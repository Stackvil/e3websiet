const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseHelper');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../schemas/validationSchemas');

// Helper to find user in either table
const findUser = async (id) => {
    // Try E3 first
    const { data: e3User } = await supabase
        .from('e3users')
        .select('*')
        .eq('_id', id)
        .single();

    if (e3User) return { user: e3User, table: 'e3users', location: 'E3' };

    // Try E4
    const { data: e4User } = await supabase
        .from('e4users')
        .select('*')
        .eq('_id', id)
        .single();

    if (e4User) return { user: e4User, table: 'e4users', location: 'E4' };

    return null;
};

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProfileResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: User ID (_id from database)
 *           example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *         name:
 *           type: string
 *           example: "Karthik"
 *         mobile:
 *           type: string
 *           example: "9876543210"
 *         role:
 *           type: string
 *           enum: [customer, admin]
 *           example: "customer"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         location:
 *           type: string
 *           enum: [E3, E4]
 *           description: Which park the user is registered under
 *           example: "E3"
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     description: |
 *       Returns the profile of the currently authenticated user.
 *       The user is identified via the JWT access token in the `Authorization` header.
 *       The system automatically searches both E3 and E4 user tables.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *             example:
 *               id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *               name: "Karthik"
 *               mobile: "9876543210"
 *               role: "customer"
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               location: "E3"
 *       401:
 *         description: Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found in E3 or E4 tables
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', auth, async (req, res) => {
    try {
        const result = await findUser(req.user.id);

        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { user, location } = result;

        res.json({
            id: user._id,
            name: user.name,
            mobile: user.mobilenumber || user.mobile,
            role: user.role,
            reward_points: user.reward_points || 0,
            createdAt: user.createdAt,
            location: location
        });
    } catch (err) {
        console.error('Profile Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update authenticated user's profile
 *     description: |
 *       Updates the name and/or email of the currently authenticated user.
 *       Only the fields provided in the request body will be updated (partial update).
 *       The user is identified via the JWT access token.
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
 *                 example: "Karthik Kumar"
 *                 description: New display name
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "karthik@example.com"
 *                 description: New email address
 *           example:
 *             name: "Karthik Kumar"
 *             email: "karthik@example.com"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *             example:
 *               id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *               name: "Karthik Kumar"
 *               mobile: "9876543210"
 *               role: "customer"
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               location: "E3"
 *       400:
 *         description: Validation error or database update failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/', [auth, validate(updateProfileSchema)], async (req, res) => {
    try {
        const result = await findUser(req.user.id);
        if (!result) return res.status(404).json({ message: 'User not found' });

        const { table, location } = result;
        const { name, email } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        const { data: updatedUser, error } = await supabase
            .from(table)
            .update(updateData)
            .eq('_id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            id: updatedUser._id,
            name: updatedUser.name,
            mobile: updatedUser.mobilenumber,
            role: updatedUser.role,
            reward_points: updatedUser.reward_points || 0,
            createdAt: updatedUser.createdAt,
            location: location
        });

    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/profile/{type}:
 *   get:
 *     summary: Get profile (backward compatibility alias)
 *     description: |
 *       Backward compatibility route. Accepts `/api/profile/e3` or `/api/profile/e4`
 *       but internally delegates to `GET /api/profile`.
 *       Prefer using `GET /api/profile` directly.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [e3, e4]
 *         description: Park type (ignored — resolved automatically from token)
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *       401:
 *         description: Missing or invalid JWT token
 *       404:
 *         description: User not found
 */
// Backward compatibility routes (optional, but good to keep if frontend relies on them)
router.get('/:type', auth, async (req, res) => {
    req.url = '/';
    req.app.handle(req, res);
});

module.exports = router;
