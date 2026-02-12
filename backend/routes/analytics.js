const express = require('express');
const router = express.Router();
const MockModel = require('../utils/mockDB');
const E3Analytics = new MockModel('E3Analytics');
const E4Analytics = new MockModel('E4Analytics');
const { auth, admin } = require('../middleware/auth');

const getStats = (type) => async (req, res) => {
    try {
        const Model = type === 'e4' ? E4Analytics : E3Analytics;
        const allData = await Model.find();

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
};

/**
 * @swagger
 * /api/analytics/e3/stats:
 *   get:
 *     summary: Get E3 platform usage statistics
 *     tags: [Analytics - E3]
 *     security:
 *       - bearerAuth: []
 */
router.get('/e3/stats', [auth, admin], getStats('e3'));

/**
 * @swagger
 * /api/analytics/e4/stats:
 *   get:
 *     summary: Get E4 platform usage statistics
 *     tags: [Analytics - E4]
 *     security:
 *       - bearerAuth: []
 */
router.get('/e4/stats', [auth, admin], getStats('e4'));

// Legacy/Combined
router.get('/stats', [auth, admin], async (req, res) => {
    try {
        // Merge stats? Or default to E3?
        // Let's return combined for global view
        const e3Data = await E3Analytics.find();
        const e4Data = await E4Analytics.find();
        const allData = [...e3Data, ...e4Data];

        const stats = {
            web: 0,
            mobile: 0,
            total: allData.length
        };

        allData.forEach(entry => {
            const platform = (entry.platform || '').toLowerCase();
            if (platform === 'web') stats.web++;
            else stats.mobile++;
        });
        res.json(stats);

    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
