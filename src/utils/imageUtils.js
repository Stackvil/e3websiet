/**
 * Compresses an image file to a smaller size using canvas.
 * @param {File} file - The image file to compress.
 * @param {number} maxWidth - The maximum width of the output image.
 * @param {number} quality - The quality of the JPEG output (0 to 1).
 * @returns {Promise<string>} - A promise that resolves to the compressed base64 string.
 */
export const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

/**
 * Generates an optimized URL for Supabase Storage images.
 * API Reference: https://supabase.com/docs/guides/storage/image-transformations#transformation-options
 * 
 * @param {string} url - The original image URL.
 * @param {number} width - The desired width.
 * @param {number} quality - The desired quality (1-100).
 * @param {string} format - The desired format (e.g., 'webp').
 * @returns {string} - The optimized URL.
 */
export const getOptimizedImageUrl = (url, width = 500, quality = 80, format = 'webp') => {
    if (!url || typeof url !== 'string') return '';

    // Check if it's a Supabase Storage URL
    // Pattern: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[path]
    // OR local/custom domains pointing to Supabase
    // Also include common deviations if any
    const isSupabase = url.includes('supabase.co') && url.includes('/storage/v1/object/public');

    if (isSupabase) {
        // Supabase Image Transformations use query parameters
        // Note: Image Transformations must be enabled in the Supabase project settings.
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}width=${width}&quality=${quality}&format=${format}`;
    }

    return url;
};
