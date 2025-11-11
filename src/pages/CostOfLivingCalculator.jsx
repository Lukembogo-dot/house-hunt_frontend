import React, { useState, useEffect } from 'react';
import { useFeatureFlag } from '../context/FeatureFlagContext';
import { Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMoneyBillWave, FaWifi, FaUtensils, FaBuilding, FaUserTie, FaSpinner, FaEquals } from 'react-icons/fa';

// This hardcoded list can be replaced with a dynamic fetch in the future
// It's important that the 'value' matches the URL path (e.g., 'kilimani')
const popularLocations = [
  { name: 'Kilimani', value: 'kilimani' },
  { name: 'Westlands', value: 'westlands' },
  { name: 'Lavington', value: 'lavington' },
  { name: 'Karen', value: 'karen' },
  { name: 'Runda', value: 'runda' },
  { name: 'Kileleshwa', value: 'kileleshwa' },
  { name: 'Muthaiga', value: 'muthaiga' },
  { name: 'Parklands', value: 'parklands' },
  { name: 'Nairobi', value: 'nairobi' },
];

// Reusable stat card for the comparison
const StatCard = ({ title, value, icon, loading }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border dark:border-gray-700">
    {loading ? (
      <div className="animate-pulse">
        <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
        <div className="h-8 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    ) : (
      <>
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center mb-1">
          {icon}
          <span className="ml-2">{title}</span>
        </h4>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </>
    )}
  </div>
);

