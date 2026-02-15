const express = require('express');
const router = express.Router();
const MockModel = require('../utils/mockDB');
const E3Order = new MockModel('E3Order');
const E4Order = new MockModel('E4Order');
const E3Payment = new MockModel('E3Payment');
const E4Payment = new MockModel('E4Payment');
const { validateHash } = require('../utils/easebuzz');

// Helper to get Order Model based on location
const getOrderModel = (location) => {
    return (location === 'E4' || location === 'e4') ? E4Order : E3Order;
};

// Helper to get Payment Model based on location
const getPaymentModel = (location) => {
    return (location === 'E4' || location === 'e4') ? E4Payment : E3Payment;
};

const { pool } = require('../utils/pgClient');

// Helper to record payment and award points
const recordPayment = async (location, data) => {
    try {
        const PaymentModel = getPaymentModel(location);
        await PaymentModel.create({
            _id: data.txnid,
            orderId: data.txnid,
            amount: data.amount,
            status: data.status,
            paymentId: data.easepayid,
            method: data.mode || 'easebuzz',
            user: data.udf2 || null,
            location: location,
            rawResponse: data,
            createdAt: new Date().toISOString()
        });
        console.log(`Recorded payment for ${location}: ${data.txnid}`);

        // Award Reward Points Logic
        // If amount > 300, give 10 points
        const amount = parseFloat(data.amount);
        if (data.status === 'success' && amount > 300 && data.udf2) {
            const userId = data.udf2;
            const UserModel = new MockModel((location === 'E4' || location === 'e4') ? 'E4User' : 'E3User');

            // Increment logic (using raw query for atomic update if possible, or MockModel update)
            // For now using MockModel/Mongoose style update, assuming standard DB adapter
            // Note: In real PG properly use: UPDATE e3users SET reward_points = COALESCE(reward_points, 0) + 10 WHERE _id = ...

            try {
                // Direct SQL update for reliability
                const tableName = (location === 'E4' || location === 'e4') ? 'e4users' : 'e3users';
                const updateQuery = `UPDATE ${tableName} SET reward_points = COALESCE(reward_points, 0) + 10 WHERE _id = $1`;
                await pool.query(updateQuery, [userId]);
                console.log(`Awarded 10 points to user ${userId}`);
            } catch (pointErr) {
                console.error("Failed to award points:", pointErr);
            }
        }

    } catch (err) {
        console.error(`Failed to record payment for ${location}:`, err);
    }
};
// Mock Success Route for Dev/Test
router.get('/mock-success', async (req, res) => {
    try {
        const { txnid } = req.query;
        // Default to E3 for mock
        const location = 'E3';
        const OrderModel = getOrderModel(location);

        await OrderModel.findByIdAndUpdate(txnid, { status: 'success', paymentId: 'MOCK_' + Math.random().toString(36).substr(2, 9) });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/success?orderId=${txnid}&location=${location}`);
    } catch (error) {
        console.error('Mock Payment Error:', error);
        res.status(500).send('Mock Internal Error');
    }
});

// Helper to record event booking
const recordEventBooking = async (order) => {
    if (!order || !order.items) return;

    // Fetch user details
    let userData = {
        name: order.firstname || 'Guest',
        mobile: order.phone || 'N/A',
        email: order.email || 'N/A'
    };

    if (order.user && (!userData.name || userData.name === 'Guest')) {
        try {
            const UserModel = new MockModel((order.location === 'E4') ? 'E4User' : 'E3User');
            // Assuming order.user is the ID string
            const user = await UserModel.findOne({ _id: order.user });
            if (user) {
                userData.name = user.name || userData.name;
                userData.mobile = user.mobile || userData.mobile;
                userData.email = user.email || userData.email;
            }
        } catch (e) {
            console.warn('Failed to fetch user for event booking record', e);
        }
    }

    for (const item of order.items) {
        // Check if item is an event
        const isEvent = (item.product && item.product.toString().startsWith('event-')) ||
            (item.id && item.id.toString().startsWith('event-')) ||
            item.stall === 'Events' ||
            item.name.toLowerCase().includes('booking') ||
            item.name.toLowerCase().includes('event');

        if (isEvent) {
            try {
                const details = item.details || {};
                const query = `
                    INSERT INTO event_bookings 
                    (order_id, user_id, event_name, booking_date, start_time, end_time, price, guests, status, customer_name, customer_mobile, customer_email)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                `;
                const values = [
                    order._id,
                    order.user,
                    item.name,
                    details.date || new Date().toISOString().split('T')[0],
                    details.startTime ? details.startTime + ':00' : '00:00:00',
                    details.endTime ? details.endTime + ':00' : '00:00:00',
                    item.price,
                    details.guests || 1,
                    order.status || 'confirmed',
                    userData.name,
                    userData.mobile,
                    userData.email
                ];

                await pool.query(query, values);
                console.log(`Recorded event booking for order ${order._id}`);
            } catch (err) {
                console.error('Failed to insert event_booking:', err);
            }
        }
    }
};

// Handle Success from Easebuzz (POST)
router.post('/success', async (req, res) => {
    try {
        console.log('Payment Success Callback Hit');
        console.log('Body:', req.body);

        if (!req.body) {
            throw new Error('Request Body is undefined');
        }

        const { status, txnid, udf1, easepayid, key, salt } = req.body;

        // udf1 contains location (E3 or E4)
        const location = udf1 || 'E3';
        const OrderModel = getOrderModel(location);

        // Verify Hash using our utility
        // Note: Easebuzz sends salt in response sometimes, but best to use our config salt
        const configSalt = require('../utils/easebuzz').getEasebuzzConfig().salt;
        const isValid = validateHash(req.body, configSalt);

        if (isValid) {
            const updatedOrder = await OrderModel.findByIdAndUpdate(txnid, { status: 'success', paymentId: easepayid });
            // Record Transaction
            await recordPayment(location, req.body);
            // Record Event Booking
            if (updatedOrder) await recordEventBooking(updatedOrder);

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const redirectLocation = location.toLowerCase() === 'e4' ? 'e4' : '';
            // If E4, maybe redirect to /e4/success? Or keep generic /success with location param
            // Current Frontend likely handles /success?location=E4
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

// Handle Failure from Easebuzz (POST)
router.post('/failure', async (req, res) => {
    try {
        const { txnid, status, udf1 } = req.body;
        const location = udf1 || 'E3';
        const OrderModel = getOrderModel(location);

        await OrderModel.findByIdAndUpdate(txnid, { status: status || 'failed' });
        // Record Transaction (even failed ones)
        await recordPayment(location, req.body);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/failed?orderId=${txnid}&location=${location}`);
    } catch (error) {
        console.error('Payment Failure Handler Error:', error);
        res.status(500).send('Internal Error');
    }
});

// Webhook (Server to Server)
router.post('/response', async (req, res) => {
    try {
        const { status, txnid, udf1, easepayid } = req.body;

        const configSalt = require('../utils/easebuzz').getEasebuzzConfig().salt;
        const isValid = validateHash(req.body, configSalt);

        if (isValid) {
            const location = udf1 || 'E3';
            const OrderModel = getOrderModel(location);

            // Update Order Status
            const updatedOrder = await OrderModel.findByIdAndUpdate(txnid, { status: status, paymentId: easepayid });
            // Record Transaction
            await recordPayment(location, req.body);
            // Record Event Booking
            if (updatedOrder && status === 'success') await recordEventBooking(updatedOrder);

            res.json({ status: 1, data: 'Terminated' });
        } else {
            res.status(400).json({ status: 0, data: 'Hash Mismatch' });
        }
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ status: 0, data: 'Internal Error' });
    }
});

module.exports = router;
