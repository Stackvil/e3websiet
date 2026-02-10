const express = require('express');
const router = express.Router();
const MockModel = require('../utils/mockDB');
const { auth, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { addRideSchema } = require('../schemas/validationSchemas');

const E4Ride = new MockModel('E4Ride'); // table: e4rides
const E4Dine = new MockModel('E4Dine'); // Future proofing? But not created yet.

/**
 * @swagger
 * /api/e4/rides:
 *   get:
 *     summary: Get all E4 rides
 *     tags: [E4]
 *     responses:
 *       200:
 *         description: List of E4 rides
 */
router.get('/rides', async (req, res) => {
    try {
        const rides = await E4Ride.find();
        res.json(rides);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/e4/rides:
 *   post:
 *     summary: Add a new ride (Admin only)
 *     tags: [E4]
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
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               ageGroup:
 *                 type: string
 *               category:
 *                 type: string
 *               stall:
 *                 type: string
 *               type:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [on, off]
 *               image:
 *                 type: string
 *               desc:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ride created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
router.post('/rides', [auth, admin, validate(addRideSchema)], async (req, res) => {
    try {
        const newItem = await E4Ride.create(req.body);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
