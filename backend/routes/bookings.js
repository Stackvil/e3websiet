const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseHelper');
const { auth, admin } = require('../middleware/auth');

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
