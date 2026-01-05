// src/hooks/useSeoData.js
// --- NEW DYNAMIC VERSION ---

import { useState, useEffect } from 'react';
import apiClient from '../api/axios';

/**
 * A dynamic hook to fetch SEO data for a specific page.
 * It will fetch data from /seo/:pagePath and fall back to the provided defaults.
 */
const useSeoData = (pagePath, defaultTitle = 'HouseHunt Kenya', defaultDescription = 'Find your next home in Kenya.') => {
  const [seo, setSeo] = useState({
    metaTitle: defaultTitle,
    metaDescription: defaultDescription,
    ogTitle: '',
    ogDescription: '',
    twitterTitle: '',
    twitterDescription: '',
    canonicalUrl: '',
    focusKeyword: '',
    videoTitle: '',
    videoDescription: '',
    videoThumbnail: '',
    videoUploadDate: '',
    breadCrumbTitle: '',
    schemaDescription: '',
    faqs: [],
    richSchema: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pagePath) {
      setLoading(false);
      return;
    }

    const fetchSeoData = async () => {
      try {
        setLoading(true);
        const encodedPath = encodeURIComponent(pagePath);

        // ✅ FIX: Removed '/api' prefix because apiClient base URL already includes it
        // Request is now: [BaseURL]/seo/[path]
        const { data } = await apiClient.get(`/seo/${encodedPath}`);

        // Merge fetched data with defaults.
        // Fetched data (from your manager) takes priority.
        setSeo({
          metaTitle: data.metaTitle || defaultTitle,
          metaDescription: data.metaDescription || defaultDescription,
          ogTitle: data.ogTitle || data.metaTitle || defaultTitle,
          ogDescription: data.ogDescription || data.metaDescription || defaultDescription,
          twitterTitle: data.twitterTitle || data.metaTitle || defaultTitle,
          twitterDescription: data.twitterDescription || data.metaDescription || defaultDescription,
          canonicalUrl: data.canonicalUrl || '', // Get canonical from DB
          focusKeyword: data.focusKeyword || '', // Get focus keyword from DB

          // ✅ Added Missing Schema Fields
          videoTitle: data.videoTitle || '',
          videoDescription: data.videoDescription || '',
          videoThumbnail: data.videoThumbnail || '',
          videoUploadDate: data.videoUploadDate || '',
          breadCrumbTitle: data.breadCrumbTitle || '',
          schemaDescription: data.schemaDescription || '',
          faqs: data.faqs || [],
          richSchema: data.richSchema || null, // Allow overriding rich schema directly
        });

      } catch (err) {
        console.error(`Failed to fetch SEO for ${pagePath}:`, err);
        setError(err);
        // On error, just use the defaults
        setSeo({
          metaTitle: defaultTitle,
          metaDescription: defaultDescription,
          ogTitle: defaultTitle,
          ogDescription: defaultDescription,
          twitterTitle: defaultTitle,
          twitterDescription: defaultDescription,
          canonicalUrl: '',
          focusKeyword: '',
          videoTitle: '',
          videoDescription: '',
          videoThumbnail: '',
          videoUploadDate: '',
          breadCrumbTitle: '',
          schemaDescription: '',
          faqs: [],
          richSchema: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSeoData();
  }, [pagePath, defaultTitle, defaultDescription]); // Re-run if any of these change

  return { seo, loading, error }; // Return the full object
};

export default useSeoData;