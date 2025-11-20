// src/pages/DynamicSearchPage.jsx
// (UPDATED with Knowledge Hub Card & Community Insights Loop)

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/axios';
import PropertyList from '../components/PropertyList';
import { motion } from 'framer-motion';
// 1. IMPORT ICONS
import { FaMoneyBillWave, FaChartBar, FaSearchDollar, FaHome, FaQuestionCircle, FaChevronRight } from 'react-icons/fa';
// 2. IMPORT THE GENERATOR
import { generateDynamicLocationContent, generateFAQSchema } from '../utils/seoContentGenerator';
import SmartOwnerBanner from '../components/SmartOwnerBanner';
import Breadcrumbs from '../components/Breadcrumbs';

// Helper function
const capitalize = (s) => {
  if (typeof s !== 'string' || !s) return '';
  return s.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// --- MARKET SNAPSHOT COMPONENT (Unchanged) ---
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
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
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
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
          <FaHome className="mr-2" /> Total Listings
        </h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.count}</p>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
          <FaMoneyBillWave className="mr-2" /> Average Price
        </h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          Ksh {stats.avgPrice ? stats.avgPrice.toLocaleString() : 'N/A'}
        </p>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
          <FaSearchDollar className="mr-2" /> Price Low
        </h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          Ksh {stats.minPrice ? stats.minPrice.toLocaleString() : 'N/A'}
        </p>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
          <FaChartBar className="mr-2" /> Price High
        </h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          Ksh {stats.maxPrice ? stats.maxPrice.toLocaleString() : 'N/A'}
        </p>
      </div>
    </motion.div>
  );
};

