const express = require('express');
const router = express.Router();
const MockModel = require('../utils/mockDB');
const Analytics = new MockModel('Analytics');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * /api/analytics/stats:
 *   get:
 *     summary: Get platform usage statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform usage counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 web:
 *                   type: integer
 *                 mobile:
 *                   type: integer
 *                 total:
 *                   type: integer
 */
router.get('/stats', [auth, admin], async (req, res) => {
    try {
        const allData = await Analytics.find();

        const stats = {
            web: 0,
            mobile: 0,
            android: 0,
            ios: 0,
            total: allData.length
        };

        allData.forEach(entry => {
            const platform = (entry.platform || '').toLowerCase();
            if (platform === 'web') stats.web++;
            else if (platform === 'mobile') stats.mobile++;
            else if (platform === 'android') stats.android++;
            else if (platform === 'ios') stats.ios++;

            // Normalize for simple chart
            if (platform === 'android' || platform === 'ios') stats.mobile++;
        });

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
