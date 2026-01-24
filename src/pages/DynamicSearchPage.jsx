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
  FaBell, FaClipboardList, FaBullhorn, FaStar, FaUsers
} from 'react-icons/fa';
import { generateDynamicLocationContent } from '../utils/seoContentGenerator'; // Removed generateFAQSchema (handled in Injector now)
import SmartOwnerBanner from '../components/SmartOwnerBanner';
import Breadcrumbs from '../components/Breadcrumbs';
import PropertyAlertForm from '../components/PropertyAlertForm';
import { useAuth } from '../context/AuthContext';
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-12">
      <div className="bg-blue-50 dark:bg-gray-700/50 p-8 text-center border-b border-blue-100 dark:border-gray-600">
        <FaExclamationTriangle className="text-5xl text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          No {listingType} listings in {location} yet.
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
          Inventory moves fast! Don't waste time refreshing. Tell us what you want, and we'll notify you instantly when a match hits the market.
        </p>
      </div>
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-gray-100 dark:border-gray-700">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <FaBell className="text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Create a Property Alert</h3>
              <p className="text-xs text-gray-500">Be the first to know.</p>
            </div>
          </div>
          <PropertyAlertForm
            currentFilters={{ location, type: listingType }}
            compact={true}
          />
        </div>
        <div className="p-8 bg-gray-50 dark:bg-gray-800/50 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <FaClipboardList className="text-xl" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Are you an Agent?</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
            You have a massive opportunity. We have tenants actively looking in <strong>{location}</strong> right now but zero listings to show them.
          </p>
          <Link
            to="/for-agents"
            className="block w-full py-3 px-4 bg-white dark:bg-gray-700 border-2 border-green-500 text-green-600 dark:text-green-400 font-bold text-center rounded-lg hover:bg-green-50 dark:hover:bg-gray-600 transition"
          >
            List Property in {location} (Free)
          </Link>
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-900 p-6 border-t dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-3 text-center">
          Or try these nearby locations
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {nearbyLocations.map(loc => (
            <Link
              key={loc}
              to={`/search/${listingType}/${loc.toLowerCase()}`}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-600 text-sm hover:border-blue-500 hover:text-blue-500 transition"
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
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center"><FaHome className="mr-2" /> Total Listings</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.count}</p>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center"><FaMoneyBillWave className="mr-2" /> Average Price</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">Ksh {stats.avgPrice ? stats.avgPrice.toLocaleString() : 'N/A'}</p>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center"><FaSearchDollar className="mr-2" /> Price Low</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">Ksh {stats.minPrice ? stats.minPrice.toLocaleString() : 'N/A'}</p>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center"><FaChartBar className="mr-2" /> Price High</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">Ksh {stats.maxPrice ? stats.maxPrice.toLocaleString() : 'N/A'}</p>
      </div>
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
      }
    };

    fetchStatsAndGenerateContent();

  }, [listingType, propertyType, location, bedrooms, urlLocation.pathname]);

  const hasResults = stats && stats.count > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">

      {/* ✅ 4. SEO INJECTOR (Replaces Manual Helmet) */}
      {finalSeoData && <SeoInjector seo={finalSeoData} />}

      {/* ✅ GEO OPTIMIZATION: AI Summary for Search Engines */}
      <article className="sr-only" aria-hidden="true">
        <h1>Find {listingType === 'rent' ? 'Rentals' : 'Property for Sale'} in {location !== 'all' ? location : 'Kenya'}</h1>
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

      <div className="container mx-auto max-w-6xl px-4 py-8">

        <div className="mb-6">
          <Breadcrumbs />
        </div>

        {/* --- SEO HEADER --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r">
                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-1">Market Insight: {filterOverrides.location || 'Nairobi'}</h3>
                <div
                  className="text-sm text-blue-700 dark:text-blue-200 prose-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: finalSeoData.marketInsight }}
                />
              </div>
            )}
          </div>

          {/* Knowledge Hub Card */}
          {locationFaqs.length > 0 && (
            <div className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-lg shadow-sm border border-blue-100 dark:border-gray-700">
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
          </>
        ) : (
          <NoResultsDashboard
            location={filterOverrides.location || 'this location'}
            listingType={listingType}
            nearbyLocations={nearbyDefaults}
          />
        )}

        {/* --- HOUSE HUNT REQUEST (COMPACT) --- */}
        <div className="my-8">
          <HouseHuntRequest compact={true} />
        </div>

        {/* --- "START A BUZZ" CTA --- */}
        <div className="my-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white text-center relative overflow-hidden">
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