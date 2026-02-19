const db = require('../utils/pgClient');

async function clearOrders() {
    try {
        console.log('Clearing all orders from e3orders table...');

        // Delete all rows from e3orders
        await db.query('DELETE FROM "e3orders"');

        console.log('✅ Successfully removed all orders/tickets.');

    } catch (err) {
        console.error('❌ Error clearing orders:', err);
    } finally {
        process.exit();
    }
}

clearOrders();
