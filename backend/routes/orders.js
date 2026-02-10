const express = require('express');
const router = express.Router();
const MockModel = require('../utils/mockDB');
const Order = new MockModel('Order');
const Stripe = require('stripe');
const { auth, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { checkoutSchema } = require('../schemas/validationSchemas');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

/**
 * @swagger
 * /api/orders/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
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
        const orders = await Order.find();
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
        const orders = await Order.find({ user: req.user.id });
        res.json(orders);
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
        const { items } = req.body;

        const order = await Order.create({
            user: req.user.id,
            items: items.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                product: item.id,
                details: item.details // Save event details
            })),
            totalAmount: items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
            paymentMethod: 'stripe',
            paymentStatus: 'pending',
            orderStatus: 'placed'
        });

        res.json({ id: 'mock_session_id', url: `http://localhost:5174/success?orderId=${order._id}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
