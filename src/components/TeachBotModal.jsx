import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import apiClient from '../api/axios';

const TeachBotModal = ({ query, onClose, onSynonymCreated }) => {
  const [keyword, setKeyword] = useState(query.queryText);
  const [replacement, setReplacement] = useState('');
  const [category, setCategory] = useState('location');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword || !replacement || !category) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Create the new synonym rule
      await apiClient.post(
        '/synonyms',
        { keyword, replacement, category },
        { withCredentials: true }
      );
      
      // 2. Delete the "failed query" from the list
      await apiClient.delete(`/ai/failed-queries/${query._id}`, {
        withCredentials: true,
      });

      // 3. Tell the parent component to refresh
      onSynonymCreated();
      onClose();

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to teach bot.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose} // Click background to close
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 relative"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <FaTimes size={20} />
          </button>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Teach the Bot
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            You are teaching the bot what to do when it sees the keyword:
          </p>
          <p className="text-lg font-mono p-2 bg-gray-100 dark:bg-gray-700 rounded mb-4">
            "{query.queryText}"
          </p>
          
          {error && (
            <div className="p-3 my-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="keyword">
                Keyword (The word the user typed)
              </label>
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="location">Location</option>
                <option value="type">Property Type</option>
                <option value="listingType">Listing Type (rent/sale)</option>
                <option value="bedrooms">Bedrooms</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="replacement">
                Replacement (The "correct" term)
              </label>
              <input
                type="text"
                id="replacement"
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                placeholder="e.g., kilimani, apartment, rent"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Teaching...' : 'Teach Bot & Delete Query'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TeachBotModal;