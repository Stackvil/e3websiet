const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseHelper');
const { auth, admin } = require('../middleware/auth');

const getStats = (type) => async (req, res) => {
    try {
        const table = type === 'e4' ? 'e4analytics' : 'e3analytics';

        const { data: allData, error } = await supabase
            .from(table)
            .select('*');

        if (error) throw error;

        const stats = {
            web: 0,
            mobile: 0,
            android: 0,
            ios: 0,
            total: (allData || []).length
        };

        (allData || []).forEach(entry => {
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
        const { data: e3Data, error: e3Err } = await supabase.from('e3analytics').select('*');
        if (e3Err) throw e3Err;

        const { data: e4Data, error: e4Err } = await supabase.from('e4analytics').select('*');
        if (e4Err) throw e4Err;

        const allData = [...(e3Data || []), ...(e4Data || [])];

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
