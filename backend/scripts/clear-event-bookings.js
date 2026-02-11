const supabase = require('../utils/supabaseClient');

async function clearEventBookings() {
    try {
        console.log('🗑️  Clearing all event bookings from the orders table...');

        // First, get all orders to filter event bookings
        const { data: allOrders, error: fetchError } = await supabase
            .from('orders')
            .select('*');

        if (fetchError) {
            console.error('❌ Error fetching orders:', fetchError);
            throw fetchError;
        }

        console.log(`📊 Found ${allOrders.length} total orders`);

        // Filter orders that contain event bookings
        const eventOrderIds = allOrders
            .filter(order => {
                if (!order.items || !Array.isArray(order.items)) return false;
                // Check if any item in the order is an event booking
                return order.items.some(item =>
                    item.stall === 'Events' ||
                    (item.id && item.id.toString().startsWith('event-')) ||
                    item.details // Event bookings have details (date, time, guests)
                );
            })
            .map(order => order._id);

        console.log(`🎫 Found ${eventOrderIds.length} event booking orders to delete`);

        if (eventOrderIds.length === 0) {
            console.log('✅ No event bookings to delete!');
            return;
        }

        // Delete event booking orders
        const { error: deleteError } = await supabase
            .from('orders')
            .delete()
            .in('_id', eventOrderIds);

        if (deleteError) {
            console.error('❌ Error deleting event bookings:', deleteError);
            throw deleteError;
        }

        console.log(`✅ Successfully deleted ${eventOrderIds.length} event booking orders!`);
        console.log('📊 Database is now clean of event bookings.');

    } catch (err) {
        console.error('❌ Failed to clear event bookings:', err.message);
        process.exit(1);
    }
}

// Run the script
clearEventBookings()
    .then(() => {
        console.log('✨ Done!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('💥 Script failed:', err);
        process.exit(1);
    });
