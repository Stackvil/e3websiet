const express = require('express');
const router = express.Router();
const MockModel = require('../utils/mockDB');
const Booking = new MockModel('Booking');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings (Admin)
 *     tags: [Bookings]
 */
const Order = new MockModel('Order');

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all event bookings (Admin)
 *     tags: [Bookings]
 */
router.get('/', auth, admin, async (req, res) => {
    try {
        // Fetch all orders that act as bookings
        const orders = await Order.find();

        // Filter orders that have event items
        const eventBookings = orders.flatMap(order => {
            if (!order.items) return [];

            return order.items
                .filter(item => {
                    const id = item.id || item.product || '';
                    const isEvent = id.toString().startsWith('event-') || item.stall === 'Events';
                    const isPaid =
                        order.paymentStatus === 'paid' ||
                        order.paymentStatus === 'success' ||
                        order.status === 'success' ||
                        order.status === 'confirmed';

                    return isEvent && isPaid;
                })
                .map((item, idx) => {
                    const formatTime = (t) => {
                        if (!t) return '';
                        const [h, m] = t.split(':').map(Number);
                        return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
                    };
                    return {
                        id: item.id || `${order._id}-${idx}`, // Unique Item ID
                        bookingId: order.txnid || order._id, // Order ID for display
                        name: order.firstname || (order.user ? (order.user.name || 'User') : 'Guest'),
                        facility: item.name,
                        date: item.details?.date || 'N/A',
                        time: item.details?.startTime ? `${formatTime(item.details.startTime)} - ${formatTime(item.details.endTime)}` : 'N/A',
                        status: (order.status || order.paymentStatus || 'pending'),
                        price: item.price,
                        quantity: item.quantity
                    };
                });
        });

        console.log(`Found ${eventBookings.length} event bookings`);

        res.json(eventBookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/bookings/check-availability:
 *   post:
 *     summary: Check if a slot is available
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - startTime
 *               - endTime
 *               - roomName
 *             properties:
 *               date:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               roomName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Availability status
 */
router.post('/check-availability', async (req, res) => {
    try {
        const { date, startTime, endTime, roomName } = req.body;

        const orders = await Order.find();

        // Simple overlap check
        // In a real app, this would be more robust with Date objects
        const isBooked = orders.some(order => {
            // Only check paid/confirmed orders
            if (order.paymentStatus !== 'paid' && order.paymentStatus !== 'success' && order.status !== 'confirmed') return false;

            return order.items.some(item => {
                // Check if it's the same room
                if (!item.name.includes(roomName)) return false;

                // Check date
                if (item.details?.date !== date) return false;

                // Check time overlap (Simplified: exact match or just assume overlap if same date/room for now)
                // For a proper implementation, we'd convert start/end to comparable values
                // For this demo, let's just check if the date matches for that room
                return true;
            });
        });

        res.json({ available: !isBooked });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Deprecated or integrated into Orders
router.post('/', async (req, res) => {
    res.status(400).json({ message: 'Use /api/orders/checkout for bookings' });
});

module.exports = router;
