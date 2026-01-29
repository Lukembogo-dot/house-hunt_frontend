// Device detection utility for performance optimization
// Detects low-end devices to conditionally disable heavy features

/**
 * Detects if the user is on a low-end device
 * Uses multiple heuristics for accurate detection
 */
export const isLowEndDevice = () => {
    // Server-side rendering check
    if (typeof window === 'undefined') return false;

    // Check CPU cores (low-end devices typically have <= 4 cores)
    const lowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

    // Check device memory (if available, low-end devices have <= 4GB)
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;

    // Check if mobile device (mobile devices benefit from reduced animations)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Slow connection detection
    const slowConnection = navigator.connection &&
        (navigator.connection.effectiveType === 'slow-2g' ||
            navigator.connection.effectiveType === '2g' ||
            navigator.connection.effectiveType === '3g');

    return lowCPU || lowMemory || isMobile || slowConnection || false;
};

/**
 * Detects if user prefers reduced motion (accessibility)
 */
export const prefersReducedMotion = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get optimal animation config based on device capabilities
 */
export const getAnimationConfig = () => {
    const shouldReduceAnimations = isLowEndDevice() || prefersReducedMotion();

    return {
        // Disable animations on low-end devices
        shouldAnimate: !shouldReduceAnimations,

        // Reduce animation duration
        duration: shouldReduceAnimations ? 0.15 : 0.3,

        // Simpler easing
        ease: shouldReduceAnimations ? 'linear' : 'easeOut',

        // Disable backdrop blur on low-end devices (heavy GPU operation)
        useBackdropBlur: !shouldReduceAnimations,

        // Disable floating orbs on mobile/low-end
        useBackgroundOrbs: !shouldReduceAnimations,
    };
};

/**
 * Get connection speed
 */
export const getConnectionSpeed = () => {
    if (typeof window === 'undefined' || !navigator.connection) {
        return 'unknown';
    }
    return navigator.connection.effectiveType || 'unknown';
};

/**
 * Check if user is on a metered connection (to save data)
 */
export const isMeteredConnection = () => {
    if (typeof window === 'undefined' || !navigator.connection) {
        return false;
    }
    return navigator.connection.saveData || false;
};

export default {
    isLowEndDevice,
    prefersReducedMotion,
    getAnimationConfig,
    getConnectionSpeed,
    isMeteredConnection,
};
