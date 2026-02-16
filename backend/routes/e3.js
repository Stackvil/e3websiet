const express = require('express');
const crypto = require('crypto');
const router = express.Router();
// const MockModel = require('../utils/mockDB'); // Deprecated for Rides/Dine
const { auth, admin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { addRideSchema, addDineSchema } = require('../schemas/validationSchemas');

const supabase = require('../utils/supabaseHelper');

// Helper to map Supabase ID to _id for frontend compatibility
const mapRecord = (record) => {
    if (!record) return null;
    // Database uses _id, so map it to id as well for consistency
    const id = record._id || record.id;
    return { ...record, _id: id, id: id };
};

/**
 * @swagger
 * tags:
 *   name: E3
 *   description: E3 Rides and Dining APIs
 */

/**
 * @swagger
 * /api/e3/rides:
 *   get:
 *     summary: Get all E3 rides
 *     tags: [E3]
 *     responses:
 *       200:
 *         description: List of E3 rides
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
            .from('e3rides')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;

        const rides = data.map(mapRecord);
        res.json(rides);
    } catch (err) {
        console.error('Fetch Rides Error:', err);
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/e3/dine:
 *   get:
 *     summary: Get all E3 dine items
 *     tags: [E3]
 *     responses:
 *       200:
 *         description: List of E3 dine items
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
            .from('e3dines')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;

        const dineItems = data.map(mapRecord);
        res.json(dineItems);
    } catch (err) {
        console.error('Fetch Dine Error:', err);
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/e3/rides:
 *   post:
 *     summary: Add a new ride (Admin only)
 *     tags: [E3]
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

// ... imports

// ... imports

// POST /rides
router.post('/rides', [auth, admin, validate(addRideSchema)], async (req, res) => {
    try {
        const imageUrl = await uploadImage(req.body.image, 'rides');
        const imagesUrls = req.body.images
            ? await Promise.all(req.body.images.map(img => uploadImage(img, 'rides')))
            : undefined;

        const payload = {
            name: req.body.name,
            price: req.body.price,
            ageGroup: req.body.ageGroup,
            category: req.body.category,
            type: req.body.type,
            status: req.body.status,
            image: imageUrl, // Use the uploaded URL
            images: imagesUrls, // Gallery URLs
            desc: req.body.desc,
            _id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('e3rides')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(mapRecord(data));
    } catch (err) {
        console.error('Create Ride Error:', err);
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
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            cuisine: req.body.cuisine,
            stall: req.body.stall,
            image: imageUrl, // Use the uploaded URL
            menuImages: menuImagesUrls,
            status: req.body.status,
            open: req.body.open,
            _id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('e3dines')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(mapRecord(data));
    } catch (err) {
        console.error('Create Dine Error:', err);
        res.status(400).json({ message: err.message });
    }
});

// PUT /rides/:id
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
            .from('e3rides')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Ride not found' });

        res.json(mapRecord(data));
    } catch (err) {
        console.error('Update Ride Error:', err);
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/e3/rides/{id}:
 *   delete:
 *     summary: Delete a ride (Admin only)
 *     tags: [E3]
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
 *         description: Ride deleted
 *       404:
 *         description: Ride not found
 *       403:
 *         description: Admin access required
 */
router.delete('/rides/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = await supabase
            .from('e3rides')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ message: 'Ride deleted successfully' });
    } catch (err) {
        console.error('Delete Ride Error:', err);
        res.status(400).json({ message: err.message });
    }
});

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
            .from('e3dines')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Dine item not found' });

        res.json(mapRecord(data));
    } catch (err) {
        console.error('Update Dine Error:', err);
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/e3/dine/{id}:
 *   delete:
 *     summary: Delete a dine item (Admin only)
 *     tags: [E3]
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
 *         description: Dine item not found
 *       403:
 *         description: Admin access required
 */
router.delete('/dine/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = await supabase
            .from('e3dines')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ message: 'Dine item deleted successfully' });
    } catch (err) {
        console.error('Delete Dine Error:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
