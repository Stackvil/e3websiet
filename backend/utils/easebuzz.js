const crypto = require('crypto');
const sha512 = require('js-sha512');
const EasebuzzKit = require('./easebuzz-lib/initiate_payment.js');
const EasebuzzUtil = require('./easebuzz-lib/util.js');

const getEasebuzzConfig = () => {
    return {
        key: process.env.EASEBUZZ_KEY,
        salt: process.env.EASEBUZZ_SALT,
        env: process.env.EASEBUZZ_ENV || 'test',
        enable_iframe: process.env.EASEBUZZ_IFRAME || 0,
        baseUrl: process.env.EASEBUZZ_ENV === 'prod'
            ? 'https://pay.easebuzz.in'
            : 'https://testpay.easebuzz.in'
    };
};

/**
 * Official Hash Generation from Kit
 */
function generateHash(data, salt) {
    const config = getEasebuzzConfig();
    const hashString = `${config.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1 || ''}|${data.udf2 || ''}|${data.udf3 || ''}|${data.udf4 || ''}|${data.udf5 || ''}|${data.udf6 || ''}|${data.udf7 || ''}|${data.udf8 || ''}|${data.udf9 || ''}|${data.udf10 || ''}|${salt}`;
    return sha512.sha512(hashString);
}

/**
 * Official Hash Validation from Kit
 */
function validateHash(data, salt) {
    const { status, txnid, amount, email, firstname, productinfo, udf10, udf9, udf8, udf7, udf6, udf5, udf4, udf3, udf2, udf1, hash, key } = data;
    const hashString = `${salt}|${status}|${udf10 || ''}|${udf9 || ''}|${udf8 || ''}|${udf7 || ''}|${udf6 || ''}|${udf5 || ''}|${udf4 || ''}|${udf3 || ''}|${udf2 || ''}|${udf1 || ''}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = sha512.sha512(hashString);
    return hash === calculatedHash;
}

/**
 * Initiates payment using the official kit's logic but adapted for API
 */
async function initiatePayment(orderData) {
    const config = getEasebuzzConfig();

    // Prepare data in the format expected by the kit
    const data = {
        txnid: orderData.txnid,
        amount: parseFloat(orderData.amount).toFixed(2),
        productinfo: (orderData.productinfo || 'Order'),
        name: orderData.firstname, // Kit uses 'name'
        email: orderData.email,
        phone: orderData.phone,
        surl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/success`,
        furl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payment/failure`,
        udf1: orderData.location || '',
        udf2: orderData.userId || '',
        udf3: '',
        udf4: '',
        udf5: '',
        udf6: '',
        udf7: '',
        udf8: '',
        udf9: '',
        udf10: ''
    };

    // Use EasebuzzUtil.call directly to mimic official behavior
    const url = `${config.baseUrl}/payment/initiateLink`;

    // Generate Hash
    const hashString = `${config.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.name}|${data.email}|${data.udf1}|${data.udf2}|${data.udf3}|${data.udf4}|${data.udf5}|${data.udf6}|${data.udf7}|${data.udf8}|${data.udf9}|${data.udf10}|${config.salt}`;
    data.hash = sha512.sha512(hashString);
    data.key = config.key;

    try {
        const response = await EasebuzzUtil.call(url, data);
        return response;
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
