const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const MockModel = require('../utils/mockDB');
const User = new MockModel('User');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, sendOtpSchema, verifyOtpSchema, bypassLoginSchema } = require('../schemas/validationSchemas');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post('/register', validate(registerSchema), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({ name, email, password: hashedPassword, role: role || 'customer' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 */
router.post('/login', validate(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send dummy OTP
 *     tags: [Auth]
 */
// Update send-otp to accept mobile
router.post('/send-otp', validate(sendOtpSchema), async (req, res) => {
    const { mobile } = req.body;
    // In a real app, integrate with SMS provider (e.g., Twilio, Msg91)
    console.log(`Sending OTP to ${mobile}: 123456`);
    res.json({ message: 'OTP sent successfully (Dummy: 123456)', mobile });
});

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify dummy OTP and login
 *     tags: [Auth]
 */
router.post('/verify-otp', validate(verifyOtpSchema), async (req, res) => {
    try {
        const { mobile, otp, name } = req.body;
        console.log(`Verifying OTP for ${mobile}: Received '${otp}' (Type: ${typeof otp})`);

        if (String(otp).trim() !== '123456') {
            console.log('OTP Validation Failed');
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const adminNumbers = ['6303407430', '9346608305', '7780447363'];
        const role = adminNumbers.includes(mobile) ? 'admin' : 'customer';

        let user = await User.findOne({ mobile });
        if (!user) {
            // Create a new user if not exists
            user = await User.create({
                name: name || 'User',
                mobile,
                role
            });
        } else if (adminNumbers.includes(mobile) && user.role !== 'admin') {
            // Upgrade existing user to admin if they are in the list
            user.role = 'admin';
            await User.findByIdAndUpdate(user._id, { role: 'admin' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret_key', { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role } });
    } catch (err) {
        console.error('Verify OTP Error:', err);
        res.status(500).json({ message: 'Internal Server Error: ' + err.message });
    }
});

/**
 * @swagger
 * /api/auth/bypass-login:
 *   post:
 *     summary: Direct login via mobile number (Bypass OTP)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *             properties:
 *               mobile:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid input
 */
router.post('/bypass-login', validate(bypassLoginSchema), async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile) return res.status(400).json({ message: 'Mobile number is required' });

        const adminNumbers = ['6303407430', '6303407431'];

        let user = await User.findOne({ mobile });

        // If user doesn't exist, create one
        if (!user) {
            const role = adminNumbers.includes(mobile) ? 'admin' : 'customer';
            user = await User.create({
                name: 'User',
                mobile,
                role,
                email: '',
                password: '' // No password for mobile users
            });
        } else if (adminNumbers.includes(mobile) && user.role !== 'admin') {
            // Upgrade to admin if needed
            user = await User.findByIdAndUpdate(user._id, { role: 'admin' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret_key', { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role, email: user.email } });

    } catch (err) {
        console.error('Bypass Login Error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
