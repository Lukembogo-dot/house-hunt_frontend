// src/components/TrendingProperties.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import PropertyCard from './PropertyCard';
import { motion } from 'framer-motion';

const TrendingProperties = ({ listingType, onLoad }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        // Fetch all trending (assuming backend returns mixed types)
        const { data } = await apiClient.get('/properties/trending');
        
        // 1. Filter by Type (Rent or Sale) if provided
        let filtered = data;
        if (listingType) {
          // Normalize to match backend values (usually 'rent'/'sale' or 'Rental'/'For Sale')
          // Adjust logic based on your actual property data structure (e.g., prop.listingType)
          filtered = data.filter(p => 
            p.listingType && p.listingType.toLowerCase() === listingType.toLowerCase()
          );
        }

        // 2. Limit to 12 items (4 cols * 3 rows)
        const limited = filtered.slice(0, 12);
        
        setProperties(limited);

        // 3. Pass IDs back to parent to avoid duplicates in the main list
        if (onLoad) {
          const ids = limited.map(p => p._id);
          onLoad(ids);
        }

      } catch (err) {
        console.error("Failed to fetch trending properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [listingType]); // Re-run if type changes

  if (loading) return null;
  if (properties.length === 0) return null;

  return (
    <motion.section 
      className="py-10 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Trending {listingType === 'rent' ? 'Rentals' : 'Homes'}
          </h2>
          <span className="text-xs font-bold bg-red-100 text-red-600 px-3 py-1 rounded-full uppercase tracking-wider">
            Hot
          </span>
        </div>

        {/* ✅ UPDATED GRID: 4 Columns on Large Screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {properties.map((prop) => (
            <PropertyCard key={prop._id} property={prop} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default TrendingProperties;