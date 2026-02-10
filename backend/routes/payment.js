const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const MockModel = require('../utils/mockDB');
const Order = new MockModel('Order');

// Environment Variables (Make sure these are set in your .env file)
// EASEBUZZ_KEY=...
// EASEBUZZ_SALT=...
// EASEBUZZ_ENV=test (or prod)

const getEasebuzzConfig = () => {
    return {
        key: process.env.EASEBUZZ_KEY || '2PBP7IABZ2', // Example Test Key
        salt: process.env.EASEBUZZ_SALT || 'DAH88E3UWQ', // Example Test Salt
        env: process.env.EASEBUZZ_ENV || 'test',
        baseUrl: process.env.EASEBUZZ_ENV === 'prod'
            ? 'https://pay.easebuzz.in'
            : 'https://testpay.easebuzz.in'
    };
};

function generateHash(data, salt) {
    const hashString = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1 || ''}|${data.udf2 || ''}|${data.udf3 || ''}|${data.udf4 || ''}|${data.udf5 || ''}|${data.udf6 || ''}|${data.udf7 || ''}|${data.udf8 || ''}|${data.udf9 || ''}|${data.udf10 || ''}|${salt}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
}

// Initiate Payment
/**
 * @swagger
 * /api/payment/initiate:
 *   post:
 *     summary: Initiate Easebuzz Payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - firstname
 *               - email
 *               - phone
 *               - productinfo
 *             properties:
 *               amount:
 *                 type: number
 *               firstname:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               productinfo:
 *                 type: string
 *               items:
 *                 type: array
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 */
router.post('/initiate', async (req, res) => {
    try {
        const { amount, firstname, email, phone, productinfo, items } = req.body;
        const config = getEasebuzzConfig();

        const txnid = 'ETH-' + Math.floor(100000 + Math.random() * 900000); // Generate unique Transaction ID

        // Save initial order status as 'pending'
        const newOrder = {
            _id: txnid,
            txnid,
            amount,
            firstname,
            email,
            phone,
            items: items || [], // Save cart items
            status: 'pending',
            createdAt: new Date()
        };
        await Order.create(newOrder); // Using MockDB

        const payload = {
            key: config.key,
            txnid: txnid,
            amount: parseFloat(amount).toFixed(2),
            productinfo: (productinfo || 'Ethree Ticket').replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 100).trim(),
            firstname: (firstname || 'User').replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 20).trim(),
            email: email || 'user@example.com',
            phone: (phone || '9999999999').replace(/[^0-9]/g, '').substring(0, 10),
            surl: `${req.protocol}://${req.get('host')}/api/payment/success`,
            furl: `${req.protocol}://${req.get('host')}/api/payment/failure`,
            udf1: '',
            udf2: '',
            udf3: '',
            udf4: '',
            udf5: '',
            udf6: '',
            udf7: '',
            udf8: '',
            udf9: '',
            udf10: ''
        };

        const hash = generateHash(payload, config.salt);
        payload.hash = hash;

        // Call Easebuzz Initiate Link API
        const response = await fetch(`${config.baseUrl}/payment/initiateLink`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams(payload)
        });

        const result = await response.json();

        if (result.status === 1) {
            res.json({
                success: true,
                access_key: result.data,
                payment_url: `${config.baseUrl}/pay/${result.data}`,
                txnid: txnid
            });
        } else {
            console.error('Easebuzz Error:', result);
            res.status(400).json({ success: false, message: result.data || 'Error initiating payment' });
        }

    } catch (error) {
        console.error('Payment Initiation Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Get Payment Status
router.get('/status/:txnid', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.txnid, {}); // Just find
        // MockDB findByIdAndUpdate returns null if not found? No, I implemented it to return data.
        // Actually I implemented findByIdAndUpdate, I should probably just use findOne for get.
        // But MockModel.findOne takes a query.
        const orders = await Order.find({ txnid: req.params.txnid });
        const orderData = orders[0];

        if (orderData) {
            res.json({ success: true, order: orderData });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Error' });
    }
});

// Handle Success from Easebuzz (POST)
router.post('/success', async (req, res) => {
    try {
        console.log('Payment Success Callback Hit');
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);

        // Check if body is parsed
        if (!req.body) {
            throw new Error('Request Body is undefined');
        }

        const { status, txnid, amount, email, firstname, productinfo, udf10, udf9, udf8, udf7, udf6, udf5, udf4, udf3, udf2, udf1, hash, key, easepayid } = req.body;
        const config = getEasebuzzConfig();

        // Verify Hash
        const hashString = `${config.salt}|${status}|${udf10 || ''}|${udf9 || ''}|${udf8 || ''}|${udf7 || ''}|${udf6 || ''}|${udf5 || ''}|${udf4 || ''}|${udf3 || ''}|${udf2 || ''}|${udf1 || ''}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
        const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

        if (hash === calculatedHash) {
            await Order.findByIdAndUpdate(txnid, { status: 'success', paymentId: easepayid });
            // Redirect to Frontend Success Page
            // Assuming Frontend is on localhost:5173 or same domain in prod
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/success?orderId=${txnid}`);
        } else {
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
        const { txnid, status } = req.body;
        await Order.findByIdAndUpdate(txnid, { status: status || 'failed' });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/failed?orderId=${txnid}`);
    } catch (error) {
        console.error('Payment Failure Handler Error:', error);
        res.status(500).send('Internal Error');
    }
});

// Webhook (Server to Server)
router.post('/response', async (req, res) => {
    try {
        const { status, txnid, amount, email, firstname, productinfo, udf10, udf9, udf8, udf7, udf6, udf5, udf4, udf3, udf2, udf1, hash, key } = req.body;
        const config = getEasebuzzConfig();

        // Verify Hash (Reverse order for response)
        const hashString = `${config.salt}|${status}|${udf10 || ''}|${udf9 || ''}|${udf8 || ''}|${udf7 || ''}|${udf6 || ''}|${udf5 || ''}|${udf4 || ''}|${udf3 || ''}|${udf2 || ''}|${udf1 || ''}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
        const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

        if (hash === calculatedHash) {
            // Update Order Status
            await Order.findByIdAndUpdate(txnid, { status: status, paymentId: req.body.easepayid });

            // Redirect to frontend success page or return JSON depending on how Easebuzz calls this
            // Often this is a server-to-server call (webhook)
            res.json({ status: 1, data: 'Terminated' }); // Easebuzz expects this for webhooks
        } else {
            res.status(400).json({ status: 0, data: 'Hash Mismatch' });
        }
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ status: 0, data: 'Internal Error' });
    }
});

module.exports = router;
