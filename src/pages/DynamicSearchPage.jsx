// src/pages/DynamicSearchPage.jsx
// (UPDATED: Fully wired to SeoInjector & SEO Manager)

import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/axios';
import PropertyList from '../components/PropertyList';
import { motion } from 'framer-motion';
import {
  FaMoneyBillWave, FaChartBar, FaSearchDollar, FaHome,
  FaQuestionCircle, FaChevronRight, FaExclamationTriangle,
  FaBell, FaClipboardList, FaBullhorn, FaStar, FaUsers,
  FaUserFriends, FaLightbulb, FaArrowRight
} from 'react-icons/fa';
import { generateDynamicLocationContent } from '../utils/seoContentGenerator'; // Removed generateFAQSchema (handled in Injector now)
import SmartOwnerBanner from '../components/SmartOwnerBanner';
import Breadcrumbs from '../components/Breadcrumbs';
import PropertyAlertForm from '../components/PropertyAlertForm';
import { useAuth } from '../context/AuthContext';
import { getAnimationConfig } from '../utils/deviceDetection'; // ⚡ Performance
import SeoInjector from '../components/SeoInjector'; // ✅ 1. Import Injector
import HouseHuntRequest from '../components/HouseHuntRequest';

// Helper function
const capitalize = (s) => {
  if (typeof s !== 'string' || !s) return '';
  return s.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ... [NoResultsDashboard Component - No Changes] ...
const NoResultsDashboard = ({ location, listingType, nearbyLocations }) => {
  return (
    <div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-white/20 overflow-hidden mb-12">
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-600/20 dark:to-red-600/20 backdrop-blur-md p-8 text-center border-b border-white/20 dark:border-white/10">
        <FaExclamationTriangle className="text-5xl text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          No {listingType} listings in {location} yet.
        </h2>
        <p className="text-gray-700 dark:text-gray-300 max-w-lg mx-auto">
          Inventory moves fast! Don't waste time refreshing. Tell us what you want, and we'll notify you instantly when a match hits the market.
        </p>
      </div>
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/20 dark:divide-white/10">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/20 dark:bg-blue-600/30 backdrop-blur-sm text-blue-600 dark:text-blue-400 rounded-full border border-blue-200/50 dark:border-blue-600/50">
              <FaBell className="text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Create a Property Alert</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Be the first to know.</p>
            </div>
          </div>
          <PropertyAlertForm
            currentFilters={{ location, type: listingType }}
            compact={true}
          />
        </div>
        <div className="p-8 bg-white/10 dark:bg-white/5 backdrop-blur-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/20 dark:bg-green-600/30 backdrop-blur-sm text-green-600 dark:text-green-400 rounded-full border border-green-200/50 dark:border-green-600/50">
              <FaClipboardList className="text-xl" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Are you an Agent?</h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm">
            You have a massive opportunity. We have tenants actively looking in <strong>{location}</strong> right now but zero listings to show them.
          </p>
          <Link
            to="/for-agents"
            className="block w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-center rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            List Property in {location} (Free)
          </Link>
        </div>
      </div>
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm p-6 border-t border-white/20 dark:border-white/10">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider mb-3 text-center">
          Or try these nearby locations
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {nearbyLocations.map(loc => (
            <Link
              key={loc}
              to={`/search/${listingType}/${loc.toLowerCase()}`}
              className="px-4 py-2 bg-white/30 dark:bg-white/10 backdrop-blur-sm rounded-full shadow-sm border border-white/30 dark:border-white/20 text-sm hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition hover:scale-105"
            >
              {loc}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// ... [MarketSnapshot Component - No Changes] ...
const MarketSnapshot = ({ stats, loading }) => {
  const StatCardSkeleton = () => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 animate-pulse">
      <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-8 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
      </div>
    );
  }

  if (!stats || stats.count === 0) return null;

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div whileHover={{ scale: 1.05, y: -4 }} transition={{ duration: 0.2 }} className="p-4 bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/30 dark:border-white/20 hover:shadow-xl">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center"><FaHome className="mr-2" /> Total Listings</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.count}</p>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05, y: -4 }} transition={{ duration: 0.2 }} className="p-4 bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/30 dark:border-white/20 hover:shadow-xl">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center"><FaMoneyBillWave className="mr-2" /> Average Price</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">Ksh {stats.avgPrice ? stats.avgPrice.toLocaleString() : 'N/A'}</p>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05, y: -4 }} transition={{ duration: 0.2 }} className="p-4 bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/30 dark:border-white/20 hover:shadow-xl">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center"><FaSearchDollar className="mr-2" /> Price Low</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">Ksh {stats.minPrice ? stats.minPrice.toLocaleString() : 'N/A'}</p>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05, y: -4 }} transition={{ duration: 0.2 }} className="p-4 bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/30 dark:border-white/20 hover:shadow-xl">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center"><FaChartBar className="mr-2" /> Price High</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">Ksh {stats.maxPrice ? stats.maxPrice.toLocaleString() : 'N/A'}</p>
      </motion.div>
    </motion.div>
  );
};

const DynamicSearchPage = () => {
  const { listingType, propertyType, location, bedrooms } = useParams();
  const { user } = useAuth();
  const urlLocation = useLocation(); // Hook to get current path

  const rawOverrides = {
    listingType: listingType,
    type: (propertyType && propertyType !== 'all') ? propertyType.replace(/-/g, ' ') : undefined,
    location: (location && location !== 'all') ? capitalize(location.replace(/-/g, ' ')) : undefined,
    bedrooms: bedrooms ? bedrooms.split('-')[0] : undefined,
  };

  // ✅ SANITIZE GLOBALLY: Remove undefined props so PropertyList gets clean data
  const filterOverrides = Object.fromEntries(
    Object.entries(rawOverrides).filter(([_, v]) => v != null && v !== 'undefined' && v !== '')
  );

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // ✅ 2. Unified SEO State
  const [finalSeoData, setFinalSeoData] = useState(null);

  const [locationFaqs, setLocationFaqs] = useState([]);
  const [communityInsights, setCommunityInsights] = useState([]);

  const nearbyDefaults = ['Westlands', 'Kilimani', 'Kileleshwa', 'Lavington', 'Karen', 'Ruaka', 'South B', 'Thika Road'];

  useEffect(() => {
    const fetchStatsAndGenerateContent = async () => {
      setLoadingStats(true);
      try {
        const params = new URLSearchParams(filterOverrides);

        // 1. Get Live Stats (Count, Avg Price)
        const { data: statsData } = await apiClient.get(`/properties/stats?${params.toString()}`);
        setStats(statsData);

        // 2. Fetch Auxiliary Data (FAQs, Community)
        if (filterOverrides.location) {
          try {
            const [faqRes, insightRes] = await Promise.allSettled([
              apiClient.get(`/faqs?search=${filterOverrides.location}`),
              apiClient.get(`/community/location/${filterOverrides.location}`)
            ]);
            if (faqRes.status === 'fulfilled') setLocationFaqs(faqRes.value.data.slice(0, 3));
            if (insightRes.status === 'fulfilled') setCommunityInsights(insightRes.value.data);
          } catch (e) { console.error("Auxiliary data fetch error", e); }
        } else {
          setLocationFaqs([]);
          setCommunityInsights([]);
        }

        // ✅ 3. SEO GENERATION STRATEGY (AI-POWERED)
        // Replaces static generation with Backend AI Endpoint (Llama 3 / Gemini)
        try {
          const currentPath = urlLocation.pathname;
          // This endpoint now checks DB first, if missing -> Generates via AI -> Saves -> Returns
          const { data: seoData } = await apiClient.get(`/seo/generate?path=${encodeURIComponent(currentPath)}`);

          setFinalSeoData({
            metaTitle: seoData.metaTitle,
            metaDescription: seoData.metaDescription,
            intro: seoData.introText || `Welcome to ${filterOverrides.location || 'House Hunt Kenya'}`,
            marketInsight: seoData.marketInsight,
            focusKeyword: seoData.focusKeyword,
            canonicalUrl: seoData.canonicalUrl,
            breadCrumbTitle: seoData.breadCrumbTitle,
            faqs: seoData.faqs || [],
            pagePath: currentPath
          });

        } catch (seoErr) {
          console.error("AI SEO Generation Failed:", seoErr);
          // Fallback to basic if AI fails
          setFinalSeoData({
            metaTitle: `${capitalize(listingType)} in ${filterOverrides.location || 'Kenya'} | House Hunt`,
            metaDescription: `Find the best ${listingType} properties in ${filterOverrides.location}.`,
            intro: `Explore the best listings in ${filterOverrides.location}.`,
            pagePath: urlLocation.pathname
          });
        }

      } catch (error) {
        console.error("Failed to fetch property stats:", error);
        setStats(null);
      } finally {
        setLoadingStats(false);
        // ✅ 4. TRACKING: Log the search query and result count
        try {
          const queryTerm = filterOverrides.location || 'all';
          // Only track if we actually have a location or meaningful filter
          if (queryTerm && queryTerm !== 'all') {
            apiClient.post('/tracking/search', {
              query: queryTerm,
              resultCount: statsData?.count || 0,
              category: listingType
            });
          }
        } catch (err) {
          // Silent fail for analytics
          console.warn("Search tracking failed", err);
        }
      }
    };

    fetchStatsAndGenerateContent();

  }, [listingType, propertyType, location, bedrooms, urlLocation.pathname]);

  const hasResults = stats && stats.count > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 relative overflow-hidden pb-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
        />
      </div>

      {/* ✅ 4. SEO INJECTOR (Replaces Manual Helmet) */}
      {finalSeoData && <SeoInjector seo={finalSeoData} />}

      {/* ✅ GEO OPTIMIZATION: AI Summary for Search Engines */}
      <article className="sr-only">
        <h2>Find {listingType === 'rent' ? 'Rentals' : 'Property for Sale'} in {location !== 'all' ? location : 'Kenya'}</h2>
        <p>
          Browse {propertyType !== 'all' ? propertyType : 'all types of'} properties for {listingType} in {location !== 'all' ? location : 'Kenya'}.
          {bedrooms && bedrooms !== 'all' && ` ${bedrooms} bedroom options available.`}
          Verified listings with transparent pricing from trusted agents and direct property owners.
        </p>
        {stats && stats.count > 0 && (
          <>
            <h2>Search Results Summary</h2>
            <ul>
              <li>{stats.count} properties matching your search criteria</li>
              {stats.minPrice && stats.maxPrice && (
                <li>Price range: Ksh {stats.minPrice?.toLocaleString()} - Ksh {stats.maxPrice?.toLocaleString()}</li>
              )}
              {stats.avgPrice && <li>Average price: Ksh {stats.avgPrice?.toLocaleString()}</li>}
              <li>Verified agents and direct property listings</li>
              <li>Detailed property information with photos and videos</li>
            </ul>
          </>
        )}
        <h2>Why Use HouseHunt Kenya?</h2>
        <ul>
          <li>100% free for property seekers</li>
          <li>Verified property listings and agents</li>
          <li>Direct communication with property owners</li>
          <li>Comprehensive neighborhood insights</li>
          <li>Market data and price trends</li>
        </ul>
      </article>


      {/* ✅ P0 ENHANCEMENT: ItemList Schema for Property Results */}
      {hasResults && stats && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": finalSeoData?.metaTitle || `${capitalize(listingType)} in ${filterOverrides.location || 'Kenya'}`,
              "description": finalSeoData?.metaDescription,
              "numberOfItems": stats.count,
              "url": typeof window !== 'undefined' ? window.location.href : ''
            })}
          </script>
        </Helmet>
      )}

      {/* ✅ P0 ENHANCEMENT: AggregateOffer Schema for Price Stats */}
      {hasResults && stats && stats.avgPrice && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AggregateOffer",
              "priceCurrency": "KES",
              "lowPrice": stats.minPrice || 0,
              "highPrice": stats.maxPrice || 0,
              "offerCount": stats.count
            })}
          </script>
        </Helmet>
      )}

      {/* ✅ P0 ENHANCEMENT: FAQPage Schema for Location FAQs */}
      {locationFaqs.length > 0 && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": locationFaqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer || "Find the answer in our FAQ section."
                }
              }))
            })}
          </script>
        </Helmet>
      )}

      <div className="container mx-auto max-w-6xl px-4 py-8 relative z-10">

        <div className="mb-6">
          <Breadcrumbs />
        </div>

        {/* ✨ PROPERTY SCOUTS HERO BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-pink-600/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-white/30 dark:border-white/20 relative overflow-hidden"
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 dark:from-blue-500/10 dark:to-purple-500/10" />

          <div className="relative z-10 grid md:grid-cols-[auto,1fr] gap-6 items-center">
            {/* Icon Section */}
            <div className="flex justify-center md:justify-start">
              <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-600/30 dark:to-purple-600/30 rounded-2xl backdrop-blur-md border border-white/30 dark:border-white/20">
                <FaUserFriends className="text-5xl text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* Content Section */}
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3">
                Can't Find It? Our Property Scouts Can!
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                Access our <strong className="text-blue-600 dark:text-blue-400">extensive offline library</strong> of thousands of exclusive listings not shown online. Our expert property scouts will personally find your perfect match.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: '🏆', text: 'Expert Scouts' },
                  { icon: '🔒', text: 'Exclusive Access' },
                  { icon: '🎯', text: 'Personalized Search' },
                  { icon: '✨', text: '100% Free' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/30 dark:bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30 dark:border-white/20">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <a
                href="#house-hunt-request"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 group"
              >
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                Request a Property Scout
              </a>
            </div>
          </div>
        </motion.div>

        {/* --- SEO HEADER --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white/20 dark:bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30 dark:border-white/20">
            {loadingStats ? (
              <div className="h-8 w-2/3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-4"></div>
            ) : (
              <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                {finalSeoData?.metaTitle}
              </h1>
            )}
            <div
              className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6 prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: finalSeoData?.intro }}
            />
            {finalSeoData?.marketInsight && !loadingStats && hasResults && (
              <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-600/20 dark:to-purple-600/20 backdrop-blur-md rounded-2xl border border-blue-200/50 dark:border-blue-500/30 shadow-lg">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 dark:bg-blue-600/30 rounded-lg">
                    <FaLightbulb className="text-blue-600 dark:text-blue-400 text-xl" />
                  </div>
                  <h3 className="font-bold text-blue-800 dark:text-blue-300 text-lg">Market Insight: {filterOverrides.location || 'Nairobi'}</h3>
                </div>
                <div
                  className="text-sm text-blue-700 dark:text-blue-200 prose-sm dark:prose-invert leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: finalSeoData.marketInsight }}
                />
              </div>
            )}
          </div>

          {/* Knowledge Hub Card */}
          {locationFaqs.length > 0 && (
            <div className="lg:col-span-1 bg-white/20 dark:bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/30 dark:border-white/20">
              <div className="flex items-center mb-4">
                <FaQuestionCircle className="text-orange-500 mr-2" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{filterOverrides.location} Knowledge Hub</h3>
              </div>
              <div className="space-y-3">
                {locationFaqs.map(faq => (
                  <Link key={faq._id} to={`/faq/${faq.slug}`} className="block p-3 bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-400 transition group">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 line-clamp-2">{faq.question}</span>
                      <FaChevronRight className="text-xs text-gray-400 group-hover:text-blue-500" />
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/faqs" className="block mt-4 text-center text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">View all Knowledge Base</Link>
            </div>
          )}
        </div>

        {/* --- RESULTS / NO RESULTS TOGGLE --- */}
        {loadingStats ? (
          <div className="h-96 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"></div>
        ) : hasResults ? (
          <>
            {filterOverrides.location && (
              <SmartOwnerBanner location={filterOverrides.location} avgPrice={stats.avgPrice} listingType={listingType} />
            )}
            <MarketSnapshot stats={stats} loading={loadingStats} />

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <PropertyList
                key={`${listingType}-${propertyType}-${location}-${bedrooms}`}
                filterOverrides={filterOverrides}
                showSearchBar={false}
                showTitle={false}
              />
            </motion.div>

            {/* ✨ INLINE PROPERTY SCOUTS CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="my-12 bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-white/30 dark:border-white/20 overflow-hidden relative"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Visual */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50" />
                    <div className="relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-600/30 dark:to-purple-600/30 backdrop-blur-md rounded-2xl p-8 border border-white/30 dark:border-white/20">
                      <FaUserFriends className="text-7xl text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Right: Copy + CTA */}
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-4">
                    Not Finding What You Need?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                    Our <strong className="text-blue-600 dark:text-blue-400">Property Scouts</strong> have access to <strong>thousands more exclusive listings</strong> not shown online. Get personalized help finding your perfect property.
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-2 mb-6">
                    {[
                      'Access to offline listings database',
                      'Personal property expert assigned to you',
                      'Customized search based on your needs',
                      'Free service - no hidden fees'
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#house-hunt-request"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 group"
                  >
                    Get Personalized Help
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <NoResultsDashboard
            location={filterOverrides.location || 'this location'}
            listingType={listingType}
            nearbyLocations={nearbyDefaults}
          />
        )}

        {/* --- HOUSE HUNT REQUEST (COMPACT) --- */}
        <div className="my-8" id="house-hunt-request">
          <HouseHuntRequest compact={true} />
        </div>

        {/* --- "START A BUZZ" CTA --- */}
        <div className="my-12 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 dark:from-purple-700/80 dark:to-indigo-700/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-white text-center relative overflow-hidden border border-purple-400/30 dark:border-purple-500/30">
          <div className="relative z-10">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBullhorn className="text-3xl text-yellow-300" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Start a Buzz in {filterOverrides.location || 'Your Area'}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Do you love (or hate) where you live? Rate your building anonymously.
              Help the community and earn <strong>Housing Passport Points</strong>.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                to={user ? "/profile" : "/living-feed"}
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-purple-900 font-extrabold px-8 py-3 rounded-full shadow-md hover:bg-yellow-300 transition transform hover:scale-105"
              >
                {user ? <><FaStar /> Rate My Building</> : <><FaUsers /> Join Community Feed</>}
              </Link>

              <Link
                to="/share-insight"
                state={{ location: filterOverrides.location, type: 'question' }}
                className="inline-flex items-center justify-center gap-2 bg-white/20 border border-white/40 text-white font-bold px-8 py-3 rounded-full hover:bg-white/30 transition"
              >
                <FaQuestionCircle /> Ask a Local
              </Link>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        {/* --- COMMUNITY INSIGHTS --- */}
        {communityInsights.length > 0 && (
          <div className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-purple-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-purple-600 mr-2">💬</span>
              What Locals Say about {filterOverrides.location}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communityInsights.map((post) => (
                <div key={post._id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded border dark:border-gray-700">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">{post.title}</h3>
                  <div className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: post.processedContent }} />
                  <Link to={`/community/${post.slug}`} className="text-blue-600 text-xs font-bold mt-2 block hover:underline">Read Full Story &rarr;</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- FOOTER LINKS --- */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Popular in {filterOverrides.location || 'Nairobi'}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link to={`/search/${listingType}/apartment/${location || 'nairobi'}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:underline">
                Apartments for {listingType === 'rent' ? 'Rent' : 'Sale'}
              </Link>
              <span className="text-gray-300">|</span>
              <Link to={`/search/${listingType}/house/${location || 'nairobi'}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:underline">
                Houses for {listingType === 'rent' ? 'Rent' : 'Sale'}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DynamicSearchPage;