export default function CostOfLivingCalculator() {
  // --- 1. FEATURE FLAG CHECK ---
  const isCalculatorEnabled = useFeatureFlag('cost-of-living-calculator');

  // --- 2. STATE ---
  const [locA, setLocA] = useState('kilimani');
  const [locB, setLocB] = useState('westlands');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // --- 3. FETCH DATA FUNCTION ---
  const fetchLocationData = async (location) => {
    // We'll fetch 3 key data points in parallel
    const rentPromise = apiClient.get(`/properties/stats?location=${location}&listingType=rent&bedrooms=2`);
    const servicesPromise = apiClient.get(`/services/find?location=${location}&topic=services`);
    const lifestylePromise = apiClient.get(`/services/find?location=${location}&topic=lifestyle`);

    const [rentRes, servicesRes, lifestyleRes] = await Promise.all([
      rentPromise,
      servicesPromise,
      lifestylePromise
    ]);

    // Process and return the data
    return {
      name: popularLocations.find(l => l.value === location)?.name || 'Area',
      avgRent: rentRes.data.count > 0 ? `Ksh ${rentRes.data.avgPrice.toLocaleString()}` : 'N/A',
      rentCount: rentRes.data.count,
      servicesCount: servicesRes.data.length,
      lifestyleCount: lifestyleRes.data.length,
    };
  };

  // --- 4. COMPARE HANDLER ---
  const handleCompare = async () => {
    if (locA === locB) {
      setError('Please select two different locations to compare.');
      setResults(null);
      return;
    }
    setError('');
    setLoading(true);
    setResults(null); // Clear old results

    try {
      // Fetch data for both locations in parallel
      const [dataA, dataB] = await Promise.all([
        fetchLocationData(locA),
        fetchLocationData(locB)
      ]);
      setResults({ locA: dataA, locB: dataB });
    } catch (err) {
      console.error("Failed to fetch comparison data:", err);
      setError('Could not load comparison data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- 5. REDIRECT IF FLAG IS OFF ---
  if (!isCalculatorEnabled) {
    return <Navigate to="/" replace />;
  }

  // --- 6. RENDER THE COMPONENT ---
  return (
    <>
      <Helmet>
        <title>Cost of Living Calculator | HouseHunt Kenya</title>
        <meta name="description" content="Compare average rent, utilities, and lifestyle costs between neighbourhoods in Kenya. Powered by real-time data." />
      </Helmet>
      
      <div className="bg-gray-100 dark:bg-gray-900 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          
          {/* --- Header --- */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Cost of Living Calculator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Compare neighbourhoods side-by-side. Our data is powered by **live** property listings and real-time community intel.
            </p>
          </motion.div>

          {/* --- The Tool UI --- */}
          <motion.div 
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border dark:border-gray-700 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Location A */}
              <div className="md:col-span-1">
                <label htmlFor="locA" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location A
                </label>
                <select
                  id="locA"
                  value={locA}
                  onChange={(e) => setLocA(e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                >
                  {popularLocations.map(loc => (
                    <option key={loc.value} value={loc.value}>{loc.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Compare Button */}
              <div className="md:col-span-1 flex flex-col items-center">
                <span className="hidden md:block text-2xl text-gray-400 dark:text-gray-500 mb-1">
                  <FaEquals />
                </span>
                <button
                  onClick={handleCompare}
                  disabled={loading}
                  className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg disabled:opacity-60"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    'Compare'
                  )}
                </button>
              </div>

              {/* Location B */}
              <div className="md:col-span-1">
                <label htmlFor="locB" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location B
                </label>
                <select
                  id="locB"
                  value={locB}
                  onChange={(e) => setLocB(e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                >
                  {popularLocations.map(loc => (
                    <option key={loc.value} value={loc.value}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          </motion.div>

          {/* --- Results Section --- */}
          <AnimatePresence>
            {(loading || results) && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
              >
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                  {loading ? 'Comparing...' : `Comparison: ${results.locA.name} vs. ${results.locB.name}`}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Location A Results */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{results?.locA.name || locA}</h3>
                    <StatCard 
                      title="Avg. 2-Bed Rent" 
                      value={results?.locA.avgRent || '...'} 
                      icon={<FaMoneyBillWave className="text-green-500" />} 
                      loading={loading} 
                    />
                    <StatCard 
                      title="Home Services Posts" 
                      value={results?.locA.servicesCount.toString() || '...'} 
                      icon={<FaWifi className="text-blue-500" />} 
                      loading={loading} 
                    />
                    <StatCard 
                      title="Lifestyle Posts" 
                      value={results?.locA.lifestyleCount.toString() || '...'} 
                      icon={<FaUtensils className="text-red-500" />} 
                      loading={loading} 
                    />
                  </div>

                  {/* Location B Results */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{results?.locB.name || locB}</h3>
                    <StatCard 
                      title="Avg. 2-Bed Rent" 
                      value={results?.locB.avgRent || '...'} 
                      icon={<FaMoneyBillWave className="text-green-500" />} 
                      loading={loading} 
                    />
                    <StatCard 
                      title="Home Services Posts" 
                      value={results?.locB.servicesCount.toString() || '...'} 
                      icon={<FaWifi className="text-blue-500" />} 
                      loading={loading} 
                    />
                    <StatCard 
                      title="Lifestyle Posts" 
                      value={results?.locB.lifestyleCount.toString() || '...'} 
                      icon={<FaUtensils className="text-red-500" />} 
                      loading={loading} 
                    />
                  </div>
                </div>

                {/* --- The Lead-Gen Moat --- */}
                {!loading && results && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border dark:border-gray-700">
                      <FaBuilding className="text-3xl text-blue-500 mb-3" />
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">See Properties in {results.locA.name}</h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        We found {results.locA.rentCount} active listings matching this criteria.
                      </p>
                      <Link 
                        to={`/search/rent/apartment/${locA}`}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Browse all listings in {results.locA.name} &rarr;
                      </Link>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border dark:border-gray-700">
                      <FaBuilding className="text-3xl text-blue-500 mb-3" />
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">See Properties in {results.locB.name}</h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        We found {results.locB.rentCount} active listings matching this criteria.
                      </p>
                      <Link 
                        to={`/search/rent/apartment/${locB}`}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Browse all listings in {results.locB.name} &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}