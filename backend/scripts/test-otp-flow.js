const fetch = globalThis.fetch;

const BASE_URL = 'http://localhost:5001/api/auth';
const mobile = '9876543210';
const otp = '123456'; // Simulated OTP or known fixed OTP if changed
const password = 'password123';
const name = 'Test User';

async function testAuthFlow() {
    console.log('\n--- Starting Auth Flow Test ---\n');

    try {
        // 1. Signup Init (Send OTP)
        console.log(`1. Requesting Signup OTP for ${mobile}...`);
        const initRes = await fetch(`${BASE_URL}/signup-init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile })
        });
        const initData = await initRes.json();
        console.log(`Signup Init Response: ${initRes.status}`, initData);

        if (!initRes.ok) throw new Error('Signup Init failed');

        // 2. Signup Verify (Verify OTP + Create User)
        console.log(`\n2. Verifying OTP & Creating User...`);
        const verifyRes = await fetch(`${BASE_URL}/signup-verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile, otp, password, name })
        });
        const verifyData = await verifyRes.json();
        console.log(`Signup Verify Response: ${verifyRes.status}`, verifyData);

        if (verifyRes.status === 400 && verifyData.message.includes('User already exists')) {
            console.log('User already exists, proceeding to login test...');
        } else if (!verifyRes.ok) {
            throw new Error('Signup Verify failed');
        }

        // 3. Login (Mobile + Password)
        console.log(`\n3. Logging in with Mobile & Password...`);
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile, password }) // Now using mobile
        });
        const loginData = await loginRes.json();
        console.log(`Login Response: ${loginRes.status}`, loginData);

        if (!loginRes.ok) throw new Error('Login failed');

        console.log('\n✅ Aut Flow Verification Successful!');

    } catch (error) {
        console.error('\n❌ Test Error:', error);
    }
}

testAuthFlow();
