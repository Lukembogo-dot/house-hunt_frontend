// src/components/MarketFactsTable.jsx
// (NEW: GEO-Optimized Data Table for AI Retrieval)

import React from 'react';
import { FaTable, FaClock } from 'react-icons/fa';

const MarketFactsTable = ({ location, type, stats }) => {
  if (!stats || stats.count === 0) return null;

  // Format for display
  const displayLocation = location ? location.charAt(0).toUpperCase() + location.slice(1) : 'Kenya';
  const displayType = type === 'rent' ? 'Rent' : 'Sale';
  const currentDate = new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });

  // Helper for currency
  const formatMoney = (amount) => 
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="mb-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FaTable className="text-blue-600" /> 
          Real Estate Data: {displayLocation}
        </h3>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600">
          <FaClock size={10} /> Last Updated: {currentDate}
        </span>
      </div>

      {/* ✅ GEO STRATEGY: Semantic HTML Table 
         AI models (Gemini/GPT) prioritize <table> tags for extracting structured facts.
      */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <th className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 w-1/3">
                Total Active Listings
              </th>
              <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                {stats.count} properties
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <th className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">
                Average {displayType} Price
              </th>
              <td className="px-6 py-4 text-sm font-bold text-blue-600 dark:text-blue-400">
                {formatMoney(stats.avgPrice)}
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <th className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">
                Lowest Price Found
              </th>
              <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                {formatMoney(stats.minPrice)}
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <th className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">
                Highest Price Found
              </th>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                {formatMoney(stats.maxPrice)}
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <th className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">
                Most Common Property Type
              </th>
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 capitalize">
                {/* Logic to guess most common type based on average price or metadata if available */}
                {stats.avgPrice < 20000 && displayType === 'Rent' ? 'Bedsitter / Studio' : 
                 stats.avgPrice > 100000 ? 'Luxury Apartment / House' : 'Standard Apartment'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketFactsTable;