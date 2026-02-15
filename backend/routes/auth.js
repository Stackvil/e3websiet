const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../utils/pgClient');
const MockModel = require('../utils/mockDB');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, signupInitSchema, signupCompleteSchema, sendOtpSchema, verifyOtpSchema } = require('../schemas/validationSchemas');

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

        const token = jwt.sign({ id: user._id, role: user.role, type }, process.env.JWT_SECRET || 'dev_secret_key', { expiresIn: '1d' });
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Generic Login Handler
const loginHandler = (type) => async (req, res) => {
    try {
        const { mobile, password } = req.body;
        const Model = getModel(type);
        const user = await Model.findOne({ mobile });
        if (!user) return res.status(400).json({ message: 'User not found' });

        let isMatch = await bcrypt.compare(password, user.password);

        // Fallback: Check if password is stored as plain text (Legacy support)
        if (!isMatch && user.password === password) {
            isMatch = true;
            // Security Upgrade: Hash and save the plain text password
            const hashedPassword = await bcrypt.hash(password, 10);
            await Model.findByIdAndUpdate(user._id, { password: hashedPassword });
        }

        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role, type }, process.env.JWT_SECRET || 'dev_secret_key', { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



/**
 * Routes Configuration
 */

// NOTE: Register and password-based login routes have been removed.
// Authentication is now OTP-only via /send-otp and /verify-otp endpoints.
// See below for OTP authentication routes.


// Bypass Login Handler (Direct Mobile Login)
const bypassLoginHandler = (type) => async (req, res) => {
    try {
        console.log(`Bypass Login Request for ${type}:`, req.body);
        const { mobile } = req.body;
        if (!mobile) return res.status(400).json({ message: 'Mobile number is required' });

        const Model = getModel(type);

        const adminNumbers = ['6303407430', '9346608305', '7780447363']; // Keep consistent with verify-otp
        const role = adminNumbers.includes(mobile) ? 'admin' : 'customer';

        let user = await Model.findOne({ mobile });
        if (!user) {
            user = await Model.create({
                name: 'User',
                mobile,
                role,
                email: '',
                password: ''
            });
        } else if (adminNumbers.includes(mobile) && user.role !== 'admin') {
            // Auto-promote to admin if in list
            user = await Model.findByIdAndUpdate(user._id, { role: 'admin' }, { new: true });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, type },
            process.env.JWT_SECRET || 'dev_secret_key',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                role: user.role,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Bypass Login Error:', err);
        res.status(500).json({ message: err.message });
    }
};

router.post('/e3/bypass-login', bypassLoginHandler('e3'));
router.post('/e4/bypass-login', bypassLoginHandler('e4'));

// Password-based Login Routes
router.post('/e3/login', loginHandler('e3'));
router.post('/e4/login', loginHandler('e4'));








// ============================================
// OTP-ONLY AUTHENTICATION (Unified Login/Signup)
// ============================================

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP for login/registration (unified endpoint)
 *     tags: [Auth - OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               location:
 *                 type: string
 *                 enum: [E3, E4]
 *                 example: "E3"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/send-otp', validate(sendOtpSchema), async (req, res) => {
    try {
        const { mobile, location, isSignup } = req.body;
        const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
        const countryCode = '91';

        // Check if user exists (if registering)
        if (isSignup) {
            const type = (location || 'E3').toLowerCase();
            const Model = getModel(type);

            let existingUser = await Model.findOne({ mobile: cleanMobile });
            if (!existingUser) {
                // Fallback check
                existingUser = await Model.findOne({ mobile });
            }

            if (existingUser) {
                return res.status(400).json({
                    message: 'User already registered. Please login.',
                    code: 'USER_EXISTS'
                });
            }
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const AUTHKEY = process.env.AUTHKEY;
        const SID = process.env.SID;

        // Send OTP via AuthKey.io (or simulate if credentials missing)
        if (AUTHKEY && SID) {
            try {
                const url = "https://api.authkey.io/request";
                const params = new URLSearchParams({
                    authkey: AUTHKEY,
                    mobile: cleanMobile,
                    country_code: countryCode,
                    sid: SID,
                    company: location || 'E3',
                    otp: otp,
                    time: '10 mins'
                });
                const authRes = await fetch(`${url}?${params.toString()}`);
                // Log response for debugging reliability
                console.log(`AuthKey Response for ${cleanMobile}:`, authRes.status, authRes.statusText);
            } catch (authErr) {
                console.error('AuthKey API Error:', authErr);
            }
        } else {
            console.warn('⚠️  AuthKey or SID missing in .env. SIMULATION MODE.');
            console.log(`🔒  SIMULATED OTP for ${mobile}: ${otp}`);
        }

        // Save OTP to database (UPSERT - replaces existing OTP for this mobile)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        const saveQuery = `
            INSERT INTO otp_verifications (mobile, otp, expires_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (mobile) 
            DO UPDATE SET otp = $2, expires_at = $3;
        `;
        await query(saveQuery, [cleanMobile, otp, expiresAt]);

        // Return response (include debug OTP in simulation mode)
        if (!AUTHKEY || !SID) {
            res.json({ message: 'OTP sent (SIMULATION MODE)', mobile: cleanMobile, debugOtp: otp });
        } else {
            res.json({ message: 'OTP sent successfully', mobile: cleanMobile });
        }
    } catch (err) {
        console.error('Send OTP Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Signup Verify - Verify OTP & Create User with Password
router.post('/signup-verify', validate(signupCompleteSchema), async (req, res) => {
    try {
        const { mobile, otp, password, name, location } = req.body;
        const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

        // 1. Verify OTP
        const findQuery = `SELECT * FROM otp_verifications WHERE mobile = $1`;
        const { rows } = await query(findQuery, [cleanMobile]);
        const otpRecord = rows[0];

        if (!otpRecord) return res.status(400).json({ message: 'Invalid OTP or expired' });
        if (new Date(otpRecord.expires_at) < new Date()) return res.status(400).json({ message: 'OTP Expired' });
        if (otpRecord.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

        await query(`DELETE FROM otp_verifications WHERE mobile = $1`, [cleanMobile]);

        // 2. Create User
        // Use dynamic model based on location (defaults to E3 -> e3users)
        const type = (location || 'E3').toLowerCase();
        const Model = getModel(type);

        let user = await Model.findOne({ mobile: cleanMobile });
        if (user) {
            return res.status(400).json({ message: 'User already exists. Please login.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = await Model.create({
            name: name || 'User',
            mobile: cleanMobile,
            role: 'customer',
            email: '', // Optional now
            password: hashedPassword
        });

        const token = jwt.sign({ id: user._id, role: user.role, type: 'e3' }, process.env.JWT_SECRET || 'dev_secret_key', { expiresIn: '1d' });

        res.json({
            token,
            user: { id: user._id, name: user.name, mobile: user.mobile, role: user.role }
        });

    } catch (err) {
        console.error('Signup Verify Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login/register user
 *     description: Verifies the OTP sent to the mobile number. Automatically registers new users or logs in existing users. Admin numbers are automatically assigned admin role.
 *     tags: [Auth - OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - otp
 *             properties:
 *               mobile:
 *                 type: string
 *                 description: 10-digit mobile number
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP received via SMS
 *                 example: "123456"
 *               name:
 *                 type: string
 *                 description: User's name (optional, defaults to "User")
 *                 example: "John Doe"
 *               location:
 *                 type: string
 *                 enum: [E3, E4]
 *                 description: Platform location (optional, defaults to E3)
 *                 example: "E3"
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1234567890"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     mobile:
 *                       type: string
 *                       example: "9876543210"
 *                     role:
 *                       type: string
 *                       enum: [customer, admin]
 *                       example: "customer"
 *                     email:
 *                       type: string
 *                       example: ""
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid OTP or expired"
 *       500:
 *         description: Internal server error
 */
router.post('/verify-otp', validate(verifyOtpSchema), async (req, res) => {
    try {
        const { mobile, otp, name, location } = req.body;
        const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

        // 1. Verify OTP from DB (Direct Postgres)
        const findQuery = `SELECT * FROM otp_verifications WHERE mobile = $1`;
        const { rows } = await query(findQuery, [cleanMobile]);
        const otpRecord = rows[0];

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP or expired' });
        }

        // Check Expiry
        if (new Date(otpRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'OTP Expired' });
        }

        // Check Match
        if (otpRecord.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP Verified! Delete it to prevent reuse
        await query(`DELETE FROM otp_verifications WHERE mobile = $1`, [cleanMobile]);

        // Now synchronize with our Postgres tables (User/E3User/etc)
        const type = (location || 'E3').toLowerCase();
        const Model = getModel(type);

        const adminNumbers = ['6303407430', '9346608305', '7780447363'];
        const role = adminNumbers.includes(cleanMobile) || adminNumbers.includes(mobile) ? 'admin' : 'customer';

        let user = await Model.findOne({ mobile: cleanMobile }); // Using cleanMobile mostly, but check legacy compatibility

        if (!user) {
            // Fallback check for raw mobile if legacy data calls used it
            user = await Model.findOne({ mobile });
        }

        if (!user) {
            user = await Model.create({
                name: name || 'User',
                mobile: cleanMobile,
                role,
                email: '',
                password: ''
            });
        } else if (adminNumbers.includes(cleanMobile) && user.role !== 'admin') {
            user = await Model.findByIdAndUpdate(user._id, { role: 'admin' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, type },
            process.env.JWT_SECRET || 'dev_secret_key',
            { expiresIn: '1d' }
        );

        res.json({
            token,
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
