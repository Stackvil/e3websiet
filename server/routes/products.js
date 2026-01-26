const express = require('express');
const router = express.Router();
const MockModel = require('../utils/mockDB');
const Product = new MockModel('Product');
const { auth, admin } = require('../middleware/auth');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 */
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a product (Admin only)
 *     tags: [Products]
 */
router.post('/', auth, admin, async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
