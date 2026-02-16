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
 * /api/profile:
 *   get:
 *     summary: Get User Profile
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
 *     summary: Update User Profile
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
 *               email:
 *                  type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
            createdAt: updatedUser.createdAt,
            location: location
        });

    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(400).json({ message: err.message });
    }
});

// Backward compatibility routes (optional, but good to keep if frontend relies on them)
router.get('/:type', auth, async (req, res) => {
    // This will catch /e3 or /e4 request if frontend not updated, but let's just use the generic logic above.
    // If exact match needed:
    req.url = '/';
    req.app.handle(req, res);
});

module.exports = router;
