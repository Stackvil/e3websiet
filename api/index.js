const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes from the server directory
// Import Routes from the server directory
const authRoutes = require('../server/routes/auth');
const productRoutes = require('../server/routes/products');
const orderRoutes = require('../server/routes/orders');
const bookingRoutes = require('../server/routes/bookings');
const paymentRoutes = require('../server/routes/payment');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);

// Root Route
app.get('/api', (req, res) => {
    res.send('Ethree Express API is running on Vercel.');
});

// Export the app for Vercel
module.exports = app;
