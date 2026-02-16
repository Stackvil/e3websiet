const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseHelper');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../schemas/validationSchemas');

// Helper to get correct table name
const getUserTable = (type) => {
    return (type || 'e3').toLowerCase() === 'e4' ? 'e4users' : 'e3users';
};

const getProfile = (type) => async (req, res) => {
    try {
        const table = getUserTable(type);
        const { data: user, error } = await supabase
            .from(table)
            .select('*')
            .eq('_id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user._id,
            name: user.name,
            mobile: user.mobilenumber || user.mobile,
            role: user.role,
            createdAt: user.createdAt,
            location: type.toUpperCase()
        });
    } catch (err) {
        console.error('Profile Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const updateProfile = (type) => async (req, res) => {
    try {
        const table = getUserTable(type);
        const { name } = req.body; // Only allow updating Name for now?

        const { data: user, error } = await supabase
            .from(table)
            .update({ name })
            .eq('_id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            id: user._id,
            name: user.name,
            mobile: user.mobilenumber,
            role: user.role,
            createdAt: user.createdAt,
            location: type.toUpperCase()
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management
 */

/**
 * @swagger
 * /api/profile/e3:
 *   get:
 *     summary: Get E3 User Profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/e3', auth, getProfile('e3'));

/**
 * @swagger
 * /api/profile/e3:
 *   put:
 *     summary: Update E3 User Profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.put('/e3', [auth, validate(updateProfileSchema)], updateProfile('e3'));


/**
 * @swagger
 * /api/profile/e4:
 *   get:
 *     summary: Get E4 User Profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/e4', auth, getProfile('e4'));

/**
 * @swagger
 * /api/profile/e4:
 *   put:
 *     summary: Update E4 User Profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.put('/e4', [auth, validate(updateProfileSchema)], updateProfile('e4'));

module.exports = router;
