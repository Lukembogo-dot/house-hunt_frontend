import React, { useState, useEffect } from 'react'; // ✅ --- FIX IS HERE ---
import { useAuth } from '../context/AuthContext';
import { useFeatureFlag } from '../context/FeatureFlagContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/axios';
import { FaPencilAlt, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';

// These categories MUST match the values in your backend (e.g., LocalService model)
const intelCategories = {
  Safety: ['Safety', 'Security', 'Community Alert'],
  Lifestyle: ['Restaurant', 'Cafe', 'Nightlife', 'Leisure', 'Shopping', 'Park'],
  Services: ['Internet', 'Utilities', 'Laundry', 'Cleaning', 'Plumber', 'Electrician', 'Groceries', 'Transport'],
  Reviews: ['Area Review', 'Estate Review'],
};

export default function CreateIntelPost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // --- 1. FEATURE FLAG CHECK ---
  const isUgcEnabled = useFeatureFlag('user-generated-intel');

  // --- 2. FORM STATE ---
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: '',
    serviceType: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.location || !formData.serviceType) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // --- 3. API CALL ---
      // This calls the new endpoint we created
      const { data } = await apiClient.post('/services/user-post', formData);
      
      setSuccess('Your post has been submitted successfully! It is now live.');
      setFormData({ title: '', content: '', location: '', serviceType: '' }); // Reset form
      
      // Redirect to their new post after a short delay
      setTimeout(() => {
        navigate(`/services/${data.slug}`);
      }, 2000);

    } catch (err) {
      // This will catch the "You must verify your email" error from the backend
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- 4. REDIRECT IF FLAG IS OFF ---
  if (!isUgcEnabled) {
    return <Navigate to="/" replace />;
  }

  // --- 5. CHECK FOR LOGIN ---
  if (!user) {
    return <Navigate to="/login" state={{ from: '/create-intel-post' }} replace />;
  }

  // --- 6. CHECK FOR EMAIL VERIFICATION (THE QUALITY GATE) ---
  if (!user.isVerified) {
    return (
      <div className="container mx-auto max-w-2xl p-6 md:p-10 my-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border dark:border-gray-700"
        >
          <FaExclamationTriangle className="text-yellow-500 text-6xl mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Verify Your Email
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            To ensure the quality of our community intel, you must verify your email address before you can create a post.
          </p>
          <p className="text-md text-gray-500 dark:text-gray-400 mt-4">
            Please check your inbox (and spam folder) for a verification link.
          </p>
          {/* We can add a "Resend Verification" button here later */}
        </motion.div>
      </div>
    );
  }

  // --- 7. RENDER THE FORM ---
  return (
    <>
      <Helmet>
        <title>Share Your Intel | HouseHunt Kenya</title>
        <meta name="description" content="Share your neighbourhood intel, review a service, or post a safety alert." />
      </Helmet>
      
      <div className="container mx-auto max-w-2xl p-6 md:p-10 my-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center">
            <FaPencilAlt className="mr-3 text-blue-500" />
            Share Your Intel
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Help the community by sharing a safety alert, a review, or local service info.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border dark:border-gray-700">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="e.g., Water Outage in Lavington"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Neighbourhood / Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="e.g., Kilimani"
                required
              />
            </div>

            {/* Service Type (Category) */}
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                required
              >
                <option value="">-- Select a category --</option>
                {Object.entries(intelCategories).map(([group, types]) => (
                  <optgroup label={group} key={group}>
                    {types.map(type => (
                      <option value={type} key={type}>{type}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Post
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-3"
                placeholder="Share the details..."
                required
              />
            </div>
            
            {/* Messages */}
            {error && (
              <div className="text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/30 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/30 rounded-md flex items-center">
                <FaCheckCircle className="mr-2" />
                {success}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
              >
                {loading ? <FaSpinner className="animate-spin" /> : 'Submit Post'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}