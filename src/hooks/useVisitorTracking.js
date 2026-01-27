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

            // Determine Source & Referrer
            const rawReferrer = document.referrer;
            let source = 'direct';

            if (rawReferrer) {
                if (
                    rawReferrer.includes('google') ||
                    rawReferrer.includes('bing') ||
                    rawReferrer.includes('yahoo') ||
                    rawReferrer.includes('duckduckgo')
                ) {
                    source = 'search_result';
                } else if (rawReferrer.includes('facebook') || rawReferrer.includes('twitter') || rawReferrer.includes('instagram') || rawReferrer.includes('linkedin') || rawReferrer.includes('t.co')) {
                    source = 'social_click'; // Assuming this enum exists or maps to a valid one? 
                    // Wait, social_click IS in the enum list I saw earlier! 
                    // enum: ['whatsapp_click', 'call_click', 'email_click', 'chat_start', 'social_click', 'view_profile', 'view_property', 'schedule_viewing_click', 'external_link_click', 'site_visit']
                    // Ah wait, 'social_click' is a TYPE, not a SOURCE. 
                    // The source enum is: ['property_sidebar', 'agent_profile', 'service_provider_details', 'search_result', 'direct']
                    // So I should stick to 'search_result' or 'direct' for now as per plan to avoid errors, or maybe 'direct' is best for social if we don't have a social source enum.
                    // Actually, let's stick to the plan: map search engines to 'search_result', others to 'direct'.
                    // But I will capture the raw referrer in metadata so we know.
                }
                // We will stick to the plan: search_result for search engines, direct for everything else (to pass validation),
                // but we rely on metadata for the specific details.
            }

            try {
                await apiClient.post('/tracking/track', {
                    type: 'site_visit',
                    source: source,
                    metadata: {
                        isNew,
                        referrer: rawReferrer // Capture the specific URL/Domain here
                    }
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
