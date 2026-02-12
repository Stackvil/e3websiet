const { auth } = require('./middleware/auth');
console.log('Auth middleware type:', typeof auth);
if (typeof auth !== 'function') {
    console.error('Auth middleware is not a function!');
    console.log('Export:', require('./middleware/auth'));
} else {
    console.log('Auth middleware loaded successfully.');
}
