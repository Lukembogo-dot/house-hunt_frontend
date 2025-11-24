import React from 'react';
import { motion } from 'framer-motion';

// --- Inline SVG Icons ---
const IconBriefcase = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconTruck = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const IconWifi = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
  </svg>
);

const IconBroom = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const IconTools = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconPaint = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const IconSearch = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const categories = [
  { id: 'all', label: 'All Services', icon: <IconBriefcase className="w-4 h-4" /> },
  { id: 'movers', label: 'Movers', icon: <IconTruck className="w-4 h-4" /> },
  { id: 'internet', label: 'Internet (ISP)', icon: <IconWifi className="w-4 h-4" /> },
  { id: 'cleaning', label: 'Cleaning', icon: <IconBroom className="w-4 h-4" /> },
  { id: 'plumbing', label: 'Plumbing', icon: <IconTools className="w-4 h-4" /> },
  { id: 'painting', label: 'Painting', icon: <IconPaint className="w-4 h-4" /> },
];

const ServicesHero = ({ activeCategory, onCategoryChange, searchQuery, onSearchChange }) => {
  return (
    <section className="relative pt-32 pb-16 px-6 bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
        >
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Services Directory</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          Connect with trusted professionals verified by the HouseHunt community. 
          From movers to internet providers, find what you need.
        </motion.p>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto mb-12 relative"
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <IconSearch className="w-5 h-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for 'movers in Kilimani'..."
            className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/20 transition shadow-xl"
          />
        </motion.div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat, index) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.05) }}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border ${
                activeCategory === cat.id 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105' 
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              {cat.icon} {cat.label}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesHero;