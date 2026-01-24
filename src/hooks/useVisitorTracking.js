import { useEffect, useRef } from 'react';
import apiClient from '../api/axios';

const useVisitorTracking = () => {
    const hasTracked = useRef(false);

    useEffect(() => {
        const trackVisit = async () => {
            // Avoid duplicate tracking in same session (refresh)
            if (sessionStorage.getItem('session_visited')) return;
            if (hasTracked.current) return;

            // Check if New or Returning
            const isReturning = localStorage.getItem('site_visited_before');
            const isNew = !isReturning;

            try {
                await apiClient.post('/tracking/track', {
                    type: 'site_visit',
                    source: document.referrer || 'direct',
                    metadata: { isNew }
                });

                // Mark as visited
                sessionStorage.setItem('session_visited', 'true');
                localStorage.setItem('site_visited_before', 'true');
                hasTracked.current = true;
            } catch (error) {
                console.error("Failed to track visit", error);
            }
        };

        trackVisit();
    }, []);
};

export default useVisitorTracking;
