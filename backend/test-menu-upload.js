
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const supabase = require('./utils/supabaseHelper');

async function run() {
    try {
        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'super_secure_secret_key_12345');
        const fakeImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        // Fetch a dine item ID
        const { data: dines } = await supabase.from('e3dines').select('_id').limit(1);
        if (!dines || !dines.length) return console.log('No dines found');
        const dineId = dines[0]._id;

        console.log(`Updating Dine item ${dineId}...`);

        const response = await fetch(`http://localhost:5001/api/e3/dine/${dineId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ menuImages: [fakeImage, fakeImage] })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Update failed');
        console.log('Update success:', data.menuImages);
    } catch (e) {
        console.error('Update failed:', e.response ? e.response.data : e.message);
    }
}
run();
