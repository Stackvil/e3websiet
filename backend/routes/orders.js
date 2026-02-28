const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseHelper'); // Use consistent Supabase client
const validate = require('../middleware/validate');
const { auth, admin } = require('../middleware/auth');
const { checkoutSchema } = require('../schemas/validationSchemas');
const { initiatePayment } = require('../utils/easebuzz');

// Helper to get correct table name
const getOrderTable = (type) => {
    return (type || 'e3').toLowerCase() === 'e4' ? 'e4orders' : 'e3orders';
};

const getUserTable = (type) => {
    return (type || 'e3').toLowerCase() === 'e4' ? 'e4users' : 'e3users';
};

// Map Supabase ID
const mapRecord = (record) => {
    if (!record) return null;
    const id = record._id || record.id;
    return { ...record, _id: id, id: id };
};

// Generic Handler Factory
const getAllOrders = (type) => async (req, res) => {
    try {
        const table = getOrderTable(type);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .gte('createdAt', sevenDaysAgo.toISOString())
            .order('createdAt', { ascending: false });

        if (error) throw error;
        res.json(data.map(mapRecord));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getUserOrders = (type) => async (req, res) => {
    try {
        const table = getOrderTable(type);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('userId', req.user.id) // Ensure userId column usage matches schema
            .gte('createdAt', sevenDaysAgo.toISOString())
            .order('createdAt', { ascending: false });

        if (error) throw error;

        const taggedOrders = data.map(o => ({
            ...mapRecord(o),
            location: type.toUpperCase()
        }));
        res.json(taggedOrders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const checkoutHandler = (type) => async (req, res) => {
    try {
        const { items } = req.body;
        const targetLocation = type.toUpperCase();
        const orderTable = getOrderTable(type);
        const userTable = getUserTable(type);

        // Fetch User Details using Supabase
        const { data: userData, error: userError } = await supabase
            .from(userTable)
            .select('*')
            .eq('_id', req.user.id) // Assuming auth middleware attaches .id which matches _id
            .single();

        if (userError || !userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch canonical prices from the database for security overrides
        const prefix = (type || 'e3').toLowerCase();
        const [ridesRes, dinesRes, eventsRes] = await Promise.all([
            supabase.from(`${prefix}rides`).select('_id, price, name'),
            supabase.from(`${prefix}dines`).select('_id, price, name'),
            supabase.from(`${prefix}events`).select('_id, price, name')
        ]);

        if (ridesRes.error) console.error(`Supabase Error (${prefix}rides):`, ridesRes.error);
        if (dinesRes.error) console.error(`Supabase Error (${prefix}dines):`, dinesRes.error);
        if (eventsRes.error) console.error(`Supabase Error (${prefix}events):`, eventsRes.error);

        const validPrices = {};
        const allDbItems = [...(ridesRes.data || []), ...(dinesRes.data || []), ...(eventsRes.data || [])];

        // Priority: Build map with prefixed keys to avoid ID collisions between categories
        // We also keep raw IDs for legacy compatibility, though they may overwrite each other
        ridesRes.data?.forEach(item => {
            const id = String(item._id || item.id);
            const entry = { price: Number(item.price) || 0, name: item.name };
            validPrices[id] = entry;
            validPrices[`play-${id}`] = entry;
        });
        dinesRes.data?.forEach(item => {
            const id = String(item._id || item.id);
            const entry = { price: Number(item.price) || 0, name: item.name };
            validPrices[id] = entry;
            validPrices[`dine-${id}`] = entry;
        });
        eventsRes.data?.forEach(item => {
            const id = String(item._id || item.id);
            const entry = { price: Number(item.price) || 0, name: item.name };
            validPrices[id] = entry;
            validPrices[`event-${id}`] = entry;
            validPrices[`item-${id}`] = entry; // Just in case
        });

        console.log(`Checkout Debug [${type.toUpperCase()}]: Fetched ${allDbItems.length} items from DB. Map size: ${Object.keys(validPrices).length}`);

        let totalAmount = 0;
        for (const item of items) {
            // Priority 1: Direct match using the full ID sent by frontend (often prefixed like 'play-3')
            let dbItem = validPrices[String(item.id).trim()];

            // Priority 2: Match using cleaned ID (strip prefixes)
            const cleanId = String(item.id).replace(/^(play|dine|event|item)-/, '').trim();
            if (!dbItem) {
                dbItem = validPrices[cleanId];
            }

            // Priority 3: Fallback by name (case-insensitive)
            if (!dbItem) {
                console.warn(`ID Match Failed for "${item.name}" (Sent ID: "${item.id}", Cleaned ID: "${cleanId}"). Attempting fallback by name...`);
                // Find item with matching name in the allDbItems list to avoid map overwrite bias
                const nameMatch = allDbItems.find(v => v.name && v.name.toLowerCase() === item.name.toLowerCase());
                if (nameMatch) {
                    console.log(`Fallback Successful: Found item "${item.name}" in DB.`);
                    dbItem = { price: Number(nameMatch.price) || 0, name: nameMatch.name };
                }
            }

            if (!dbItem) {
                console.error(`Validation Failed: Item "${item.name}" (Sent ID: ${item.id}, Cleaned ID: "${cleanId}") not found in DB.`);
                return res.status(400).json({
                    success: false,
                    message: `Item validation failed: pricing not found for ${item.name}. Please refresh your cart.`,
                    debug: { sentId: item.id, cleanedId: cleanId, availableNames: allDbItems.map(v => v.name).slice(0, 15) }
                });
            }

            const dbPrice = dbItem.price;
            totalAmount += (dbPrice * item.quantity);
            item.price = dbPrice; // Stomp frontend price with authentic pricing
            item.dbName = dbItem.name; // Keep DB name for reference
        }

        const txnid = 'ETH-' + Math.floor(100000 + Math.random() * 900000);

        // Prepare Order Payload
        const orderPayload = {
            _id: txnid,
            userId: req.user.id,
            items: items, // JSONB in Postgres (now reflects secure prices)
            amount: totalAmount,
            status: 'placed', // initial status
            // payment details updated later
            createdAt: new Date().toISOString()
        };

        const { error: createError } = await supabase
            .from(orderTable)
            .insert([orderPayload]);

        if (createError) throw createError;

        // Initiate Payment via Easebuzz
        const paymentData = {
            txnid: txnid,
            amount: totalAmount,
            firstname: userData.name || 'User',
            email: userData.email || 'user@example.com', // fallback if empty
            phone: userData.mobilenumber || userData.mobile || '9999999999',
            productinfo: `Order for ${items.length} items`,
            udf1: targetLocation, // Pass location in UDF1 for callback
            udf2: req.user.id     // Pass UserID in UDF2 for callback
        };

        const result = await initiatePayment(paymentData);

        if (result.status === 1) {
            const easebuzzConfig = require('../utils/easebuzz').getEasebuzzConfig();
            res.json({
                success: true,
                payment_url: `${easebuzzConfig.baseUrl}/pay/${result.data}`,
                access_key: result.data,
                txnid: txnid,
                mode: easebuzzConfig.enable_iframe == 1 ? 'iframe' : 'hosted',
                key: easebuzzConfig.key,
                env: easebuzzConfig.env
            });
        } else {
            res.status(400).json({ success: false, message: result.data || 'Error initiating payment' });
        }

    } catch (err) {
        console.error('Checkout Error:', err);
        res.status(500).json({ message: err.message });
    }
};

const claimRewardHandler = (type) => async (req, res) => {
    try {
        const userTable = getUserTable(type);
        const orderTable = getOrderTable(type);

        // 1. Fetch user to verify points
        const { data: user, error: userError } = await supabase
            .from(userTable)
            .select('reward_points')
            .eq('_id', req.user.id)
            .single();

        if (userError || !user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const currentPoints = Number(user.reward_points) || 0;
        if (currentPoints < 500) {
            return res.status(400).json({ success: false, message: 'Insufficient reward points. Need 500 points.' });
        }

        // 2. Deduct points
        const { error: updateError } = await supabase
            .from(userTable)
            .update({ reward_points: currentPoints - 500 })
            .eq('_id', req.user.id);

        if (updateError) throw updateError;

        // 3. Create Free Ride Ticket Order
        const txnid = 'REW-' + Math.floor(100000 + Math.random() * 900000);
        const orderPayload = {
            _id: txnid,
            userId: req.user.id,
            items: [{
                id: 'reward-free-ride',
                name: 'Free Ride Ticket (Reward)',
                price: 0,
                quantity: 1,
                stall: 'Rewards',
                details: { rideCount: 1, type: 'reward' }
            }],
            amount: 0,
            status: 'success',
            createdAt: new Date().toISOString()
        };

        const { error: orderError } = await supabase
            .from(orderTable)
            .insert([orderPayload]);

        if (orderError) throw orderError;

        res.json({ success: true, message: 'Free Ride Ticket claimed successfully!', orderId: txnid });

    } catch (err) {
        console.error('Claim Reward Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and checkout
 */

/**
 * @swagger
 * /api/orders/e3/all:
 *   get:
 *     summary: Get all E3 orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of E3 orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       403:
 *         description: Admin access required
 */
router.get('/e3/all', [auth, admin], getAllOrders('e3'));

/**
 * @swagger
 * /api/orders/e3:
 *   get:
 *     summary: Get my E3 orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's E3 orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/e3', auth, getUserOrders('e3'));

/**
 * @swagger
 * /api/orders/e3/checkout:
 *   post:
 *     summary: Checkout for E3 items
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string }
 *                     price: { type: number }
 *                     quantity: { type: integer }
 *     responses:
 *       200:
 *         description: Payment initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 payment_url: { type: string }
 *                 access_key: { type: string }
 *                 txnid: { type: string }
 */
router.post('/e3/checkout', [auth, validate(checkoutSchema)], checkoutHandler('e3'));
router.post('/e3/claim-reward', auth, claimRewardHandler('e3'));


/**
 * @swagger
 * /api/orders/e4/all:
 *   get:
 *     summary: Get all E4 orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of E4 orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/e4/all', [auth, admin], getAllOrders('e4'));

/**
 * @swagger
 * /api/orders/e4:
 *   get:
 *     summary: Get my E4 orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's E4 orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/e4', auth, getUserOrders('e4'));

/**
 * @swagger
 * /api/orders/e4/checkout:
 *   post:
 *     summary: Checkout for E4 items
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string }
 *                     price: { type: number }
 *                     quantity: { type: integer }
 *     responses:
 *       200:
 *         description: Payment initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 payment_url: { type: string }
 *                 access_key: { type: string }
 *                 txnid: { type: string }
 */
router.post('/e4/checkout', [auth, validate(checkoutSchema)], checkoutHandler('e4'));
router.post('/e4/claim-reward', auth, claimRewardHandler('e4'));



/**
 * @swagger
 * /api/orders/all:
 *   get:
 *     summary: Get all E3 orders combined (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All E3 orders
 */
router.get('/all', [auth, admin], getAllOrders('e3'));

/**
 * @swagger
 * /api/orders/daily:
 *   get:
 *     summary: Get today's sales and last 14 days history (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily sales breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 today:
 *                   type: object
 *                   properties:
 *                     total: { type: number }
 *                     count: { type: integer }
 *                     orders: { type: array }
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date: { type: string }
 *                       total: { type: number }
 *                       count: { type: integer }
 */
router.get('/daily', [auth, admin], async (req, res) => {
    try {
        // Fetch all E3 orders sorted newest first
        const { data, error } = await supabase
            .from('e3orders')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;

        const allOrders = (data || []).map(mapRecord);

        // Only count "paid" / "confirmed" orders for revenue
        const isPaid = (o) => {
            const s = (o.status || '').toLowerCase();
            const ps = (o.paymentStatus || '').toLowerCase();
            return ps === 'paid' || ps === 'success' || ps === 'completed'
                || s === 'confirmed' || s === 'success' || s === 'completed' || s === 'placed';
        };

        // --- Today ---
        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local tz
        const todayOrders = allOrders.filter(o => {
            const d = new Date(o.createdAt).toLocaleDateString('en-CA');
            return d === todayStr;
        });
        const todayPaid = todayOrders.filter(isPaid);
        const todayTotal = todayPaid.reduce((s, o) => s + (Number(o.amount) || Number(o.totalAmount) || 0), 0);

        // --- Last 14 days history (grouped by date) ---
        const history = {};
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-CA');
            history[key] = { date: key, total: 0, count: 0 };
        }

        allOrders.filter(isPaid).forEach(o => {
            const key = new Date(o.createdAt).toLocaleDateString('en-CA');
            if (history[key]) {
                history[key].total += Number(o.amount) || Number(o.totalAmount) || 0;
                history[key].count += 1;
            }
        });

        // Sort history oldest → newest for charting
        const historyArr = Object.values(history).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json({
            today: {
                total: todayTotal,
                count: todayPaid.length,
                allOrdersCount: todayOrders.length,
                orders: todayOrders.slice(0, 20) // latest 20 today
            },
            history: historyArr
        });
    } catch (err) {
        console.error('Daily Stats Error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

