// src/hooks/useSeoData.js

import { useState, useEffect } from 'react';
import apiClient from '../api/axios';

/**
 * Fetches SEO data for a given page path from the backend.
 * @param {string} path - The path of the page (e.g., '/buy', '/rent', '/about').
 * @param {string} defaultTitle - The default title to use if no custom SEO is found.
 * @param {string} defaultDescription - The default description to use if no custom SEO is found.
 * @returns {object} The fetched or default SEO metadata.
 */
const useSeoData = (path, defaultTitle, defaultDescription) => {
    const [seoData, setSeoData] = useState({
        metaTitle: defaultTitle,
        metaDescription: defaultDescription,
        faqs: [],
        schemaDescription: '',
    });
    // Encode the path to safely include the forward slash in the URL
    const encodedPath = encodeURIComponent(path); 

    useEffect(() => {
        const fetchSeo = async () => {
            try {
                // Fetch data for the specific path
                const { data } = await apiClient.get(`/seo/${encodedPath}`);

                // If a record is returned, update the state with fetched data, falling back to defaults
                setSeoData({
                    metaTitle: data.metaTitle || defaultTitle,
                    metaDescription: data.metaDescription || defaultDescription,
                    faqs: data.faqs || [],
                    schemaDescription: data.schemaDescription || '',
                });
            } catch (error) {
                console.error(`Failed to fetch SEO for path: ${path}`, error);
                // On error, the state retains the initial default values.
            }
        };

        fetchSeo();
    }, [path, defaultTitle, defaultDescription, encodedPath]);

    return seoData;
};

export default useSeoData;