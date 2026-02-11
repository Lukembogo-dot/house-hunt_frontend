import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaFilter, FaCheckCircle, FaHome, FaBuilding, FaComments } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/axios';

const HeroSearchBar = ({ compact }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('buy'); // 'buy', 'rent', 'intel', 'filters'
    const [location, setLocation] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Autocomplete State
    const [suggestions, setSuggestions] = useState({ properties: [], services: [], shadow: [] });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const searchRef = useRef(null);

    // Filter States (basic for now, can be expanded)
    const [filters, setFilters] = useState({
        type: 'all',
        minPrice: '',
        maxPrice: '',
        bedrooms: ''
    });

    // Handle clicks outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced Autocomplete
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (location.length < 3) {
                setSuggestions({ properties: [], services: [], shadow: [] });
                return;
            }

            setLoadingSuggestions(true);
            try {
                // Determine search context based on tab
                const [propRes] = await Promise.allSettled([
                    apiClient.get(`/properties?location=${location}&limit=3`),
                ]);

                const newSuggestions = {
                    properties: propRes.status === 'fulfilled' ? propRes.value.data.properties : [],
                    services: [], // Keeping empty for hero search focus on properties/intel for now
                    shadow: []
                };
                setSuggestions(newSuggestions);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Autocomplete Error", error);
            } finally {
                setLoadingSuggestions(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [location, activeTab]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        setShowSuggestions(false);
        const cleanLocation = location.trim();

        // Logic mapping
        if (activeTab === 'buy') {
            // Defaulting 'Buy Land' to sale search, maybe map to 'land' type if specific
            navigate(`/search/sale/${cleanLocation || 'kenya'}`);
        } else if (activeTab === 'rent') {
            navigate(`/search/rent/${cleanLocation || 'kenya'}`);
        } else if (activeTab === 'intel') {
            navigate(`/living-feed?neighborhood=${cleanLocation}`);
        }
    };

    const handleSuggestionClick = (item, type) => {
        if (type === 'property') {
            navigate(`/properties/${item.slug}`);
        } else if (type === 'intel') {
            // Handle intel suggestion navigation
        }
        setShowSuggestions(false);
    };

    const tabs = [
        { id: 'buy', label: 'Buy Land', icon: FaHome },
        { id: 'rent', label: 'Rent Property', icon: FaBuilding },
        { id: 'intel', label: 'Intel', icon: FaComments },
    ];

    return (
        <div className={`w-full mx-auto flex flex-col items-center z-50 relative transition-all duration-300 ${compact ? 'max-w-7xl px-4 py-1' : 'max-w-4xl'}`} ref={searchRef}>

            {/* Top Tabs - Hidden in Compact Mode */}
            {!compact && (
                <div className="flex w-full bg-black/40 backdrop-blur-md rounded-t-2xl overflow-hidden border border-white/10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm md:text-base font-bold transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-yellow-600/90 text-white shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)]'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <tab.icon className={activeTab === tab.id ? 'text-white' : 'text-white/60'} />
                            {tab.label}
                        </button>
                    ))}

                    {/* Filters Tab (Toggle) */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm md:text-base font-bold transition-all duration-300 border-l border-white/10 ${showFilters
                            ? 'bg-white/20 text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <FaFilter />
                        Filters
                    </button>
                </div>
            )}

            {/* Search Bar Area */}
            <div className={`w-full flex flex-col md:flex-row gap-4 items-center relative z-50 transition-all duration-300 ${compact
                ? 'bg-transparent'
                : 'bg-black/40 backdrop-blur-md p-4 rounded-b-2xl border-x border-b border-white/10'
                }`}>

                {/* Compact Type Selector */}
                {compact && (
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shrink-0">
                        <button
                            onClick={() => setActiveTab('buy')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'buy'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            <FaHome /> Buy
                        </button>
                        <button
                            onClick={() => setActiveTab('rent')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'rent'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            <FaBuilding /> Rent
                        </button>
                    </div>
                )}

                {/* Input Container */}
                <div className="relative flex-grow w-full group z-50">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors ${compact ? 'text-gray-400 group-focus-within:text-blue-500' : 'text-white/60 group-focus-within:text-yellow-400'}`}>
                        <FaMapMarkerAlt />
                    </div>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        className={`w-full border rounded-xl py-4 pl-12 pr-10 focus:outline-none focus:ring-2 transition-all text-lg ${compact
                            ? 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:ring-blue-500/50 py-2.5 text-sm'
                            : 'bg-white/10 border-white/10 text-white placeholder-white/50 focus:ring-yellow-500/50 focus:bg-white/20'
                            }`}
                        placeholder="Enter Location..."
                    />

                    {loadingSuggestions && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className={`w-5 h-5 border-2 rounded-full animate-spin ${compact ? 'border-gray-300 border-t-blue-500 w-4 h-4' : 'border-white/30 border-t-white'}`}></div>
                        </div>
                    )}

                    {/* Autocomplete Dropdown */}
                    <AnimatePresence>
                        {showSuggestions && (suggestions.properties.length > 0) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden z-[100] text-left border border-gray-100 dark:border-gray-700 ${compact ? 'shadow-xl' : ''}`}
                            >
                                {suggestions.properties.map((item) => (
                                    <div
                                        key={item._id}
                                        onClick={() => handleSuggestionClick(item, 'property')}
                                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                                    >
                                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                                            {item.images?.[0] && <img src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">{item.title}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.location?.name || item.location}</div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className={`font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${compact
                        ? 'px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-blue-600/30 text-sm whitespace-nowrap'
                        : 'w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-600/30 text-lg'
                        }`}
                >
                    <FaSearch />
                    Search
                </button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilters && !compact && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="w-full bg-black/60 backdrop-blur-md rounded-xl mt-2 border border-white/10 overflow-hidden"
                    >
                        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-white/70 font-bold uppercase">Min Price</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    className="w-full bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-white/30"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-white/70 font-bold uppercase">Max Price</label>
                                <input
                                    type="number"
                                    placeholder="Any"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    className="w-full bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-white/30"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Persistent Tags - Hidden in Compact Mode */}
            {!compact && (
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mt-3 md:mt-6 mb-2 md:mb-8 relative z-0 px-2">
                    <div className="flex items-center gap-1.5 text-white/90 font-medium bg-black/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-sm border border-white/10 text-xs md:text-sm">
                        <FaCheckCircle className="text-white text-[10px] md:text-xs" /> Verified Listings
                    </div>
                    <div className="flex items-center gap-1.5 text-white/90 font-medium bg-black/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-sm border border-white/10 text-xs md:text-sm">
                        <FaCheckCircle className="text-white text-[10px] md:text-xs" /> Affordable Prices
                    </div>
                    <div className="flex items-center gap-1.5 text-white/90 font-medium bg-black/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-sm border border-white/10 text-xs md:text-sm">
                        <FaCheckCircle className="text-white text-[10px] md:text-xs" /> Secure Investments
                    </div>
                </div>
            )}

        </div>
    );
};

export default HeroSearchBar;
