const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request Logger & Analytics Middleware
const logger = require('./utils/logger');
const MockModel = require('./utils/mockDB');
const Analytics = new MockModel('Analytics');

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const platform = req.headers['x-platform'] || 'unknown';
        const userAgent = req.headers['user-agent'] || '-';

        logger.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - Platform: ${platform}`);

        // Persist to Analytics DB (Fire and forget)
        Analytics.create({
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            duration,
            platform,
            userAgent,
            timestamp: new Date().toISOString()
        }).catch(err => console.error('Failed to save analytics:', err));
    });
    next();
});



// Swagger Setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ethree API',
            version: '1.0.0',
            description: 'API for Ethree - Eat, Enjoy, Entertainment platform (Supabase PostgreSQL Version)',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Local Server'
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [path.join(__dirname, 'routes/*.js')], // Removed ./ to ensure clean path
};

let swaggerDocs;
try {
    swaggerDocs = swaggerJsdoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
} catch (err) {
    console.error("Failed to initialize Swagger:", err);
}


// Root Route
app.get('/', (req, res) => {
    res.send('Ethree API is running with Supabase PostgreSQL. Check /api-docs for documentation.');
});

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payment');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/sponsors', require('./routes/sponsors'));
app.use('/api/analytics', require('./routes/analytics'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
