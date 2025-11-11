// src/pages/SEOManager.jsx (UPDATED FOR KEYWORD LIBRARY)

import React, { useState, useEffect, useCallback } from 'react';
import { FaGlobe, FaTag, FaCheckCircle, FaSitemap, FaKey, FaTrash, FaStar, FaPlus } from 'react-icons/fa';
import apiClient from '../api/axios';

// ✅ --- 1. NEW COMPONENT FOR THE KEYWORD LIBRARY ---
const KeywordLibrary = () => {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(null); // Will store the ID of the keyword being saved

  // State for the new keyword form
  const [newKeyword, setNewKeyword] = useState({
    name: '',
    path: '',
    engine: 'property',
  });

  // Fetch all keywords on component mount
  const fetchKeywords = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/seo/keywords');
      setKeywords(data);
    } catch (err) {
      setError('Failed to fetch keyword library.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  // Handle changes in the "Create New" form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewKeyword(prev => ({ ...prev, [name]: value }));
  };

  // Handle creating a new keyword
  const handleCreateKeyword = async (e) => {
    e.preventDefault();
    setIsSaving('new'); // Set saving state for the form
    setError('');
    try {
      await apiClient.post('/seo/keywords', newKeyword);
      setNewKeyword({ name: '', path: '', engine: 'property' }); // Reset form
      fetchKeywords(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create keyword.');
    } finally {
      setIsSaving(null);
    }
  };

  // Handle toggling the "isEmphasized" flag
  const handleToggleEmphasize = async (keyword) => {
    setIsSaving(keyword._id); // Set saving state for this specific row
    try {
      const { data: updatedKeyword } = await apiClient.put(`/seo/keywords/${keyword._id}`, {
        isEmphasized: !keyword.isEmphasized,
      });
      // Update the list in-place for a responsive UI
      setKeywords(prev => 
        prev.map(kw => (kw._id === keyword._id ? updatedKeyword : kw))
      );
    } catch (err) {
      setError('Failed to update keyword.');
    } finally {
      setIsSaving(null);
    }
  };

  // Handle deleting a keyword
  const handleDeleteKeyword = async (id) => {
    if (window.confirm('Are you sure you want to delete this keyword? This cannot be undone.')) {
      setIsSaving(id); // Use saving state for delete
      try {
        await apiClient.delete(`/seo/keywords/${id}`);
        fetchKeywords(); // Refresh the list
      } catch (err) {
        setError('Failed to delete keyword.');
      } finally {
        setIsSaving(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center dark:text-gray-300">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Loading Keyword Library...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* --- Create New Keyword Form --- */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4 dark:text-gray-100 flex items-center">
          <FaPlus className="mr-2 text-green-500" /> Add to Keyword Library
        </h3>
        <form onSubmit={handleCreateKeyword} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="name"
            value={newKeyword.name}
            onChange={handleFormChange}
            placeholder="Friendly Name (e.g., Bedsitters in Kilimani)"
            className="md:col-span-2 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
            required
          />
          <input
            type="text"
            name="path"
            value={newKeyword.path}
            onChange={handleFormChange}
            placeholder="Full Path (e.g., /search/rent/bedsitter/kilimani)"
            className="md:col-span-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
            required
          />
          <select
            name="engine"
            value={newKeyword.engine}
            onChange={handleFormChange}
            className="md:col-span-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
          >
            <option value="property">Property Engine</option>
            <option value="agent">Agent Engine</option>
            <option value="intel">Intel Engine</option>
            <option value="other">Other</option>
          </select>
          <button
            type="submit"
            disabled={isSaving === 'new'}
            className="md:col-span-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md disabled:opacity-50"
          >
            {isSaving === 'new' ? 'Creating...' : 'Create New Keyword'}
          </button>
        </form>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </section>

      {/* --- Keyword List Table --- */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <h3 className="text-xl font-semibold p-6 dark:text-gray-100">
          Your Keyword Library ({keywords.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prioritize</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Path</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Engine</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {keywords.map(kw => (
                <tr key={kw._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleEmphasize(kw)}
                      disabled={isSaving === kw._id}
                      className={`p-2 rounded-full transition-colors ${
                        kw.isEmphasized 
                          ? 'text-yellow-400 hover:text-yellow-300' 
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                      }`}
                      title={kw.isEmphasized ? 'De-emphasize (Remove from Footer)' : 'Emphasize (Add to Footer)'}
                    >
                      {isSaving === kw._id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaStar size={20} />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{kw.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{kw.path}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      kw.engine === 'property' ? 'bg-blue-100 text-blue-800' :
                      kw.engine === 'agent' ? 'bg-green-100 text-green-800' :
                      kw.engine === 'intel' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {kw.engine}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleDeleteKeyword(kw._id)}
                      disabled={isSaving === kw._id}
                      className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400 transition"
                      title="Delete Keyword"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

// ✅ --- 2. THIS IS YOUR EXISTING COMPONENT, WRAPPED ---
const PageSettingsEditor = () => {
  const [pagesList, setPagesList] = useState([]);
  const [selectedPagePath, setSelectedPagePath] = useState(null);
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const staticPages = [
      { pagePath: '/', metaTitle: 'Homepage', breadCrumbTitle: 'Home' },
      { pagePath: '/buy', metaTitle: 'Buy Page', breadCrumbTitle: 'Buy' },
      { pagePath: '/rent', metaTitle: 'Rent Page', breadCrumbTitle: 'Rent' },
      { pagePath: '/about', metaTitle: 'About Us', breadCrumbTitle: 'About' },
      { pagePath: '/contact', metaTitle: 'Contact Us', breadCrumbTitle: 'Contact' },
  ];
  
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
  
  const fetchSeoData = useCallback(async (path) => {
    if (!path) return;
    setSaving(false);
    setError('');
    
    try {
        const encodedPath = encodeURIComponent(path);
        // ✅ --- YOUR EXISTING getSeoDataByPath IS PERFECT ---
        const { data } = await apiClient.get(`/seo/${encodedPath}`);

        setSeoData({
            pagePath: path,
            metaTitle: data.metaTitle || '',
            metaDescription: data.metaDescription || '',
            schemaFocusKeyword: data.schemaFocusKeyword || '',
            schemaDescription: data.schemaDescription || '',
            breadCrumbTitle: data.breadCrumbTitle || '',
            faqs: data.faqs || [],
            altTagStatusNote: data.altTagStatusNote || 'No issues found.',
            linkSuggestionNote: data.linkSuggestionNote || 'No immediate links required.',
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
        <div className="p-10 text-center dark:text-gray-300">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading SEO Configuration...
        </div>
    );
  }

  if (saving || !seoData) {
      return (
        <div className="p-10 text-center dark:text-gray-300">
             <PageSelector />
             <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 mt-8"></div>
             {saving ? 'Saving changes...' : 'Loading page data...'}
        </div>
      );
  }

  return (
    <div className="space-y-8">
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
          {/* ... (rest of your existing form is unchanged) ... */}
        </section>

        {/* === On-Page Audit Notes Section (Now Editable) === */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100 flex items-center">
            <FaCheckCircle className="mr-2 text-blue-500" /> SEO Audit Notes (Manual)
          </h2>
          {/* ... (rest of your existing form is unchanged) ... */}
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


// ✅ --- 3. THIS IS THE NEW MAIN COMPONENT ---
const SEOManager = () => {
  const [activeTab, setActiveTab] = useState('pageSettings'); // 'pageSettings' or 'keywordLibrary'

  const TabButton = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center space-x-2 px-4 py-3 font-semibold text-sm rounded-md transition ${
        activeTab === tabName
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="container mx-auto p-6 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 dark:text-white flex items-center">
        <FaGlobe className="mr-3 text-blue-500" /> SEO Management Dashboard
      </h1>

      {/* --- Tab Navigation --- */}
      <div className="flex space-x-2 mb-8 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <TabButton 
          tabName="pageSettings" 
          label="Page Meta Settings" 
          icon={<FaTag />} 
        />
        <TabButton 
          tabName="keywordLibrary" 
          label="pSEO Keyword Library" 
          icon={<FaKey />} 
        />
      </div>

      {/* --- Tab Content --- */}
      <div>
        {activeTab === 'pageSettings' && <PageSettingsEditor />}
        {activeTab === 'keywordLibrary' && <KeywordLibrary />}
      </div>
    </div>
  );
};

export default SEOManager;