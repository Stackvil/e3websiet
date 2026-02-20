const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const cookieParser = require('cookie-parser');

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
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request Logger (Lightweight)
// const logger = require('./utils/logger'); // Optional

// Swagger Setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ethree & Efour API',
            version: '2.0.0',
            description: `
## Overview
REST API backend for **Ethree (E3)** and **Efour (E4)** — a multi-location entertainment, dining, and rides platform.
            `,
        },
        servers: [
            {
                url: 'https://e3-e4-backend.vercel.app',
                description: '🚀 Production'
            },
            {
                url: `http://localhost:${PORT}`,
                description: '🛠 Local Dev'
            },
        ],
        tags: [
            { name: 'Auth', description: 'OTP-based mobile authentication for E3 and E4 users' },
            { name: 'E3', description: 'E3 location — Rides (GET/POST/PUT/DELETE) and Dine items' },
            { name: 'E4', description: 'E4 location — Rides (GET/POST/PUT/DELETE) and Dine items' },
            { name: 'Events', description: 'Event spaces — listing and admin management' },
            { name: 'Bookings', description: 'Event slot availability, slot booking, and booking history' },
            { name: 'Orders', description: 'Cart checkout, payment initiation (Easebuzz), and order history for E3 & E4' },
            { name: 'POA', description: 'Plan of Action — operational dashboard data for E3 (summary, rides, stalls, alerts)' },
            { name: 'Analytics', description: 'Platform usage statistics — web vs mobile breakdown per location' },
            { name: 'Profile', description: 'User profile read and update' },
            { name: 'Sponsors', description: 'Sponsor registration and profile management' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT obtained from `/api/auth/verify-otp`',
                },
            },
            schemas: {
                // ── Auth ──────────────────────────────────────────────────────
                User: {
                    type: 'object',
                    description: 'Authenticated user record',
                    properties: {
                        id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
                        name: { type: 'string', example: 'Karthik Kumar' },
                        mobile: { type: 'string', example: '9876543210' },
                        role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
                        location: { type: 'string', enum: ['E3', 'E4'], example: 'E3' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                // ── Products ──────────────────────────────────────────────────
                Ride: {
                    type: 'object',
                    description: 'A ride available at E3 or E4',
                    required: ['name', 'price', 'category'],
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string', example: 'Roller Coaster' },
                        price: { type: 'number', example: 150 },
                        image: { type: 'string', description: 'Base64 or URL', example: 'https://...' },
                        images: { type: 'array', items: { type: 'string' }, description: 'Gallery images' },
                        desc: { type: 'string', example: 'High-speed thrilling ride' },
                        status: { type: 'string', enum: ['on', 'off'], example: 'on' },
                        category: { type: 'string', enum: ['play', 'splash'], example: 'play' },
                        ageGroup: { type: 'string', example: '8+' },
                        type: { type: 'string', example: 'thrill' }
                    }
                },
                DineItem: {
                    type: 'object',
                    description: 'A food or beverage item at E3 or E4 dining',
                    required: ['name', 'price', 'stall'],
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string', example: 'Chicken Burger' },
                        price: { type: 'number', example: 120 },
                        image: { type: 'string' },
                        menuImages: { type: 'array', items: { type: 'string' } },
                        category: { type: 'string', example: 'main course' },
                        cuisine: { type: 'string', example: 'Continental' },
                        stall: { type: 'string', example: 'Stall A' },
                        open: { type: 'boolean', example: true },
                        status: { type: 'string', enum: ['active', 'inactive'], example: 'active' }
                    }
                },
                // ── Events ───────────────────────────────────────────────────
                Event: {
                    type: 'object',
                    description: 'An event space entity (admin-managed)',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string', example: 'Celebration Zone' },
                        price: { type: 'number', example: 1000, description: '₹ per hour' },
                        image: { type: 'string' },
                        capacity: { type: 'string', example: '20-50 People' },
                        start_time: { type: 'string', format: 'date-time' },
                        end_time: { type: 'string', format: 'date-time' },
                        location: { type: 'string', enum: ['E3', 'E4'] },
                        status: { type: 'string', example: 'active' }
                    }
                },
                // ── Bookings / Slots ─────────────────────────────────────────
                Slot: {
                    type: 'object',
                    description: 'A single 1-hour bookable time slot',
                    properties: {
                        hour: { type: 'integer', example: 11, description: 'Hour in 24h (9–21)' },
                        startTime: { type: 'string', example: '11:00' },
                        endTime: { type: 'string', example: '12:00' },
                        label: { type: 'string', example: '11:00 – 12:00' },
                        status: { type: 'string', enum: ['available', 'booked', 'past'], example: 'available' },
                        price: { type: 'number', example: 1000, description: '₹ per hour (fixed)' }
                    }
                },
                BookingSlotsResponse: {
                    type: 'object',
                    description: 'Response from GET /api/bookings/slots',
                    properties: {
                        date: { type: 'string', example: '2026-02-20' },
                        location: { type: 'string', enum: ['E3', 'E4'] },
                        pricePerHour: { type: 'number', example: 1000 },
                        slots: {
                            type: 'array',
                            items: { '$ref': '#/components/schemas/Slot' }
                        }
                    }
                },
                // ── Orders ───────────────────────────────────────────────────
                OrderItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        price: { type: 'number' },
                        quantity: { type: 'integer' },
                        image: { type: 'string' },
                        details: {
                            type: 'object',
                            description: 'Used for event bookings',
                            properties: {
                                date: { type: 'string', example: '2026-02-20' },
                                startTime: { type: 'string', example: '11:00' },
                                endTime: { type: 'string', example: '12:00' },
                                guests: { type: 'integer', example: 25 }
                            }
                        }
                    }
                },
                Order: {
                    type: 'object',
                    description: 'An order record (E3 or E4)',
                    properties: {
                        _id: { type: 'string', description: 'Transaction ID (ETH-XXXXXX)', example: 'ETH-123456' },
                        userId: { type: 'string' },
                        amount: { type: 'number', example: 1000 },
                        status: { type: 'string', enum: ['placed', 'confirmed', 'failed'], example: 'placed' },
                        location: { type: 'string', enum: ['E3', 'E4'] },
                        items: { type: 'array', items: { '$ref': '#/components/schemas/OrderItem' } },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                CheckoutResponse: {
                    type: 'object',
                    description: 'Response from checkout endpoint — use payment_url or access_key for payment',
                    properties: {
                        success: { type: 'boolean', example: true },
                        payment_url: { type: 'string', example: 'https://pay.easebuzz.in/pay/abc123' },
                        access_key: { type: 'string', example: 'abc123xyz' },
                        txnid: { type: 'string', example: 'ETH-789012' },
                        mode: { type: 'string', enum: ['hosted', 'iframe'], example: 'hosted' },
                        key: { type: 'string' },
                        env: { type: 'string', enum: ['test', 'prod'] }
                    }
                },
                // ── POA ──────────────────────────────────────────────────────
                POASummary: {
                    type: 'object',
                    description: 'Plan of Action operational summary for one location',
                    properties: {
                        location: { type: 'string', enum: ['E3', 'E4'] },
                        date: { type: 'string', example: '2026-02-19' },
                        summary: {
                            type: 'object',
                            properties: {
                                totalRevenue: { type: 'number', example: 24500 },
                                totalOrders: { type: 'integer', example: 38 },
                                activeRides: { type: 'integer', example: 6 },
                                openStalls: { type: 'integer', example: 4 },
                                pendingAlerts: { type: 'integer', example: 2 }
                            }
                        },
                        recentOrders: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    amount: { type: 'number' },
                                    status: { type: 'string' },
                                    time: { type: 'string' }
                                }
                            }
                        },
                        rideStatus: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    status: { type: 'string', enum: ['running', 'maintenance', 'offline'] },
                                    count: { type: 'integer' }
                                }
                            }
                        },
                        stallStatus: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    status: { type: 'string', enum: ['open', 'closed'] },
                                    revenue: { type: 'number' }
                                }
                            }
                        },
                        alerts: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string' },
                                    message: { type: 'string' },
                                    level: { type: 'string', enum: ['info', 'warning', 'critical'] }
                                }
                            }
                        }
                    }
                },
                // ── Analytics ────────────────────────────────────────────────
                AnalyticsStats: {
                    type: 'object',
                    description: 'Platform usage stats for a location',
                    properties: {
                        web: { type: 'integer', example: 142 },
                        mobile: { type: 'integer', example: 87 },
                        android: { type: 'integer', example: 53 },
                        ios: { type: 'integer', example: 34 },
                        total: { type: 'integer', example: 229 }
                    }
                },
                // ── Error ────────────────────────────────────────────────────
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Unauthorized' }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }],
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
const analyticsRoutes = require('./routes/analytics');
const sponsorRoutes = require('./routes/sponsors');
const poaRoutes = require('./routes/poa');

app.use('/api/auth', authRoutes);
app.use('/api/e3', e3Routes);
app.use('/api/e4', e4Routes);
app.use('/api/events', eventRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/poa', poaRoutes);
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
