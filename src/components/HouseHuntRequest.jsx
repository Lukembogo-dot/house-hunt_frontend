import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Truck, CheckCircle, Clock, ArrowRight, Sparkles, Users, TrendingUp, Star } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true
});

const HouseHuntRequest = ({ compact = false }) => {
  const [activeTab, setActiveTab] = useState('property');
  const [recentLeads, setRecentLeads] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Property',
    details: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Fetch ticker data even in compact mode (horizontal ticker)
    // if (compact) return;

    const fetchRecent = async () => {
      try {
        const response = await apiClient.get('/leads/recent');
        if (Array.isArray(response.data)) {
          setRecentLeads(response.data);
        } else {
          setRecentLeads([]);
        }
      } catch (err) {
        console.error("Failed to fetch recent leads.", err);
        setRecentLeads([]);
      }
    };

    fetchRecent();
    const interval = setInterval(fetchRecent, 30000);
    return () => clearInterval(interval);
  }, [compact]);

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
      setFormData({ name: '', phone: '', email: '', category: 'Property', details: '' });

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
    <section className={`relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 ${compact ? 'py-4 px-2 rounded-xl border border-blue-100 dark:border-blue-900' : 'py-20'}`}>
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
          className={`text-center ${compact ? 'mb-4' : 'mb-16'}`}
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

          <h2 className={`${compact ? 'text-2xl' : 'text-4xl md:text-5xl'} font-black text-gray-900 dark:text-white mb-6 leading-tight`}>
            Sit Back &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Relax.
            </span>
            <br />
            We'll Find It For You.
          </h2>

          <p className={`${compact ? 'text-base' : 'text-xl'} text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed`}>
            Don't stress over the search. Tell us what you need, and our expert scouts will do the legwork to find your perfect match.
          </p>
        </motion.div>

        {/* --- COMPACT MODE HORIZONTAL TICKER --- */}
        {compact && recentLeads.length > 0 && (
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
        {!compact && (
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

        <div className={`grid ${compact ? 'grid-cols-1 justify-center' : 'lg:grid-cols-2'} gap-8 items-start`}>

          {/* LEFT: THE FORM with Enhanced Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, x: compact ? 0 : -30, y: compact ? 20 : 0 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            className={`relative ${compact ? 'max-w-2xl mx-auto w-full' : ''}`}
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>

            <div className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 dark:border-gray-700/50 ${compact ? 'p-5' : 'p-8'}`}>
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
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-2">Tell Us What You Need</label>
                  <textarea
                    placeholder={activeTab === 'property'
                      ? "E.g., 2 Bedroom apartment in Kilimani, Budget 50k/month, near school..."
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
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-2xl hover:shadow-purple-500/50'
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

          {/* RIGHT: LIVE ACTIVITY with Enhanced Design */}
          {!compact && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-24"
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
                  />
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    Live Activity Feed
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Users size={16} />
                  See what others are requesting right now
                </p>
              </div>

              {/* Activity Feed */}
              <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/60 dark:border-gray-700/50 max-h-[500px] overflow-hidden">
                {/* Gradient Masks */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/90 dark:from-gray-800/90 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/90 dark:from-gray-800/90 to-transparent z-10 pointer-events-none"></div>

                <div className="space-y-3 max-h-[450px] overflow-y-auto scrollbar-hide">
                  {(!Array.isArray(recentLeads) || recentLeads.length === 0) ? (
                    <div className="text-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
                      />
                      <p className="text-gray-400 dark:text-gray-500 italic">
                        Loading recent activity...
                      </p>
                    </div>
                  ) : (
                    recentLeads.map((lead, index) => (
                      <motion.div
                        key={`${lead._id || index}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative"
                      >
                        {/* Glow on hover */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>

                        <div className="relative flex items-start gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-xl transition-all">
                          {/* Avatar */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg ${['Property'].includes(lead.category)
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                            : 'bg-gradient-to-br from-orange-500 to-red-500'
                            }`}>
                            {lead.name && lead.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 dark:text-white font-semibold text-sm mb-2">
                              <span className="font-black">{lead.name}</span> requested {lead.category === 'Property' ? 'a Property' : 'a Service'}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {lead.category === 'Property' ? <Home size={12} /> : <Truck size={12} />}
                                {lead.category}
                              </span>
                              <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                <Clock size={12} />
                                {lead.createdAt && !isNaN(new Date(lead.createdAt))
                                  ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })
                                  : 'Just now'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* CTA Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-6 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl text-white"
              >
                <p className="text-lg font-bold mb-2 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Join the Community
                </p>
                <p className="text-blue-100 text-sm">
                  Over <strong>{(Array.isArray(recentLeads) && recentLeads.length > 0) ? recentLeads.length + 2400 : '2,500+'}</strong> Kenyans found their perfect match through our request system this month!
                </p>
              </motion.div>

            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HouseHuntRequest;