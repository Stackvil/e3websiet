const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../utils/supabaseHelper');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFromUrlToCloudinary = async (url, folder) => {
    if (!url || !url.startsWith('http')) return url; // Ignore non-urls or nulls
    if (url.includes('cloudinary.com')) return url; // Already processed

    try {
        console.log(`[Uploading to Cloudinary] ${url} => ${folder}`);
        const result = await cloudinary.uploader.upload(url, {
            folder: `e3-e4/${folder}`
        });
        return result.secure_url;
    } catch (err) {
        console.error(`[Upload Failed] ${url}:`, err.message);
        return url; // fallback to supabase URL
    }
};

const processRides = async (table) => {
    console.log(`[Processing Table] ${table}`);
    const { data: rides, error } = await supabase.from(table).select('*');
    if (error) {
        console.error(`Error fetching ${table}:`, error);
        return;
    }

    for (let ride of rides) {
        let updated = false;
        let updatePayload = {};

        // Migrate main image
        if (ride.image && ride.image.includes('supabase.co')) {
            const newImage = await uploadFromUrlToCloudinary(ride.image, 'rides');
            if (newImage !== ride.image) {
                updatePayload.image = newImage;
                updated = true;
            }
        }

        // Migrate gallery images
        if (ride.images && Array.isArray(ride.images) && ride.images.length > 0) {
            let newImagesArray = [];
            let galleryUpdated = false;
            for (let img of ride.images) {
                if (img.includes('supabase.co')) {
                    const newImg = await uploadFromUrlToCloudinary(img, 'rides');
                    newImagesArray.push(newImg);
                    if (newImg !== img) galleryUpdated = true;
                } else {
                    newImagesArray.push(img);
                }
            }
            if (galleryUpdated) {
                updatePayload.images = newImagesArray;
                updated = true;
            }
        }

        if (updated) {
            console.log(`[DB Update] Updating ${table} ID: ${ride._id}`);
            const { error: updateError } = await supabase.from(table).update(updatePayload).eq('_id', ride._id);
            if (updateError) console.error(`[DB Error] Update fail on ${ride._id}:`, updateError);
            else console.log(`[DB Success] ${ride._id} mapped to new URLs.`);
        }
    }
};

const processDine = async (table) => {
    console.log(`[Processing Table] ${table}`);
    const { data: dines, error } = await supabase.from(table).select('*');
    if (error) {
        console.error(`Error fetching ${table}:`, error);
        return;
    }

    for (let dine of dines) {
        let updated = false;
        let updatePayload = {};

        // Migrate main image
        if (dine.image && dine.image.includes('supabase.co')) {
            const newImage = await uploadFromUrlToCloudinary(dine.image, 'dine');
            if (newImage !== dine.image) {
                updatePayload.image = newImage;
                updated = true;
            }
        }

        // Migrate menu images
        if (dine.menuImages && Array.isArray(dine.menuImages) && dine.menuImages.length > 0) {
            let newMenuArr = [];
            let menuUpdated = false;
            for (let img of dine.menuImages) {
                if (img.includes('supabase.co')) {
                    const newImg = await uploadFromUrlToCloudinary(img, 'dine');
                    newMenuArr.push(newImg);
                    if (newImg !== img) menuUpdated = true;
                } else {
                    newMenuArr.push(img);
                }
            }
            if (menuUpdated) {
                updatePayload.menuImages = newMenuArr;
                updated = true;
            }
        }

        if (updated) {
            console.log(`[DB Update] Updating ${table} ID: ${dine._id}`);
            const { error: updateError } = await supabase.from(table).update(updatePayload).eq('_id', dine._id);
            if (updateError) console.error(`[DB Error] Update fail on ${dine._id}:`, updateError);
            else console.log(`[DB Success] ${dine._id} mapped to new URLs.`);
        }
    }
};

const runMigration = async () => {
    console.log('--- Starting Cloudinary Migration ---');
    await processRides('e3rides');
    await processRides('e4rides');
    await processDine('e3dines');
    await processDine('e4dines');
    console.log('--- Migration Completed ---');
};

runMigration();
