import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaHome, FaTruck, FaComments, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const GlobalSearchBar = ({ initialValues = {} }) => {
  const navigate = useNavigate();
  
  // Search Scope
  const [category, setCategory] = useState(initialValues.category || 'rent');
  const [location, setLocation] = useState(initialValues.location || '');

  const handleSearch = (e) => {
    e.preventDefault();
    
    // 1. Clean the input (remove special chars, trim, lowercase) to make SEO-friendly URLs
    const cleanLocation = location.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '');
    
    // 2. Routing Logic -> Directs to the Dynamic Search Page or Service/Community Feeds
    switch (category) {
      case 'rent':
        navigate(cleanLocation ? `/search/rent/${cleanLocation}` : '/search/rent/kenya');
        break;
      case 'sale':
        navigate(cleanLocation ? `/search/sale/${cleanLocation}` : '/search/sale/kenya');
        break;
      case 'services':
        navigate(`/services?location=${cleanLocation}`);
        break;
      case 'community':
        navigate(`/living-feed?neighborhood=${cleanLocation}`);
        break;
      default:
        navigate(`/search/rent/${cleanLocation || 'kenya'}`);
    }
  };

  // Helper for Tab Styling (Updated for visibility on light backgrounds)
  const getTabClass = (activeType) => 
    `px-4 py-2 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-all ${
      category === activeType 
      ? 'bg-white text-blue-600 shadow-sm translate-y-1 z-10 border-t border-x border-gray-100' 
      : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
    }`;

  // Dynamic Placeholder based on category
  const getPlaceholder = () => {
    switch (category) {
      case 'services': return 'Search for movers, plumbers...';
      case 'community': return 'Search a location for insights...';
      default: return 'Enter Location (e.g. Westlands, Kilimani)';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative z-30">
      
      {/* 1. Category Tabs */}
      <div className="flex justify-center md:justify-start pl-2 space-x-1">
        <button type="button" onClick={() => setCategory('rent')} className={getTabClass('rent')}>
          <FaHome /> Rent
        </button>
        <button type="button" onClick={() => setCategory('sale')} className={getTabClass('sale')}>
          <FaBuilding /> Buy
        </button>
        <button type="button" onClick={() => setCategory('services')} className={getTabClass('services')}>
          <FaTruck /> Services
        </button>
        <button type="button" onClick={() => setCategory('community')} className={getTabClass('community')}>
          <FaComments /> Intel
        </button>
      </div>

      {/* 2. Search Container */}
      <motion.form 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onSubmit={handleSearch} 
        className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-3 relative z-20"
      >
        
        {/* Location Input */}
        <div className="relative flex-grow group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <FaMapMarkerAlt className="text-lg" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-lg placeholder-gray-400"
            placeholder={getPlaceholder()}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Search Button */}
        <button 
          type="submit"
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-lg transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 text-lg"
        >
          <FaSearch /> 
          <span>Search</span>
        </button>
      </motion.form>
    </div>
  );
};

export default GlobalSearchBar;