// src/pages/AgentFinderPage.jsx
// (UPDATED)

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/axios';
import { motion } from 'framer-motion';
import { FaStar, FaUserCheck, FaPhone, FaWhatsapp, FaBuilding } from 'react-icons/fa';

// --- 1. IMPORT THE NEW HOOKS ---
import useSeoData from '../hooks/useSeoData';
import SeoInjector from '../components/SeoInjector';

// Helper function to capitalize words: "kilimani" -> "Kilimani"
const capitalize = (s) => {
  if (typeof s !== 'string' || !s) return 'Kenya';
  return s.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// --- We'll create a simple, self-contained AgentCard component here ---
const AgentCard = ({ agent }) => {
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/agent/${agent._id}`} className="block p-6">
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={agent.profilePicture}
            alt={agent.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
          />
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600">
              {agent.name}
            </h3>
            <div className="flex items-center mt-1">
              <FaStar className="text-yellow-400" />
              <span className="text-gray-700 dark:text-gray-300 font-semibold ml-1">
                {agent.averageRating?.toFixed(1) || 'New'}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                ({agent.numReviews || 0} reviews)
              </span>
            </div>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
          {agent.about || 'A dedicated real estate agent helping you find your next home.'}
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          {agent.voiceCallNumber && (
            <span className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
              <FaPhone size={12} />
              <span>Call</span>
            </span>
          )}
          {agent.whatsappNumber && (
            <span className="flex items-center space-x-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
              <FaWhatsapp size={12} />
              <span>WhatsApp</span>
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};


// --- This is the main pSEO Page Component ---
const AgentFinderPage = () => {
  // 1. Read the location from the URL
  const { location } = useParams();
  const cleanLocation = location ? capitalize(location) : 'Kenya';

  // 2. State for agents and loading
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. --- NEW DYNAMIC SEO ---
  // Generate the unique path for this pSEO page
  const pagePath = location ? `/agents/${location}` : '/agents';

  // Generate default titles and descriptions for fallback
  const defaultTitle = location
    ? `Top Real Estate Agents in ${cleanLocation} | HouseHunt Kenya`
    : `Find All Real Estate Agents in Kenya | HouseHunt`;
  
  const defaultDescription = location
    ? `Find, review, and contact the best real estate agents in ${cleanLocation}. View their listings and ratings.`
    : `Browse a directory of all verified real estate agents in Kenya. Find top-rated agents.`;

  // Call our upgraded dynamic hook
  const { seo, loading: seoLoading } = useSeoData(
    pagePath,
    defaultTitle,
    defaultDescription
  );
  // --- END OF NEW SEO ---


  // 4. useEffect to fetch only Agent data
  useEffect(() => {
    setLoading(true);

    const fetchAgentData = async () => {
      try {
        const query = location ? `?location=${location}` : '';
        const { data } = await apiClient.get(`/users/find${query}`);
        setAgents(data);
      } catch (error) {
        console.error("Failed to fetch agents:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgentData();
  }, [location]); // Re-run if the location in the URL changes
  
  // Combine loading states
  const pageLoading = loading || seoLoading;

  return (
    <>
      {/* 5. REPLACE HELMET WITH SEOINJECTOR */}
      <SeoInjector seo={seo} />
      
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 6. H1 IS NOW DYNAMICALLY CONTROLLED BY THE SEO MANAGER */}
          {pageLoading ? (
            <div className="mb-12 h-12 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          ) : (
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-12">
              {seo.metaTitle} 
            </h1>
          )}
          
          {pageLoading ? (
            // --- Loading State ---
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <div>
                      <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded mt-2"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : agents.length > 0 ? (
            // --- Agents Found State ---
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {agents.map(agent => (
                <AgentCard key={agent._id} agent={agent} />
              ))}
            </div>
          ) : (
            // --- No Agents Found State (Your Sales Pitch!) ---
            <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700">
              <FaBuilding className="text-blue-500 text-6xl mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                No Agents Found in {cleanLocation}... Yet.
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                This area is waiting for top agents. Be the first to be seen by thousands of users searching for properties here.
              </p>
              <Link
                to="/for-agents" 
                className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg"
              >
                Are You an Agent? Join Now
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default AgentFinderPage;