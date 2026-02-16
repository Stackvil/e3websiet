const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { auth, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getEventsSchema, addEventSchema } = require('../schemas/validationSchemas');
const supabase = require('../utils/supabaseHelper');

// Helper to map Supabase ID
const mapRecord = (record) => {
    if (!record) return null;
    const id = record._id || record.id;
    return { ...record, _id: id, id: id };
};

// Helper: Get Table based on location
const getTable = (location) => {
    return (location || 'e3').toLowerCase() === 'e4' ? 'e4events' : 'e3events';
};

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management APIs
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *           enum: [E3, E4]
 *         description: Filter by location
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/', async (req, res) => {
    try {
        const { location } = req.query;
        // If location is provided, fetch from that table.
        // If not provided, fetch from E3 by default, or maybe merging both?
        // Let's default to retrieving E3 if unspecified, as usually user context is clear.

        const table = getTable(location);

        const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;
        res.json(data.map(mapRecord));
    } catch (err) {
        console.error('Fetch Events Error:', err);
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Add a new event (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
router.post('/', [auth, admin], async (req, res) => {
    try {
        const { location } = req.body;
        const table = getTable(location);

        const payload = {
            name: req.body.name,
            "start_time": req.body.start_time,
            "end_time": req.body.end_time,
            location: req.body.location,
            price: req.body.price,
            type: req.body.type,
            status: req.body.status,
            image: req.body.image,
            _id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(table)
            .insert([payload])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(mapRecord(data));
    } catch (err) {
        console.error('Create Event Error:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
