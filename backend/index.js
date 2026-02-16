const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Easebuzz Configuration (from kit instructions)
global.EASEBUZZ_CONFIG = {
    key: process.env.EASEBUZZ_KEY,
    salt: process.env.EASEBUZZ_SALT,
    env: process.env.EASEBUZZ_ENV || 'test',
    enable_iframe: process.env.EASEBUZZ_IFRAME || 0
};

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://e3websiet.vercel.app'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request Logger (Lightweight)
// const logger = require('./utils/logger'); // Optional

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
                url: 'https://e3-e4-backend.vercel.app',
                description: 'Production Server'
            },
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
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'User ID' },
                        name: { type: 'string', description: 'User Name' },
                        mobile: { type: 'string', description: 'Mobile Number' },
                        role: { type: 'string', enum: ['user', 'admin', 'customer'], description: 'User Role' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Ride: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        price: { type: 'number' },
                        image: { type: 'string' },
                        desc: { type: 'string' },
                        status: { type: 'string', enum: ['on', 'off'] },
                        category: { type: 'string' },
                        ageGroup: { type: 'string' }
                    }
                },
                DineItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        price: { type: 'number' },
                        image: { type: 'string' },
                        category: { type: 'string' },
                        cuisine: { type: 'string' },
                        stall: { type: 'string' },
                        open: { type: 'boolean' }
                    }
                },
                Event: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        price: { type: 'number' },
                        image: { type: 'string' },
                        start_time: { type: 'string', format: 'date-time' },
                        end_time: { type: 'string', format: 'date-time' },
                        location: { type: 'string', enum: ['E3', 'E4'] },
                        status: { type: 'string' }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', description: 'Transaction ID' },
                        userId: { type: 'string' },
                        amount: { type: 'number' },
                        status: { type: 'string' },
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    price: { type: 'number' },
                                    quantity: { type: 'integer' }
                                }
                            }
                        },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [path.join(__dirname, 'routes/*.js')],
};

let swaggerDocs;
try {
    swaggerDocs = swaggerJsdoc(swaggerOptions);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
        customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css',
        customJs: [
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.min.js'
        ],
        customSiteTitle: "Ethree API Documentation"
    }));
} catch (err) {
    console.error("Failed to initialize Swagger:", err);
}


// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to Ethree and Efour');
});

// Import Routes
const authRoutes = require('./routes/auth');
const e3Routes = require('./routes/e3');
const e4Routes = require('./routes/e4');
const eventRoutes = require('./routes/events');
const orderRoutes = require('./routes/orders');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payment');

app.use('/api/auth', authRoutes);
app.use('/api/e3', e3Routes);
app.use('/api/e4', e4Routes);
app.use('/api/events', eventRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/profile', require('./routes/profile'));


// 404 Handler (Catch-All)
app.use((req, res, next) => {
    // Check if API request -> JSON response
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: 'Endpoint NOT Found',
            path: req.originalUrl
        });
    }

    // Otherwise serve HTML template
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Page Not Found</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f8f9fa;
                    color: #333;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    text-align: center;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    max-width: 500px;
                }
                h1 { font-size: 80px; margin: 0; color: #ff6b6b; }
                h2 { margin: 10px 0 20px; }
                p { color: #666; margin-bottom: 30px; }
                a {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    transition: background 0.3s;
                }
                a:hover { background-color: #0056b3; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you are looking for does not exist or has been moved.</p>
                <a href="/">Go Home</a>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});

module.exports = app;
