const express = require('express');
const router = express.Router();
const MockModel = require('../utils/mockDB');
const E3Order = new MockModel('E3Order');
const E4Order = new MockModel('E4Order');
const validate = require('../middleware/validate');
const { auth, admin } = require('../middleware/auth');
const { checkoutSchema } = require('../schemas/validationSchemas');
const { initiatePayment } = require('../utils/easebuzz');

// Helper to get correct model
const getOrderModel = (type) => {
    return type === 'e4' ? E4Order : E3Order;
};

// Generic Handler Factory
const getAllOrders = (type) => async (req, res) => {
    try {
        const OrderModel = getOrderModel(type);
        const orders = await OrderModel.find();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getUserOrders = (type) => async (req, res) => {
    try {
        const OrderModel = getOrderModel(type);
        const orders = await OrderModel.find({ user: req.user.id });
        // Add location tag
        const taggedOrders = orders.map(o => ({ ...o, location: type.toUpperCase() }));
        taggedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(taggedOrders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const checkoutHandler = (type) => async (req, res) => {
    try {
        const { items } = req.body;
        const targetLocation = type.toUpperCase();
        const OrderModel = getOrderModel(type);

        const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const txnid = 'ETH-' + Math.floor(100000 + Math.random() * 900000);

        // Create Pending Order
        const order = await OrderModel.create({
            _id: txnid,
            user: req.user.id,
            items: items.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                product: item.id,
                details: item.details
            })),
            totalAmount: totalAmount,
            paymentMethod: 'easebuzz',
            paymentStatus: 'pending',
            orderStatus: 'placed',
            location: targetLocation
        });

        // Initiate Payment
        const paymentData = {
            txnid: txnid,
            amount: totalAmount,
            firstname: req.user.name || 'User',
            email: req.user.email || 'user@example.com',
            phone: req.user.mobile || '9999999999',
            productinfo: `Order for ${items.length} items`,
            location: targetLocation // Pass location to Easebuzz via udf1 if needed
        };

        const result = await initiatePayment(paymentData);

        if (result.status === 1) {
            res.json({
                success: true,
                payment_url: result.data || `${require('../utils/easebuzz').getEasebuzzConfig().baseUrl}/pay/${result.data}`,
                access_key: result.data,
                txnid: txnid
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
 * Routes
 */

/**
 * @swagger
 * /api/orders/e3/all:
 *   get:
 *     summary: Get all E3 orders (Admin)
 *     tags: [Orders - E3]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/e3/all', [auth, admin], getAllOrders('e3'));

/**
 * @swagger
 * /api/orders/e3:
 *   get:
 *     summary: Get my E3 orders
 *     tags: [Orders - E3]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/e3', auth, getUserOrders('e3'));

/**
 * @swagger
 * /api/orders/e3/checkout:
 *   post:
 *     summary: Checkout for E3
 *     tags: [Orders - E3]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/e3/checkout', [auth, validate(checkoutSchema)], checkoutHandler('e3'));


/**
 * @swagger
 * /api/orders/e4/all:
 *   get:
 *     summary: Get all E4 orders (Admin)
 *     tags: [Orders - E4]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/e4/all', [auth, admin], getAllOrders('e4'));

/**
 * @swagger
 * /api/orders/e4:
 *   get:
 *     summary: Get my E4 orders
 *     tags: [Orders - E4]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/e4', auth, getUserOrders('e4'));

/**
 * @swagger
 * /api/orders/e4/checkout:
 *   post:
 *     summary: Checkout for E4
 *     tags: [Orders - E4]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/e4/checkout', [auth, validate(checkoutSchema)], checkoutHandler('e4'));


// Combined/Legacy Route (Optional, for backward compat if needed, otherwise deprecate)
// Mapping generic /all to E3 for now or merging both if specifically asked 'all'
router.get('/all', [auth, admin], async (req, res) => {
    try {
        const e3 = await E3Order.find();
        const e4 = await E4Order.find();
        res.json([...e3, ...e4]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/', auth, async (req, res) => {
    try {
        const e3 = await E3Order.find({ user: req.user.id });
        const e4 = await E4Order.find({ user: req.user.id });
        res.json([...e3, ...e4]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
