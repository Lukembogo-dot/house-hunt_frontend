// src/pages/SEOManager.jsx (UPDATED FOR EDITABLE AUDIT NOTES)

import React, { useState, useEffect, useCallback } from 'react';
import { FaGlobe, FaTag, FaCheckCircle, FaSitemap } from 'react-icons/fa';
import apiClient from '../api/axios';

const SEOManager = () => {
  const [pagesList, setPagesList] = useState([]);
  const [selectedPagePath, setSelectedPagePath] = useState(null);
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // --- 1. Hardcoded Static Pages for initial setup ---
  const staticPages = [
      { pagePath: '/', metaTitle: 'Homepage', breadCrumbTitle: 'Home' },
      { pagePath: '/buy', metaTitle: 'Buy Page', breadCrumbTitle: 'Buy' },
      { pagePath: '/rent', metaTitle: 'Rent Page', breadCrumbTitle: 'Rent' },
      { pagePath: '/about', metaTitle: 'About Us', breadCrumbTitle: 'About' },
      { pagePath: '/contact', metaTitle: 'Contact Us', breadCrumbTitle: 'Contact' },
  ];
  
  // --- 2. Function to fetch the list of all configurable pages (Static + Dynamic) ---
  const fetchPagesList = useCallback(async () => {
    try {
        const { data: dynamicPages } = await apiClient.get('/seo/pages');
        
        const allPages = [
            ...staticPages, 
            ...dynamicPages.map(p => ({
                pagePath: p.pagePath,
                metaTitle: p.metaTitle,
                breadCrumbTitle: p.breadCrumbTitle || 'Property Details',
                isDynamic: true,
                updatedAt: p.updatedAt,
            }))
        ];
        
        const uniquePages = Array.from(new Map(allPages.map(page => [page.pagePath, page])).values());
        
        setPagesList(uniquePages);
        if (uniquePages.length > 0 && !selectedPagePath) {
            setSelectedPagePath(uniquePages[0].pagePath);
        }
    } catch (err) {
        console.error("Failed to fetch pages list:", err);
        setError('Failed to load configurable pages from the server.');
        setPagesList(staticPages);
    } finally {
        setLoading(false);
    }
  }, [selectedPagePath]);
  
  // --- 3. Function to fetch detailed SEO data for the selected page ---
  const fetchSeoData = useCallback(async (path) => {
    if (!path) return;
    setSaving(false);
    setError('');
    
    try {
        const encodedPath = encodeURIComponent(path);
        const { data } = await apiClient.get(`/seo/${encodedPath}`);

        setSeoData({
            pagePath: path,
            metaTitle: data.metaTitle || '',
            metaDescription: data.metaDescription || '',
            schemaFocusKeyword: data.schemaFocusKeyword || '',
            schemaDescription: data.schemaDescription || '',
            breadCrumbTitle: data.breadCrumbTitle || '',
            faqs: data.faqs || [],
            // 🚀 NEW FIELDS ADDED TO SEO MODEL
            altTagStatusNote: data.altTagStatusNote || 'No issues found.',
            linkSuggestionNote: data.linkSuggestionNote || 'No immediate links required.',
            // Mock audit data (still needed for the read-only metrics)
            altTags: data.altTags || 0,
            linkSuggestions: data.linkSuggestions || 0,
            faqCount: data.faqs?.length || 0,
        });

    } catch (err) {
        console.error("Failed to fetch detailed SEO data:", err);
        setError('Failed to fetch detailed SEO data for the selected page.');
        setSeoData(null);
    } finally {
        setSaving(false);
    }
  }, []);

  useEffect(() => {
    fetchPagesList();
  }, [fetchPagesList]);
  
  useEffect(() => {
    if (selectedPagePath) {
        fetchSeoData(selectedPagePath);
    }
  }, [selectedPagePath, fetchSeoData]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSeoData(prev => ({ ...prev, [name]: value }));
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!seoData) return;

    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
        const encodedPath = encodeURIComponent(seoData.pagePath);
        
        // The save request now includes altTagStatusNote and linkSuggestionNote
        await apiClient.put(`/seo/${encodedPath}`, seoData);
        
        setSuccess(`SEO settings for ${seoData.pagePath} saved successfully!`);
        fetchPagesList(); 
    } catch (err) {
        console.error("Failed to save SEO data:", err.response?.data);
        setError(err.response?.data?.message || 'Failed to save SEO data. Check server logs.');
    } finally {
        setSaving(false);
    }
  };

  const PageSelector = () => (
    <div className="mb-6">
      <label htmlFor="page-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Page to Edit
      </label>
      <select
        id="page-select"
        value={selectedPagePath || ''}
        onChange={(e) => setSelectedPagePath(e.target.value)}
        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
        disabled={loading || saving}
      >
        {loading ? (
            <option>Loading pages...</option>
        ) : (
            pagesList.map((page) => (
              <option key={page.pagePath} value={page.pagePath}>
                {page.metaTitle || page.pagePath} ({page.isDynamic ? 'Dynamic' : 'Static'})
              </option>
            ))
        )}
      </select>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );

  if (loading) {
    return (
        <div className="p-10 text-center dark:bg-gray-950 min-h-screen dark:text-gray-300">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading SEO Configuration...
        </div>
    );
  }

  if (saving || !seoData) {
      return (
        <div className="p-10 text-center dark:bg-gray-950 min-h-screen dark:text-gray-300">
             <PageSelector />
             <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 mt-8"></div>
             {saving ? 'Saving changes...' : 'Loading page data...'}
        </div>
      );
  }


  return (
    <div className="container mx-auto p-6 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 dark:text-white flex items-center">
        <FaGlobe className="mr-3 text-blue-500" /> SEO Management Dashboard
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        Editing SEO for path: <span className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded text-sm">{seoData.pagePath}</span>
      </p>

      <PageSelector />
      
      {success && (
        <div className="bg-green-100 dark:bg-green-900/50 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* === Meta Tags Section === */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100 flex items-center">
            <FaTag className="mr-2 text-purple-500" /> Page Meta Tags
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta Title (Max 65 chars)
              </label>
              <input
                type="text"
                id="metaTitle"
                name="metaTitle"
                value={seoData.metaTitle}
                onChange={handleInputChange}
                maxLength={65}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="Enter a compelling and keyword-rich page title"
              />
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Characters: {seoData.metaTitle.length}/65
              </p>
            </div>

            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta Description (Max 160 chars)
              </label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                value={seoData.metaDescription}
                onChange={handleInputChange}
                maxLength={160}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="Enter a summary that encourages clicks"
              />
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Characters: {seoData.metaDescription.length}/160
              </p>
            </div>

            <div>
              <label htmlFor="breadCrumbTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Breadcrumb Title
              </label>
              <input
                type="text"
                id="breadCrumbTitle"
                name="breadCrumbTitle"
                value={seoData.breadCrumbTitle}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="e.g. 'Home' or 'Properties for Sale'"
              />
            </div>
          </div>
        </section>

        {/* === Schema/Structured Data Section === */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100 flex items-center">
            <FaSitemap className="mr-2 text-green-500" /> Schema (Structured Data)
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="schemaFocusKeyword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Schema Focus Keyword (Main Topic)
              </label>
              <input
                type="text"
                id="schemaFocusKeyword"
                name="schemaFocusKeyword"
                value={seoData.schemaFocusKeyword}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="e.g. 'Real Estate Agent' or 'Property'"
              />
            </div>
            
            <div>
              <label htmlFor="schemaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Schema Description (For JSON-LD)
              </label>
              <textarea
                id="schemaDescription"
                name="schemaDescription"
                value={seoData.schemaDescription}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="Detailed description for search engines/knowledge graph."
              />
            </div>

            <div className="pt-4 border-t dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300 font-medium block mb-2">
                Schema-Generated FAQs ({seoData.faqs.length} found)
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                  FAQ editing is not implemented yet. Displaying {seoData.faqs.length} FAQs for reference.
              </p>
            </div>
          </div>
        </section>

        {/* 🚀 === On-Page Audit Notes Section (Now Editable) === */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100 flex items-center">
            <FaCheckCircle className="mr-2 text-blue-500" /> SEO Audit Notes (Manual)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Alt Tag Status */}
            <div>
                <h3 className="font-bold text-lg text-red-700 dark:text-red-400 mb-2">
                    Image Alt Tags Status (
                    <span className="font-mono">{seoData.altTags} Missing</span>
                    )
                </h3>
                <textarea
                    id="altTagStatusNote"
                    name="altTagStatusNote"
                    value={seoData.altTagStatusNote}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                    placeholder="E.g., All property images have descriptive alt text."
                />
            </div>
            
            {/* Internal Link Suggestions */}
            <div>
                <h3 className="font-bold text-lg text-yellow-700 dark:text-yellow-400 mb-2">
                    Internal Link Suggestions (
                    <span className="font-mono">{seoData.linkSuggestions} Found</span>
                    )
                </h3>
                <textarea
                    id="linkSuggestionNote"
                    name="linkSuggestionNote"
                    value={seoData.linkSuggestionNote}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                    placeholder="E.g., Ensure link to Buy page is included in description."
                />
            </div>
          </div>
        </section>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md disabled:opacity-50"
          >
            {saving ? 'Saving...' : `Save SEO Settings for ${seoData.pagePath}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SEOManager;