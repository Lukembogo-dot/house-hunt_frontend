import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaHome, FaTruck, FaComments, FaBuilding, FaMapMarkerAlt, FaFilter, FaBed, FaMoneyBillWave, FaStar, FaUserTie, FaGlobe } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/axios'; // Ensure this path is correct

const GlobalSearchBar = ({ initialValues = {} }) => {
  const navigate = useNavigate();

  // Search Scope
  const [category, setCategory] = useState(initialValues.category || 'all'); // Default to All
  const [location, setLocation] = useState(initialValues.location || '');

  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'apartment', // default
    minPrice: '',
    maxPrice: '',
    bedrooms: ''
  });

  // Autocomplete State
  const [suggestions, setSuggestions] = useState({ properties: [], services: [], shadow: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Debounced Autocomplete Fetcher
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (location.length < 3) {
        setSuggestions({ properties: [], services: [], shadow: [] });
        return;
      }

      setLoadingSuggestions(true);
      try {
        const [propRes, serviceRes, shadowRes] = await Promise.allSettled([
          apiClient.get(`/properties?location=${location}&limit=3`),
          apiClient.get(`/service-providers?search=${location}&limit=3`), // Search providers by name/desc
          apiClient.get(`/living-community/experience?buildingName=${location}`) // Search shadow buildings
        ]);

        const newSuggestions = {
          properties: propRes.status === 'fulfilled' ? propRes.value.data.properties : [],
          services: serviceRes.status === 'fulfilled' ? serviceRes.value.data.providers : [],
          shadow: shadowRes.status === 'fulfilled' ?
            // Deduplicate shadow buildings by name
            [...new Map(shadowRes.value.data.map(item => [item.buildingName, item])).values()].slice(0, 3)
            : []
        };
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Autocomplete Error", error);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [location]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);

    // 1. Clean the input
    const cleanLocation = location.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '');

    // ✅ ANALYTICS: Track Search Query
    const searchQuery = cleanLocation || 'kenya';
    apiClient.post('/analytics/track', {
      type: 'search',
      source: 'global_search_bar',
      metadata: {
        query: searchQuery,
        category: category,
        filters: showFilters ? filters : null,
        timestamp: new Date().toISOString()
      }
    }).catch(err => console.warn('Analytics tracking failed:', err.message));

    // 2. Build Query Params for Advanced Filters
    const queryParams = new URLSearchParams();
    if (showFilters) {
      if (filters.minPrice) queryParams.append('min', filters.minPrice);
      if (filters.maxPrice) queryParams.append('max', filters.maxPrice);
      if (filters.bedrooms) queryParams.append('beds', filters.bedrooms);
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    // 3. Routing Logic
    // If filters are hidden, we do a BROAD search (ignore default 'apartment' type)
    // If filters are shown, we do a NARROW search (respect selected type)
    const useBroadSearch = !showFilters;

    switch (category) {
      case 'all':
        if (useBroadSearch) {
          navigate((cleanLocation ? `/search/all/${cleanLocation}` : '/search/all/kenya') + queryString);
        } else {
          // If filters are on, user might have selected a specific type like 'apartment'
          // So we search for 'all' listing types (rent+sale) but 'apartment' property type
          navigate((cleanLocation ? `/search/all/${filters.type || 'apartment'}/${cleanLocation}` : '/search/all/kenya') + queryString);
        }
        break;
      case 'rent':
        if (useBroadSearch) {
          navigate((cleanLocation ? `/search/rent/${cleanLocation}` : '/search/rent/kenya') + queryString);
        } else {
          navigate((cleanLocation ? `/search/rent/${filters.type || 'apartment'}/${cleanLocation}` : '/search/rent/kenya') + queryString);
        }
        break;
      case 'sale':
        if (useBroadSearch) {
          navigate((cleanLocation ? `/search/sale/${cleanLocation}` : '/search/sale/kenya') + queryString);
        } else {
          navigate((cleanLocation ? `/search/sale/${filters.type || 'house'}/${cleanLocation}` : '/search/sale/kenya') + queryString);
        }
        break;
      case 'services':
        // Search for providers specifically
        navigate(cleanLocation ? `/services?search=${cleanLocation}` : '/services');
        break;
      case 'community':
        navigate(`/living-feed?neighborhood=${cleanLocation}`);
        break;
      default:
        navigate(`/search/rent/${cleanLocation || 'kenya'}`);
    }
  };

  const handleSuggestionClick = (type, item) => {
    if (type === 'property') {
      navigate(`/properties/${item.slug}`);
    } else if (type === 'service') {
      navigate(`/services/${item.slug}`); // Goes to ServiceProviderDetails
    } else if (type === 'shadow') {
      navigate(`/rated-properties?building=${encodeURIComponent(item.buildingName)}`);
    }
    setShowSuggestions(false);
  };

  // ✅ HELPER: Robust Image Extractor
  const getSafeImage = (item, type) => {
    if (type === 'property') {
      // Check images array (strings or objects)
      if (Array.isArray(item.images) && item.images.length > 0) {
        const first = item.images[0];
        return typeof first === 'string' ? first : first.url;
      }
      return item.imageUrl || 'https://placehold.co/100x100?text=No+Image';
    }
    if (type === 'service') {
      // ServiceProviderDetails uses image.url or imageUrl
      return item.image?.url || item.imageUrl || item.logo || (item.images?.[0]?.url || item.images?.[0]) || 'https://placehold.co/100x100?text=Service';
    }
    return 'https://placehold.co/100x100?text=No+Image';
  };

  // ✅ HELPER: Gradient for Shadow Buildings (Matches RatedPropertiesPage)
  const getBuildingGradient = (name) => {
    const gradients = [
      'from-blue-500 via-indigo-500 to-purple-600',
      'from-emerald-400 via-teal-500 to-cyan-600',
      'from-orange-400 via-pink-500 to-rose-600',
      'from-violet-500 via-purple-500 to-fuchsia-600',
      'from-cyan-500 via-blue-500 to-indigo-600'
    ];
    // Simple hash to pick consistent gradient
    const index = name ? name.length % gradients.length : 0;
    return gradients[index];
  };

  // Helper for Tab Styling
  const getTabClass = (activeType) =>
    `px-4 py-2 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-all ${category === activeType
      ? 'bg-white/20 backdrop-blur-md text-white shadow-sm translate-y-1 z-10 border-t border-x border-white/20'
      : 'bg-black/20 text-white/70 hover:bg-black/30'
    }`;

  const getPlaceholder = () => {
    switch (category) {
      case 'services': return 'Search movers, plumbers, or provider names...';
      case 'community': return 'Search a location for insights...';
      default: return 'Enter Location...';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative z-30" ref={searchRef}>

      {/* 1. Category Tabs - Scrollable on Mobile */}
      <div className="flex overflow-x-auto md:justify-start pb-2 md:pb-0 pl-1 md:pl-2 space-x-2 md:space-x-1 no-scrollbar whitespace-nowrap mask-linear-fade">
        <button type="button" onClick={() => setCategory('all')} className={getTabClass('all')}>
          <FaGlobe /> <span className="text-sm">All</span>
        </button>
        <button type="button" onClick={() => setCategory('rent')} className={getTabClass('rent')}>
          <FaHome /> <span className="text-sm">Rent</span>
        </button>
        <button type="button" onClick={() => setCategory('sale')} className={getTabClass('sale')}>
          <FaBuilding /> <span className="text-sm">Buy</span>
        </button>
        <button type="button" onClick={() => setCategory('services')} className={getTabClass('services')}>
          <FaTruck /> <span className="text-sm">Services</span>
        </button>
        <button type="button" onClick={() => setCategory('community')} className={getTabClass('community')}>
          <FaComments /> <span className="text-sm">Intel</span>
        </button>
      </div>

      {/* 2. Main Search Bar */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/10 backdrop-blur-xl p-3 rounded-xl shadow-2xl border border-white/20 relative z-20"
      >
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          {/* Location Input */}
          <div className="relative flex-grow group">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 group-focus-within:text-white transition-colors">
              <FaMapMarkerAlt className="text-lg" />
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/10 focus:bg-white/30 focus:ring-2 focus:ring-white/50 outline-none transition-all font-medium text-lg shadow-inner"
              placeholder={getPlaceholder()}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
            />
            {loadingSuggestions && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Filter Toggle */}
          {(category === 'rent' || category === 'sale' || category === 'all') && (
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-4 rounded-lg font-bold transition-all border ${showFilters
                ? 'bg-white/30 text-white border-white/30'
                : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                }`}
              title="Advanced Filters"
            >
              <FaFilter /> <span className="hidden md:inline">Filters</span>
            </button>
          )}

          {/* Search Button */}
          <button
            type="submit"
            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg border border-white/20"
          >
            <FaSearch />
            <span className="hidden md:inline">Search</span>
          </button>
        </form>

        {/* 3. Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (category === 'rent' || category === 'sale') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-700 mt-2">
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase mb-1">Property Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full p-2 rounded bg-white/20 border border-white/10 text-white text-sm focus:ring-2 focus:ring-white/50 outline-none hover:bg-white/30 transition-colors"
                  >
                    <option value="apartment" className="text-gray-900">Apartment</option>
                    <option value="house" className="text-gray-900">House</option>
                    <option value="office" className="text-gray-900">Office</option>
                    <option value="land" className="text-gray-900">Land</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase mb-1">Price Range (Ksh)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      className="w-1/2 p-2 rounded bg-white/20 border border-white/10 text-white placeholder-white/50 text-sm focus:ring-2 focus:ring-white/50 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="w-1/2 p-2 rounded bg-white/20 border border-white/10 text-white placeholder-white/50 text-sm focus:ring-2 focus:ring-white/50 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 uppercase mb-1">Bedroom Count</label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                    className="w-full p-2 rounded bg-white/20 border border-white/10 text-white text-sm focus:ring-2 focus:ring-white/50 outline-none hover:bg-white/30 transition-colors"
                  >
                    <option value="" className="text-gray-900">Any</option>
                    <option value="1" className="text-gray-900">1 Bedroom</option>
                    <option value="2" className="text-gray-900">2 Bedrooms</option>
                    <option value="3" className="text-gray-900">3 Bedrooms</option>
                    <option value="4+" className="text-gray-900">4+ Bedrooms</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. Autocomplete Dropdown */}
        <AnimatePresence>
          {showSuggestions && (suggestions.properties.length > 0 || suggestions.services.length > 0 || suggestions.shadow.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden max-h-[70vh] overflow-y-auto"
            >
              {/* Properties Section */}
              {suggestions.properties.length > 0 && (
                <div className="p-2">
                  <h4 className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-widest">Properties</h4>
                  {suggestions.properties.map(item => (
                    <div
                      key={item._id}
                      onClick={() => handleSuggestionClick('property', item)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition"
                    >
                      <img src={getSafeImage(item, 'property')} alt="" className="w-10 h-10 rounded-md object-cover bg-gray-200" />
                      <div>
                        <div className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.location?.name || item.location} · {item.price ? `Ksh ${item.price.toLocaleString()}` : 'Price on Request'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Shadow Buildings Section */}
              {suggestions.shadow.length > 0 && (
                <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/10">
                  <h4 className="px-3 py-1 text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                    <FaStar /> Rated Buildings (Shadow Index)
                  </h4>
                  {suggestions.shadow.map(item => (
                    <div
                      key={item._id}
                      onClick={() => handleSuggestionClick('shadow', item)}
                      className="flex items-center gap-3 p-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg cursor-pointer transition"
                    >
                      <div className={`w-10 h-10 rounded-md flex items-center justify-center font-bold text-white shadow-sm bg-gradient-to-br ${getBuildingGradient(item.buildingName)}`}>
                        {item.review?.rating || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-800 dark:text-gray-200">{item.buildingName}</div>
                        <div className="text-xs text-gray-500">{item.location?.neighborhood} · <span className="text-blue-600 font-semibold">{item.rentalDetails?.monthlyRent ? `~Ksh ${item.rentalDetails.monthlyRent.toLocaleString()}` : 'Rent unknown'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Service Providers Section */}
              {suggestions.services.length > 0 && (
                <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-green-50/30 dark:bg-green-900/10">
                  <h4 className="px-3 py-1 text-xs font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                    <FaUserTie /> Service Providers
                  </h4>
                  {suggestions.services.map(item => (
                    <div
                      key={item._id}
                      onClick={() => handleSuggestionClick('service', item)}
                      className="flex items-center gap-3 p-3 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg cursor-pointer transition"
                    >
                      <img src={getSafeImage(item, 'service')} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      <div>
                        <div className="font-bold text-sm text-gray-800 dark:text-gray-200">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.serviceType} · {item.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

export default GlobalSearchBar;