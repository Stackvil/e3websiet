const supabase = require('./supabaseHelper');
const crypto = require('crypto');

/**
 * Uploads a base64 image or buffer to Supabase Storage
 * @param {string} imageInput - Base64 string or URL
 * @param {string} folder - Folder name in bucket (default: 'uploads')
 * @returns {Promise<string>} Public URL of the uploaded image
 */
const uploadImage = async (imageInput, folder = 'uploads') => {
    if (!imageInput) return null;

    // improved base64 detection: check for data:image prefix
    if (typeof imageInput === 'string' && imageInput.startsWith('data:image')) {
        try {
            // Extract content type and base64 data
            const matches = imageInput.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

            if (!matches || matches.length !== 3) {
                console.warn('Invalid base64 string');
                return imageInput; // Return as is if regex fails (might not be base64)
            }

            const contentType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');

            // Generate unique filename
            const ext = contentType.split('/')[1] || 'png';
            const filename = `${folder}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;

            // Upload to Supabase Storage
            // Using 'images' bucket. Ensure this bucket exists and is public in Supabase.
            const { data, error } = await supabase
                .storage
                .from('images')
                .upload(filename, buffer, {
                    contentType: contentType,
                    upsert: false
                });

            if (error) {
                console.error('Supabase Storage Upload Error:', error);
                throw new Error('Image upload failed');
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase
                .storage
                .from('images')
                .getPublicUrl(filename);

            return publicUrl;
        } catch (err) {
            console.error('Image Upload processing error:', err);
            // Fallback: return original if upload fails? Or throw?
            // Throwing restricts proceeding with bad image.
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
