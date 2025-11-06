// src/components/MyFavorites.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import PropertyCard from './PropertyCard';
import { Link } from 'react-router-dom'; 
import { motion } from 'framer-motion'; // ✅ 1. Import motion

const MyFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ... (fetchFavorites function is unchanged)
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/users/favorites', {
          withCredentials: true,
        });
        setFavorites(data);
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
        setError(err.response?.data?.message || "Failed to load favorites.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []); 

  return (
    // ✅ 2. Add scroll-in animation
    <motion.section 
      className="mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }} // Delay slightly after page load
    >
      <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
        My Saved Properties ({favorites.length})
      </h2>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700">
        {loading ? (
          <p className="dark:text-gray-300">Loading saved properties...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : favorites.length === 0 ? (
          <p className="dark:text-gray-300">
            You haven't saved any properties yet.
            <Link to="/rent" className="text-blue-500 underline ml-1">Browse properties</Link>
          </p>
        ) : (
          // PropertyCards inside here are already animated
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default MyFavorites;