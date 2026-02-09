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
                        quantity: item.quantity,
                        createdAt: order.createdAt // Include for sorting
                    };
                });
        });

        // Sort by creation date (newest first)
        eventBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
 */
router.post('/check-availability', async (req, res) => {
    try {
        const { date, startTime, endTime, roomName } = req.body;
        console.log(`Checking availability for ${roomName} on ${date} from ${startTime} to ${endTime}`);

        const orders = await Order.find();

        // Helper to convert "HH:mm" to minutes
        const toMinutes = (timeStr) => {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        };

        const reqStart = toMinutes(startTime);
        const reqEnd = toMinutes(endTime);

        const conflictingOrder = orders.find(order => {
            // Only check paid/confirmed orders
            const isConfirmed =
                order.paymentStatus === 'paid' ||
                order.paymentStatus === 'success' ||
                order.status === 'success' ||
                order.status === 'confirmed';

            if (!isConfirmed) return false;

            return order.items && order.items.some(item => {
                // Check if it's the same room (flexible match)
                if (!item.name.includes(roomName.replace(' Booking', ''))) return false;

                // Check date
                if (item.details?.date !== date) return false;

                // Check time overlap
                if (item.details?.startTime && item.details?.endTime) {
                    const bookedStart = toMinutes(item.details.startTime);
                    const bookedEnd = toMinutes(item.details.endTime);

                    // Add 2 hours (120 minutes) buffer AFTER the event ends
                    // "after the every evnt end sont allow 2hrs for booking the slot"
                    const BUFFER_MINS = 120;
                    const effectiveBookedEnd = bookedEnd + BUFFER_MINS;

                    // Overlap Logic: 
                    // New Req Start < Existing End + Buffer AND New Req End > Existing Start
                    const isOverlapping = reqStart < effectiveBookedEnd && reqEnd > bookedStart;

                    if (isOverlapping) {
                        console.log(`Conflict found with Order #${order._id} (${bookedStart}-${bookedEnd} + 2hr buffer -> ${effectiveBookedEnd})`);
                    }
                    return isOverlapping;
                }
                return false;
            });
        });

        if (conflictingOrder) {
            console.log('Slot unavailable');
            res.json({ available: false, message: 'Slot already booked' });
        } else {
            console.log('Slot available');
            res.json({ available: true });
        }

    } catch (err) {
        console.error('Availability Check Error:', err);
        res.status(500).json({ message: err.message });
    }
});

// Deprecated or integrated into Orders
router.post('/', async (req, res) => {
    res.status(400).json({ message: 'Use /api/orders/checkout for bookings' });
});

module.exports = router;
