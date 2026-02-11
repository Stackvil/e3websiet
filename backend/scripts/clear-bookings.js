const supabase = require('../utils/supabaseClient');

async function clearBookings() {
    try {
        console.log('🗑️  Clearing all bookings from the database...');

        // Delete all bookings
        const { data, error } = await supabase
            .from('bookings')
            .delete()
            .neq('_id', ''); // This deletes all rows (neq with empty string matches all)

        if (error) {
            console.error('❌ Error clearing bookings:', error);
            throw error;
        }

        console.log('✅ Successfully cleared all bookings!');
        console.log('📊 Database is now clean.');

    } catch (err) {
        console.error('❌ Failed to clear bookings:', err.message);
        process.exit(1);
    }
}

// Run the script
clearBookings()
    .then(() => {
        console.log('✨ Done!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('💥 Script failed:', err);
        process.exit(1);
    });
