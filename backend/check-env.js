const dotenv = require('dotenv');
const path = require('path');

// console.log('--- Checking Environment Variables ---');
const envPath = path.join(__dirname, '.env');
// console.log(`Loading .env from: ${envPath}`);

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env:', result.error);
} else {
    console.log('.env loaded successfully.');
}

const authKey = process.env.AUTHKEY;
const sid = process.env.SID;

// console.log(`AUTHKEY: ${authKey ? 'Present (' + authKey.substring(0, 4) + '...)' : 'MISSING'}`);
// console.log(`SID: ${sid ? 'Present (' + sid + ')' : 'MISSING'}`);

if (authKey && sid) {
    console.log('✅ Keys are accessible.');
} else {
    console.error('❌ Keys are missing in process.env');
}
