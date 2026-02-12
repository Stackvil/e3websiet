const express = require('express');
const router = express.Router();
const MockModel = require('../utils/mockDB');
const E3User = new MockModel('E3User');
const E4User = new MockModel('E4User'); // Assuming E4User table/model exists
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../schemas/validationSchemas');

// Helper to get User Model
const getUserModel = (type) => {
    return type === 'e4' ? E4User : E3User;
};

const getProfile = (type) => async (req, res) => {
    try {
        const Model = getUserModel(type);
        const user = await Model.findOne({ _id: req.user.id });

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Exclude password
        const { password, ...userProfile } = user;
        res.json(userProfile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateProfile = (type) => async (req, res) => {
    try {
        const Model = getUserModel(type);
        const { name, email, mobile } = req.body;

        // Ensure user exists first
        let user = await Model.findOne({ _id: req.user.id });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update fields
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (mobile) updateData.mobile = mobile;

        const updatedUser = await Model.findByIdAndUpdate(req.user.id, updateData);

        // Exclude password
        const { password, ...userProfile } = updatedUser;
        res.json(userProfile);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * @swagger
 * /api/profile/e3:
 *   get:
 *     summary: Get E3 User Profile
 *     tags: [Profile - E3]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/e3', auth, getProfile('e3'));

/**
 * @swagger
 * /api/profile/e3:
 *   put:
 *     summary: Update E3 User Profile
 *     tags: [Profile - E3]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/e3', [auth, validate(updateProfileSchema)], updateProfile('e3'));

/**
 * @swagger
 * /api/profile/e4:
 *   get:
 *     summary: Get E4 User Profile
 *     tags: [Profile - E4]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/e4', auth, getProfile('e4'));

/**
 * @swagger
 * /api/profile/e4:
 *   put:
 *     summary: Update E4 User Profile
 *     tags: [Profile - E4]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/e4', [auth, validate(updateProfileSchema)], updateProfile('e4'));

module.exports = router;
