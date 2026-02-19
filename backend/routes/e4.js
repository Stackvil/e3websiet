const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { addRideSchema, addDineSchema } = require('../schemas/validationSchemas');

const supabase = require('../utils/supabaseHelper');

// Helper to map Supabase ID
const mapRecord = (record) => {
    if (!record) return null;
    const id = record._id || record.id;
    return { ...record, _id: id, id: id };
};

/**
 * @swagger
 * tags:
 *   name: E4
 *   description: E4 Rides and Dining APIs
 */

/**
 * @swagger
 * /api/e4/rides:
 *   get:
 *     summary: Get all E4 rides
 *     tags: [E4]
 *     responses:
 *       200:
 *         description: List of E4 rides
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ride'
 */
router.get('/rides', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('e4rides')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;

        const rides = data.map(mapRecord);
        res.json(rides);
    } catch (err) {
        console.error('Fetch E4 Rides Error:', err);
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/e4/dine:
 *   get:
 *     summary: Get all E4 dine items
 *     tags: [E4]
 *     responses:
 *       200:
 *         description: List of E4 dine items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DineItem'
 */
router.get('/dine', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('e4dines')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;

        const dineItems = data.map(mapRecord);
        res.json(dineItems);
    } catch (err) {
        console.error('Fetch E4 Dine Error:', err);
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/e4/rides:
 *   post:
 *     summary: Add a new ride (Admin only)
 *     tags: [E4]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ride'
 *     responses:
 *       201:
 *         description: Ride created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ride'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
const { uploadImage } = require('../utils/uploadUtils');

// POST /rides
router.post('/rides', [auth, admin, validate(addRideSchema)], async (req, res) => {
    try {
        const imageUrl = await uploadImage(req.body.image, 'rides');
        const imagesUrls = req.body.images
            ? await Promise.all(req.body.images.map(img => uploadImage(img, 'rides')))
            : undefined;

        const payload = {
            ...req.body,
            image: imageUrl,
            images: imagesUrls,
            _id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('e4rides')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(mapRecord(data));
    } catch (err) {
        console.error('Create E4 Ride Error:', err);
        res.status(400).json({ message: err.message });
    }
});

// POST /dine
router.post('/dine', [auth, admin, validate(addDineSchema)], async (req, res) => {
    try {
        const imageUrl = await uploadImage(req.body.image, 'dine');
        const menuImagesUrls = req.body.menuImages
            ? await Promise.all(req.body.menuImages.map(img => uploadImage(img, 'dine')))
            : undefined;

        const payload = {
            ...req.body,
            image: imageUrl,
            menuImages: menuImagesUrls,
            _id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('e4dines')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(mapRecord(data));
    } catch (err) {
        console.error('Create E4 Dine Error:', err);
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/e4/rides/{id}:
 *   put:
 *     summary: Update a ride (Admin only)
 *     tags: [E4]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ride'
 *     responses:
 *       200:
 *         description: Ride updated
 *       404:
 *         description: Not found
 *       403:
 *         description: Admin access required
 */
router.put('/rides/:id', [auth, admin], async (req, res) => {
    try {
        let updateData = { ...req.body };

        if (updateData.image) {
            updateData.image = await uploadImage(updateData.image, 'rides');
        }
        if (updateData.images) {
            updateData.images = await Promise.all(updateData.images.map(img => uploadImage(img, 'rides')));
        }

        const { data, error } = await supabase
            .from('e4rides')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Ride not found' });

        res.json(mapRecord(data));
    } catch (err) {
        console.error('Update E4 Ride Error:', err);
        res.status(400).json({ message: err.message });
    }
});

// ... delete ride

// PUT /dine/:id
router.put('/dine/:id', [auth, admin], async (req, res) => {
    try {
        let updateData = { ...req.body };

        if (updateData.image) {
            updateData.image = await uploadImage(updateData.image, 'dine');
        }
        if (updateData.menuImages) {
            updateData.menuImages = await Promise.all(updateData.menuImages.map(img => uploadImage(img, 'dine')));
        }

        const { data, error } = await supabase
            .from('e4dines')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Dine item not found' });

        res.json(mapRecord(data));
    } catch (err) {
        console.error('Update E4 Dine Error:', err);
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/e4/dine/{id}:
 *   delete:
 *     summary: Delete a dine item (Admin only)
 *     tags: [E4]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dine item deleted
 *       404:
 *         description: Not found
 *       403:
 *         description: Admin access required
 */
router.delete('/dine/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = await supabase
            .from('e4dines')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ message: 'Dine item deleted successfully' });
    } catch (err) {
        console.error('Delete E4 Dine Error:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
