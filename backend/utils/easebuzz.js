const crypto = require('crypto');

const getEasebuzzConfig = () => {
    return {
        key: process.env.EASEBUZZ_KEY,
        salt: process.env.EASEBUZZ_SALT,
        env: process.env.EASEBUZZ_ENV || 'test',
        baseUrl: process.env.EASEBUZZ_ENV === 'prod'
            ? 'https://pay.easebuzz.in'
            : 'https://testpay.easebuzz.in'
    };
};

function generateHash(data, salt) {
    const hashString = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1 || ''}|${data.udf2 || ''}|${data.udf3 || ''}|${data.udf4 || ''}|${data.udf5 || ''}|${data.udf6 || ''}|${data.udf7 || ''}|${data.udf8 || ''}|${data.udf9 || ''}|${data.udf10 || ''}|${salt}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
}

/**
 * Validates the hash from Easebuzz response
 */
function validateHash(data, salt) {
    const { status, txnid, amount, email, firstname, productinfo, udf10, udf9, udf8, udf7, udf6, udf5, udf4, udf3, udf2, udf1, hash, key } = data;
    const hashString = `${salt}|${status}|${udf10 || ''}|${udf9 || ''}|${udf8 || ''}|${udf7 || ''}|${udf6 || ''}|${udf5 || ''}|${udf4 || ''}|${udf3 || ''}|${udf2 || ''}|${udf1 || ''}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
    return hash === calculatedHash;
}

async function initiatePayment(orderData) {
    const config = getEasebuzzConfig();

    // Construct payload
    const payload = {
        key: config.key,
        txnid: orderData.txnid,
        amount: parseFloat(orderData.amount).toFixed(2),
        productinfo: (orderData.productinfo || 'Order').replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 100).trim(),
        firstname: (orderData.firstname || 'User').replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 20).trim(),
        email: orderData.email || 'user@example.com',
        phone: (orderData.phone || '9999999999').replace(/[^0-9]/g, '').substring(0, 10),
        surl: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/payment/success`, // Callback to backend
        furl: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/payment/failure`, // Callback to backend
        udf1: orderData.location || '', // Store location (E3/E4) here
        udf2: '',
        udf3: '',
        udf4: '',
        udf5: '',
        udf6: '',
        udf7: '',
        udf8: '',
        udf9: '',
        udf10: ''
    };

    const hash = generateHash(payload, config.salt);
    payload.hash = hash;

    try {
        const response = await fetch(`${config.baseUrl}/payment/initiateLink`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams(payload)
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Easebuzz Initiation Error:', error);
        throw error;
    }
}

module.exports = {
    getEasebuzzConfig,
    generateHash,
    validateHash,
    initiatePayment
};
