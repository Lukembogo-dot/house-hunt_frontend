// src/pages/SEOManager.jsx
// (Strictly Updated: Adds Service Providers to SEO Manager logic)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaGlobe, FaTag, FaCheckCircle, FaSitemap, FaKey, FaTrash, FaStar, FaPlus, FaSpinner, FaFacebook, FaTwitter, FaLink, FaExclamationTriangle, FaBuilding, FaInstagram, FaLinkedin, FaRobot, FaEye, FaExternalLinkAlt, FaEyeSlash } from 'react-icons/fa';
import apiClient from '../api/axios';
import { formatDistanceToNow } from 'date-fns';

// --- CKEditor Imports (Unchanged) ---
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }
  upload() {
    return this.loader.file.then(file => new Promise((resolve, reject) => {
      const data = new FormData();
      data.append('image', file);
      apiClient.post('/services/upload-content-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      })
        .then(response => {
          if (response.data.imageUrl) {
            resolve({ default: response.data.imageUrl });
          } else {
            reject('Image URL not returned from server.');
          }
        })
        .catch(error => {
          reject(error.response?.data?.message || 'Image upload failed.');
        });
    }));
  }
  abort() { }
}

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}
// --- END OF CKEDITOR IMPORTS ---


// --- KeywordLibrary Component (Unchanged) ---
const KeywordLibrary = ({ keywordLibrary, loading, error, fetchKeywords }) => {
  const [isSaving, setIsSaving] = useState(null);
  const [formError, setFormError] = useState('');
  const [newKeyword, setNewKeyword] = useState({ name: '', path: '', engine: 'property' });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewKeyword(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateKeyword = async (e) => {
    e.preventDefault();
    setIsSaving('new');
    setFormError('');
    try {
      await apiClient.post('/seo/keywords', newKeyword);
      setNewKeyword({ name: '', path: '', engine: 'property' });
      fetchKeywords();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create keyword.');
    } finally {
      setIsSaving(null);
    }
  };

  const handleToggleEmphasize = async (keyword) => {
    setIsSaving(keyword._id);
    try {
      await apiClient.put(`/seo/keywords/${keyword._id}`, {
        ...keyword,
        isEmphasized: !keyword.isEmphasized,
      });
      fetchKeywords();
    } catch (err) {
      setFormError('Failed to update keyword.');
    } finally {
      setIsSaving(null);
    }
  };

  const handleDeleteKeyword = async (id) => {
    if (window.confirm('Are you sure you want to delete this keyword? This cannot be undone.')) {
      setIsSaving(id);
      try {
        await apiClient.delete(`/seo/keywords/${id}`);
        fetchKeywords();
      } catch (err) {
        setFormError('Failed to delete keyword.');
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
            {isSaving === 'new' ? <FaSpinner className="animate-spin" /> : 'Create New Keyword'}
          </button>
        </form>
        {formError && <p className="text-sm text-red-500 mt-2">{formError}</p>}
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <h3 className="text-xl font-semibold p-6 dark:text-gray-100">
          Your Keyword Library ({keywordLibrary.length})
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
              {keywordLibrary.map(kw => (
                <tr key={kw._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleEmphasize(kw)}
                      disabled={isSaving === kw._id}
                      className={`p-2 rounded-full transition-colors ${kw.isEmphasized
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
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${kw.engine === 'property' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      kw.engine === 'agent' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        kw.engine === 'intel' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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

// --- PageSettingsEditor Component (UPDATED) ---
const PageSettingsEditor = ({ keywordLibrary }) => {
  const [pagesList, setPagesList] = useState([]);
  const [selectedPagePath, setSelectedPagePath] = useState(null);
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);

  const [postContent, setPostContent] = useState('');

  // ✅ UPDATED: Identifiers for Mongo Objects
  const [currentMongoId, setCurrentMongoId] = useState(null);

  // ✅ UPDATED: Flags to toggle Editor vs Standard Form
  const [isServicePost, setIsServicePost] = useState(false);
  const [isProvider, setIsProvider] = useState(false);

  const staticPages = [
    { pagePath: '/', metaTitle: 'Homepage', breadCrumbTitle: 'Home' },
    { pagePath: '/buy', metaTitle: 'Buy Page', breadCrumbTitle: 'Buy' },
    { pagePath: '/rent', metaTitle: 'Rent Page', breadCrumbTitle: 'Rent' },
    { pagePath: '/about', metaTitle: 'About Us', breadCrumbTitle: 'About' },
    { pagePath: '/contact', metaTitle: 'Contact Us', breadCrumbTitle: 'Contact' },

    // ✅ Added All Pages
    { pagePath: '/add-property', metaTitle: 'Add Property', breadCrumbTitle: 'Add Property' },
    { pagePath: '/admin-add-service', metaTitle: 'Admin Add Service', breadCrumbTitle: 'Add Service' },
    { pagePath: '/admin-dashboard', metaTitle: 'Admin Dashboard', breadCrumbTitle: 'Admin' },
    { pagePath: '/admin-faq-manager', metaTitle: 'FAQ Manager', breadCrumbTitle: 'FAQ Manager' },
    { pagePath: '/agent-analytics', metaTitle: 'Agent Analytics', breadCrumbTitle: 'Analytics' },
    { pagePath: '/agent-dashboard', metaTitle: 'Agent Dashboard', breadCrumbTitle: 'Dashboard' },
    { pagePath: '/agent-finder-page', metaTitle: 'Find an Agent', breadCrumbTitle: 'Agent Finder' },
    { pagePath: '/agent-public-profile', metaTitle: 'Agent Profile', breadCrumbTitle: 'Agent Profile' },
    { pagePath: '/agent-wallet', metaTitle: 'Agent Wallet', breadCrumbTitle: 'Wallet' },
    { pagePath: '/chat-page', metaTitle: 'Chat', breadCrumbTitle: 'Chat' },
    { pagePath: '/community-hub', metaTitle: 'Community Hub', breadCrumbTitle: 'Community' },
    { pagePath: '/community-post', metaTitle: 'Community Post', breadCrumbTitle: 'Post' },
    { pagePath: '/cost-of-living-calculator', metaTitle: 'Cost of Living Calculator', breadCrumbTitle: 'Calculator' },
    { pagePath: '/create-intel-post', metaTitle: 'Create Intel Post', breadCrumbTitle: 'Create Intel' },
    { pagePath: '/dynamic-agent-search', metaTitle: 'Search Agents', breadCrumbTitle: 'Search Agents' },
    { pagePath: '/dynamic-neighbourhood-search', metaTitle: 'Search Neighbourhoods', breadCrumbTitle: 'Neighbourhoods' },
    { pagePath: '/dynamic-search-page', metaTitle: 'Search Properties', breadCrumbTitle: 'Search' },
    { pagePath: '/dynamic-service-search', metaTitle: 'Search Services', breadCrumbTitle: 'Search Services' },
    { pagePath: '/edit-profile-settings', metaTitle: 'Edit Profile', breadCrumbTitle: 'Edit Profile' },
    { pagePath: '/edit-property', metaTitle: 'Edit Property', breadCrumbTitle: 'Edit Property' },
    { pagePath: '/faq-details', metaTitle: 'FAQ Details', breadCrumbTitle: 'FAQ Details' },
    { pagePath: '/faq-index', metaTitle: 'FAQs', breadCrumbTitle: 'FAQ' },
    { pagePath: '/feature-manager', metaTitle: 'Feature Manager', breadCrumbTitle: 'Features' },
    { pagePath: '/for-agents', metaTitle: 'For Agents', breadCrumbTitle: 'For Agents' },
    { pagePath: '/forgot-password', metaTitle: 'Forgot Password', breadCrumbTitle: 'Forgot Password' },
    { pagePath: '/home-page', metaTitle: 'Home Alternate', breadCrumbTitle: 'Home' },
    { pagePath: '/living-community-feed', metaTitle: 'Living Community', breadCrumbTitle: 'Living Community' },
    { pagePath: '/living-post-detail', metaTitle: 'Community Post', breadCrumbTitle: 'Post' },
    { pagePath: '/login', metaTitle: 'Login', breadCrumbTitle: 'Login' },
    { pagePath: '/my-profile', metaTitle: 'My Profile', breadCrumbTitle: 'Profile' },
    { pagePath: '/neighbourhood-intel-page', metaTitle: 'Neighbourhood Intel', breadCrumbTitle: 'Intel' },
    { pagePath: '/neighbourhood-quiz', metaTitle: 'Neighbourhood Quiz', breadCrumbTitle: 'Quiz' },
    { pagePath: '/not-found', metaTitle: 'Page Not Found', breadCrumbTitle: '404' },
    { pagePath: '/our-platform', metaTitle: 'Our Platform', breadCrumbTitle: 'Platform' },
    { pagePath: '/payment-cancel', metaTitle: 'Payment Cancelled', breadCrumbTitle: 'Cancelled' },
    { pagePath: '/payment-success', metaTitle: 'Payment Success', breadCrumbTitle: 'Success' },
    { pagePath: '/privacy-policy', metaTitle: 'Privacy Policy', breadCrumbTitle: 'Privacy' },
    { pagePath: '/property-details', metaTitle: 'Property Details', breadCrumbTitle: 'Property' },
    { pagePath: '/rated-properties-page', metaTitle: 'Rated Properties', breadCrumbTitle: 'Rated' },
    { pagePath: '/register', metaTitle: 'Register', breadCrumbTitle: 'Register' },
    { pagePath: '/reset-password', metaTitle: 'Reset Password', breadCrumbTitle: 'Reset Password' },
    { pagePath: '/seo-manager', metaTitle: 'SEO Manager', breadCrumbTitle: 'SEO' },
    { pagePath: '/service-post-details', metaTitle: 'Service Details', breadCrumbTitle: 'Service' },
    { pagePath: '/service-provider-details', metaTitle: 'Provider Details', breadCrumbTitle: 'Provider' },
    { pagePath: '/services', metaTitle: 'Services', breadCrumbTitle: 'Services' },
    { pagePath: '/share-insight', metaTitle: 'Share Insight', breadCrumbTitle: 'Share' },
    { pagePath: '/sold-properties-page', metaTitle: 'Sold Properties', breadCrumbTitle: 'Sold' },
    { pagePath: '/terms-of-service', metaTitle: 'Terms of Service', breadCrumbTitle: 'Terms' },
    { pagePath: '/verify-email', metaTitle: 'Verify Email', breadCrumbTitle: 'Verify' },
    { pagePath: '/wanted-request-page', metaTitle: 'Wanted Requests', breadCrumbTitle: 'Requests' },
  ];

  // ✅ 1. UPDATED: Fetch Providers, Posts & FAQs
  const fetchPagesList = useCallback(async () => {
    try {
      // 1. Get Configured SEO Pages
      const { data: dynamicPagesData } = await apiClient.get('/seo/pages');
      const dynamicPages = Array.isArray(dynamicPagesData) ? dynamicPagesData : [];

      // 2. Get Service Posts
      const { data: servicePosts } = await apiClient.get('/services');

      // 3. Get FAQs
      const { data: faqPosts } = await apiClient.get('/faqs');

      // ✅ 4. NEW: Get Service Providers
      const { data: serviceProvidersWrapper } = await apiClient.get('/service-providers?limit=1000');
      const serviceProviders = serviceProvidersWrapper.providers || serviceProvidersWrapper || [];

      // 5. Map pSEO
      const pSeoPages = keywordLibrary.map(kw => ({
        pagePath: kw.path,
        metaTitle: `${kw.name} (pSEO)`,
        breadCrumbTitle: kw.name,
        type: 'Keyword'
      }));

      // 6. Map Service Posts
      const servicePostPages = (Array.isArray(servicePosts) ? servicePosts : []).map(sp => ({
        pagePath: `/services/${sp.slug}`,
        metaTitle: sp.title,
        breadCrumbTitle: sp.title,
        type: 'Service Post',
        isPost: true, // Identify as Post
        mongoId: sp._id
      }));

      // ✅ 7. NEW: Map Service Providers
      const providerPages = serviceProviders.map(sp => ({
        pagePath: `/services/${sp.slug}`,
        metaTitle: sp.title,
        breadCrumbTitle: sp.title,
        type: 'Service Provider',
        isProvider: true, // Identify as Provider
        mongoId: sp._id
      }));

      // 8. Map FAQs
      const faqPages = (Array.isArray(faqPosts) ? faqPosts : []).map(faq => ({
        pagePath: `/faq/${faq.slug}`,
        metaTitle: faq.question,
        breadCrumbTitle: 'FAQ',
        type: 'FAQ'
      }));

      const pageMap = new Map();

      // Populate Map (Order implies display priority if paths conflict)
      faqPages.forEach(page => pageMap.set(page.pagePath, { ...page, isDynamic: true }));
      pSeoPages.forEach(page => pageMap.set(page.pagePath, { ...page, isDynamic: true }));
      staticPages.forEach(page => pageMap.set(page.pagePath, { ...page, isDynamic: false, type: 'Static' }));
      servicePostPages.forEach(page => pageMap.set(page.pagePath, { ...page, isDynamic: true }));

      // ✅ Add Providers to Map
      providerPages.forEach(page => pageMap.set(page.pagePath, { ...page, isDynamic: true }));

      // Overwrite with existing DB SEO settings
      dynamicPages.forEach(page => {
        const existing = pageMap.get(page.pagePath) || {};
        pageMap.set(page.pagePath, { ...existing, ...page, isDynamic: true });
      });

      const uniquePages = Array.from(pageMap.values());
      uniquePages.sort((a, b) => a.pagePath.localeCompare(b.pagePath));

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
  }, [selectedPagePath, keywordLibrary]);

  // ✅ 2. UPDATED: Fetch Data Logic (Handles Providers)
  const fetchSeoData = useCallback(async (path) => {
    if (!path) return;
    setSaving(false);
    setError('');
    setSeoData(null);
    setPostContent('');
    setCurrentMongoId(null);
    setIsServicePost(false);
    setIsProvider(false);

    // Identify current page object
    const pageObj = pagesList.find(p => p.pagePath === path);
    const isThisProvider = pageObj?.isProvider;
    const isThisPost = pageObj?.isPost;

    try {
      const encodedPath = encodeURIComponent(path);
      const { data } = await apiClient.get(`/seo/${encodedPath}`);

      setSeoData({
        pagePath: path,
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        ogTitle: data.ogTitle || '',
        ogDescription: data.ogDescription || '',
        twitterTitle: data.twitterTitle || '',
        twitterDescription: data.twitterDescription || '',
        focusKeyword: data.focusKeyword || '',
        canonicalUrl: data.canonicalUrl || '',
        schemaFocusKeyword: data.schemaFocusKeyword || '',
        schemaHeadline: data.schemaHeadline || '', // ✅ Added Schema Headline
        schemaDescription: data.schemaDescription || '',
        breadCrumbTitle: data.breadCrumbTitle || '',
        faqs: data.faqs || [],

        // Video Schema Fields
        videoTitle: data.videoTitle || '',
        videoDescription: data.videoDescription || '',
        videoThumbnail: data.videoThumbnail || '',
        videoUploadDate: data.videoUploadDate ? data.videoUploadDate.split('T')[0] : '',
      });

      // ✅ LOGIC A: If Service Provider
      if (isThisProvider) {
        setIsProvider(true);
        try {
          // Fetch Provider details using the ID from list
          const { data: provider } = await apiClient.get(`/service-providers/${pageObj.mongoId}`);
          setPostContent(provider.content || ''); // Bio / Content
          setCurrentMongoId(provider._id);

          // Autofill SEO if missing
          if (!data.metaTitle) {
            setSeoData(prev => ({
              ...prev,
              metaTitle: provider.metaTitle || provider.title,
              metaDescription: provider.metaDescription || provider.description,
            }));
          }
        } catch (err) {
          console.error("Failed to fetch provider content:", err);
        }
      }
      // ✅ LOGIC B: If Service Post (Existing Logic)
      else if (path.startsWith('/services/') || isThisPost) {
        setIsServicePost(true);
        try {
          const slug = path.split('/services/')[1];
          const { data: postData } = await apiClient.get(`/services/slug/${slug}`);
          setPostContent(postData.content || '');
          setCurrentMongoId(postData._id);

          if (!data.metaTitle) {
            setSeoData(prev => ({
              ...prev,
              metaTitle: postData.metaTitle || postData.title,
              metaDescription: postData.metaDescription || (postData.content ? postData.content.substring(0, 150).replace(/<[^>]+>/g, '') : ''),
            }));
          }
        } catch (postErr) {
          // Might be a directory page or static page
        }
      }

    } catch (err) {
      // Fallback
      setSeoData({
        pagePath: path,
        metaTitle: '', metaDescription: '', ogTitle: '', ogDescription: '',
        twitterTitle: '', twitterDescription: '', focusKeyword: '',
        canonicalUrl: '', schemaFocusKeyword: '', schemaDescription: '',
        breadCrumbTitle: '', faqs: []
      });
    } finally {
      setSaving(false);
    }
  }, [pagesList]);

  useEffect(() => {
    fetchPagesList();
  }, [fetchPagesList]);

  useEffect(() => {
    if (selectedPagePath && pagesList.length > 0) {
      fetchSeoData(selectedPagePath);
    }
  }, [selectedPagePath, pagesList]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSeoData(prev => ({ ...prev, [name]: value }));
    setSuccess('');

    if (name === 'focusKeyword' && value.trim() !== '') {
      const suggestions = keywordLibrary
        .filter(kw => kw.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setKeywordSuggestions(suggestions);
    } else {
      setKeywordSuggestions([]);
    }
  };

  const handleSuggestionClick = (keywordName) => {
    setSeoData(prev => ({ ...prev, focusKeyword: keywordName }));
    setKeywordSuggestions([]);
  };

  // ✅ NEW: SERP Feature Handlers
  const handleSerpChange = (e) => {
    const { name, value } = e.target;
    setSeoData(prev => ({
      ...prev,
      serpModifications: {
        ...prev.serpModifications,
        [name]: value
      }
    }));
  };

  const handleAddKeyTakeaway = () => {
    setSeoData(prev => ({
      ...prev,
      serpModifications: {
        ...prev.serpModifications,
        keyTakeaways: [...(prev.serpModifications?.keyTakeaways || []), '']
      }
    }));
  };

  const handleRemoveKeyTakeaway = (index) => {
    setSeoData(prev => ({
      ...prev,
      serpModifications: {
        ...prev.serpModifications,
        keyTakeaways: prev.serpModifications.keyTakeaways.filter((_, i) => i !== index)
      }
    }));
  };

  const handleKeyTakeawayChange = (index, value) => {
    const newTakeaways = [...(seoData.serpModifications?.keyTakeaways || [])];
    newTakeaways[index] = value;
    setSeoData(prev => ({
      ...prev,
      serpModifications: {
        ...prev.serpModifications,
        keyTakeaways: newTakeaways
      }
    }));
  };

  const handleAddQa = () => {
    setSeoData(prev => ({
      ...prev,
      serpModifications: {
        ...prev.serpModifications,
        qaPairs: [...(prev.serpModifications?.qaPairs || []), { question: '', answer: '' }]
      }
    }));
  };

  const handleRemoveQa = (index) => {
    setSeoData(prev => ({
      ...prev,
      serpModifications: {
        ...prev.serpModifications,
        qaPairs: prev.serpModifications.qaPairs.filter((_, i) => i !== index)
      }
    }));
  };

  const handleQaChange = (index, field, value) => {
    const newQa = [...(seoData.serpModifications?.qaPairs || [])];
    newQa[index] = { ...newQa[index], [field]: value };
    setSeoData(prev => ({
      ...prev,
      serpModifications: {
        ...prev.serpModifications,
        qaPairs: newQa
      }
    }));
  };

  // ✅ NEW: AI Video Description Generator
  const handleGenerateVideoSeo = async () => {
    if (!seoData.metaTitle) return alert("Please enter a Meta Title first to give the AI context.");

    // Set a loading state specifically for this button if we wanted, 
    // but for now we'll just toggle the main saving state or use a local one.
    // Let's use a quick alert/toast for UX or reuse 'saving' to block interaction.
    setSaving(true);

    try {
      const { data } = await apiClient.post('/ai/video-description', {
        title: seoData.metaTitle,
        location: seoData.metaTitle.includes('in ') ? seoData.metaTitle.split('in ')[1] : 'Kenya', // Simple inference
        type: 'Property',
        listingType: 'Listing',
        description: seoData.metaDescription || seoData.metaTitle
      });

      setSeoData(prev => ({
        ...prev,
        videoDescription: data.generatedDescription
      }));
      setSuccess("AI generated a new video description!");

    } catch (err) {
      console.error("AI Gen Failed:", err);
      setError("Failed to generate description. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ 3. UPDATED: Save Logic (Route to correct endpoint)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!seoData) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const encodedPath = encodeURIComponent(seoData.pagePath);
      await apiClient.put(`/seo/${encodedPath}`, seoData);

      // ✅ CASE 1: Service Provider Update
      if (isProvider && currentMongoId) {
        const formData = new FormData();
        formData.append('content', postContent);
        formData.append('metaTitle', seoData.metaTitle);
        formData.append('metaDescription', seoData.metaDescription);

        await apiClient.put(`/service-providers/${currentMongoId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      // ✅ CASE 2: Service Post Update
      else if (isServicePost && currentMongoId) {
        await apiClient.put(`/services/${currentMongoId}`, {
          content: postContent,
          title: seoData.metaTitle,
          metaTitle: seoData.metaTitle,
          metaDescription: seoData.metaDescription,
        });
      }

      setSuccess(`Successfully updated all settings for ${seoData.pagePath}!`);
      fetchPagesList();
    } catch (err) {
      console.error("Failed to save data:", err.response?.data);
      setError(err.response?.data?.message || 'Failed to save data. Check server logs.');
    } finally {
      setSaving(false);
    }
  };

  const editorConfig = {
    extraPlugins: [MyCustomUploadAdapterPlugin],
    removePlugins: ['CKBox', 'CKFinder', 'EasyImage']
  };

  const [showPreview, setShowPreview] = useState(false);

  const PageSelector = () => (
    <div className="mb-6 space-y-4">
      <div>
        <label htmlFor="page-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Page to Edit
        </label>
        <div className="flex gap-2">
          <select
            id="page-select"
            value={selectedPagePath || ''}
            onChange={(e) => setShowPreview(false) || setSelectedPagePath(e.target.value)}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
            disabled={loading || saving}
          >
            {loading ? (
              <option>Loading pages...</option>
            ) : (
              pagesList.map((page) => (
                <option key={page.pagePath} value={page.pagePath}>
                  {page.type ? `[${page.type}] ` : ''}{page.metaTitle || page.pagePath}
                </option>
              ))
            )}
          </select>

          {/* ✅ PREVIEW BUTTONS */}
          {selectedPagePath && (
            <>
              <a
                href={selectedPagePath}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-200 rounded-md transition flex items-center justify-center min-w-[50px]"
                title="Open Live Page in New Tab"
              >
                <FaExternalLinkAlt />
              </a>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`p-3 rounded-md transition flex items-center justify-center min-w-[50px] ${showPreview ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-200'}`}
                title={showPreview ? "Hide Preview" : "Show Embedded Preview"}
              >
                {showPreview ? <FaEyeSlash /> : <FaEye />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ✅ EMBEDDED PREVIEW IFRAME */}
      {showPreview && selectedPagePath && (
        <div className="rounded-xl overflow-hidden border-4 border-gray-300 dark:border-gray-700 shadow-2xl relative bg-gray-100">
          <div className="bg-gray-800 text-white text-xs py-1 px-4 flex justify-between items-center">
            <span>Live Preview: {selectedPagePath}</span>
            <button onClick={() => setShowPreview(false)} className="hover:text-red-400">Close</button>
          </div>
          <iframe
            src={selectedPagePath}
            title="Page Preview"
            className="w-full h-[500px] bg-white"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );

  if (loading) return <div className="p-10 text-center dark:text-gray-300"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>Loading SEO Configuration...</div>;

  if (!seoData) return <div className="p-10 text-center dark:text-gray-300"><PageSelector /><div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 mt-8"></div>Loading page data...</div>;

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

        {/* ✅ Updated Condition: Show CKEditor if it is a Service Post OR Service Provider */}
        {(isServicePost || isProvider) && (
          <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100 flex items-center">
              Page Content (H1, H2, etc.)
            </h2>
            <div className="ck-editor-container dark:text-gray-900">
              <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                data={postContent}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setPostContent(data);
                }}
              />
            </div>
          </section>
        )}

        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100 flex items-center">
            <FaTag className="mr-2 text-purple-500" /> Page Meta Tags
          </h2>
          <div className="space-y-4">

            <div className="relative">
              <label htmlFor="focusKeyword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Focus Keyword
              </label>
              <input
                type="text"
                id="focusKeyword"
                name="focusKeyword"
                value={seoData.focusKeyword}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="Enter the main keyword for this page"
                autoComplete="off"
              />
              {keywordSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {keywordSuggestions.map((kw) => (
                    <li
                      key={kw._id}
                      onClick={() => handleSuggestionClick(kw.name)}
                      className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {kw.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

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
              <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Canonical URL (Optional)
              </label>
              <input
                type="text"
                id="canonicalUrl"
                name="canonicalUrl"
                value={seoData.canonicalUrl}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="e.g., https://www.househuntkenya.co.ke/rent/nairobi"
              />
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Leave blank to use the default page URL. Only fill this in if you have duplicate content.
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

        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100 flex items-center">
            <FaFacebook className="mr-2 text-blue-600" /> <FaTwitter className="mr-2 text-blue-400" /> Social Media Tags
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            These tags control how your page looks when shared on social media. If left blank, they will default to your Meta Title & Description.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="ogTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Facebook / Open Graph Title
              </label>
              <input
                type="text"
                id="ogTitle"
                name="ogTitle"
                value={seoData.ogTitle}
                onChange={handleInputChange}
                maxLength={60}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="e.g., Check out these awesome properties in Kilimani"
              />
            </div>
            <div>
              <label htmlFor="ogDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Facebook / Open Graph Description
              </label>
              <textarea
                id="ogDescription"
                name="ogDescription"
                value={seoData.ogDescription}
                onChange={handleInputChange}
                maxLength={150}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="A short description for Facebook and LinkedIn."
              />
            </div>
            <div>
              <label htmlFor="twitterTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Twitter Title
              </label>
              <input
                type="text"
                id="twitterTitle"
                name="twitterTitle"
                value={seoData.twitterTitle}
                onChange={handleInputChange}
                maxLength={60}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="A shorter title for Twitter (X)."
              />
            </div>
            <div>
              <label htmlFor="twitterDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Twitter Description
              </label>
              <textarea
                id="twitterDescription"
                name="twitterDescription"
                value={seoData.twitterDescription}
                onChange={handleInputChange}
                maxLength={150}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="A short description for Twitter (X)."
              />
            </div>
          </div>
        </section>

        {/* --- VIDEO SCHEMA SECTION --- */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100 flex items-center">
            <FaCheckCircle className="mr-2 text-red-500" /> Video Schema Overrides
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            If this page contains a video, you can override the automatically generated video structured data here.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video Title (Override)</label>
              <input type="text" id="videoTitle" name="videoTitle" value={seoData.videoTitle} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3" placeholder="e.g. Virtual Tour of 3BR Apartment" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="videoDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Video Description (Override)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateVideoSeo}
                  className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-2 py-1 rounded flex items-center transition"
                  title="Generate using Gemma 2 (27b)"
                >
                  <FaRobot className="mr-1" /> Auto-Generate with AI
                </button>
              </div>
              <textarea id="videoDescription" name="videoDescription" value={seoData.videoDescription} onChange={handleInputChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3" placeholder="Description of the video content..." />
            </div>
            <div>
              <label htmlFor="videoThumbnail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video Thumbnail URL (Override)</label>
              <input type="text" id="videoThumbnail" name="videoThumbnail" value={seoData.videoThumbnail} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3" placeholder="https://..." />
            </div>
            <div>
              <label htmlFor="videoUploadDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video Upload Date (Override)</label>
              <input type="date" id="videoUploadDate" name="videoUploadDate" value={seoData.videoUploadDate} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3" />
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100 flex items-center">
            <FaStar className="mr-2 text-yellow-500" /> SERP Feature Optimizer (GEO)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Optimize for Google's **Featured Snippets** and **AI Overviews**. Content entered here is prioritized for direct answers.
          </p>

          {/* 1. Featured Snippet (Direct Answer) */}
          <div className="mb-6">
            <label htmlFor="featuredSnippet" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured Snippet Text (Definition / Direct Answer)
            </label>
            <textarea
              id="featuredSnippet"
              name="featuredSnippet"
              value={seoData.serpModifications?.featuredSnippet || ''}
              onChange={handleSerpChange}
              rows={3}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
              placeholder="A concise, direct answer to the user's query (40-60 words). E.g., 'To determine rental yield in Nairobi, calculate...'"
            />
          </div>

          {/* 2. Key Takeaways (Listicle) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Key Takeaways (Listicle Format)
            </label>
            {seoData.serpModifications?.keyTakeaways?.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleKeyTakeawayChange(index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-2"
                  placeholder={`Takeaway #${index + 1}`}
                />
                <button type="button" onClick={() => handleRemoveKeyTakeaway(index)} className="text-red-500 hover:text-red-700 px-2">
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddKeyTakeaway}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-2"
            >
              <FaPlus className="mr-1" /> Add Key Takeaway
            </button>
          </div>

          {/* 3. Q&A Pairs (AI Overview / FAQ) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Structured Q&A (For AI Overviews)
            </label>
            {seoData.serpModifications?.qaPairs?.map((qa, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase text-gray-500">Q&A #{index + 1}</h4>
                  <button type="button" onClick={() => handleRemoveQa(index)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                </div>
                <input
                  type="text"
                  value={qa.question}
                  onChange={(e) => handleQaChange(index, 'question', e.target.value)}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm p-2 mb-2"
                  placeholder="Question (e.g., Is Kilimani safe?)"
                />
                <textarea
                  value={qa.answer}
                  onChange={(e) => handleQaChange(index, 'answer', e.target.value)}
                  rows={2}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm p-2"
                  placeholder="Direct Answer..."
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddQa}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-2"
            >
              <FaPlus className="mr-1" /> Add Q&A Pair
            </button>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100 flex items-center">
            <FaSitemap className="mr-2 text-green-500" /> Schema (Structured Data)
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="schemaFocusKeyword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Schema Focus Keyword
              </label>
              <input
                type="text"
                id="schemaFocusKeyword"
                name="schemaFocusKeyword"
                value={seoData.schemaFocusKeyword}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="e.g., 'Bedsitter Rent Kilimani'"
              />
            </div>

            <div>
              <label htmlFor="schemaHeadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Schema Headline (For Article/WebPage Schema)
              </label>
              <input
                type="text"
                id="schemaHeadline"
                name="schemaHeadline"
                value={seoData.schemaHeadline || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="A compelling headline for structured data (Defaults to Meta Title)"
              />
            </div>

            <div>
              <label htmlFor="schemaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Schema Description
              </label>
              <textarea
                id="schemaDescription"
                name="schemaDescription"
                value={seoData.schemaDescription}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="A detailed description for search engines (can be longer than meta)."
              />
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100 flex items-center">
            <FaCheckCircle className="mr-2 text-blue-500" /> SEO Audit Notes (Manual)
          </h2>
          {/* (Content preserved implicitly as it was in your provided code, assuming it was empty or just the header) */}
        </section>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md disabled:opacity-50"
          >
            {saving ? <FaSpinner className="animate-spin" /> : `Save All Settings for ${seoData.pagePath}`}
          </button>
        </div>
      </form>
    </div>
  );
};


// --- RedirectManager Component (Unchanged) ---
const RedirectManager = ({ redirects, brokenLinks, fetchRedirects, fetchBrokenLinks }) => {
  const [newRedirect, setNewRedirect] = useState({ fromPath: '', toPath: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewRedirect(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateRedirect = async (e) => {
    e.preventDefault();
    if (!newRedirect.fromPath || !newRedirect.toPath) {
      setError('Both "From" and "To" paths are required.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      await apiClient.post('/redirects', newRedirect);
      setNewRedirect({ fromPath: '', toPath: '' });
      fetchRedirects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create redirect.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRedirect = async (id) => {
    if (window.confirm('Are you sure you want to delete this redirect?')) {
      try {
        await apiClient.delete(`/redirects/${id}`);
        fetchRedirects();
      } catch (err) {
        setError('Failed to delete redirect.');
      }
    }
  };

  const handleDeleteBrokenLink = async (id) => {
    if (window.confirm('Are you sure you want to delete this log? This is just a log, not the error itself.')) {
      try {
        await apiClient.delete(`/redirects/404s/${id}`);
        fetchBrokenLinks();
      } catch (err) {
        setError('Failed to delete broken link log.');
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-4 dark:text-gray-100 flex items-center">
          <FaPlus className="mr-2 text-green-500" /> Create 301 Redirect
        </h3>
        <form onSubmit={handleCreateRedirect} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            name="fromPath"
            value={newRedirect.fromPath}
            onChange={handleFormChange}
            placeholder="From Path (e.g., /old-link)"
            className="md:col-span-2 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
            required
          />
          <input
            type="text"
            name="toPath"
            value={newRedirect.toPath}
            onChange={handleFormChange}
            placeholder="To Path (e.g., /new-link)"
            className="md:col-span-2 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
            required
          />
          <button
            type="submit"
            disabled={isSaving}
            className="md:col-span-1 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md disabled:opacity-50"
          >
            {isSaving ? <FaSpinner className="animate-spin" /> : 'Create'}
          </button>
        </form>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <h3 className="text-xl font-semibold p-6 dark:text-gray-100">
            Active Redirects ({redirects.length})
          </h3>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">From Path</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">To Path</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {redirects.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{r.fromPath}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{r.toPath}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDeleteRedirect(r._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400 transition"
                        title="Delete Redirect"
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

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <h3 className="text-xl font-semibold p-6 dark:text-gray-100 flex items-center">
            <FaExclamationTriangle className="mr-2 text-yellow-400" /> Logged 404 Errors ({brokenLinks.length})
          </h3>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Broken Path</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Hit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {brokenLinks.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      <button onClick={() => copyToClipboard(b.path)} title="Copy path" className="mr-2 text-gray-400 hover:text-blue-500">📋</button>
                      {b.path}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{b.hits}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDistanceToNow(new Date(b.lastHitAt), { addSuffix: true })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDeleteBrokenLink(b._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400 transition"
                        title="Delete Log"
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
    </div>
  );
};


// --- GlobalSettingsManager Component (Unchanged) ---
const GlobalSettingsManager = () => {
  const [settings, setSettings] = useState({
    businessName: 'HouseHunt Kenya',
    logoUrl: '',
    phoneNumber: '',
    address: {
      streetAddress: '',
      addressLocality: '',
      addressRegion: '',
      postalCode: '',
      addressCountry: 'KE',
    },
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    instagramUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/settings');
        if (data) {
          setSettings(prev => ({
            ...prev,
            ...data,
            address: {
              ...prev.address,
              ...(data.address || {}),
            }
          }));
        }
      } catch (err) {
        setError('Failed to load global settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
    setSuccess('');
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.put('/settings', settings);
      setSuccess('Global settings saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center dark:text-gray-300">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Loading Global Settings...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {success && (
        <div className="bg-green-100 dark:bg-green-900/50 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100 flex items-center">
          <FaBuilding className="mr-2 text-blue-500" /> Business Information (for Schema)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Name</label>
            <input type="text" id="businessName" name="businessName" value={settings.businessName} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3" />
          </div>
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo URL</label>
            <input type="text" id="logoUrl" name="logoUrl" value={settings.logoUrl} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3" placeholder="https://www.househuntkenya.co.ke/logo.png" />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
            <input type="text" id="phoneNumber" name="phoneNumber" value={settings.phoneNumber} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3" placeholder="+254700000000" />
          </div>
          <div>
            <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</label>
            <input type="text" id="streetAddress" name="streetAddress" value={settings.address.streetAddress} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3" placeholder="e.g., 123 Kindaruma Road" />
          </div>
          <div>
            <label htmlFor="addressLocality" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City / Locality</label>
            <input type="text" id="addressLocality" name="addressLocality" value={settings.address.addressLocality} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3" placeholder="Nairobi" />
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
            <input type="text" id="postalCode" name="postalCode" value={settings.address.postalCode} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3" placeholder="00100" />
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100 flex items-center">
          <FaLink className="mr-2 text-gray-500" /> Social Media Profiles (for Schema)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Facebook URL</label>
            <input type="text" id="facebookUrl" name="facebookUrl" value={settings.facebookUrl} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3" placeholder="https://www.facebook.com/yourpage" />
          </div>
          <div>
            <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Twitter (X) URL</label>
            <input type="text" id="twitterUrl" name="twitterUrl" value={settings.twitterUrl} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3" placeholder="https://www.x.com/yourhandle" />
          </div>
          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</label>
            <input type="text" id="linkedinUrl" name="linkedinUrl" value={settings.linkedinUrl} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3" placeholder="https://www.linkedin.com/company/yourpage" />
          </div>
          <div>
            <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instagram URL</label>
            <input type="text" id="instagramUrl" name="instagramUrl" value={settings.instagramUrl} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3" placeholder="https://www.instagram.com/yourhandle" />
          </div>
        </div>
      </section>

      <div className="pt-4">
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md disabled:opacity-50"
        >
          {saving ? <FaSpinner className="animate-spin" /> : `Save Global Settings`}
        </button>
      </div>
    </form>
  );
};

// --- MAIN SEOManager Component (Unchanged) ---
const SEOManager = () => {
  const [activeTab, setActiveTab] = useState('pageSettings');
  const [keywordLibrary, setKeywordLibrary] = useState([]);
  const [keywordsLoading, setKeywordsLoading] = useState(true);
  const [keywordsError, setKeywordsError] = useState('');
  const [redirects, setRedirects] = useState([]);
  const [brokenLinks, setBrokenLinks] = useState([]);
  const [redirectsLoading, setRedirectsLoading] = useState(true);
  const [redirectsError, setRedirectsError] = useState('');

  const fetchKeywords = useCallback(async () => {
    try {
      setKeywordsLoading(true);
      setKeywordsError('');
      const { data } = await apiClient.get('/seo/keywords');
      setKeywordLibrary(Array.isArray(data) ? data : []);
    } catch (err) {
      setKeywordsError('Failed to fetch keyword library.');
      console.error(err);
      setKeywordLibrary([]);
    } finally {
      setKeywordsLoading(false);
    }
  }, []);

  const fetchRedirects = useCallback(async () => {
    try {
      setRedirectsLoading(true);
      setRedirectsError('');
      const { data } = await apiClient.get('/redirects');
      setRedirects(Array.isArray(data) ? data : []);
    } catch (err) {
      setRedirectsError('Failed to fetch redirects.');
    } finally {
      setRedirectsLoading(false);
    }
  }, []);

  const fetchBrokenLinks = useCallback(async () => {
    try {
      setRedirectsLoading(true);
      setRedirectsError('');
      const { data } = await apiClient.get('/redirects/404s');
      setBrokenLinks(Array.isArray(data) ? data : []);
    } catch (err) {
      setRedirectsError('Failed to fetch broken links.');
    } finally {
      setRedirectsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeywords();
    fetchRedirects();
    fetchBrokenLinks();
  }, [fetchKeywords, fetchRedirects, fetchBrokenLinks]);


  const TabButton = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center space-x-2 px-4 py-3 font-semibold text-sm rounded-md transition ${activeTab === tabName
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

      <div className="flex flex-wrap gap-2 mb-8 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <TabButton
          tabName="pageSettings"
          label="Content & Meta Editor"
          icon={<FaTag />}
        />
        <TabButton
          tabName="keywordLibrary"
          label="pSEO Keyword Library"
          icon={<FaKey />}
        />
        <TabButton
          tabName="redirects"
          label="Redirects & 404s"
          icon={<FaLink />}
        />
        <TabButton
          tabName="globalSettings"
          label="Global Settings"
          icon={<FaBuilding />}
        />
      </div>

      <div>
        {activeTab === 'pageSettings' && (
          <PageSettingsEditor
            keywordLibrary={keywordLibrary}
          />
        )}
        {activeTab === 'keywordLibrary' && (
          <KeywordLibrary
            keywordLibrary={keywordLibrary}
            loading={keywordsLoading}
            error={keywordsError}
            fetchKeywords={fetchKeywords}
          />
        )}
        {activeTab === 'redirects' && (
          <RedirectManager
            redirects={redirects}
            brokenLinks={brokenLinks}
            loading={redirectsLoading}
            error={redirectsError}
            fetchRedirects={fetchRedirects}
            fetchBrokenLinks={fetchBrokenLinks}
          />
        )}
        {activeTab === 'globalSettings' && (
          <GlobalSettingsManager />
        )}
      </div>
    </div>
  );
};

export default SEOManager;