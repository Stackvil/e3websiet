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
        const { data, error } = await supabase
            .from(table)
            .select('*')
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
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('userId', req.user.id) // Ensure userId column usage matches schema
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

        const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const txnid = 'ETH-' + Math.floor(100000 + Math.random() * 900000);

        // Prepare Order Payload
        const orderPayload = {
            _id: txnid,
            userId: req.user.id,
            items: items, // JSONB in Postgres
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

