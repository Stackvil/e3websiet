const jwt = require('jsonwebtoken');
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE3NzAzODUyNjIwOTkiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzA0MzYyNDIsImV4cCI6MTc3MDUyMjY0Mn0.B5dX2PGUFZcscENwSicDY591vsHaYuPdWpwNl4NxOmo";
const secret = process.env.JWT_SECRET || 'dev_secret_key';

try {
    const decoded = jwt.verify(token, secret);
    console.log("Token is valid:", decoded);
} catch (err) {
    console.error("Token verification failed:", err.message);
}
