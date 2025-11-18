import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';
import { FaRobot, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const SmartPricingWidget = ({ location, type, bedrooms, currentPrice }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper to format currency
  const formatPrice = (price) => 
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(price);

  useEffect(() => {
    // We need at least location and type to give a suggestion
    if (!location || !type) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const params = { location, type };
        if (bedrooms) params.bedrooms = bedrooms;

        const { data } = await apiClient.get('/properties/market-stats', { params });
        
        if (data.found) {
          setStats(data);
        } else {
          setStats(null); // No data found for this combo
        }
      } catch (error) {
        console.error("Pricing Intelligence Error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the call (wait 1 second after user stops typing)
    const timer = setTimeout(() => {
      fetchStats();
    }, 1000);

    return () => clearTimeout(timer);
  }, [location, type, bedrooms]);

  if (loading) return <div className="text-xs text-gray-500 animate-pulse mt-2">Analyzing market data...</div>;
  if (!stats) return null;

  // Logic to check if user's entered price is "Good"
  let priceStatus = "neutral";
  if (currentPrice) {
    if (currentPrice < stats.minPrice) priceStatus = "low";
    else if (currentPrice > stats.maxPrice) priceStatus = "high";
    else priceStatus = "good";
  }

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <FaRobot className="text-blue-600 dark:text-blue-400" />
        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Smart Pricing Suggestion</h4>
      </div>
      
      <div className="text-xs text-gray-600 dark:text-gray-300 mb-3">
        Based on <strong>{stats.count} similar listings</strong> in {location}:
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div className="bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
          <span className="block text-[10px] text-gray-400">Lowest</span>
          <span className="font-semibold text-green-600 text-xs">{formatPrice(stats.minPrice)}</span>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded border border-blue-200 dark:border-blue-700">
          <span className="block text-[10px] text-blue-500 font-bold">Average</span>
          <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">{formatPrice(stats.avgPrice)}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
          <span className="block text-[10px] text-gray-400">Highest</span>
          <span className="font-semibold text-red-500 text-xs">{formatPrice(stats.maxPrice)}</span>
        </div>
      </div>

      {/* Feedback on current input */}
      {currentPrice > 0 && (
        <div className={`text-xs flex items-center gap-2 p-2 rounded ${
          priceStatus === 'good' ? 'bg-green-100 text-green-800' : 
          priceStatus === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {priceStatus === 'good' && <><FaCheckCircle /> Price is competitive!</>}
          {priceStatus === 'high' && <><FaInfoCircle /> Price is above market average.</>}
          {priceStatus === 'low' && <><FaInfoCircle /> Price is below market average.</>}
        </div>
      )}
    </div>
  );
};

export default SmartPricingWidget;