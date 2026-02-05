import useSWR from 'swr';
import apiClient from '../api/axios';

// Fetcher function for SWR
const fetcher = (url) => apiClient.get(url).then(res => res.data);

/**
 * Custom hook for cached API calls with 48-hour revalidation
 * @param {string} url - API endpoint
 * @param {object} options - SWR configuration options
 * @returns {object} SWR response { data, error, isLoading, mutate }
 */
export const useCachedAPI = (url, options = {}) => {
    const defaultOptions = {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 172800000, // 48 hours in milliseconds
        refreshInterval: 0, // Disable auto-refresh (manual only)
        ...options
    };

    return useSWR(url, fetcher, defaultOptions);
};

/**
 * Hook for long-term cached data (SEO, property lists, agent profiles)
 * 48-hour cache, no automatic revalidation
 */
export const useLongTermCache = (url) => {
    return useCachedAPI(url, {
        revalidateIfStale: false,
        revalidateOnMount: false,
        dedupingInterval: 172800000,
    });
};

/**
 * Hook for route resolution (service/agent lookups)
 * Cache for 48 hours but allow stale content to show immediately
 */
export const useRouteCache = (url) => {
    return useCachedAPI(url, {
        revalidateIfStale: true,
        revalidateOnMount: true,
        dedupingInterval: 172800000,
    });
};

export default useCachedAPI;
