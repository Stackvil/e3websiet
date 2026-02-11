const fetch = require('node-fetch');

async function testAddRide() {
    const payload = {
        name: 'Test Ride ' + Date.now(),
        price: 150,
        category: 'play',
        image: 'https://placehold.co/600x400',
        status: 'on',
        desc: 'A thrilling test ride',
        type: 'Ride',
        ageGroup: 'All'
    };

    try {
        const response = await fetch('http://localhost:5001/api/e3/rides', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': 'YOUR_TEST_TOKEN_HERE_IF_NEEDED_BUT_MOCK_AUTH_MIGHT_BYPASS' 
            }
        });
        
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testAddRide();
