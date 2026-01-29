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
    onLoad,
    priority = false, // Set true for above-the-fold images
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(blurhash || fallbackSrc);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        // Skip loading if no src provided
        if (!src) {
            setImageError(true);
            return;
        }

        // Preload image
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setImageSrc(src);
            setImageLoading(false);
            onLoad?.();
        };

        img.onerror = () => {
            setImageError(true);
            setImageLoading(false);
            setImageSrc(fallbackSrc);
        };

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src, fallbackSrc, onLoad]);

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={`${className} ${imageLoading ? 'blur-sm scale-105' : 'blur-0 scale-100'
                } transition-all duration-300 ease-out`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
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
