const MockModel = require('../utils/mockDB');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testAuthLogic() {
    console.log('--- Testing Mobile Auth Flow Logic ---');

    const testMobile = '9999999999';
    const testLocation = 'E3';
    const testName = 'Test User';

    // 1. Simulate finding/creating user in DB
    const E3User = new MockModel('E3User');

    try {
        console.log(`Checking if user ${testMobile} exists in E3User table...`);
        let user = await E3User.findOne({ mobile: testMobile });

        if (!user) {
            console.log('User not found, creating new user...');
            user = await E3User.create({
                name: testName,
                mobile: testMobile,
                role: 'customer',
                email: '',
                password: ''
            });
            console.log('User created:', user);
        } else {
            console.log('User already exists:', user);
        }

        // 2. Test JWT Generation
        console.log('Generating JWT token...');
        const token = jwt.sign(
            { id: user._id, role: user.role, type: testLocation.toLowerCase() },
            process.env.JWT_SECRET || 'dev_secret',
            { expiresIn: '1d' }
        );
        console.log('JWT Token generated successfully.');

        // 3. Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
        console.log('Decoded Token:', decoded);

        if (decoded.id === user._id && decoded.type === 'e3') {
            console.log('✅ Auth Logic Verification Passed!');
        } else {
            console.log('❌ Auth Logic Verification Failed!');
        }

        // Cleanup: remove test user
        // await E3User.deleteMany({ mobile: testMobile }); 

    } catch (error) {
        console.error('❌ Verification Error:', error);
    } finally {
        // Since pgClient uses a pool, we should ideally end it if this were a standalone script,
        // but for a quick test running via node, it will exit anyway.
        process.exit(0);
    }
}

testAuthLogic();
