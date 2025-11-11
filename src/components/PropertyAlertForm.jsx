import React, { useState } from 'react';
import apiClient from '../api/axios';
import { FaEnvelope, FaWhatsapp, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // <-- 1. IMPORT USE AUTH

// This component receives the filters from the search page as props
const PropertyAlertForm = ({ currentFilters }) => {
  const { user } = useAuth(); // <-- 2. USE AUTH

  // 3. INITIALIZE STATE BASED ON LOGIN STATUS
  const [email, setEmail] = useState(user?.email || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsappNumber || '');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    const payload = {
      ...currentFilters, // This includes location, type, price, etc.
      email: email,
      whatsappNumber: whatsapp,
    };

    try {
      // The backend handles linking the user ID via optionalAuth
      const { data } = await apiClient.post('/alerts', payload);
      setMessage(data.message);
      
      // Only clear if the user was NOT logged in (to prevent clearing their profile data)
      if (!user) {
        setEmail('');
        setWhatsapp('');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create alert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border dark:border-gray-700 max-w-2xl mx-auto my-12 text-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Properties Found... Yet!</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        No properties match your current search. Be the first to know when one is listed!
      </p>

      {/* 4. NEW LOGGED-IN MESSAGE */}
      {user && (
        <p className="text-sm text-blue-600 dark:text-blue-400 mb-4 font-medium">
          Your current profile details are pre-filled below for easy submission.
        </p>
      )}

      {message ? (
        <div className="p-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="alert-email" className="sr-only">Email*</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="email"
                id="alert-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter your email*"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="alert-whatsapp" className="sr-only">WhatsApp (Optional)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaWhatsapp className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="tel"
                id="alert-whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="WhatsApp (Optional, e.g., +254...)"
              />
            </div>
          </div>
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? <FaSpinner className="animate-spin" /> : 'Create Alert'}
          </button>
        </form>
      )}
    </motion.div>
  );
};

export default PropertyAlertForm;