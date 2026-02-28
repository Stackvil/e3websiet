const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../utils/supabaseHelper');

async function updateEventNames() {
    try {
        console.log('Updating event names to "Celebration Zone"...');

        // Update E3
        const { error: e3Error } = await supabase
            .from('e3events')
            .update({ name: 'Celebration Zone' })
            .eq('name', 'Party space');

        if (e3Error) console.error('E3 Update Error:', e3Error);
        else console.log('E3 events updated (if any were "Party space").');

        // Update E4
        const { error: e4Error } = await supabase
            .from('e4events')
            .update({ name: 'Celebration Zone' })
            .eq('name', 'Party space');

        if (e4Error) console.error('E4 Update Error:', e4Error);
        else console.log('E4 events updated (if any were "Party space").');

        // Also check for "VIP Dining Suite" just in case
        await supabase.from('e3events').update({ name: 'Celebration Zone' }).eq('name', 'VIP Dining Suite');
        await supabase.from('e4events').update({ name: 'Celebration Zone' }).eq('name', 'VIP Dining Suite');

        console.log('Done.');
    } catch (err) {
        console.error('Script failed:', err.message);
    }
}

updateEventNames();
