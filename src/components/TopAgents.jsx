// frontend/src/components/TopAgents.jsx
import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/axios';
import { Link } from 'react-router-dom';
import {
  FaStar, FaBuilding, FaArrowRight, FaHome, FaCheckCircle,
  FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaPhone,
  FaWhatsapp, FaEnvelope, FaAward
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// --- AGENT CAROUSEL CARD ---
const AgentCarouselCard = ({ agent }) => {
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    const fetchAgentProperties = async () => {
      try {
        setLoadingProperties(true);
        const { data } = await apiClient.get(`/properties/by-agent/${agent._id}`);
        setProperties(Array.isArray(data) ? data.slice(0, 3) : []); // Top 3 properties
      } catch (error) {
        console.error('Failed to fetch agent properties', error);
        setProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchAgentProperties();
  }, [agent._id]);

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

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
const TopAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

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

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, agents.length - 3) : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= agents.length - 3 ? 0 : prev + 1));
  };

  // Auto-scroll carousel
  useEffect(() => {
    if (agents.length > 3) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev >= agents.length - 3 ? 0 : prev + 1));
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [agents.length]);

  if (loading) {
    return (
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block animate-pulse mb-4">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                Loading Experts...
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[520px] bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-full p-6 flex flex-col justify-between">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
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
    <section className="py-20 px-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl px-6 py-3 rounded-full border border-blue-200 dark:border-blue-800 mb-6 shadow-lg"
          >
            <FaBuilding className="text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-sm">
              Featured Professionals
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            Meet Your Local{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Property Experts
            </span>
          </h2>

          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
            Connect with verified agents who have the experience and local knowledge to help you find your perfect home.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {agents.length > 3 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
              >
                <FaChevronLeft />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
              >
                <FaChevronRight />
              </motion.button>
            </>
          )}

          {/* Carousel Container */}
          <div className="overflow-hidden" ref={carouselRef}>
            <motion.div
              className="flex gap-8"
              animate={{ x: `-${currentIndex * (100 / 3)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {agents.map((agent) => (
                <div key={agent._id} className="min-w-[calc(100%-2rem)] md:min-w-[calc(50%-1rem)] lg:min-w-[calc(33.333%-1.5rem)]">
                  <AgentCarouselCard agent={agent} />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Carousel Indicators */}
          {agents.length > 3 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.max(1, agents.length - 2) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${index === currentIndex
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 dark:bg-gray-700 w-2 hover:bg-blue-400'
                    }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
            Looking for more expert guidance?
          </p>
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Browse All Agents <FaArrowRight />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TopAgents;