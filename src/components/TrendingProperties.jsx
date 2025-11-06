// src/components/TrendingProperties.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import PropertyCard from './PropertyCard';
import { motion } from 'framer-motion';

const TrendingProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/properties/trending');
        setProperties(data);
      } catch (err) {
        console.error("Failed to fetch trending properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return null; 
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    // ✅ FIX: Removed background colors (bg-white dark:bg-gray-800)
    <motion.section 
      className="py-20 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
          Trending Properties
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop) => (
            <PropertyCard key={prop._id} property={prop} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default TrendingProperties;