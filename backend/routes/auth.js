const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const MockModel = require('../utils/mockDB');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, sendOtpSchema, verifyOtpSchema } = require('../schemas/validationSchemas');

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



/**
 * Routes Configuration
 */

// Legacy/Default Routes (Maps to User/E3User typically, depending on legacy need. Mapping to generic User for now)
router.post('/register', validate(registerSchema), registerHandler('default'));
router.post('/login', validate(loginSchema), loginHandler('default'));


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




const supabase = require('../utils/supabaseHelper');

// OTP Routes (Real Supabase Auth Integration)
router.post('/send-otp', validate(sendOtpSchema), async (req, res) => {
    try {
        const { mobile } = req.body;
        // Ensure +91 prefix for Indian numbers if not present
        const phoneNumber = mobile.startsWith('+') ? mobile : `+91${mobile}`;

        const { data, error } = await supabase.auth.signInWithOtp({
            phone: phoneNumber,
        });

        if (error) {
            console.error('Supabase OTP Send Error:', error);
            return res.status(error.status || 500).json({ message: error.message });
        }

        res.json({ message: 'OTP sent successfully', mobile });
    } catch (err) {
        console.error('Auth Send OTP Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/verify-otp', validate(verifyOtpSchema), async (req, res) => {
    try {
        const { mobile, otp, name, location } = req.body;
        const phoneNumber = mobile.startsWith('+') ? mobile : `+91${mobile}`;

        const { data, error } = await supabase.auth.verifyOtp({
            phone: phoneNumber,
            token: otp,
            type: 'sms',
        });

        if (error) {
            console.error('Supabase OTP Verify Error:', error);
            return res.status(error.status || 400).json({ message: error.message });
        }

        // OTP Verified! Now synchronize with our Postgres tables
        const type = (location || 'E3').toLowerCase();
        const Model = getModel(type);

        const adminNumbers = ['6303407430', '9346608305', '7780447363'];
        const role = adminNumbers.includes(mobile) ? 'admin' : 'customer';

        let user = await Model.findOne({ mobile });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            user = await Model.create({
                name: name || '',
                mobile,
                role,
                email: '',
                password: ''
            });
        } else if (adminNumbers.includes(mobile) && user.role !== 'admin') {
            user = await Model.findByIdAndUpdate(user._id, { role: 'admin' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, type },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            isNewUser,
            user: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                role: user.role,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Auth Verify OTP Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
