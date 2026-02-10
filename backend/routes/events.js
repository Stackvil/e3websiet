const express = require('express');
const router = express.Router();
const MockModel = require('../utils/mockDB');
const { auth, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getEventsSchema, addEventSchema } = require('../schemas/validationSchemas');

const Event = new MockModel('Event'); // table: events

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
 *         description: Filter by location (E3 or E4)
 *     responses:
 *       200:
 *         description: List of events
 */
router.get('/', validate(getEventsSchema), async (req, res) => {
    try {
        const { location } = req.query;
        let query = {};
        if (location) {
            query.location = location; // MockDB/Supabase handles filter
        }

        // MockModel.find(query) maps to Supabase.from(events).select('*').eq(field, value)
        // Wait, MockModel.find(query) logic needs to support query object properly.
        // Let's verify MockDB implementation later, but assuming basic filter support.

        const events = await Event.find(query);
        res.json(events);
    } catch (err) {
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
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *                 enum: [E3, E4]
 *               price:
 *                 type: number
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *               status:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
router.post('/', [auth, admin, validate(addEventSchema)], async (req, res) => {
    try {
        const newItem = await Event.create(req.body);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
