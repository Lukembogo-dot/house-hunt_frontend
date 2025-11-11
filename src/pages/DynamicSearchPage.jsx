import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/axios';
import PropertyList from '../components/PropertyList';
import { motion } from 'framer-motion';

// Helper function to capitalize words: "kilimani" -> "Kilimani"
const capitalize = (s) => {
  if (typeof s !== 'string' || !s) return '';
  return s.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// This component will generate default SEO and also try to fetch manual overrides
const DynamicSearchPage = () => {
  // ✅ --- 1. READ ALL NEW PARAMS FROM THE URL ---
  const { listingType, propertyType, location, bedrooms } = useParams();

  // ✅ --- 2. GENERATE UPGRADED FILTERS ---
  const filterOverrides = {
    listingType: listingType, // e.g., "rent"
    type: (propertyType && propertyType !== 'all') ? propertyType.replace(/-/g, ' ') : undefined, // "propertyType" from URL (e.g., "bedsitter") maps to "type" in the filter
    location: (location && location !== 'all') ? capitalize(location.replace(/-/g, ' ')) : undefined, // "kilimani" -> "Kilimani"
    bedrooms: bedrooms ? bedrooms.split('-')[0] : undefined, // "2-bedroom" -> "2"
  };

  // ✅ --- 3. UPGRADED SEO/H1 GENERATOR ---
  const generateDefaultSeo = () => {
    // Get clean, capitalized values
    const listType = capitalize(filterOverrides.listingType);
    const propType = filterOverrides.type ? capitalize(filterOverrides.type) : 'Properties';
    const loc = filterOverrides.location ? `in ${filterOverrides.location}` : 'in Kenya';
    const beds = filterOverrides.bedrooms ? `${capitalize(filterOverrides.bedrooms)} Bedroom` : '';

    // Handle plurals
    let pluralPropType = (propType.endsWith('s') || propType === 'Land') ? propType : `${propType}s`;
    
    // Create the H1 title
    let h1 = `${beds} ${pluralPropType} for ${listType} ${loc}`;
    
    // Cleaner H1 for specific types
    if (propType === 'Bedsitters' || propType === 'Land') {
      h1 = `${pluralPropType} for ${listType} ${loc}`; // e.g., "Bedsitters for Rent in Kilimani"
    } else if (propType === 'Properties' && beds) {
      h1 = `${beds} ${pluralPropType} for ${listType} ${loc}`; // e.g., "2 Bedroom Properties for Rent in Kenya"
    }

    // Tidy up any double spaces
    h1 = h1.replace(/\s+/g, ' ').trim();
    
    const title = `${h1} | HouseHunt`;
    const description = `Find the latest ${h1}. Browse verified listings, photos, and prices on HouseHunt Kenya. Be the first to know when new listings are available.`;
    
    return { title, description, h1 };
  };

  const [seo, setSeo] = useState(generateDefaultSeo());
  const [loadingSeo, setLoadingSeo] = useState(true);

  // ✅ --- 4. UPGRADED SEO OVERRIDE FETCHER ---
  useEffect(() => {
    // Generate defaults immediately
    setSeo(generateDefaultSeo());
    
    const fetchSeoData = async () => {
      setLoadingSeo(true);
      
      // Build the path exactly as it's defined in the router,
      // based on which params are available in the URL.
      let pagePath = `/search/${listingType}`;
      if (propertyType) {
        pagePath += `/${propertyType}`;
        if (location) {
          pagePath += `/${location}`;
          if (bedrooms) {
            pagePath += `/${bedrooms}`;
          }
        }
      }
      
      try {
        const encodedPath = encodeURIComponent(pagePath);
        const { data } = await apiClient.get(`/seo/${encodedPath}`);
        
        // If data is found, override the defaults
        setSeo(prev => ({
          ...prev,
          title: data.metaTitle || prev.title,
          description: data.metaDescription || prev.description,
          h1: data.h1Tag || prev.h1 
        }));
      } catch (error) {
        // This is normal. It just means no manual entry exists.
        console.warn(`No manual SEO data for ${pagePath}. Using generated defaults.`);
      } finally {
        setLoadingSeo(false);
      }
    };
    
    fetchSeoData();
  // ✅ --- 5. UPDATE DEPENDENCIES ---
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
          
          {/*
            Here's the magic: We render our existing PropertyList component,
            but we pass in the new, hyper-specific filters.
          */}
          <PropertyList 
            // ✅ --- 6. UPDATE KEY TO BE 100% UNIQUE ---
            key={`${listingType}-${propertyType}-${location}-${bedrooms}`}
            filterOverrides={filterOverrides}
            showSearchBar={true} // We keep the search bar so users can refine
            showTitle={false}     // We hide the default "Find Your Perfect Home" title
          />
        </motion.div>
      </div>
    </>
  );
};

export default DynamicSearchPage;