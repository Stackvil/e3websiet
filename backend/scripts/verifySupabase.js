const MockModel = require('../utils/mockDB');

async function verify() {
    try {
        console.log('Verifying Supabase Connection via MockModel...');

        const Product = new MockModel('Product');
        const products = await Product.find();
        console.log(`Successfully fetched ${products.length} products.`);

        if (products.length > 0) {
            console.log('Sample Product:', products[0].name);
        }

        const User = new MockModel('User');
        const users = await User.find();
        console.log(`Successfully fetched ${users.length} users.`);

        const Order = new MockModel('Order');
        const orders = await Order.find();
        console.log(`Successfully fetched ${orders.length} orders.`);

    } catch (err) {
        console.error('Verification Failed:', err);
    }
}

verify();
