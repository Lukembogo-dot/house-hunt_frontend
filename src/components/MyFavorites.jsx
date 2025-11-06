// src/components/MyFavorites.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import PropertyCard from './PropertyCard';
import { Link } from 'react-router-dom'; // ✅ FIX: Removed the extra 'S' here

const MyFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        // This endpoint gets the *populated* list of properties
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
  }, []); // Runs once on component mount

  return (
    <section className="mt-12">
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyFavorites;