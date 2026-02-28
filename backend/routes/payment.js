const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const supabase = require('../utils/supabaseHelper');
const { validateHash } = require('../utils/easebuzz');
const { auth } = require('../middleware/auth');

// Helper to get Order Table
const getOrderTable = (location) => {
    return (location || 'e3').toLowerCase() === 'e4' ? 'e4orders' : 'e3orders';
};

// Helper to get Payment Table
const getPaymentTable = (location) => {
    return (location || 'e3').toLowerCase() === 'e4' ? 'e4payments' : 'e3payments';
};



// Helper to record payment
const recordPayment = async (location, data) => {
    try {
        const table = getPaymentTable(location);
        const { error } = await supabase
            .from(table)
            .insert([{
                paymentId: data.easepayid,
                orderId: data.txnid,
                amount: data.amount,
                status: data.status,
                method: data.mode || 'easebuzz',
                userId: data.udf2 || null,
                "createdAt": new Date().toISOString()
            }]);

        if (error) console.error(`Error recording payment for ${data.txnid}:`, error.message);
        // else console.log(`Recorded payment for ${location}: ${data.txnid}`);

    } catch (err) {
        console.error(`Failed to record payment for ${location}:`, err);
    }
};

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment callbacks and order status
 */

/**
 * @swagger
 * /api/payment/status/{orderId}:
 *   get:
 *     summary: Get order/payment status by Order ID
 *     description: |
 *       Looks up an order by its transaction ID across both E3 and E4 order tables.
 *       Used by the Success page to display booked items and confirm payment.
 *       No authentication required (order ID acts as the access key).
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The transaction/order ID (e.g. ETH-123456)
 *         example: ETH-734291
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                       example: success
 *                     items:
 *                       type: array
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     location:
 *                       type: string
 *                       enum: [E3, E4]
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        // Search E3 first
        const { data: e3Order } = await supabase
            .from('e3orders')
            .select('*')
            .eq('_id', orderId)
            .single();

        if (e3Order) {
            return res.json({ success: true, order: { ...e3Order, location: 'E3' } });
        }

        // Search E4
        const { data: e4Order } = await supabase
            .from('e4orders')
            .select('*')
            .eq('_id', orderId)
            .single();

        if (e4Order) {
            return res.json({ success: true, order: { ...e4Order, location: 'E4' } });
        }

        return res.status(404).json({ success: false, message: 'Order not found' });
    } catch (err) {
        console.error('Order Status Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @swagger
 * /api/payment/my-orders:
 *   get:
 *     summary: Get all orders for the authenticated user
 *     description: |
 *       Returns all E3 and E4 orders belonging to the currently authenticated user,
 *       sorted newest first. Location is derived from the JWT token (`req.user.type`).
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Missing or invalid JWT token
 *       500:
 *         description: Internal server error
 */
