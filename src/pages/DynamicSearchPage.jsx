import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/axios';
import PropertyList from '../components/PropertyList';
import { motion } from 'framer-motion';
// 1. IMPORT ICONS
import { FaMoneyBillWave, FaChartBar, FaSearchDollar, FaHome } from 'react-icons/fa';
// 2. IMPORT THE GENERATOR (Updated to import generateFAQSchema)
import { generateDynamicLocationContent, generateFAQSchema } from '../utils/seoContentGenerator';
// 3. IMPORT SMART OWNER BANNER
import SmartOwnerBanner from '../components/SmartOwnerBanner';
// 4. IMPORT BREADCRUMBS
import Breadcrumbs from '../components/Breadcrumbs';

// Helper function
const capitalize = (s) => {
  if (typeof s !== 'string' || !s) return '';
  return s.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// --- MARKET SNAPSHOT COMPONENT ---
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
  
  // Prepare Filters
  const filterOverrides = {
    listingType: listingType,
    type: (propertyType && propertyType !== 'all') ? propertyType.replace(/-/g, ' ') : undefined,
    location: (location && location !== 'all') ? capitalize(location.replace(/-/g, ' ')) : undefined,
    bedrooms: bedrooms ? bedrooms.split('-')[0] : undefined,
  };

  // State for Stats & SEO Content
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [seoData, setSeoData] = useState({ title: '', intro: '', marketInsight: '' });

  useEffect(() => {
    const fetchStatsAndGenerateContent = async () => {
      setLoadingStats(true);
      try {
        const params = new URLSearchParams(filterOverrides);
        
        // 1. Fetch Real Stats from your API
        const { data } = await apiClient.get(`/properties/stats?${params.toString()}`);
        setStats(data);

        // 2. Generate Dynamic SEO Content based on the fetched stats
        // If location exists, we generate specific content. 
        // If not (e.g. just /search/buy), we generate generic content.
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
        // Fallback content in case of error
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
      
      {/* --- 1. DYNAMIC META TAGS --- */}
      <Helmet>
        <title>{seoData.title} | HouseHunt Kenya</title>
        <meta name="description" content={seoData.intro} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={window.location.href} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.intro} />
        
        {/* ✅ INJECT FAQ SCHEMA AUTOMATICALLY */}
        {stats && (
            <script type="application/ld+json">
              {generateFAQSchema(filterOverrides.location, listingType, stats.avgPrice)}
            </script>
        )}
      </Helmet>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        
        {/* ✅ 2. INSERT BREADCRUMBS */}
        <div className="mb-6">
          <Breadcrumbs />
        </div>

        {/* --- 3. SEO RICH HEADER --- */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
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

            {/* Market Insight Box */}
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

        {/* ✅ 4. INSERT THE SMART OWNER BANNER */}
        {filterOverrides.location && stats && (
          <SmartOwnerBanner 
            location={filterOverrides.location} 
            avgPrice={stats.avgPrice}
            listingType={listingType}
          />
        )}

        {/* --- 5. MARKET SNAPSHOT STATS --- */}
        <MarketSnapshot stats={stats} loading={loadingStats} />

        {/* --- 6. PROPERTY LIST --- */}
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

        {/* --- 7. AUTOMATIC INTERNAL LINKING (THE SPIDERWEB) --- */}
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