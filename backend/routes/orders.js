const express = require('express');
const router = express.Router();
const MockModel = require('../utils/mockDB');
const E3Order = new MockModel('E3Order');
const E4Order = new MockModel('E4Order');
const validate = require('../middleware/validate');
const { auth, admin } = require('../middleware/auth');
const { checkoutSchema } = require('../schemas/validationSchemas');
const { initiatePayment } = require('../utils/easebuzz');

// const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

/**
 * @swagger
 * /api/orders/all:
 *   get:
 *     summary: Get all orders (Admin only) - defaults to E3
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *           enum: [E3, E4]
 *         description: Location filter (defaults to E3)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *       403:
 *         description: Access denied
 */
router.get('/all', auth, async (req, res) => {
    try {
        const location = req.query.location || 'E3';
        let orders;

        if (location === 'E4') {
            orders = await E4Order.find();
        } else {
            orders = await E3Order.find();
        }
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get('/', auth, async (req, res) => {
    try {
        // Fetch from both tables and merge, or filter by query. Merging for simplicity.
        const e3Orders = await E3Order.find({ user: req.user.id });
        const e4Orders = await E4Order.find({ user: req.user.id });

        // Add location tag to response
        const allOrders = [
            ...e3Orders.map(o => ({ ...o, location: 'E3' })),
            ...e4Orders.map(o => ({ ...o, location: 'E4' }))
        ];

        // Sort by date if possible (mockDB doesn't sort, so do it here)
        allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(allOrders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     summary: Create checkout session
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - name
 *                     - price
 *                     - quantity
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: integer
 *                     details:
 *                       type: object
 *                       properties:
 *                         date:
 *                           type: string
 *                         startTime:
 *                           type: string
 *                         endTime:
 *                           type: string
 *                         guests:
 *                           type: string
 *     responses:
 *       200:
 *         description: Checkout session created
 */
router.post('/checkout', [auth, validate(checkoutSchema)], async (req, res) => {
    try {
        const { items, location } = req.body;
        const targetLocation = location || 'E3';

        const OrderModel = targetLocation === 'E4' ? E4Order : E3Order;

        const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const txnid = 'ETH-' + Math.floor(100000 + Math.random() * 900000);

        // Create Pending Order
        const order = await OrderModel.create({
            _id: txnid, // Use txnid as ID for easier lookup
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
            location: targetLocation // Pass location to Easebuzz via udf1
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
});

module.exports = router;
