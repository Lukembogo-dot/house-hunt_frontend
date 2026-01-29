// Optimized Image Component with Progressive Loading
// Reduces data consumption and provides instant visual feedback

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * OptimizedImage component with progressive loading and lazy loading
 * Features:
 * - Blur placeholder while loading
 * - Lazy loading (only loads when in viewport)
 * - Progressive enhancement
 * - Error handling with fallback
 */
const OptimizedImage = ({
    src,
    alt,
    className = '',
    blurhash,
    fallbackSrc = 'https://placehold.co/600x400/e2e8f0/64748b?text=Loading...',
    priority = false, // Set true for above-the-fold images
    ...props
}) => {
    const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
    const [isLoading, setIsLoading] = useState(!priority);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (src) {
            // ✅ OPTIMIZATION: Auto-append Cloudinary params if not present
            // f_auto = WebP/AVIF, q_auto = Optimize Quality, w_600 = Safe mobile width
            let optimizedSrc = src;
            if (src.includes('res.cloudinary.com') && !src.includes('f_auto')) {
                // Insert params before the version/upload path or at the end
                optimizedSrc = src.replace('/upload/', '/upload/f_auto,q_auto,w_600/');
            }
            setImgSrc(optimizedSrc);
        }
    }, [src]);

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={`${className} ${isLoading ? 'blur-sm scale-110' : 'blur-0 scale-100'
                } transition-all duration-500 ease-out`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setIsLoading(false)}
            onError={() => {
                setHasError(true);
                setIsLoading(false);
                setImgSrc(fallbackSrc);
            }}
            {...props}
        />
    );
};

OptimizedImage.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string.isRequired,
    className: PropTypes.string,
    blurhash: PropTypes.string,
    fallbackSrc: PropTypes.string,
    onLoad: PropTypes.func,
    priority: PropTypes.bool,
};

export default OptimizedImage;
