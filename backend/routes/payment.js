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

// Helper to record payment
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
            user: data.udf2 || null, // Assuming udf2 might store user id if passed, else null
            location: location,
            rawResponse: data,
            createdAt: new Date().toISOString()
        });
        console.log(`Recorded payment for ${location}: ${data.txnid}`);
    } catch (err) {
        console.error(`Failed to record payment for ${location}:`, err);
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
            await OrderModel.findByIdAndUpdate(txnid, { status: 'success', paymentId: easepayid });
            // Record Transaction
            await recordPayment(location, req.body);

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
            await OrderModel.findByIdAndUpdate(txnid, { status: status, paymentId: easepayid });
            // Record Transaction
            await recordPayment(location, req.body);

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
