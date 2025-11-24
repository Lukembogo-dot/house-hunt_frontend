// src/pages/ShareInsight.jsx
// (UPDATED: Added Question vs Insight Toggle & Logic)

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaPenNib, FaMapMarkerAlt, FaUser, FaPaperPlane, FaCheckCircle, FaSpinner, FaQuestionCircle } from 'react-icons/fa';
import apiClient from '../api/axios';

const ShareInsight = () => {
  const navigate = useNavigate();
  const locationHook = useLocation();
  
  // Check if location/type was passed via state or query param
  const initialLocation = locationHook.state?.location || '';
  const initialType = locationHook.state?.type || 'insight'; // 'insight' or 'question'

  const [formData, setFormData] = useState({
    title: '',
    location: initialLocation,
    authorName: '',
    content: '',
    type: initialType // ✅ ADDED TYPE
  });

  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [createdSlug, setCreatedSlug] = useState('');

  // Update formData if location state changes (e.g. strict mode re-renders)
  useEffect(() => {
     if (initialType) {
         setFormData(prev => ({ ...prev, type: initialType }));
     }
     if (initialLocation) {
         setFormData(prev => ({ ...prev, location: initialLocation }));
     }
  }, [initialLocation, initialType]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Toggle between Question and Insight
  const handleTypeChange = (newType) => {
      setFormData({ ...formData, type: newType });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      // POST to the community endpoint (Controller now accepts 'type')
      const { data } = await apiClient.post('/community/submit', formData);
      
      if (data.success) {
        setCreatedSlug(data.data.slug);
        setStatus('success');
        // Clear form
        setFormData({ title: '', location: '', authorName: '', content: '', type: 'insight' });
      }
    } catch (err) {
      console.error("Submission error:", err);
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-green-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {formData.type === 'question' ? 'Question Posted!' : 'Published Successfully!'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {formData.type === 'question' 
                ? 'Your question is live. Locals will reply soon!' 
                : 'Your insight has been published and is now live for the community to see.'}
          </p>
          <div className="space-y-3">
            <Link 
              to={`/community/${createdSlug}`}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
            >
              View Your Post
            </Link>
            <button 
              onClick={() => setStatus('idle')}
              className="block w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Write Another
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Dynamic UI Text based on Type
  const isQuestion = formData.type === 'question';
  const pageTitle = isQuestion ? 'Ask a Local' : 'Share Your Insight';
  const pageDesc = isQuestion 
      ? 'Have questions about security, water, or internet in a specific area? Ask residents directly.' 
      : 'Tell us about your neighborhood. Your real-life experience helps others find their perfect home.';
  const titleLabel = isQuestion ? 'Your Question (Short Summary)' : 'Headline / Title';
  const titlePlaceholder = isQuestion ? 'e.g. Is water constant in South B?' : 'e.g. Why I love living in Kilimani...';
  const contentLabel = isQuestion ? 'Details' : 'Your Experience';
  const contentPlaceholder = isQuestion 
      ? 'Describe what you want to know...' 
      : 'Write your review here. What is the vibe like? How is the security, water, and accessibility?';
  const submitText = isQuestion ? 'Post Question' : 'Publish Insight';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{pageTitle} | HouseHunt Kenya</title>
        <meta name="description" content={pageDesc} />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-3">
            {isQuestion ? <FaQuestionCircle className="text-purple-600" /> : <FaPenNib className="text-purple-600" />}
            {pageTitle}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {pageDesc}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          
          {/* ✅ TYPE TOGGLE TABS */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button 
                  type="button"
                  onClick={() => handleTypeChange('insight')}
                  className={`flex-1 py-4 text-center font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors ${!isQuestion ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-b-2 border-purple-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                  <FaPenNib /> Write a Review
              </button>
              <button 
                  type="button"
                  onClick={() => handleTypeChange('question')}
                  className={`flex-1 py-4 text-center font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors ${isQuestion ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-b-2 border-purple-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                  <FaQuestionCircle /> Ask a Question
              </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location Input */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Neighborhood / Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g. Kilimani"
                  />
                </div>
              </div>

              {/* Author Name Input */}
              <div>
                <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Name (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="authorName"
                    id="authorName"
                    value={formData.authorName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {titleLabel}
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500 font-semibold"
                placeholder={titlePlaceholder}
              />
            </div>

            {/* Content Textarea */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {contentLabel}
              </label>
              <textarea
                name="content"
                id="content"
                rows="8"
                required
                value={formData.content}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                placeholder={contentPlaceholder}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all transform hover:scale-[1.01]"
            >
              {status === 'submitting' ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Publishing...
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-2" /> {submitText}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareInsight;