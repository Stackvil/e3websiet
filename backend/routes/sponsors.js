const express = require('express');
const router = express.Router();
const MockModel = require('../utils/mockDB');
const Sponsor = new MockModel('Sponsor');
const { auth, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { addSponsorSchema } = require('../schemas/validationSchemas');

/**
 * @swagger
 * components:
 *   schemas:
 *     Sponsor:
 *       type: object
 *       required:
 *         - name
 *         - image
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Sponsor Name
 *         image:
 *           type: string
 *           description: URL of sponsor logo
 *         website:
 *           type: string
 *           description: Link to sponsor website
 *         tier:
 *           type: string
 *           description: Sponsorship tier (e.g. Gold, Silver)
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/sponsors:
 *   get:
 *     summary: Get all sponsors
 *     tags: [Sponsors]
 *     responses:
 *       200:
 *         description: List of sponsors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sponsor'
 */
router.get('/', async (req, res) => {
    try {
        const sponsors = await Sponsor.find();
        res.json(sponsors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/sponsors:
 *   post:
 *     summary: Add a new sponsor (Admin only)
 *     tags: [Sponsors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *               website:
 *                 type: string
 *               tier:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sponsor added successfully
 *       403:
 *         description: Admin access required
 */
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', [auth, admin, upload.single('image'), validate(addSponsorSchema)], async (req, res) => {
    try {
        const { name, website, tier } = req.body;
        let imageUrl = req.body.image || null;

        // If a file is uploaded, push it to Cloudinary
        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'sponsors',
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary Upload Error:', error);
                            reject(new Error('Image upload failed'));
                        } else {
                            resolve(result);
                        }
                    }
                );
                stream.end(req.file.buffer);
            });
            imageUrl = uploadResult.secure_url;
        }

        if (!imageUrl) {
            return res.status(400).json({ message: 'Sponsor image is required.' });
        }

        const newSponsor = await Sponsor.create({
            name,
            image: imageUrl,
            website,
            tier
        });
        res.status(201).json(newSponsor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/sponsors/{id}:
 *   delete:
 *     summary: Delete a sponsor (Admin only)
 *     tags: [Sponsors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Sponsor ID
 *     responses:
 *       200:
 *         description: Sponsor deleted
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Sponsor not found
 */
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        await Sponsor.deleteMany({ _id: req.params.id });
        res.json({ message: 'Sponsor deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
