// src/components/property/CommunityInsightsCTA.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaLightbulb } from 'react-icons/fa';

const CommunityInsightsCTA = ({ location }) => {
  if (!location) return null;
  
  // Clean location string (e.g., "Kilimani, Nairobi" -> "Kilimani")
  const cleanLocation = location.split(',')[0].trim();

  return (
    <div className="mb-8 p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl text-center shadow-sm">
      <div className="flex justify-center mb-3">
        <FaLightbulb className="text-3xl text-purple-600 dark:text-purple-400" />
      </div>
      <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-2">
        Curious about life in {cleanLocation}?
      </h3>
      <p className="text-purple-700 dark:text-purple-300 mb-6 max-w-lg mx-auto">
        Discover real stories from residents in {cleanLocation}, or share your own experience to help others find their home.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          to={`/search/rent/${cleanLocation.toLowerCase()}`}
          className="px-6 py-3 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-300 font-bold border border-purple-200 dark:border-gray-600 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 transition shadow-sm"
        >
          View {cleanLocation} Insights
        </Link>
        <Link 
          to="/share-insight"
          state={{ location: cleanLocation }} 
          className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition shadow-md"
        >
          Write a Review
        </Link>
      </div>
    </div>
  );
};

export default CommunityInsightsCTA;