import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Truck, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

// ✅ FIX: Use relative path '/api'.
// Ensure your vite.config.js or package.json has a proxy set up for development:
// "proxy": { "/api": "http://localhost:5000" }
const apiClient = axios.create({
  baseURL: '/api', 
  withCredentials: true
});

const HouseHuntRequest = () => {
  const [activeTab, setActiveTab] = useState('property'); // property | service
  const [recentLeads, setRecentLeads] = useState([]); // Initialize as empty array
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

  // Fetch Recent Requests for Ticker
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await apiClient.get('/leads/recent');
        
        // ✅ DEFENSIVE CHECK: Ensure data is actually an array before setting state
        if (Array.isArray(response.data)) {
          setRecentLeads(response.data);
        } else {
          console.warn("API /leads/recent did not return an array. Response:", response.data);
          setRecentLeads([]); 
        }
      } catch (err) {
        console.error("Failed to fetch recent leads.", err);
        setRecentLeads([]); 
      }
    };

    fetchRecent();
    
    // Poll every 30 seconds to update ticker
    const interval = setInterval(fetchRecent, 30000);
    return () => clearInterval(interval);
  }, []);

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
      setSuccessMsg('Request Sent! An agent will contact you shortly.');
      setFormData({ name: '', phone: '', email: '', category: 'Property', details: '' });
      
      // Refresh ticker immediately to show self (optimistic UI update)
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

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-10">
        
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* --- LEFT: THE FORM --- */}
          <div className="w-full lg:w-1/2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 z-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Tell us what you need
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Can't find what you're looking for? Request it here and we'll do the legwork.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6">
              <button
                onClick={() => { setActiveTab('property'); setFormData({...formData, category: 'Property'}); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'property' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Home size={18} /> Find Property
              </button>
              <button
                onClick={() => { setActiveTab('service'); setFormData({...formData, category: 'Movers'}); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'service' 
                    ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Truck size={18} /> Local Services
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'service' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Service Type</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  >
                    <option value="Movers">Movers & Relocation</option>
                    <option value="Cleaning">Cleaning Services</option>
                    <option value="Internet">Internet / WiFi Installation</option>
                    <option value="Interior Design">Interior Design</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  />
                </div>
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                />
              </div>

              <div>
                <textarea
                  placeholder={activeTab === 'property' 
                    ? "Describe the property (e.g. 2 Bedroom in Kilimani, Budget 50k...)" 
                    : "Describe what you need (e.g. Moving from Westlands to Kileleshwa on Saturday...)"
                  }
                  required
                  rows="3"
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white resize-none"
                ></textarea>
              </div>

              {successMsg && (
                <div className="p-3 bg-green-100 text-green-700 text-sm rounded-lg flex items-center gap-2">
                  <CheckCircle size={18} /> {successMsg}
                </div>
              )}
              
              {errorMsg && (
                <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-bold transition-all shadow-md ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-1'
                }`}
              >
                {loading ? 'Sending...' : 'Submit Request'}
              </button>
            </form>
          </div>

          {/* --- RIGHT: RECENT ACTIVITY TICKER --- */}
          <div className="w-full lg:w-1/2 lg:pt-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                Live Requests
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                See what others are looking for right now.
              </p>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-hidden relative">
              {/* Gradient Mask for scroll effect */}
              <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-white dark:from-gray-900 to-transparent z-10"></div>
              <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-10"></div>

              {(!Array.isArray(recentLeads) || recentLeads.length === 0) ? (
                <div className="text-gray-400 text-center italic py-10">
                  {loading ? 'Loading recent activity...' : 'No recent activity yet. Be the first!'}
                </div>
              ) : (
                <motion.div 
                  // Simple vertical ticker animation
                  animate={{ y: [0, -20 * recentLeads.length] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: Math.max(10, recentLeads.length * 4), 
                    ease: "linear",
                    repeatType: "reverse" 
                  }}
                  className="space-y-4"
                >
                   {recentLeads.map((lead, index) => (
                    <motion.div
                      key={`${lead._id || index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 ${
                        ['Property'].includes(lead.category) ? 'bg-blue-500' : 'bg-orange-500'
                      }`}>
                        {lead.name && lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium text-sm">
                          <span className="font-bold">{lead.name}</span> requested {lead.category === 'Property' ? 'a Property' : 'a Service'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {lead.category === 'Property' ? <Home size={12} /> : <Truck size={12} />} {lead.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> 
                            {lead.createdAt && !isNaN(new Date(lead.createdAt)) 
                              ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true }) 
                              : 'Just now'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
            
            {/* CTA Text */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <ArrowRight size={16} /> Join <strong>{(Array.isArray(recentLeads) && recentLeads.length > 0) ? recentLeads.length + 120 : '120+'}</strong> Kenyans who found help this week.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HouseHuntRequest;