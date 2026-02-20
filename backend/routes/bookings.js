const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseHelper');
const { auth, admin } = require('../middleware/auth');

// ── Slot config ───────────────────────────────────────────────────────────────
const SLOT_START_HOUR = 9;   // 9 AM
const SLOT_END_HOUR = 22;  // 10 PM (last slot 21:00–22:00)
const SLOT_PRICE = 1000; // ₹ per hour

/**
 * Build a deterministic but realistic set of booked slots for dummy data.
 * Uses date + location as a seed so the same date always returns the
 * same "booked" pattern, making demos consistent.
 */
const getDummyBookedSlots = (dateStr, location) => {
    // Simple numeric hash of date string
    const hash = dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const loc = (location || 'e3').toLowerCase();

    // Different base patterns per location
    const baseBookedHours = loc === 'e4'
        ? [10, 11, 14, 15, 19]   // E4 pattern
        : [9, 11, 13, 17, 18];   // E3 pattern

    // Shift pattern slightly based on date hash so each day looks a bit different
    const shift = hash % 3;
    return baseBookedHours.map(h => (h + shift) % (SLOT_END_HOUR) || SLOT_START_HOUR)
        .filter(h => h >= SLOT_START_HOUR && h < SLOT_END_HOUR);
};

/**
 * @swagger
 * /api/bookings/slots:
 *   get:
 *     summary: Get hourly slot availability for a date and location
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema: { type: string, enum: [e3, e4] }
 *       - in: query
 *         name: date
 *         schema: { type: string, example: "2026-02-20" }
 *     responses:
 *       200:
 *         description: Array of slots with status
 */
router.get('/slots', async (req, res) => {
    try {
        const { location = 'e3', date } = req.query;

        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: 'date query param required (YYYY-MM-DD)' });
        }

        // Try real DB first, fall back to dummy
        let bookedHours = [];
        try {
            const table = location.toLowerCase() === 'e4' ? 'e4orders' : 'e3orders';
            const { data } = await supabase.from(table).select('items');
            if (data) {
                bookedHours = data.flatMap(row => row.items || [])
                    .filter(item => item.details?.date === date)
                    .map(item => parseInt((item.details?.startTime || '').split(':')[0]))
                    .filter(h => !isNaN(h));
            }
        } catch (_) { /* fall through to dummy */ }

        // Merge with dummy data for showcase
        const dummyBooked = getDummyBookedSlots(date, location);
        const allBookedSet = new Set([...bookedHours, ...dummyBooked]);

        // Build slot list
        const slots = [];
        for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
            const pad = n => String(n).padStart(2, '0');
            const from = `${pad(h)}:00`;
            const to = `${pad(h + 1)}:00`;
            const isBooked = allBookedSet.has(h);
            // Mark past slots as unavailable too
            const nowHour = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).getHours();
            const isToday = date === new Date().toISOString().split('T')[0];
            const isPast = isToday && h <= nowHour;

            slots.push({
                hour: h,
                startTime: from,
                endTime: to,
                label: `${from} – ${to}`,
                status: isPast ? 'past' : isBooked ? 'booked' : 'available',
                price: SLOT_PRICE,
            });
        }

        res.json({ date, location: location.toUpperCase(), slots, pricePerHour: SLOT_PRICE });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/bookings/check-availability:
 *   post:
 *     summary: Check if a specific time slot is available
 *     tags: [Bookings]
 */
router.post('/check-availability', async (req, res) => {
    try {
        const { date, startTime, location = 'e3' } = req.body;
        if (!date || !startTime) return res.status(400).json({ message: 'date and startTime required' });

        const hour = parseInt(startTime.split(':')[0]);
        const dummyBooked = getDummyBookedSlots(date, location);
        const available = !dummyBooked.includes(hour);
        res.json({ available, date, startTime, location });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all event bookings (Admin)
 */
router.get('/', [auth, admin], async (req, res) => {
    try {
        const { data: e3, error: e3Err } = await supabase.from('e3orders').select('*');
        const { data: e4, error: e4Err } = await supabase.from('e4orders').select('*');

        if (e3Err || e4Err) throw new Error('Failed to fetch orders');

        const allOrders = [...(e3 || []), ...(e4 || [])];

        const bookings = allOrders.flatMap(order => {
            const items = order.items || [];
            return items.filter(item =>
                item.category === 'event' ||
                (item.name && item.name.toLowerCase().includes('event')) ||
                (item.product && item.product.includes('event'))
            ).map(item => ({
                id: order._id,
                bookingId: order._id,
                name: 'Guest',
                facility: item.name,
                date: item.details?.date || order.createdAt,
                start_time: item.details?.startTime,
                end_time: item.details?.endTime,
                status: order.status,
                price: item.price,
                guests: item.quantity
            }));
        });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;


// Placeholder for Bookings - derived from Orders in the new schema
// To properly implement, we'd query e3orders/e4orders for items with category='event'

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings (Derived from Orders)
 */
router.get('/', [auth, admin], async (req, res) => {
    try {
        // Fetch all orders from both
        const { data: e3, error: e3Err } = await supabase.from('e3orders').select('*');
        const { data: e4, error: e4Err } = await supabase.from('e4orders').select('*');

        if (e3Err || e4Err) throw new Error('Failed to fetch orders');

        const allOrders = [...(e3 || []), ...(e4 || [])];

        // Filter for events
        const bookings = allOrders.flatMap(order => {
            // Items is JSONB array
            const items = order.items || [];
            return items.filter(item =>
                item.category === 'event' ||
                (item.name && item.name.toLowerCase().includes('event')) ||
                (item.product && item.product.includes('event'))
            ).map(item => ({
                id: order._id, // use order ID as booking ID ref
                bookingId: order._id,
                name: 'Guest', // User details need join or storing on order
                facility: item.name,
                date: item.details?.date || order.createdAt,
                start_time: item.details?.startTime,
                end_time: item.details?.endTime,
                status: order.status,
                price: item.price,
                guests: item.quantity
            }));
        });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