router.get('/my-orders', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const location = req.user.type || 'E3'; // from JWT
        const orderTable = getOrderTable(location);

        const { data, error } = await supabase
            .from(orderTable)
            .select('*')
            .eq('userId', userId)
            .order('createdAt', { ascending: false });

        if (error) throw error;

        res.json((data || []).map(o => ({ ...o, location })));
    } catch (err) {
        console.error('My Orders Error:', err);
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/payment/success:
 *   post:
 *     summary: Easebuzz payment success callback
 *     description: |
 *       This endpoint is called **by Easebuzz** (not the frontend) after a successful payment.
 *       It validates the hash, updates the order status to `success`, records the payment,
 *       and redirects the user to the frontend `/success` page.
 *       **Do not call this manually.**
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               txnid:
 *                 type: string
 *                 description: Transaction ID
 *               status:
 *                 type: string
 *                 example: success
 *               easepayid:
 *                 type: string
 *               udf1:
 *                 type: string
 *                 description: Location (E3 or E4) stored during checkout
 *               udf2:
 *                 type: string
 *                 description: User ID stored during checkout
 *               hash:
 *                 type: string
 *                 description: Easebuzz response hash for signature verification
 *     responses:
 *       302:
 *         description: Redirects to frontend /success or /failed page
 *       400:
 *         description: Hash validation failed
 */
router.post('/success', async (req, res) => {
    try {
        console.log('--- Payment Success Callback Detailed Log ---');
        console.log('Body Keys:', Object.keys(req.body));
        console.log('UDF1:', req.body.udf1);
        console.log('UDF2:', req.body.udf2);
        console.log('Amount:', req.body.amount);
        console.log('Transaction ID:', req.body.txnid);
        console.log('Full Body:', JSON.stringify(req.body, null, 2));

        const { status, txnid, udf1, easepayid } = req.body;

        // Persistent logging
        const logEntry = `${new Date().toISOString()} - Callback: TXNID=${txnid}, UDF1=${req.body.udf1}, UDF2=${req.body.udf2}, Amount=${req.body.amount}\n`;
        fs.appendFileSync(path.join(__dirname, '../debug_payment.log'), logEntry);

        // udf1 contains location (E3 or E4)
        const location = udf1 || 'E3';
        const orderTable = getOrderTable(location);

        // Verify Hash
        const configSalt = require('../utils/easebuzz').getEasebuzzConfig().salt;
        const isValid = validateHash(req.body, configSalt);

        if (isValid) {
            // Update Order Status
            const { error: updateError } = await supabase
                .from(orderTable)
                .update({
                    status: 'success',
                    paymentId: easepayid,
                    txnid: txnid
                })
                .eq('_id', txnid);

            if (updateError) console.error('Order Update Error:', updateError);

            // Record Transaction in Payments Table
            await recordPayment(location, req.body);


            // Reward Points Logic (10 points for transactions >= ₹300)
            try {
                const amount = Number(req.body.amount);
                const userId = req.body.udf2;

                console.log(`Checking rewards: Amount=${amount}, UserID=${userId}, Location=${location}`);

                if (amount >= 300 && userId) {
                    const userTable = location.toLowerCase() === 'e4' ? 'e4users' : 'e3users';

                    const { data: userRecord, error: fetchError } = await supabase
                        .from(userTable)
                        .select('reward_points')
                        .eq('_id', userId)
                        .single();

                    if (fetchError) {
                        console.error(`Error fetching user ${userId} for rewards:`, fetchError.message);
                    } else if (userRecord) {
                        const currentPoints = Number(userRecord.reward_points) || 0;
                        const newPoints = currentPoints + 10;

                        const { error: updateError } = await supabase
                            .from(userTable)
                            .update({ reward_points: newPoints })
                            .eq('_id', userId);

                        if (updateError) {
                            console.error(`Error updating reward points for user ${userId}:`, updateError.message);
                        } else {
                            console.log(`Successfully credited 10 points to user ${userId} (${userTable}). New balance: ${newPoints}`);
                        }
                    } else {
                        console.warn(`User ${userId} not found in ${userTable} for reward credit.`);
                    }
                } else {
                    console.log(`No rewards applicable: Amount ${amount} < 300 or missing UserID.`);
                }
            } catch (rewardErr) {
                console.error('Reward Points Logic Failure:', rewardErr);
            }

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/success?orderId=${txnid}&location=${location}`);
        } else {
            console.error('Hash Validation Failed for txnid:', txnid);
            res.status(400).send('Hash Validation Failed');
        }
    } catch (error) {
        console.error('Payment Success Handler Error:', error);
        res.status(500).send('Internal Error');
    }
});

/**
 * @swagger
 * /api/payment/failure:
 *   post:
 *     summary: Easebuzz payment failure callback
 *     description: |
 *       Called by Easebuzz after a failed/cancelled payment.
 *       Updates the order status and redirects to the frontend `/failed` page.
 *       **Do not call this manually.**
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               txnid:
 *                 type: string
 *               status:
 *                 type: string
 *                 example: failed
 *               udf1:
 *                 type: string
 *                 description: Location (E3 or E4)
 *     responses:
 *       302:
 *         description: Redirects to frontend /failed page
 */
router.post('/failure', async (req, res) => {
    try {
        const { txnid, status, udf1 } = req.body;
        const location = udf1 || 'E3';
        const orderTable = getOrderTable(location);

        // Update Order Status
        await supabase
            .from(orderTable)
            .update({ status: status || 'failed' })
            .eq('_id', txnid);

        // Record Transaction
        await recordPayment(location, req.body);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/failed?orderId=${txnid}&location=${location}`);
    } catch (error) {
        console.error('Payment Failure Handler Error:', error);
        res.status(500).send('Internal Error');
    }
});

module.exports = router;
