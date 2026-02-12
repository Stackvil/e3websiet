const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const MockModel = require('../utils/mockDB');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, sendOtpSchema, verifyOtpSchema, bypassLoginSchema } = require('../schemas/validationSchemas');

// Initialize Models
const User = new MockModel('User');
const E3User = new MockModel('E3User');
const E4User = new MockModel('E4User');

// Helper to get correct model based on type
const getModel = (type) => {
    switch (type) {
        case 'e4': return E4User;
        case 'e3': return E3User;
        default: return User; // Default/Legacy
    }
};

// Generic Register Handler
const registerHandler = (type) => async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const Model = getModel(type);
        let user = await Model.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = await Model.create({ name, email, password: hashedPassword, role: role || 'customer' });

        const token = jwt.sign({ id: user._id, role: user.role, type }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Generic Login Handler
const loginHandler = (type) => async (req, res) => {
    try {
        const { email, password } = req.body;
        const Model = getModel(type);
        const user = await Model.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role, type }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Generic Bypass Login Handler
const bypassLoginHandler = (type) => async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile) return res.status(400).json({ message: 'Mobile number is required' });

        const adminNumbers = ['6303407430', '6303407431'];
        const Model = getModel(type);

        let user = await Model.findOne({ mobile });

        // If user doesn't exist, create one
        if (!user) {
            const role = adminNumbers.includes(mobile) ? 'admin' : 'customer';
            user = await Model.create({
                name: 'User',
                mobile,
                role,
                email: '',
                password: '' // No password for mobile users
            });
        } else if (adminNumbers.includes(mobile) && user.role !== 'admin') {
            // Upgrade to admin if needed
            user = await Model.findByIdAndUpdate(user._id, { role: 'admin' });
        }

        const token = jwt.sign({ id: user._id, role: user.role, type }, process.env.JWT_SECRET || 'dev_secret_key', { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role, email: user.email } });

    } catch (err) {
        console.error('Bypass Login Error:', err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * Routes Configuration
 */

// Legacy/Default Routes (Maps to User/E3User typically, depending on legacy need. Mapping to generic User for now)
router.post('/register', validate(registerSchema), registerHandler('default'));
router.post('/login', validate(loginSchema), loginHandler('default'));
router.post('/bypass-login', validate(bypassLoginSchema), bypassLoginHandler('default'));

// E3 Specific Routes
/**
 * @swagger
 * /api/auth/e3/register:
 *   post:
 *     summary: Register a new E3 user
 *     tags: [Auth - E3]
 */
router.post('/e3/register', validate(registerSchema), registerHandler('e3'));

/**
 * @swagger
 * /api/auth/e3/login:
 *   post:
 *     summary: Login an E3 user
 *     tags: [Auth - E3]
 */
router.post('/e3/login', validate(loginSchema), loginHandler('e3'));

/**
 * @swagger
 * /api/auth/e3/bypass-login:
 *   post:
 *     summary: Direct access login for E3 (Mobile only)
 *     tags: [Auth - E3]
 */
router.post('/e3/bypass-login', validate(bypassLoginSchema), bypassLoginHandler('e3'));

// E4 Specific Routes
/**
 * @swagger
 * /api/auth/e4/register:
 *   post:
 *     summary: Register a new E4 user
 *     tags: [Auth - E4]
 */
router.post('/e4/register', validate(registerSchema), registerHandler('e4'));

/**
 * @swagger
 * /api/auth/e4/login:
 *   post:
 *     summary: Login an E4 user
 *     tags: [Auth - E4]
 */
router.post('/e4/login', validate(loginSchema), loginHandler('e4'));

/**
 * @swagger
 * /api/auth/e4/bypass-login:
 *   post:
 *     summary: Direct access login for E4 (Mobile only)
 *     tags: [Auth - E4]
 */
router.post('/e4/bypass-login', validate(bypassLoginSchema), bypassLoginHandler('e4'));


// OTP Routes (Keeping generic for now, typically SMS service is shared)
router.post('/send-otp', validate(sendOtpSchema), async (req, res) => {
    const { mobile } = req.body;
    console.log(`Sending OTP to ${mobile}: 123456`);
    res.json({ message: 'OTP sent successfully (Dummy: 123456)', mobile });
});

router.post('/verify-otp', validate(verifyOtpSchema), async (req, res) => {
    // Note: Verify OTP creates users. This logic needs to know WHICH user table to create in.
    // Assuming 'default' User table for generic verify-otp for now.
    // If strict separation needed here, we need /e3/verify-otp etc.
    // For now, retaining legacy behavior for this specific route.
    try {
        const { mobile, otp, name } = req.body;
        if (String(otp).trim() !== '123456') return res.status(400).json({ message: 'Invalid OTP' });

        const adminNumbers = ['6303407430', '9346608305', '7780447363'];
        const role = adminNumbers.includes(mobile) ? 'admin' : 'customer';

        let user = await User.findOne({ mobile });
        if (!user) {
            user = await User.create({ name: name || 'User', mobile, role });
        } else if (adminNumbers.includes(mobile) && user.role !== 'admin') {
            await User.findByIdAndUpdate(user._id, { role: 'admin' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret_key', { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error: ' + err.message });
    }
});

module.exports = router;
