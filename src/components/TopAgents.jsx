// frontend/src/components/TopAgents.jsx (Corrected)

import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

// --- START: FIX FOR 'toFixed' ERROR ---
// Mini Star Rating for one-line display
const MiniStarRating = ({ rating }) => {
  // 1. Default the rating to 0 if it's undefined, null, or NaN
  const safeRating = Number(rating) || 0;
  
  // 2. Round the safe rating to one decimal place
  const roundedRating = safeRating.toFixed(1);

  return (
    <div className="flex items-center space-x-1">
      <FaStar className="text-yellow-400" />
      <span className="text-gray-700 dark:text-gray-200 font-semibold">{roundedRating}</span>
    </div>
  );
};
// --- END: FIX FOR 'toFixed' ERROR ---

const TopAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopAgents = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/users/top-agents');
        setAgents(data);
      } catch (error) {
        console.error('Failed to fetch top agents', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopAgents();
  }, []);

  if (loading && agents.length === 0) {
    // Show a simple loading placeholder
    return (
      <section className="py-20 px-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
            Top Agents
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6"> {/* ✅ Updated Grid to 5 */}
            {/* Placeholder cards */}
            {[...Array(5)].map((_, i) => ( // ✅ Updated to 5 placeholders
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse">
                <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 mx-auto mb-4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't show the section if no agents are found
  if (!agents || agents.length === 0) {
    return null; 
  }

  return (
    <section className="py-20 px-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
          Top Agents
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6"> {/* ✅ Updated Grid to 5 */}
          {agents.slice(0, 5).map(agent => ( // ✅ Strictly limited to 5 agents
            <Link
              to={`/agent/${agent._id}`}
              key={agent._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border dark:border-gray-700 text-center transition-transform transform hover:-translate-y-2 hover:shadow-xl"
            >
              <img
                src={agent.profilePicture}
                alt={agent.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200 dark:border-gray-600"
              />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{agent.name}</h3>
              <div className="flex justify-center items-center space-x-2">
                {/* This component is now safe */}
                <MiniStarRating rating={agent.averageRating} /> 
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({agent.numReviews} review{agent.numReviews !== 1 ? 's' : ''})
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopAgents;