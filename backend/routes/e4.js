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
 *     parameters:
 *       - in: query
 *         name: all
 *         schema:
 *           type: string
 *         description: Pass true to fetch all rides including offline/inactive rides
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
        let query = supabase.from('e4rides').select('*').order('_id', { ascending: true });
        if (req.query.all !== 'true') {
            query = query.eq('status', 'on');
        }
        const { data, error } = await query;

        if (error) throw error;

        const rides = data.map(mapRecord);
        rides.sort((a, b) => {
            const isMegaA = a.name && a.name.toLowerCase().includes('mega combo pack');
            const isMegaB = b.name && b.name.toLowerCase().includes('mega combo pack');

            if (isMegaA && !isMegaB) return -1;
            if (!isMegaA && isMegaB) return 1;

            const numA = parseInt(a._id, 10);
            const numB = parseInt(b._id, 10);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return String(a._id).localeCompare(String(b._id), undefined, { numeric: true });
        });

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
 *     parameters:
 *       - in: query
 *         name: all
 *         schema:
 *           type: string
 *         description: Pass true to fetch all dine items including closed/inactive ones
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
        let query = supabase.from('e4dines').select('*').order('createdAt', { ascending: false });
        if (req.query.all !== 'true') {
            query = query.eq('status', 'on');
        }
        const { data, error } = await query;

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
        let imagesUrls = undefined;
        if (req.body.images && Array.isArray(req.body.images)) {
            imagesUrls = [];
            for (const img of req.body.images) {
                imagesUrls.push(await uploadImage(img, 'rides'));
            }
        }

        const payload = {
            _id: crypto.randomUUID(),
            name: req.body.name,
            price: Number(req.body.price),
            ageGroup: req.body.ageGroup || 'All',
            category: req.body.category || 'play',
            type: req.body.type || 'Ride',
            status: req.body.status || 'on',
            image: imageUrl,
            images: imagesUrls || [],
            desc: req.body.desc || '',
            isCombo: req.body.isCombo || false,
            rideCount: req.body.rideCount ? Number(req.body.rideCount) : undefined,
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

/**
 * @swagger
 * /api/e4/dine:
 *   post:
 *     summary: Add a new E4 dine item (Admin only)
 *     tags: [E4]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DineItem'
 *     responses:
 *       201:
 *         description: Dine item created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DineItem'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
// POST /dine
router.post('/dine', [auth, admin, validate(addDineSchema)], async (req, res) => {
    try {
        const imageUrl = await uploadImage(req.body.image, 'dine');
        let menuImagesUrls = undefined;
        if (req.body.menuImages && Array.isArray(req.body.menuImages)) {
            menuImagesUrls = [];
            for (const img of req.body.menuImages) {
                menuImagesUrls.push(await uploadImage(img, 'dine'));
            }
        }

        const payload = {
            _id: crypto.randomUUID(),
            name: req.body.name,
            price: Number(req.body.price),
            category: req.body.category || 'dine',
            cuisine: req.body.cuisine || 'General',
            stall: req.body.stall || 'General',
            image: imageUrl,
            menuImages: menuImagesUrls || [],
            status: req.body.status || 'on',
            open: req.body.open !== undefined ? req.body.open : true,
            contactNumber: req.body.contactNumber || '',
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/rides/:id', [auth, admin], async (req, res) => {
    try {
        let updateData = { ...req.body };
        delete updateData._id;
        delete updateData.id;

        if (updateData.image && !updateData.image.startsWith('http')) {
            updateData.image = await uploadImage(updateData.image, 'rides');
        }
        if (updateData.images && Array.isArray(updateData.images)) {
            const newImages = [];
            for (const img of updateData.images) {
                newImages.push(img.startsWith('http') ? img : await uploadImage(img, 'rides'));
            }
            updateData.images = newImages;
        }

        const { data, error } = await supabase
            .from('e4rides')
            .update(updateData)
            .eq('_id', req.params.id)
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

/**
 * @swagger
 * /api/e4/rides/{id}:
 *   delete:
 *     summary: Delete an E4 ride (Admin only)
 *     tags: [E4]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ride ID
 *     responses:
 *       200:
 *         description: Ride deleted
 *       404:
 *         description: Ride not found
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/rides/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = await supabase
            .from('e4rides')
            .delete()
            .eq('_id', req.params.id);

        if (error) throw error;
        res.json({ message: 'E4 Ride deleted successfully' });
    } catch (err) {
        console.error('Delete E4 Ride Error:', err);
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/e4/dine/{id}:
 *   put:
 *     summary: Update an E4 dine item (Admin only)
 *     tags: [E4]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dine item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DineItem'
 *     responses:
 *       200:
 *         description: Dine item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DineItem'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Dine item not found
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// PUT /dine/:id
router.put('/dine/:id', [auth, admin], async (req, res) => {
    try {
        let updateData = { ...req.body };
        delete updateData._id;
        delete updateData.id;

        if (updateData.image && !updateData.image.startsWith('http')) {
            updateData.image = await uploadImage(updateData.image, 'dine');
        }
        if (updateData.menuImages && Array.isArray(updateData.menuImages)) {
            const newMenuImages = [];
            for (const img of updateData.menuImages) {
                newMenuImages.push(img.startsWith('http') ? img : await uploadImage(img, 'dine'));
            }
            updateData.menuImages = newMenuImages;
        }

        const { data, error } = await supabase
            .from('e4dines')
            .update(updateData)
            .eq('_id', req.params.id)
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/dine/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = await supabase
            .from('e4dines')
            .delete()
            .eq('_id', req.params.id);

        if (error) throw error;

        res.json({ message: 'Dine item deleted successfully' });
    } catch (err) {
        console.error('Delete E4 Dine Error:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
