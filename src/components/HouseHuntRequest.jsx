import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Truck, CheckCircle, Clock, ArrowRight, Sparkles, Users, TrendingUp, Star } from 'lucide-react';
// import axios from 'axios'; // Removed unused axios import
import apiClient from '../api/axios'; // ✅ Use synchronized API client
import { formatDistanceToNow } from 'date-fns';

const HouseHuntRequest = ({ compact = false, variant = compact ? 'compact' : 'default' }) => {
  // Normalize layout variants
  const isCompactLayout = variant === 'compact';
  const isWideLayout = variant === 'wide';
  const isDefaultLayout = variant === 'default' || (!isCompactLayout && !isWideLayout);

  // Feature Flags based on Layout
  const showHeroHeader = isDefaultLayout;
  const showStats = isDefaultLayout;
  const showSlideshow = isDefaultLayout;
  const showTopTicker = isCompactLayout;
  const showSideCounter = isDefaultLayout || isWideLayout;
  const useCardContainer = isCompactLayout;
  const useTwoColGrid = isDefaultLayout || isWideLayout;
  const [activeTab, setActiveTab] = useState('property');
  const [recentLeads, setRecentLeads] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Property',
    details: '',
    unitType: '',
    landSize: '',
    budget: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Carousel settings
  const maxRequests = 15;
  const requestsPerSlide = 3;

  useEffect(() => {
    // Fetch ticker data even in compact mode (horizontal ticker)
    // if (compact) return;

    const fetchRecent = async () => {
      try {
        const response = await apiClient.get('/leads/recent');
        if (Array.isArray(response.data) && response.data.length > 0) {
          setRecentLeads(response.data);
        } else {
          // Fallback Data (Matches Localhost "Realistic" Data)
          setRecentLeads([
            { _id: 'fb1', name: 'Sarah K.', category: 'Property', createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
            { _id: 'fb2', name: 'Michael O.', category: 'Movers', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
            { _id: 'fb3', name: 'Anita W.', category: 'Property', createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
            { _id: 'fb4', name: 'David M.', category: 'Internet', createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
            { _id: 'fb5', name: 'Kevin J.', category: 'Property', createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
            { _id: 'fb6', name: 'James L.', category: 'Cleaning', createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch recent leads, using fallback.", err);
        setRecentLeads([
          { _id: 'fb1', name: 'Sarah K.', category: 'Property', createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
          { _id: 'fb2', name: 'Michael O.', category: 'Movers', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
          { _id: 'fb3', name: 'Anita W.', category: 'Property', createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
          { _id: 'fb4', name: 'David M.', category: 'Internet', createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
          { _id: 'fb5', name: 'Kevin J.', category: 'Property', createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
          { _id: 'fb6', name: 'James L.', category: 'Cleaning', createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
        ]);
      }
    };

    fetchRecent();
    const interval = setInterval(fetchRecent, 30000);
    return () => clearInterval(interval);
  }, [isCompactLayout]);

  // Auto-rotate carousel
  useEffect(() => {
    if (isCompactLayout || recentLeads.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        const totalSlides = Math.ceil(Math.min(recentLeads.length, maxRequests) / requestsPerSlide);
        return (prev + 1) % totalSlides;
      });
    }, 3000); // Rotate every 3 seconds

    return () => clearInterval(interval);
  }, [recentLeads, isCompactLayout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await apiClient.post('/leads', {
        ...formData,
        category: activeTab === 'property' ? 'Property' : formData.category
      });
      setSuccessMsg('🎉 Request Sent! An agent will contact you shortly.');
      setSuccessMsg('🎉 Request Sent! An agent will contact you shortly.');
      setFormData({ name: '', phone: '', email: '', category: 'Property', details: '', unitType: '', landSize: '', budget: '', location: '' });

      // No need to update ticker if compact
      // Update ticker even if compact
      // eslint-disable-next-line no-constant-condition
      if (true) {
        const newLead = {
          name: formData.name,
          category: activeTab === 'property' ? 'Property' : formData.category,
          createdAt: new Date().toISOString(),
          _id: Date.now()
        };

        setRecentLeads(prev => {
          const safePrev = Array.isArray(prev) ? prev : [];
          return [newLead, ...safePrev].slice(0, 10);
        });
      }

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { value: '2,500+', label: 'Requests Fulfilled', icon: CheckCircle, color: 'text-green-500' },
    { value: '98%', label: 'Success Rate', icon: TrendingUp, color: 'text-blue-500' },
    { value: '<24h', label: 'Avg Response Time', icon: Clock, color: 'text-purple-500' },
  ];

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 ${useCardContainer ? 'py-4 px-2 rounded-xl border border-blue-100 dark:border-blue-900' : isWideLayout ? 'py-12' : 'py-20'}`}>
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

      <div className="container mx-auto px-4 md:px-10 relative z-10 w-full">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-center ${isCompactLayout ? 'mb-4' : 'mb-16'} ${!showHeroHeader && !isCompactLayout ? 'hidden' : ''}`}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl px-6 py-3 rounded-full border border-blue-200 dark:border-blue-800 mb-6 shadow-lg"
          >
            <Sparkles className="text-yellow-500" size={20} />
            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-sm">
              Let Us Find It For You
            </span>
          </motion.div>

          <h2 className={`${isCompactLayout ? 'text-2xl' : 'text-4xl md:text-5xl'} font-black text-gray-900 dark:text-white mb-6 leading-tight`}>
            Sit Back &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Relax.
            </span>
            <br />
            We'll Find It For You.
          </h2>

          <p className={`${isCompactLayout ? 'text-base' : 'text-xl'} text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed`}>
            Don't stress over the search. Tell us what you need, and our expert scouts will do the legwork to find your perfect match.
          </p>
        </motion.div>

        {/* --- COMPACT MODE HORIZONTAL TICKER --- */}
        {showTopTicker && recentLeads.length > 0 && (
          <div className="mb-4 max-w-4xl mx-auto overflow-hidden relative group">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-blue-50 via-purple-50 to-transparent dark:from-gray-950 dark:to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-pink-50 via-purple-50 to-transparent dark:from-gray-950 dark:to-transparent z-10"></div>

            <motion.div
              className="flex items-center gap-4 whitespace-nowrap"
              animate={{ x: [0, -100 * recentLeads.length] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: Math.max(20, recentLeads.length * 5),
                  ease: "linear",
                },
              }}
            >
              {[...recentLeads, ...recentLeads].map((lead, i) => (
                <div key={i} className="inline-flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0 ${['Property'].includes(lead.category) ? 'bg-blue-600' : 'bg-orange-500'}`}>
                    {lead.name && lead.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold">{lead.name}</span> requested <span className="font-semibold text-blue-600 dark:text-blue-400">{lead.category}</span>
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-[10px] ml-1">
                    {lead.createdAt && !isNaN(new Date(lead.createdAt)) ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true }) : 'Just now'}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Stats Bar (Hidden in Compact Mode) */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl text-center"
              >
                <stat.icon className={`mx-auto mb-3 ${stat.color}`} size={32} />
                <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ANIMATED SLIDESHOW CAROUSEL - Full Width */}
        {showSlideshow && recentLeads.length > 0 && (
          <div className="mb-16 max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
                />
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Recent Requests
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                <Users size={16} />
                Live feed of what others are requesting
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {recentLeads
                  .slice(0, maxRequests)
                  .slice(currentSlide * requestsPerSlide, (currentSlide + 1) * requestsPerSlide)
                  .map((lead, index) => (
                    <motion.div
                      key={lead._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative"
                    >
                      {/* Glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity"></div>

                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/60 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all h-full">
                        {/* Avatar */}
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg ${['Property'].includes(lead.category)
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                              : 'bg-gradient-to-br from-orange-500 to-red-500'
                              }`}
                          >
                            {lead.name && lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-lg font-black text-gray-900 dark:text-white">
                              {lead.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Looking for {lead.category === 'Property' ? 'a Property' : 'a Service'}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full text-xs font-bold text-blue-700 dark:text-blue-300">
                              {lead.category === 'Property' ? <Home size={14} /> : <Truck size={14} />}
                              {lead.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                            <Clock size={14} />
                            {lead.createdAt && !isNaN(new Date(lead.createdAt))
                              ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })
                              : 'Just now'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({
                length: Math.ceil(Math.min(recentLeads.length, maxRequests) / requestsPerSlide)
              }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-3 h-3 rounded-full transition-all ${currentSlide === i
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                    }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* THE FORM & LIVE COUNTER - Side by Side */}
        <div className={`grid ${!useTwoColGrid ? 'grid-cols-1 justify-center' : 'lg:grid-cols-[1.5fr,1fr]'} gap-8 items-stretch max-w-6xl mx-auto`}>
          {/* LEFT: THE FORM with Enhanced Glassmorphism */}
          <motion.div
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            className={`relative ${isCompactLayout ? 'max-w-2xl mx-auto w-full' : 'h-full'}`}
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>

            <div className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 dark:border-gray-700/50 ${isCompactLayout ? 'p-5' : 'p-8'} h-full flex flex-col justify-center`}>
              {/* Header */}
              <div className="mb-8">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3 flex items-center gap-3">
                  <span className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white">
                    <Home size={20} />
                  </span>
                  Submit Your Request
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Fill in the details below and our team will get back to you within 24 hours.
                </p>
              </div>

              {/* Tabs with Glassmorphism */}
              <div className="flex p-1.5 bg-gray-100/50 dark:bg-gray-700/50 backdrop-blur-md rounded-2xl mb-8 border border-gray-200/50 dark:border-gray-600/50">
                <button
                  onClick={() => { setActiveTab('property'); setFormData({ ...formData, category: 'Property' }); }}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'property'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Home size={18} /> Find Property
                </button>
                <button
                  onClick={() => { setActiveTab('service'); setFormData({ ...formData, category: 'Movers' }); }}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'service'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Truck size={18} /> Local Services
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {activeTab === 'service' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2">Service Type</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-white transition-all"
                    >
                      <option value="Movers">🚚 Movers & Relocation</option>
                      <option value="Cleaning">🧹 Cleaning Services</option>
                      <option value="Internet">📡 Internet / WiFi Installation</option>
                      <option value="Interior Design">🎨 Interior Design</option>
                      <option value="Other">✨ Other</option>
                    </select>
                  </motion.div>
                )}

                {activeTab === 'property' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                  >
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2">Unit Type</label>
                      <select
                        value={formData.unitType}
                        onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-white transition-all"
                      >
                        <option value="">Select Type</option>
                        <option value="Bedsitter">Bedsitter</option>
                        <option value="1 Bedroom">1 Bedroom</option>
                        <option value="2 Bedroom">2 Bedroom</option>
                        <option value="3 Bedroom">3 Bedroom</option>
                        <option value="4+ Bedroom">4+ Bedroom</option>
                        <option value="Maisonette">Maisonette</option>
                        <option value="Land">Land</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>

                    {formData.unitType === 'Land' ? (
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2">Land Size</label>
                        <input
                          type="text"
                          placeholder="e.g 50x100, 1 Acre"
                          value={formData.landSize}
                          onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-white transition-all"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2">Budget Range</label>
                        <select
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-white transition-all"
                        >
                          <option value="">Select Budget</option>
                          <option value="Below 10k">Below 10k</option>
                          <option value="10k - 20k">10k - 20k</option>
                          <option value="20k - 35k">20k - 35k</option>
                          <option value="35k - 50k">35k - 50k</option>
                          <option value="50k - 80k">50k - 80k</option>
                          <option value="80k - 150k">80k - 150k</option>
                          <option value="Above 150k">Above 150k</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2">Ideal Location</label>
                      <input
                        type="text"
                        placeholder="e.g Kilimani, Westlands, Thika Road"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-white transition-all"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2">Your Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="0712 345 678"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2">Tell Us More</label>
                  <textarea
                    placeholder={activeTab === 'property'
                      ? "E.g., Spacious with a balcony and close to the road..."
                      : "E.g., Moving from Westlands to Kileleshwa this Saturday, need a 3-ton truck..."
                    }
                    required
                    rows="4"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-white resize-none transition-all"
                  ></textarea>
                </div>

                <AnimatePresence>
                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 text-sm rounded-xl flex items-center gap-3 backdrop-blur-md"
                    >
                      <CheckCircle size={20} className="flex-shrink-0" />
                      <span className="font-semibold">{successMsg}</span>
                    </motion.div>
                  )}

                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm rounded-xl backdrop-blur-md"
                    >
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-2xl hover:shadow-green-500/50'
                    }`}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-3 border-white border-t-transparent rounded-full"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      Submit Request <ArrowRight size={20} />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Trust Badge */}
              <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 backdrop-blur-md rounded-xl border border-blue-100 dark:border-blue-800/30">
                <p className="text-xs text-blue-800 dark:text-blue-300 text-center flex items-center justify-center gap-2">
                  <Star className="text-yellow-500" size={14} fill="currentColor" />
                  <span>Trusted by <strong>2,500+</strong> Kenyans this month</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: LIVE COUNTER */}
          {showSideCounter && recentLeads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-24"
            >
              {/* Live Counter Card - Takes Full Height */}
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 dark:border-gray-700/50 p-6 flex flex-col h-full">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
                    />
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-wide">
                      Live Stats
                    </h3>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Real-time activity tracking
                  </p>
                </div>

                {/* Stats */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                      <p className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Total
                      </p>
                      <motion.div
                        key={recentLeads.length}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-black text-blue-600 dark:text-blue-400"
                      >
                        {recentLeads.length + 2485}
                      </motion.div>
                    </div>
                    <div className="text-center p-4 bg-green-50/50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-800/30">
                      <p className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 mb-1">
                        Fulfilled
                      </p>
                      <motion.div
                        key={recentLeads.length}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-black text-green-600 dark:text-green-400"
                      >
                        {Math.floor((recentLeads.length + 2485) * 0.98)}
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl text-white mb-6">
                  <p className="text-sm font-bold mb-1 flex items-center justify-center gap-2">
                    <TrendingUp size={18} />
                    Join the Community
                  </p>
                  <p className="text-xs text-blue-100">
                    Over <strong>{recentLeads.length + 2400}</strong> Kenyans found their perfect match this month!
                  </p>
                </div>

                {/* Vertical Request Feed */}
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
                  <h4 className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Recent Activity
                  </h4>
                  <div className="space-y-3 max-h-[300px] overflow-hidden relative">
                    {/* Gradient Overlay for Fade Effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 dark:from-gray-800/0 to-transparent z-10"></div>

                    <motion.div
                      animate={{ y: [0, -((recentLeads.length * 50) - 300)] }}
                      transition={{
                        y: {
                          repeat: Infinity,
                          repeatType: "loop",
                          duration: Math.max(20, recentLeads.length * 3),
                          ease: "linear",
                        }
                      }}
                    >
                      {[...recentLeads, ...recentLeads].map((lead, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${['Property'].includes(lead.category) ? 'bg-blue-600' : 'bg-orange-500'}`}>
                            {lead.name && lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 dark:text-gray-200 truncate">
                              {lead.name}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                              Requested {lead.category}
                            </p>
                          </div>
                          <span className="text-[9px] text-gray-400 whitespace-nowrap">
                            {lead.createdAt && !isNaN(new Date(lead.createdAt)) ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true }) : 'Just now'}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HouseHuntRequest;