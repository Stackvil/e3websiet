const express = require('express');
const router = express.Router();
const MockModel = require('../utils/mockDB');
const { auth, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { addRideSchema, addDineSchema } = require('../schemas/validationSchemas');

const E3Ride = new MockModel('E3Ride'); // table: e3rides
const E3Dine = new MockModel('E3Dine'); // table: e3dines

/**
 * @swagger
 * /api/e3/rides:
 *   get:
 *     summary: Get all E3 rides
 *     tags: [E3]
 *     responses:
 *       200:
 *         description: List of E3 rides
 */
router.get('/rides', async (req, res) => {
    try {
        const rides = await E3Ride.find();
        res.json(rides);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/e3/dine:
 *   get:
 *     summary: Get all E3 dine items
 *     tags: [E3]
 *     responses:
 *       200:
 *         description: List of E3 dine items
 */
router.get('/dine', async (req, res) => {
    try {
        const dineItems = await E3Dine.find();
        res.json(dineItems);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/e3/rides:
 *   post:
 *     summary: Add a new ride (Admin only)
 *     tags: [E3]
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
        const newItem = await E3Ride.create(req.body);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/e3/dine:
 *   post:
 *     summary: Add a new dine item (Admin only)
 *     tags: [E3]
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
 *               category:
 *                 type: string
 *               cuisine:
 *                 type: string
 *               stall:
 *                 type: string
 *               image:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [on, off]
 *               open:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Dine item created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
router.post('/dine', [auth, admin, validate(addDineSchema)], async (req, res) => {
    try {
        const newItem = await E3Dine.create(req.body);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
