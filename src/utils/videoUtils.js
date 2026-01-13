// src/utils/videoUtils.js
// Video metadata extraction utilities for SEO and display

/**
 * Determines the video platform from the URL
 * @param {string} videoUrl - The video URL
 * @returns {string} - 'youtube', 'vimeo', or 'custom'
 */
export const getVideoPlatform = (videoUrl) => {
    if (!videoUrl) return 'custom';

    const url = videoUrl.toLowerCase();
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'youtube';
    } else if (url.includes('vimeo.com')) {
        return 'vimeo';
    }
    return 'custom';
};

/**
 * Extracts video ID from YouTube or Vimeo URLs
 * @param {string} videoUrl - The video URL
 * @param {string} platform - The platform ('youtube' or 'vimeo')
 * @returns {string|null} - The video ID or null
 */
export const extractVideoId = (videoUrl, platform) => {
    if (!videoUrl) return null;

    if (platform === 'youtube') {
        // Handle various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([^&]+)/,
            /(?:youtube\.com\/embed\/)([^?]+)/,
            /(?:youtu\.be\/)([^?]+)/,
            /(?:youtube\.com\/v\/)([^?]+)/
        ];

        for (const pattern of patterns) {
            const match = videoUrl.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
    } else if (platform === 'vimeo') {
        // Handle Vimeo URL formats
        const patterns = [
            /(?:vimeo\.com\/)(\d+)/,
            /(?:player\.vimeo\.com\/video\/)(\d+)/
        ];

        for (const pattern of patterns) {
            const match = videoUrl.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
    }

    return null;
};

/**
 * Extracts high-quality thumbnail from video URL
 * @param {string} videoUrl - The video URL
 * @returns {string} - The thumbnail URL
 */
export const extractVideoThumbnail = (videoUrl) => {
    if (!videoUrl) return null;

    const platform = getVideoPlatform(videoUrl);
    const videoId = extractVideoId(videoUrl, platform);

    if (platform === 'youtube' && videoId) {
        // YouTube thumbnail URLs (in order of quality preference)
        // maxresdefault: 1280x720 (if available)
        // sddefault: 640x480
        // hqdefault: 480x360
        // mqdefault: 320x180
        // default: 120x90
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } else if (platform === 'vimeo' && videoId) {
        // Vimeo requires an API call to get thumbnail, but we can use a fallback
        // For proper implementation, you'd need to call Vimeo's oEmbed API
        // Fallback: Use Vimeo's default thumbnail endpoint (may not work for all videos)
        return `https://vumbnail.com/${videoId}.jpg`;
    }

    // For custom videos or if extraction fails, return null
    return null;
};

/**
 * Generates proper contentUrl and embedUrl for video schema
 * @param {string} videoUrl - The video URL
 * @returns {object} - Object with contentUrl and embedUrl
 */
export const generateVideoUrls = (videoUrl) => {
    if (!videoUrl) return { contentUrl: null, embedUrl: null };

    const platform = getVideoPlatform(videoUrl);
    const videoId = extractVideoId(videoUrl, platform);

    if (platform === 'youtube' && videoId) {
        return {
            contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
            embedUrl: `https://www.youtube.com/embed/${videoId}`
        };
    } else if (platform === 'vimeo' && videoId) {
        return {
            contentUrl: `https://vimeo.com/${videoId}`,
            embedUrl: `https://player.vimeo.com/video/${videoId}`
        };
    }

    // For custom videos, contentUrl is the direct file, embedUrl is same
    return {
        contentUrl: videoUrl,
        embedUrl: videoUrl
    };
};

/**
 * Estimates video duration in ISO 8601 format
 * Note: This is a placeholder. For accurate duration, you'd need to:
 * - For YouTube: Use YouTube Data API
 * - For Vimeo: Use Vimeo API
 * - For custom: Extract from video metadata
 * 
 * @param {string} videoUrl - The video URL
 * @param {string} defaultDuration - Default duration if extraction fails
 * @returns {string} - Duration in ISO 8601 format (e.g., "PT5M30S")
 */
export const estimateVideoDuration = (videoUrl, defaultDuration = "PT3M0S") => {
    // TODO: Implement API calls to get actual duration
    // For now, return a reasonable default
    return defaultDuration;
};

/**
 * Validates if a video URL is accessible and properly formatted
 * @param {string} videoUrl - The video URL
 * @returns {boolean} - True if valid
 */
export const isValidVideoUrl = (videoUrl) => {
    if (!videoUrl || typeof videoUrl !== 'string') return false;

    try {
        const url = new URL(videoUrl);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

/**
 * Gets a fallback thumbnail URL if video thumbnail extraction fails
 * @param {string} videoUrl - The video URL
 * @param {array} propertyImages - Array of property images
 * @returns {string} - Thumbnail URL
 */
export const getVideoThumbnailWithFallback = (videoUrl, propertyImages = []) => {
    // Try to extract video thumbnail
    const videoThumbnail = extractVideoThumbnail(videoUrl);

    if (videoThumbnail) {
        return videoThumbnail;
    }

    // Fallback: Use first property image if available
    if (propertyImages && propertyImages.length > 0) {
        const firstImage = propertyImages[0];
        return typeof firstImage === 'string' ? firstImage : firstImage.url;
    }

    // Final fallback: Generic video placeholder
    return "https://www.househuntkenya.co.ke/assets/video-placeholder.jpg";
};
