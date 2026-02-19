const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: POA
 *   description: Plan of Action - E3 & E4 operational data (MongoDB)
 */

// ── Dummy data (replace with real MongoDB queries later) ─────────────────────

const dummyE3 = {
    location: 'E3',
    lastUpdated: new Date().toISOString(),

    summary: {
        totalRevenue: 128450,
        totalOrders: 342,
        totalVisitors: 1870,
        avgOrderValue: 375,
        activeRides: 8,
        openStalls: 12,
    },

    recentOrders: [
        { id: 'E3-001', customer: 'Rahul Sharma', amount: 850, items: ['Bumping Cars x2', 'Chai x1'], status: 'completed', time: '14 mins ago' },
        { id: 'E3-002', customer: 'Priya Nair', amount: 1200, items: ['Free Fall x1', 'Burger Combo x2'], status: 'completed', time: '28 mins ago' },
        { id: 'E3-003', customer: 'Anil Kumar', amount: 450, items: ['Mini Train x3'], status: 'pending', time: '35 mins ago' },
        { id: 'E3-004', customer: 'Sneha Reddy', amount: 2100, items: ['Super Saver Combo x1', 'Juice x2'], status: 'completed', time: '52 mins ago' },
        { id: 'E3-005', customer: 'Kiran Babu', amount: 750, items: ['Carousel x2', 'Samosa x3'], status: 'failed', time: '1 hr ago' },
    ],

    rideStatus: [
        { name: 'Bumping Cars', status: 'running', waitTime: '5 mins', capacity: 12 },
        { name: 'Free Fall', status: 'running', waitTime: '10 mins', capacity: 6 },
        { name: 'Mini Train', status: 'running', waitTime: '2 mins', capacity: 20 },
        { name: 'Carousel', status: 'maintenance', waitTime: '-', capacity: 16 },
        { name: 'Water Splash', status: 'running', waitTime: '8 mins', capacity: 8 },
        { name: 'Giant Wheel', status: 'running', waitTime: '15 mins', capacity: 24 },
        { name: 'Super Swing', status: 'offline', waitTime: '-', capacity: 10 },
        { name: 'Roller Coaster', status: 'running', waitTime: '20 mins', capacity: 30 },
    ],

    stallStatus: [
        { name: 'Riverside BBQ', status: 'open', revenue: 12400, orders: 38 },
        { name: 'Chai Corner', status: 'open', revenue: 4200, orders: 84 },
        { name: 'Pizza Hub', status: 'open', revenue: 9800, orders: 41 },
        { name: 'Juice Junction', status: 'open', revenue: 6100, orders: 62 },
        { name: 'Biryani Palace', status: 'closed', revenue: 0, orders: 0 },
        { name: 'Snacks World', status: 'open', revenue: 3500, orders: 57 },
    ],

    alerts: [
        { type: 'warning', message: 'Carousel under maintenance — ETA 2 hours' },
        { type: 'info', message: 'Super Swing offline for the day' },
        { type: 'success', message: 'Revenue target 65% achieved for today' },
    ]
};

const dummyE4 = {
    location: 'E4',
    lastUpdated: new Date().toISOString(),

    summary: {
        totalRevenue: 94200,
        totalOrders: 218,
        totalVisitors: 1120,
        avgOrderValue: 432,
        activeRides: 5,
        openStalls: 8,
    },

    recentOrders: [
        { id: 'E4-001', customer: 'Meera Pillai', amount: 1500, items: ['Event Entry x2', 'Nachos x1'], status: 'completed', time: '8 mins ago' },
        { id: 'E4-002', customer: 'Suresh Babu', amount: 900, items: ['Go-Kart x1', 'Cold Coffee x2'], status: 'completed', time: '22 mins ago' },
        { id: 'E4-003', customer: 'Deepa Rao', amount: 600, items: ['Rock Climbing x2'], status: 'pending', time: '41 mins ago' },
        { id: 'E4-004', customer: 'Arjun Das', amount: 1800, items: ['Adventure Pack x1'], status: 'completed', time: '1 hr ago' },
        { id: 'E4-005', customer: 'Kavitha M', amount: 550, items: ['Paintball x1', 'Snacks x2'], status: 'failed', time: '1.5 hrs ago' },
    ],

    rideStatus: [
        { name: 'Go-Kart', status: 'running', waitTime: '8 mins', capacity: 10 },
        { name: 'Rock Climbing', status: 'running', waitTime: '3 mins', capacity: 5 },
        { name: 'Paintball Arena', status: 'running', waitTime: '12 mins', capacity: 12 },
        { name: 'Zipline', status: 'maintenance', waitTime: '-', capacity: 2 },
        { name: 'Archery Range', status: 'running', waitTime: '5 mins', capacity: 8 },
    ],

    stallStatus: [
        { name: 'Adventure Café', status: 'open', revenue: 8400, orders: 32 },
        { name: 'The Grill Spot', status: 'open', revenue: 11200, orders: 28 },
        { name: 'Shake Shack', status: 'open', revenue: 5600, orders: 47 },
        { name: 'Energy Bar', status: 'closed', revenue: 0, orders: 0 },
        { name: 'Wrap & Roll', status: 'open', revenue: 4100, orders: 36 },
        { name: 'Italian Corner', status: 'open', revenue: 7200, orders: 24 },
    ],

    alerts: [
        { type: 'warning', message: 'Zipline under maintenance — awaiting safety check' },
        { type: 'info', message: 'Energy Bar closed today — staff shortage' },
        { type: 'success', message: 'Go-Kart bookings fully booked for evening slot' },
    ]
};

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/poa/e3:
 *   get:
 *     summary: Get E3 Plan of Action data
 *     description: |
 *       Returns live operational snapshot for E3: summary stats, recent orders,
 *       ride status, stall status, and alerts. (Currently returns dummy data — will
 *       connect to MongoDB in production.)
 *     tags: [POA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: E3 operational data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/e3', [auth, admin], (req, res) => {
    // TODO: Replace with real MongoDB query
    res.json({ ...dummyE3, lastUpdated: new Date().toISOString() });
});

/**
 * @swagger
 * /api/poa/e4:
 *   get:
 *     summary: Get E4 Plan of Action data
 *     description: |
 *       Returns live operational snapshot for E4: summary stats, recent orders,
 *       ride status, stall status, and alerts. (Currently returns dummy data — will
 *       connect to MongoDB in production.)
 *     tags: [POA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: E4 operational data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/e4', [auth, admin], (req, res) => {
    // TODO: Replace with real MongoDB query
    res.json({ ...dummyE4, lastUpdated: new Date().toISOString() });
});

module.exports = router;
