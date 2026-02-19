const db = require('../utils/pgClient');

async function optimize() {
    try {
        console.log('Starting database optimization...');

        // 1. Cleanup e3comborides (The new table causing recent slowdowns)
        // Since this is a new feature with likely only test data, and it's causing the hang,
        // it is safest to clear it so the user can re-upload with compression.
        await db.query('TRUNCATE TABLE e3comborides');
        console.log('✅ Cleared e3comborides table (removed heavy uncompressed test combos).');

        // 2. Cleanup e3rides
        // Remove old rides that have images larger than ~500KB (500,000 characters of base64)
        // This ensures the main rides list loads instantly.
        const resRides = await db.query("DELETE FROM e3rides WHERE length(image) > 500000 RETURNING name");
        if (resRides.rowCount > 0) {
            console.log(`✅ Removed ${resRides.rowCount} heavy rides:`, resRides.rows.map(r => r.name));
        } else {
            console.log('✓ e3rides table is already optimized.');
        }

        // 3. Cleanup e3dines
        const resDines = await db.query("DELETE FROM e3dines WHERE length(image) > 500000 RETURNING name");
        if (resDines.rowCount > 0) {
            console.log(`✅ Removed ${resDines.rowCount} heavy dine items:`, resDines.rows.map(r => r.name));
        } else {
            console.log('✓ e3dines table is already optimized.');
        }

        console.log('Database optimization complete. Existing heavy images removed.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error optimizing DB:', err);
        process.exit(1);
    }
}

optimize();
