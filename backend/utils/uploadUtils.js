const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a base64 image or buffer to Cloudinary
 * @param {string} imageInput - Base64 string or URL
 * @param {string} folder - Folder name in bucket (default: 'uploads')
 * @returns {Promise<string>} Public URL of the uploaded image
 */
const uploadImage = async (imageInput, folder = 'uploads') => {
    if (!imageInput) return null;

    if (typeof imageInput === 'string' && imageInput.startsWith('data:image')) {
        try {
            // Cloudinary's uploader.upload() natively supports base64 data URIs!
            const result = await cloudinary.uploader.upload(imageInput, {
                folder: `e3-e4/${folder}`,
                use_filename: true,
                unique_filename: true,
            });

            return result.secure_url;
        } catch (err) {
            console.error('Cloudinary Image Upload error:', err);
            throw err;
        }
    }

    // specific check for http/https to confirm it's a URL
    if (typeof imageInput === 'string' && (imageInput.startsWith('http') || imageInput.startsWith('/'))) {
        return imageInput;
    }

    // default fallback
    return imageInput;
};

module.exports = { uploadImage };
