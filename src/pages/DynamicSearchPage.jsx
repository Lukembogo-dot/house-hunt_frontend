import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/axios';
import PropertyList from '../components/PropertyList';
import { motion } from 'framer-motion';
// ✅ 1. IMPORT ICONS FOR THE STATS
import { FaMoneyBillWave, FaChartBar, FaSearchDollar, FaHome } from 'react-icons/fa';

// Helper function to capitalize words: "kilimani" -> "Kilimani"
const capitalize = (s) => {
  if (typeof s !== 'string' || !s) return '';
  return s.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ✅ 2. NEW "MARKET SNAPSHOT" COMPONENT
const MarketSnapshot = ({ stats, loading }) => {
  // Skeleton loader component
  const StatCardSkeleton = () => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 animate-pulse">
      <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-8 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
    </div>
  );

  // If loading, show 4 skeleton cards
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  // If stats are loaded but no listings found, render nothing.
  // This allows the PropertyList's "PropertyAlertForm" to be the main UI.
  if (!stats || stats.count === 0) {
    return null;
  }

  // If stats are loaded and listings exist, show the data.
  return (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
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
          Ksh {stats.avgPrice.toLocaleString()}
        </p>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
          <FaSearchDollar className="mr-2" /> Price Low
        </h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          Ksh {stats.minPrice.toLocaleString()}
        </p>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
          <FaChartBar className="mr-2" /> Price High
        </h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          Ksh {stats.maxPrice.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
};


// This component will generate default SEO and also try to fetch manual overrides
const DynamicSearchPage = () => {
  const { listingType, propertyType, location, bedrooms } = useParams();

  const filterOverrides = {
    listingType: listingType,
    type: (propertyType && propertyType !== 'all') ? propertyType.replace(/-/g, ' ') : undefined,
    location: (location && location !== 'all') ? capitalize(location.replace(/-/g, ' ')) : undefined,
    bedrooms: bedrooms ? bedrooms.split('-')[0] : undefined,
  };

  const generateDefaultSeo = () => {
    // ... (This function is unchanged)
    const listType = capitalize(filterOverrides.listingType);
    const propType = filterOverrides.type ? capitalize(filterOverrides.type) : 'Properties';
    const loc = filterOverrides.location ? `in ${filterOverrides.location}` : 'in Kenya';
    const beds = filterOverrides.bedrooms ? `${capitalize(filterOverrides.bedrooms)} Bedroom` : '';

    let pluralPropType = (propType.endsWith('s') || propType === 'Land') ? propType : `${propType}s`;
    
    let h1 = `${beds} ${pluralPropType} for ${listType} ${loc}`;
    
    if (propType === 'Bedsitters' || propType === 'Land') {
      h1 = `${pluralPropType} for ${listType} ${loc}`;
    } else if (propType === 'Properties' && beds) {
      h1 = `${beds} ${pluralPropType} for ${listType} ${loc}`;
    }

    h1 = h1.replace(/\s+/g, ' ').trim();
    
    const title = `${h1} | HouseHunt`;
    const description = `Find the latest ${h1}. Browse verified listings, photos, and prices on HouseHunt Kenya. Be the first to know when new listings are available.`;
    
    return { title, description, h1 };
  };

  const [seo, setSeo] = useState(generateDefaultSeo());
  const [loadingSeo, setLoadingSeo] = useState(true);

  // ✅ 3. ADD NEW STATE FOR STATS
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // ✅ 4. UPGRADED useEffect TO FETCH STATS
  useEffect(() => {
    setSeo(generateDefaultSeo());
    
    const fetchSeoData = async () => {
      setLoadingSeo(true);
      let pagePath = `/search/${listingType}`;
      if (propertyType) {
        pagePath += `/${propertyType}`;
        if (location) {
          pagePath += `/${location}`;
          if (bedrooms) pagePath += `/${bedrooms}`;
        }
      }
      
      try {
        const encodedPath = encodeURIComponent(pagePath);
        const { data } = await apiClient.get(`/seo/${encodedPath}`);
        setSeo(prev => ({
          ...prev,
          title: data.metaTitle || prev.title,
          description: data.metaDescription || prev.description,
          h1: data.h1Tag || prev.h1 
        }));
      } catch (error) {
        console.warn(`No manual SEO data for ${pagePath}. Using generated defaults.`);
      } finally {
        setLoadingSeo(false);
      }
    };
    
    // --- NEW STATS FETCHING FUNCTION ---
    const fetchStatsData = async () => {
      setLoadingStats(true);
      try {
        // Use the same filterOverrides to build the query
        const params = new URLSearchParams(filterOverrides);
        const { data } = await apiClient.get(`/properties/stats?${params.toString()}`);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch property stats:", error);
        setStats(null); // Set to null on error
      } finally {
        setLoadingStats(false);
      }
    };
    
    // --- RUN BOTH FETCHERS IN PARALLEL ---
    fetchSeoData();
    fetchStatsData();
    
  }, [listingType, propertyType, location, bedrooms]); // Re-run if ANY param changes

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
      </Helmet>
      
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Use a loading skeleton for the H1 while SEO fetches */}
          {loadingSeo ? (
            <div className="mb-12 h-12 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          ) : (
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-12">
              {seo.h1}
            </h1>
          )}
          
          {/* ✅ 5. RENDER THE NEW MARKET SNAPSHOT COMPONENT */}
          <MarketSnapshot stats={stats} loading={loadingStats} />
          
          <PropertyList 
            key={`${listingType}-${propertyType}-${location}-${bedrooms}`}
            filterOverrides={filterOverrides}
            showSearchBar={true}
            showTitle={false}
          />
        </motion.div>
      </div>
    </>
  );
};

export default DynamicSearchPage;