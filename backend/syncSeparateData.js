const dotenv = require('dotenv');
const supabase = require('./utils/supabaseClient');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const syncTable = async (tableName, jsonFileName) => {
    try {
        console.log(`Syncing ${tableName} from ${jsonFileName}...`);
        const dataPath = path.join(__dirname, 'data', jsonFileName);

        if (!fs.existsSync(dataPath)) {
            console.warn(`Warning: Data file not found at ${dataPath}. Skipping.`);
            return;
        }

        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(fileContent);

        console.log(`Read ${data.length} records.`);

        // Clear existing data
        // Filter: delete all (neq _id 0)
        const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .neq('_id', '0');

        if (deleteError) {
            // Ignore "relation does not exist" error if table doesn't exist yet, 
            // but Supabase usually needs tables created first. 
            // We assume tables exist or will be auto-created if using a flexible scheme (unlike strict SQL).
            // Since we are using a Supabase client, tables must imply exist.
            console.error(`Error clearing table ${tableName}:`, deleteError.message);
        }

        // Insert new data
        if (data.length > 0) {
            const { error: insertError } = await supabase
                .from(tableName)
                .insert(data);

            if (insertError) {
                console.error(`Error inserting into ${tableName}:`, insertError.message);
            } else {
                console.log(`Successfully synced ${tableName}`);
            }
        }
    } catch (err) {
        console.error(`Error processing ${tableName}:`, err);
    }
};

const syncAll = async () => {
    console.log('Starting fresh sync for separate E3/E4 tables...');

    // E3 Rides -> e3rides
    await syncTable('e3rides', 'E3Rides.json');

    // E3 Dine -> e3dines
    await syncTable('e3dines', 'E3Dine.json');

    // E4 Rides -> e4rides
    await syncTable('e4rides', 'E4Rides.json');

    // Events -> events
    await syncTable('events', 'Events.json');

    // Users -> users (Keep users global)
    await syncTable('users', 'User.json');

    console.log('Sync Complete.');
    process.exit(0);
};

syncAll();
