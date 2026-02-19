const supabase = require('../utils/supabaseHelper');

async function inspectRide() {
    try {
        console.log('--- Inspecting e3rides ---');
        const { data, error } = await supabase
            .from('e3rides')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Supabase Error:', error);
            return;
        }

        if (data && data.length > 0) {
            console.log('First Record Keys:', Object.keys(data[0]));
            // console.log('First Record:', JSON.stringify(data[0], null, 2));
        } else {
            console.log('No records found in e3rides.');
        }
    } catch (err) {
        console.error('Script Error:', err);
    }
}

inspectRide();
