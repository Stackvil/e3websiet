const supabase = require('./utils/supabaseHelper');

async function inspectOrders() {
    console.log('--- Inspecting Recent Orders ---');
    try {
        const { data, error } = await supabase
            .from('e3orders')
            .select('*')
            .order('createdAt', { ascending: false })
            .limit(5);

        if (error) throw error;

        data.forEach(order => {
            console.log(`\nOrder ID: ${order._id}`);
            console.log(`Created At: ${order.createdAt}`);
            console.log('Items:');
            order.items.forEach(item => {
                console.log(` - ${item.name} (ID: ${item.id}, Qty: ${item.quantity}, Price: ${item.price})`);
                console.log(`   Details: ${JSON.stringify(item.details || {})}`);
            });
        });

    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspectOrders();
