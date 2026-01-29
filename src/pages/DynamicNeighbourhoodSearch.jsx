import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/axios';
import { motion } from 'framer-motion';
import {
  FaMapMarkerAlt, FaShieldAlt, FaTint, FaRoad, FaStar,
  FaBullhorn, FaComments, FaHome, FaBuilding, FaExclamationTriangle
} from 'react-icons/fa';
import SeoInjector from '../components/SeoInjector';
import Breadcrumbs from '../components/Breadcrumbs';
import PropertyList from '../components/PropertyList'; // Reuse for monetization

// Helper to capitalize slug
const formatLocation = (slug) => {
  if (!slug) return '';
  return slug.replace(/-/g, ' ').split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const DynamicNeighbourhoodSearch = () => {
  const { slug } = useParams(); // e.g. "westlands"
  const locationName = formatLocation(slug);

  const [seo, setSeo] = useState(null);
  const [insights, setInsights] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Custom SEO from Manager
        // 1. Fetch Custom SEO (Supercharged with AI Researcher)
        const path = `/neighbourhood/${slug}`;
        try {
          const seoRes = await apiClient.get(`/seo/generate?path=${encodeURIComponent(path)}`);
          setSeo(seoRes.data);
        } catch (e) {
          console.warn("Neighbourhood SEO failed, falling back to locals.");
        }

        // 2. Fetch Community Reviews/Posts for this location
        const insightsRes = await apiClient.get(`/community/location/${locationName}`);
        setInsights(insightsRes.data || []);

        // 3. Fetch Market Stats (Price, Count)
        const statsRes = await apiClient.get(`/properties/stats?location=${locationName}`);
        setStats(statsRes.data);

      } catch (error) {
        console.error("Neighbourhood Data Error", error);
      } finally {
        setLoading(false);

        // ✅ TRACKING: Log neighbourhood view as a search
        try {
          apiClient.post('/tracking/search', {
            query: locationName,
            resultCount: statsRes?.data?.count || 0,
            category: 'neighbourhood'
          });
        } catch (err) {
          console.warn("Neighbourhood tracking failed", err);
        }
      }
    };

    fetchData();
  }, [slug, locationName]);

  // Default SEO
  const pageTitle = seo?.metaTitle || `Living in ${locationName}: Reviews, Safety & Rent Prices | HouseHunt`;
  const pageDesc = seo?.metaDescription || `Thinking of moving to ${locationName}? See what locals say about safety, water, and traffic. Browse verified reviews and rental trends in ${locationName}.`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-inter">
      <SeoInjector seo={seo || { metaTitle: pageTitle, metaDescription: pageDesc }} />

      {/* Hero Section */}
      <div className="bg-purple-900 text-white pt-12 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-4 flex justify-center">
            <span className="bg-purple-700/50 border border-purple-500 text-purple-100 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2">
              <FaMapMarkerAlt /> Neighbourhood Guide
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            Living in {locationName}
          </h1>

          {/* ✅ AI Intro Text (HTML) */}
          <div
            className="text-lg text-purple-100 max-w-2xl mx-auto prose prose-invert"
            dangerouslySetInnerHTML={{ __html: seo?.introText || `The honest truth about <strong>${locationName}</strong>. Read verified reviews from real residents about safety, water reliability, and connectivity.` }}
          />

          {/* ✅ AI Market Insight (HTML) */}
          {seo?.marketInsight && (
            <div className="mt-6 bg-white/10 p-4 rounded-lg border border-white/20 inline-block text-left max-w-3xl">
              <h3 className="text-xs font-bold text-purple-200 mb-1 uppercase tracking-wide">Neighbourhood Scout</h3>
              <div
                className="text-white text-sm prose-sm prose-invert"
                dangerouslySetInnerHTML={{ __html: seo.marketInsight }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20 max-w-6xl">
        <Breadcrumbs />

        {/* --- VIBE CHECK (Zero Inventory Protocol for Content) --- */}
        {insights.length === 0 && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-purple-100 dark:border-gray-700 mb-10">
            <FaBullhorn className="text-5xl text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No reviews for {locationName} yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
              Do you live here? Be the first to share your experience! Help thousands of house hunters make the right choice.
            </p>
            <Link
              to="/share-insight"
              state={{ location: locationName, type: 'review' }}
              className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-purple-700 transition"
            >
              <FaStar /> Write the First Review
            </Link>
          </div>
        )}

        {/* --- 1. COMMUNITY VOICES --- */}
        {insights.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaComments className="text-purple-600" /> What Locals Say
              </h2>
              <Link to="/share-insight" className="text-sm text-purple-600 font-bold hover:underline">
                + Add Review
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {insights.map(post => (
                <div key={post._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
                        {post.authorAlias?.[0] || 'A'}
                      </div>
                      <div>
                        <p className="text-sm font-bold dark:text-white">{post.authorAlias}</p>
                        <p className="text-[10px] text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {post.category && <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">{post.category}</span>}
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 line-clamp-1">{post.title}</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: post.processedContent }} />
                  <Link to={`/community/${post.slug}`} className="text-blue-600 text-xs font-bold uppercase tracking-wide hover:underline">Read Full Story</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 2. REAL ESTATE SNAPSHOT --- */}
        {stats && stats.count > 0 && (
          <div className="mb-12 bg-blue-50 dark:bg-gray-800/50 rounded-xl p-8 border border-blue-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaHome className="text-blue-600" /> Housing Market in {locationName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Current market trends based on {stats.count} active listings.
                </p>
              </div>
              <Link to={`/search/rent/${slug}`} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-sm">
                View All {stats.count} Properties
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 font-bold uppercase">Avg Rent</p>
                <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">Ksh {stats.avgPrice?.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 font-bold uppercase">Lowest</p>
                <p className="text-xl font-extrabold text-gray-800 dark:text-white">Ksh {stats.minPrice?.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 font-bold uppercase">Highest</p>
                <p className="text-xl font-extrabold text-gray-800 dark:text-white">Ksh {stats.maxPrice?.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 font-bold uppercase">Demand</p>
                <p className="text-xl font-extrabold text-green-500">High</p>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. AVAILABLE PROPERTIES (Monetization) --- */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FaBuilding className="text-gray-400" /> Available Homes in {locationName}
          </h2>
          {/* Reuse PropertyList but limit items */}
          <PropertyList
            filterOverrides={{ location: locationName }}
            showTitle={false}
            limit={4}
            showSearchBar={false}
          />
          <div className="text-center mt-8">
            <Link to={`/search/rent/${slug}`} className="inline-block border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              Browse all Homes in {locationName}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DynamicNeighbourhoodSearch;