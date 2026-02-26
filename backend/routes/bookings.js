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
 *     description: |
 *       Fetches all orders from E3 and E4, filters out the event-related items,
 *       and maps them with user details for the Admin Dashboard.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', [auth, admin], async (req, res) => {
    try {
        console.log("Admin fetching all bookings...");

        // Fetch all data in parallel for speed
        const [e3Orders, e4Orders, e3Users, e4Users] = await Promise.all([
            supabase.from('e3orders').select('*').order('createdAt', { ascending: false }),
            supabase.from('e4orders').select('*').order('createdAt', { ascending: false }),
            supabase.from('e3users').select('_id, name, mobilenumber, email'),
            supabase.from('e4users').select('_id, name, mobilenumber, email')
        ]);

        if (e3Orders.error) console.error("E3 Orders Error:", e3Orders.error);
        if (e4Orders.error) console.error("E4 Orders Error:", e4Orders.error);

        const allOrders = [...(e3Orders.data || []), ...(e4Orders.data || [])];

        // Create a fast lookup map for users
        const usersMap = {};
        [...(e3Users.data || []), ...(e4Users.data || [])].forEach(u => {
            if (u._id) usersMap[u._id] = u;
        });

        const formatTime12h = (time24) => {
            if (!time24) return '';
            const parts = time24.split(':');
            let h = parseInt(parts[0]);
            const m = parts[1] || '00';
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            return `${h}:${m} ${ampm}`;
        };

        const bookings = allOrders.flatMap(order => {
            const items = order.items || [];

            // Filter logic: Must be an event category or contain booking/event/celebration keywords
            return items.filter(item => {
                const itemName = (item.name || '').toLowerCase();
                const isEvent = item.category === 'events' ||
                    item.category === 'event' ||
                    item.stall === 'Events' ||
                    itemName.includes('booking') ||
                    itemName.includes('event') ||
                    itemName.includes('celebration zone') ||
                    itemName.includes('vip dining') ||
                    (item.id && item.id.toString().startsWith('event-'));

                // Only include successful or confirmed bookings for the main list
                const status = (order.status || '').toLowerCase();
                const isValidOrder = status === 'success' || status === 'confirmed' || status === 'placed';

                return isEvent && isValidOrder;
            }).map(item => {
                const user = usersMap[order.userId] || usersMap[order.udf2] || {};

                // Format time string
                let timeStr = 'N/A';
                if (item.details?.startTime) {
                    timeStr = formatTime12h(item.details.startTime);
                    if (item.details.endTime) {
                        timeStr += ` - ${formatTime12h(item.details.endTime)}`;
                    }
                }

                return {
                    id: `${order._id}-${Math.random().toString(36).substr(2, 4)}`,
                    bookingId: order._id,
                    name: user.name || 'Guest',
                    mobile: user.mobilenumber || 'N/A',
                    email: user.email || 'N/A',
                    facility: item.name,
                    date: item.details?.date || new Date(order.createdAt).toLocaleDateString('en-IN'),
                    time: timeStr,
                    status: order.status,
                    price: item.price,
                    guests: item.details?.guests || item.quantity || 1,
                    orderDate: order.createdAt
                };
            });
        });

        // Sort by date newest first
        bookings.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        res.json(bookings);
    } catch (err) {
        console.error("Fetch Bookings Error:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