const DynamicSearchPage = () => {
  const { listingType, propertyType, location, bedrooms } = useParams();
  
  const filterOverrides = {
    listingType: listingType,
    type: (propertyType && propertyType !== 'all') ? propertyType.replace(/-/g, ' ') : undefined,
    location: (location && location !== 'all') ? capitalize(location.replace(/-/g, ' ')) : undefined,
    bedrooms: bedrooms ? bedrooms.split('-')[0] : undefined,
  };

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [seoData, setSeoData] = useState({ title: '', intro: '', marketInsight: '' });
  // ✅ 3. STATE FOR LOCATION FAQS
  const [locationFaqs, setLocationFaqs] = useState([]);
  // ✅ 4. STATE FOR COMMUNITY INSIGHTS (NEW)
  const [communityInsights, setCommunityInsights] = useState([]);

  useEffect(() => {
    const fetchStatsAndGenerateContent = async () => {
      setLoadingStats(true);
      try {
        const params = new URLSearchParams(filterOverrides);
        
        // 1. Fetch Real Stats
        const { data } = await apiClient.get(`/properties/stats?${params.toString()}`);
        setStats(data);

        // 2. Fetch Location Specific FAQs (The Knowledge Hub)
        if (filterOverrides.location) {
          try {
            // Call the API with a search query for the location
            const { data: faqData } = await apiClient.get(`/faqs?search=${filterOverrides.location}`);
            setLocationFaqs(faqData.slice(0, 3)); // Take top 3 relevant FAQs
            
            // ✅ 3. Fetch Community Insights (NEW)
            const { data: insights } = await apiClient.get(`/community/location/${filterOverrides.location}`);
            setCommunityInsights(insights);
            
          } catch (e) {
            console.error("FAQ/Insights Fetch error", e);
          }
        } else {
          setLocationFaqs([]);
          setCommunityInsights([]);
        }

        // 4. Generate Generic Content
        const loc = filterOverrides.location || 'Nairobi';
        const content = generateDynamicLocationContent(
          loc,
          listingType || 'rent',
          data.count || 0,
          data.avgPrice || 0
        );
        setSeoData(content);

      } catch (error) {
        console.error("Failed to fetch property stats:", error);
        setStats(null);
        setSeoData({
            title: `Find ${listingType} Properties`, 
            intro: 'Browse our latest verified listings.', 
            marketInsight: ''
        });
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchStatsAndGenerateContent();
    
  }, [listingType, propertyType, location, bedrooms]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      
      <Helmet>
        <title>{seoData.title} | HouseHunt Kenya</title>
        <meta name="description" content={seoData.intro} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={window.location.href} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.intro} />
        
        {stats && (
            <script type="application/ld+json">
              {generateFAQSchema(filterOverrides.location, listingType, stats.avgPrice)}
            </script>
        )}
      </Helmet>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        
        <div className="mb-6">
          <Breadcrumbs />
        </div>

        {/* --- SEO RICH HEADER GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Left: Generic Text (SEO Intro) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {loadingStats ? (
                  <div className="h-8 w-2/3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-4"></div>
              ) : (
                  <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    {seoData.title}
                  </h1>
              )}
              
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {seoData.intro}
              </p>

              {seoData.marketInsight && !loadingStats && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r">
                  <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-1">
                    Market Insight: {filterOverrides.location || 'Nairobi'}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    {seoData.marketInsight}
                  </p>
                </div>
              )}
          </div>

          {/* Right: Knowledge Hub Card (The New Addition) */}
          {locationFaqs.length > 0 && (
            <div className="lg:col-span-1 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-lg shadow-sm border border-blue-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                 <FaQuestionCircle className="text-orange-500 mr-2" />
                 <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                   {filterOverrides.location} Knowledge Hub
                 </h3>
              </div>
              <div className="space-y-3">
                {locationFaqs.map(faq => (
                  <Link 
                    key={faq._id} 
                    to={`/faq/${faq.slug}`}
                    className="block p-3 bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                        {faq.question}
                      </span>
                      <FaChevronRight className="text-xs text-gray-400 group-hover:text-blue-500" />
                    </div>
                  </Link>
                ))}
              </div>
              <Link 
                to="/faqs" 
                className="block mt-4 text-center text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                View all Knowledge Base
              </Link>
            </div>
          )}

        </div>

        {filterOverrides.location && stats && (
          <SmartOwnerBanner 
            location={filterOverrides.location} 
            avgPrice={stats.avgPrice}
            listingType={listingType}
          />
        )}

        <MarketSnapshot stats={stats} loading={loadingStats} />

        {/* --- ✅ NEW: COMMUNITY INSIGHTS SECTION --- */}
        {communityInsights.length > 0 && (
          <div className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-purple-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
               <span className="text-purple-600 mr-2">💬</span> 
               What Locals Say about {filterOverrides.location}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communityInsights.map((post) => (
                <div key={post._id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded border dark:border-gray-700">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">{post.title}</h3>
                  {/* We render the processed HTML which contains the SEO Links */}
                  <div 
                    className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 prose dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: post.processedContent }} 
                  />
                  <Link to={`/community/${post.slug}`} className="text-blue-600 text-xs font-bold mt-2 block hover:underline">
                    Read Full Story &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* --- ✅ NEW: CALL TO ACTION: WRITE YOUR OWN --- */}
        {filterOverrides.location && (
            <div className="mb-8 text-center">
                 <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Live in {filterOverrides.location}?</p>
                 <Link to="/share-insight" className="inline-block bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-purple-700">
                    Write a Review for {filterOverrides.location}
                 </Link>
            </div>
        )}

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <PropertyList 
              key={`${listingType}-${propertyType}-${location}-${bedrooms}`}
              filterOverrides={filterOverrides}
              showSearchBar={true}
              showTitle={false}
            />
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Explore Nearby Locations</h3>
            <div className="flex flex-wrap gap-2">
              {['Westlands', 'Kilimani', 'Kileleshwa', 'Lavington', 'Karen', 'Ruaka', 'South B'].map(loc => (
                <Link 
                  key={loc} 
                  to={`/search/${listingType}/${loc.toLowerCase()}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-gray-700 px-3 py-1 rounded-full transition-colors hover:bg-blue-100"
                >
                  {listingType === 'rent' ? 'Rent' : 'Buy'} in {loc}
                </Link>
              ))}
            </div>
          </div>

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
               <span className="text-gray-300">|</span>
               <Link to={`/search/${listingType}/office/${location || 'nairobi'}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:underline">
                 Offices for {listingType === 'rent' ? 'Rent' : 'Sale'}
               </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DynamicSearchPage;