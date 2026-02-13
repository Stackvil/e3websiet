const express = require('express');
const router = express.Router();
const MockModel = require('../utils/mockDB');
const Booking = new MockModel('Booking');
const { auth, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { checkAvailabilitySchema } = require('../schemas/validationSchemas');

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings (Admin)
 *     tags: [Bookings]
 */
const { pool } = require('../utils/pgClient');

// ... (imports)

router.get('/', auth, admin, async (req, res) => {
    try {
        // Fetch from the dedicated event_bookings table
        const result = await pool.query('SELECT * FROM event_bookings ORDER BY booking_date DESC, start_time DESC');
        const bookings = result.rows.map((booking, idx) => {
            const formatTime = (t) => {
                if (!t) return '';
                // Handle TIME type "14:30:00"
                const [h, m] = t.split(':').map(Number);
                return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
            };

            // Format date YYYY-MM-DD
            const dateObj = new Date(booking.booking_date);
            const dateStr = !isNaN(dateObj) ? dateObj.toISOString().split('T')[0] : booking.booking_date;

            return {
                id: booking.id, // DB Primary Key
                bookingId: booking.order_id,
                name: booking.customer_name || 'Guest',
                email: booking.customer_email || 'N/A',
                mobile: booking.customer_mobile || 'N/A',
                facility: booking.event_name,
                date: dateStr,
                time: booking.start_time ? `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}` : 'N/A',
                status: booking.status,
                price: booking.price,
                quantity: booking.guests
            };
        });

        // Deduplicate bookings based on Order ID and Facility Name
        const uniqueBookings = [];
        const seen = new Set();

        bookings.forEach(booking => {
            const key = `${booking.bookingId}-${booking.facility}-${booking.date}-${booking.time}`; // Unique key
            if (!seen.has(key)) {
                seen.add(key);
                uniqueBookings.push(booking);
            }
        });

        res.json(uniqueBookings);
    } catch (err) {
        console.error("Failed to fetch event bookings:", err);
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Delete a booking (Admin)
 */
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM event_bookings WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({ message: 'Booking deleted successfully', booking: result.rows[0] });
    } catch (err) {
        console.error("Failed to delete booking:", err);
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
router.post('/check-availability', validate(checkAvailabilitySchema), async (req, res) => {
    try {
        const { date, startTime, endTime, roomName } = req.body;
        const Order = new MockModel('Order');
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
