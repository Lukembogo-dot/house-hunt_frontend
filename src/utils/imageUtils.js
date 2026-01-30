/**
 * Optimizes Cloudinary and Unsplash URLs for better performance (WebP/AVIF)
 * 
 * @param {string} url - The original image URL
 * @param {Object} options - Optimization options
 * @param {number} options.width - Target width (optional)
 * @param {string} options.crop - Crop mode (default: 'limit')
 * @param {string} options.quality - Quality (default: 'auto')
 * @returns {string} - The optimized URL
 */
export const getOptimizedUrl = (url, { width, crop = 'limit', quality = 'auto' } = {}) => {
    if (!url) return '';
    if (typeof url !== 'string') return url;

    // 1. Handle Cloudinary URLs
    if (url.includes('res.cloudinary.com')) {
        // If already has f_auto (format auto), assume it's optimized enough to avoid breaking complex URLs
        if (url.includes('f_auto')) return url;

        // Construct transformation string
        // f_auto: Automatically select best format (WebP/AVIF)
        // q_auto: Automatically adjust quality
        const params = ['f_auto'];

        if (quality === 'auto') params.push('q_auto');
        else params.push(`q_${quality}`);

        if (width) params.push(`w_${width}`);
        if (crop) params.push(`c_${crop}`);

        const transformation = params.join(',');

        // Insert transformation after '/upload/'
        if (url.includes('/upload/')) {
            return url.replace('/upload/', `/upload/${transformation}/`);
        }
    }

    // 2. Handle Unsplash URLs
    if (url.includes('images.unsplash.com')) {
        // Ensure auto=format is present
        if (!url.includes('auto=format')) {
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}auto=format`;
        }
    }

    return url;
};
