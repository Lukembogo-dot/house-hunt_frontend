import { useCallback } from 'react';
import apiClient from '../api/axios';

const useAnalytics = () => {
    const trackEvent = useCallback(async (type, source, targetUserId, metadata = {}) => {
        try {
            if (!type || !source) return;

            // Log to console in dev
            if (import.meta.env.DEV) {
                console.log(`[Analytics] Tracking: ${type} from ${source}`, { targetUserId, metadata });
            }

            await apiClient.post('/tracking/track', {
                type,
                source,
                targetUserId,
                metadata
            });
        } catch (error) {
            // Fail silently to not impact user experience
            console.error('[Analytics] Failed to track event:', error);
        }
    }, []);

    return { trackEvent };
};

export default useAnalytics;
