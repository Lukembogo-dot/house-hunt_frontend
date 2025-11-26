// frontend/src/components/TopAgents.jsx
// (FIXED: Removed invalid 'FaClose' import)

import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { Link } from 'react-router-dom';
// ✅ FIXED: Removed FaClose, Kept FaTimes
import { FaStar, FaUserTie, FaBuilding, FaArrowRight, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- HELPER: Mini Star Rating ---
const MiniStarRating = ({ rating }) => {
  const safeRating = Number(rating) || 0;
  const roundedRating = safeRating.toFixed(1);

  return (
    <div className="flex items-center space-x-1 bg-yellow-100/80 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-700/50 backdrop-blur-sm">
      <FaStar className="text-yellow-500 text-xs" />
      <span className="text-yellow-700 dark:text-yellow-400 text-xs font-bold">{roundedRating}</span>
    </div>
  );
};

// --- 3D AGENT CARD COMPONENT ---
const AgentCard = ({ agent }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const variants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  };

  // Fallback image if profilePicture is missing
  const displayImage = agent.profilePicture && !agent.profilePicture.includes('placehold') 
    ? agent.profilePicture 
    : "https://ui-avatars.com/api/?name=" + encodeURIComponent(agent.name) + "&background=0D8ABC&color=fff&size=150";

  return (
    <div 
      className="relative w-full h-80 cursor-pointer group" 
      style={{ perspective: '1000px' }} 
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="w-full h-full relative transition-all"
        style={{ transformStyle: 'preserve-3d' }} 
        variants={variants}
        initial="front"
        animate={isFlipped ? "back" : "front"}
        transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.8 }}
      >
        {/* === FRONT SIDE (Glassy) === */}
        <div 
          style={{ backfaceVisibility: 'hidden' }}
          className="absolute inset-0 w-full h-full 
            /* Light Mode: White Frost */
            bg-white/90 backdrop-blur-md border border-white/40 
            /* Dark Mode: Blue/Gray Glass */
            dark:bg-gray-800/90 dark:border-gray-700/50
            rounded-2xl shadow-xl overflow-hidden flex flex-col items-center justify-center p-6"
          onClick={handleFlip}
        >
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <img 
                    src={displayImage} 
                    alt={agent.name} 
                    className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-800" 
                />
            </div>
            {/* Online Indicator */}
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 text-center line-clamp-1">
            {agent.name}
          </h3>
          
          <div className="flex items-center gap-2 mt-1">
             <MiniStarRating rating={agent.averageRating} />
             <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
               ({agent.numReviews || 0} reviews)
             </span>
          </div>

          <div className="mt-6 w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors
            bg-blue-50/80 text-blue-600 border border-blue-100 backdrop-blur-sm
            dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50
            group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent">
             Tap to View Stats
          </div>
        </div>

        {/* === BACK SIDE (Flipped & Glassy) === */}
        <div 
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className="absolute inset-0 w-full h-full 
            /* Light: Clear Glass */
            bg-white/90 backdrop-blur-xl border border-white/60
            /* Dark: Deep Dark Glass */
            dark:bg-gray-950 dark:border-gray-700/50
            rounded-2xl shadow-xl overflow-hidden flex flex-col"
        >
          {/* Dynamic Background Image with Adaptive Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none">
             <img 
               src={displayImage} 
               alt="Background" 
               className="w-full h-full object-cover opacity-40 blur-2xl scale-150"
             />
             {/* Adaptive Overlay: White in Light Mode, Dark Blue/Black in Dark Mode */}
             <div className="absolute inset-0 bg-white/80 dark:bg-gradient-to-b dark:from-gray-900/95 dark:to-blue-950/95" /> 
          </div>

          {/* Content Container */}
          <div className="relative z-10 flex flex-col h-full p-6 items-center justify-center text-gray-900 dark:text-white">
            
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
              className="absolute top-4 right-4 p-2 rounded-full transition backdrop-blur-md
                hover:bg-gray-200 text-gray-500
                dark:hover:bg-white/10 dark:text-white/80"
            >
              <FaTimes /> {/* ✅ Using FaTimes here */}
            </button>

            <div className="mb-6 text-center w-full">
                <h4 className="text-xs font-bold uppercase tracking-widest mb-3
                  text-blue-600 dark:text-blue-300 opacity-90">
                    Agent Performance
                </h4>
                
                <div className="flex flex-col items-center p-5 rounded-2xl shadow-inner border backdrop-blur-md
                  bg-white/60 border-white/60
                  dark:bg-white/5 dark:border-white/10">
                    <FaBuilding className="text-3xl mb-2 text-gray-700 dark:text-gray-300" />
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {agent.propertyPostCount || 0}
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Active Listings</span>
                </div>
            </div>

            <Link 
               to={`/agent/${agent._id}`}
               onClick={(e) => e.stopPropagation()}
               className="w-full py-3 flex items-center justify-center gap-2 rounded-xl font-bold shadow-lg transition transform hover:scale-105 text-sm backdrop-blur-md
                 bg-blue-600 text-white hover:bg-blue-700
                 dark:bg-white dark:text-blue-900 dark:hover:bg-gray-100"
            >
              View Profile <FaArrowRight />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN COMPONENT ---
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
    // Loading Skeleton
    return (
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
            Top Agents
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-80 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 animate-pulse p-6 flex flex-col items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!agents || agents.length === 0) {
    return null; 
  }

  return (
    <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">
          Top Rated Agents
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Connect with the most active and trusted real estate professionals in Kenya.
        </p>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {agents.slice(0, 5).map(agent => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopAgents;