// src/pages/CommunityHub.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/axios';
import { FaMapMarkerAlt, FaUser, FaPenNib, FaSearch } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const CommunityHub = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data } = await apiClient.get('/community/recent');
        setInsights(data);
      } catch (err) {
        console.error("Failed to fetch community insights", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  // Simple frontend filter
  const filteredInsights = insights.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-inter">
      <Helmet>
        <title>Community Stories & Neighborhood Reviews | HouseHunt Kenya</title>
        <meta name="description" content="Read real stories and reviews from residents in Nairobi's neighborhoods. Discover what it's really like to live in Kilimani, Westlands, and more." />
        <link rel="canonical" href="https://househuntkenya.com/community" />
      </Helmet>

      {/* --- Hero Section --- */}
      <section className="relative bg-purple-900 text-white py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-purple-800 border border-purple-600 text-xs font-semibold tracking-wider mb-4">
              COMMUNITY VOICES
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              Real Stories about <span className="text-yellow-400">Living in Nairobi</span>
            </h1>
            <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
              Discover the hidden gems, the vibes, and the honest truth about Nairobi's neighborhoods—written by the people who live there.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/share-insight"
                className="flex items-center justify-center bg-yellow-400 text-purple-900 font-bold py-3 px-8 rounded-lg hover:bg-yellow-300 transition transform hover:scale-105"
              >
                <FaPenNib className="mr-2" /> Write a Story
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Content Section --- */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Search Bar */}
        <div className="flex justify-between items-center mb-8 flex-col md:flex-row gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent Stories
          </h2>
          <div className="relative w-full md:w-1/3">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search location or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredInsights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredInsights.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col"
              >
                <div className="p-6 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-full uppercase tracking-wide">
                      <FaMapMarkerAlt className="mr-1" /> {post.location}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <Link to={`/community/${post.slug}`} className="block group">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 transition">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">
                    {post.metaDescription || "Read the full story to learn more about living in this neighborhood..."}
                  </p>
                </div>

                {/* ✅ FIXED: Removed conflicting pt-0 class here */}
                <div className="p-6 mt-auto border-t border-gray-100 dark:border-gray-700 flex items-center justify-between pt-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <FaUser className="mr-2" /> {post.authorName}
                  </div>
                  <Link to={`/community/${post.slug}`} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    Read More &rarr;
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No stories found.</h3>
            <p className="text-gray-500 mb-6">Be the first to write about {searchTerm || "your neighborhood"}!</p>
            <Link to="/share-insight" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-bold">
              Write a Story
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default CommunityHub;