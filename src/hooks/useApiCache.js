import { useEffect, useState, useRef } from 'react';

// Simple in-memory cache with TTL
const cache = new Map();
const pendingRequests = new Map();

/**
 * Custom hook for caching API responses and deduplicating simultaneous requests
 * @param {string} key - Unique cache key for this request
 * @param {Function} fetcher - Async function that fetches the data
 * @param {number} ttl - Time-to-live in milliseconds (default: 5 minutes)
 * @param {boolean} enabled - Whether to execute the fetch (default: true)
 * @returns {Object} - { data, loading, error, refetch }
 */
export function useApiCache(key, fetcher, ttl = 5 * 60 * 1000, enabled = true) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetcherRef = useRef(fetcher);

    // Update fetcher ref on changes
    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    const fetchData = async () => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        // Check cache first
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < ttl) {
            setData(cached.data);
            setLoading(false);
            return;
        }

        // Check if there's already a pending request for this key
        const pending = pendingRequests.get(key);
        if (pending) {
            try {
                const result = await pending;
                setData(result);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
            return;
        }

        // Create new request
        const promise = fetcherRef.current();
        pendingRequests.set(key, promise);

        try {
            setLoading(true);
            setError(null);
            const result = await promise;

            // Cache the result
            cache.set(key, {
                data: result,
                timestamp: Date.now()
            });

            setData(result);
        } catch (err) {
            console.error(`API Error for key "${key}":`, err);
            setError(err);
        } finally {
            setLoading(false);
            pendingRequests.delete(key);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, enabled]);

    const refetch = () => {
        // Clear cache for this key
        cache.delete(key);
        fetchData();
    };

    return { data, loading, error, refetch };
}

/**
 * Clear all cached data
 */
export function clearAllCache() {
    cache.clear();
    pendingRequests.clear();
}

/**
 * Clear cache for a specific key or pattern
 * @param {string|RegExp} keyOrPattern - Key or pattern to match
 */
export function clearCache(keyOrPattern) {
    if (typeof keyOrPattern === 'string') {
        cache.delete(keyOrPattern);
    } else if (keyOrPattern instanceof RegExp) {
        for (const key of cache.keys()) {
            if (keyOrPattern.test(key)) {
                cache.delete(key);
            }
        }
    }
}
