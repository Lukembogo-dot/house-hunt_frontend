import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApiCache } from '../hooks/useApiCache';
import {
  FaStar, FaBuilding, FaArrowRight, FaHome, FaCheckCircle,
  FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaPhone,
  FaWhatsapp, FaEnvelope, FaAward
} from 'react-icons/fa';

// --- AGENT CAROUSEL CARD ---
const AgentCarouselCard = ({ agent }) => {
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const properties = agent.properties || []; // ✅ Use pre-fetched properties
  // No secondary loading state needed!

  // Auto-rotate properties
  useEffect(() => {
    if (properties.length > 1) {
      const interval = setInterval(() => {
        setCurrentPropertyIndex((prev) => (prev + 1) % properties.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [properties.length]);

  const currentProperty = properties[currentPropertyIndex];
  const displayImage = agent.profilePicture && !agent.profilePicture.includes('placehold')
    ? agent.profilePicture
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=0D8ABC&color=fff&size=200`;

  // Get property image
  const getPropertyImage = (property) => {
    if (!property) return null;
    if (Array.isArray(property.images) && property.images.length > 0) {
      return typeof property.images[0] === 'string'
        ? property.images[0]
        : property.images[0].url;
    }
    return property.imageUrl || null;
  };

  const propertyImage = getPropertyImage(currentProperty);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative w-full h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 group"
    >
      {/* Background Property Image with Overlay */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          {propertyImage && (
            <motion.img
              key={currentPropertyIndex}
              src={propertyImage}
              alt={currentProperty?.title || 'Property'}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6">

        {/* Top Section - Property Info */}
        <div className="space-y-3">
          {currentProperty ? (
            <motion.div
              key={currentPropertyIndex}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-white font-bold text-sm line-clamp-1 mb-1">
                    {currentProperty.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-white/80 text-xs">
                    <FaMapMarkerAlt size={10} />
                    <span className="line-clamp-1">{currentProperty.location}</span>
                  </div>
                </div>
                <span className="bg-blue-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap ml-2">
                  For {currentProperty.listingType}
                </span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-white font-black text-lg">
                  Ksh {currentProperty.price.toLocaleString()}
                </span>
                {currentProperty.listingType === 'rent' && (
                  <span className="text-white/70 text-xs">/month</span>
                )}
              </div>

              {/* Property Navigation Dots */}
              {properties.length > 1 && (
                <div className="flex gap-1 mt-3 justify-center">
                  {properties.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPropertyIndex(index)}
                      className={`h-1 rounded-full transition-all ${index === currentPropertyIndex
                        ? 'bg-white w-6'
                        : 'bg-white/40 w-1.5'
                        }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 text-center">
              <FaHome className="text-white/50 text-2xl mx-auto mb-2" />
              <p className="text-white/70 text-xs">No active listings</p>
            </div>
          )}
        </div>

        {/* Bottom Section - Agent Info */}
        <div className="space-y-4">
          {/* Agent Profile */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/30">
                <img
                  src={displayImage}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {agent.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <FaCheckCircle className="text-white text-xs" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg line-clamp-1">
                {agent.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <FaStar className="text-yellow-400 text-xs" />
                  <span className="text-yellow-300 text-xs font-bold">
                    {(agent.averageRating || 0).toFixed(1)}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${agent.agentType === 'Agency'
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'bg-green-500/20 text-green-300'
                  }`}>
                  {agent.agentType || 'Agent'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats & CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20 text-center">
              <div className="text-white font-black text-2xl">
                {agent.propertyPostCount || 0}
              </div>
              <div className="text-white/70 text-xs font-medium uppercase">
                Properties
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20 text-center flex flex-col items-center justify-center">
              <div className="text-blue-500 font-black text-2xl flex items-center justify-center gap-1 mb-1">
                <FaCheckCircle className="bg-white rounded-full text-blue-500" />
              </div>
              <div className="text-white text-xs font-bold uppercase tracking-wider">
                Verified
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Link
            to={`/agent/${agent._id}`}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            View Full Portfolio <FaArrowRight />
          </Link>
        </div>
      </div>

      {/* Hover Effect Overlay - Removed as per request */}
      {/* <div className="absolute inset-0 bg-gradient-to-t from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-300 pointer-events-none" /> */}
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
const TopAgents = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  // ⚡ Performance: Use cached API requests (10 min TTL)
  const { data, loading, error } = useApiCache(
    'top-agents',
    async () => {
      const { data } = await apiClient.get('/users/top-agents');
      return data;
    },
    10 * 60 * 1000 // 10 minutes cache
  );

  // ⚡ Null safety: Ensure agents is always an array
  const agents = Array.isArray(data) ? data : [];

  // Log errors for debugging
  if (error) {
    console.error('Failed to load top agents:', error);
  }

  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Responsive Carousel Logic
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize(); // Set initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, agents.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Auto-scroll carousel
  useEffect(() => {
    if (agents.length > itemsPerPage) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [agents.length, itemsPerPage, maxIndex]);

  if (loading) {
    return (
      <section className="py-6 px-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 relative overflow-hidden">
        {/* Static Background Elements - Performance Optimized */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl opacity-70" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl opacity-70" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700/50 rounded-full animate-pulse" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[460px] bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-full p-5 flex flex-col justify-between">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  </div>
                </div>
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
    <section className="py-2 px-6 relative overflow-hidden">
      {/* Static Background Elements - Performance Optimized */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl opacity-70" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">

        {/* Unified Header & Controls Layout */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-4 mb-4">

          {/* Left: Heading & Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <FaBuilding size={12} /> Featured
              </span>
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800 max-w-[100px]"></span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
              Meet Your Local <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Property Experts</span>
            </h2>
          </motion.div>

          {/* Right: Navigation Buttons (Desktop) */}
          {agents.length > itemsPerPage && (
            <div className="hidden md:flex gap-2">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Previous agents"
              >
                <FaChevronLeft size={14} />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Next agents"
              >
                <FaChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Carousel */}
        <div className="relative -mx-4 md:mx-0">
          <div className="overflow-hidden px-4 py-2" ref={carouselRef}>
            <motion.div
              className="flex"
              animate={{ x: `-${currentIndex * (100 / itemsPerPage)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {agents.map((agent) => (
                <div key={agent._id} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 p-2 md:p-3">
                  <div className="h-[480px]"> {/* Fixed height container constraint */}
                    <AgentCarouselCard agent={agent} />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Mobile Navigation & View All */}
        <div className="mt-4 flex items-center justify-between md:justify-center border-t border-gray-100 dark:border-gray-800 pt-4">
          {/* Mobile Nav */}
          {agents.length > itemsPerPage && (
            <div className="flex md:hidden gap-2">
              <button onClick={handlePrev} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"><FaChevronLeft size={14} /></button>
              <div className="flex gap-1.5 items-center px-2">
                {Array.from({ length: Math.min(5, Math.ceil(agents.length / itemsPerPage)) }).map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentIndex % Math.ceil(agents.length / itemsPerPage) ? 'w-6 bg-blue-600' : 'w-1.5 bg-gray-300 dark:bg-gray-700'}`} />
                ))}
              </div>
              <button onClick={handleNext} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"><FaChevronRight size={14} /></button>
            </div>
          )}

          <Link
            to="/agents"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition"
          >
            View All Agents <FaArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopAgents;