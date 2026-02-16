const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../utils/supabaseHelper');
const validate = require('../middleware/validate');
const { sendOtpSchema, verifyOtpSchema } = require('../schemas/validationSchemas');

// Helper to map Supabase ID to _id for frontend compatibility
const mapAuthData = (data) => {
    if (!data) return null;
    return { ...data, id: data._id || data.id };
};

// Helper: Get Table Name based on location
const getUserTable = (location) => {
    return (location || 'e3').toLowerCase() === 'e4' ? 'e4users' : 'e3users';
};

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to mobile number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mobile]
 *             properties:
 *               mobile:
 *                 type: string
 *                 description: 10-digit mobile number
 *               location:
 *                 type: string
 *                 enum: [E3, E4]
 *                 default: E3
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 mobile:
 *                   type: string
 *                 debugOtp:
 *                   type: string
 *                   description: Development only OTP
 *       400:
 *         description: Invalid input
 */
router.post('/send-otp', validate(sendOtpSchema), async (req, res) => {
    try {
        const { mobile, location } = req.body;
        const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Expiry: 10 minutes from now
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        // AUTHKEY Integration (or Simulation)
        const AUTHKEY = process.env.AUTHKEY;
        const SID = process.env.SID;

        if (AUTHKEY && SID) {
            try {
                // Real SMS sending logic (Sample fetch implementation)
                const url = "https://api.authkey.io/request";
                const params = new URLSearchParams({
                    authkey: AUTHKEY,
                    mobile: cleanMobile,
                    country_code: '91',
                    sid: SID,
                    company: 'E3',
                    otp: otp,
                    time: '10 mins'
                });

                // Using global fetch (require Node 18+)
                await fetch(`${url}?${params.toString()}`);
                console.log(`OTP sent to ${cleanMobile}`);
            } catch (err) {
                console.error('SMS Provider Error:', err);
            }
        } else {
            console.log(`[DEV] SIMULATED OTP for ${cleanMobile}: ${otp}`);
        }

        // Upsert OTP into 'otps' table
        const { error } = await supabase
            .from('otps')
            .upsert({
                mobile: cleanMobile,
                otp: otp,
                "expiresAt": expiresAt,
                "createdAt": new Date()
            }, { onConflict: 'mobile' });

        if (error) {
            console.error('Supabase OTP Error:', error);
            throw new Error(error.message);
        }

        // Response
        const responseCtx = { message: 'OTP sent successfully', mobile: cleanMobile };
        if (!AUTHKEY) responseCtx.debugOtp = otp; // Only in dev mode

        res.json(responseCtx);

    } catch (err) {
        console.error('Send OTP Error:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login/register
 *     description: Verifies the OTP. If user exists, logs them in. If not, creates a new user with role 'customer'.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mobile, otp]
 *             properties:
 *               mobile:
 *                 type: string
 *               otp:
 *                 type: string
 *               name:
 *                 type: string
 *                 description: Optional name for new registration
 *               location:
 *                 type: string
 *                 enum: [E3, E4]
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid OTP or expired
 */
router.post('/verify-otp', validate(verifyOtpSchema), async (req, res) => {
    try {
        const { mobile, otp, name, location } = req.body;
        const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
        const userTable = getUserTable(location);

        // 1. Verify OTP
        const { data: otpRecord, error: otpError } = await supabase
            .from('otps')
            .select('*')
            .eq('mobile', cleanMobile)
            .single();

        if (otpError || !otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

        // Check Expiry
        if (new Date(otpRecord.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'OTP Expired' });
        }
        // Check Match
        if (String(otpRecord.otp) !== String(otp)) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Delete used OTP
        await supabase.from('otps').delete().eq('mobile', cleanMobile);

        // 2. Find or Create User
        // Admin numbers list - updated by user request
        const adminNumbers = ['6303407430', '9346608305'];
        const isAdmin = adminNumbers.includes(cleanMobile);

        // Check if user exists
        let { data: user, error: userError } = await supabase
            .from(userTable)
            .select('*')
            .eq('mobilenumber', cleanMobile)
            .single();

        if (!user) {
            // Register New User
            const newUserObj = {
                _id: crypto.randomUUID(),
                name: name || 'User',
                mobilenumber: cleanMobile,
                role: isAdmin ? 'admin' : 'customer', // Default role customer
                "createdAt": new Date()
            };

            const { data: newUser, error: createError } = await supabase
                .from(userTable)
                .insert([newUserObj])
                .select()
                .single();

            if (createError) throw new Error(createError.message);
            user = newUser;
        } else {
            // Check for admin promotion
            if (isAdmin && user.role !== 'admin') {
                const { data: updatedUser, error: updateError } = await supabase
                    .from(userTable)
                    .update({ role: 'admin' })
                    .eq('mobilenumber', cleanMobile)
                    .select()
                    .single();

                if (!updateError) user = updatedUser;
            }
        }

        // 3. Generate Token
        const token = jwt.sign(
            { id: user._id, role: user.role, type: location || 'E3' }, // Payload
            process.env.JWT_SECRET || 'dev_secret_key',
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: mapAuthData(user)
        });

    } catch (err) {
        console.error('Verify OTP Error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
