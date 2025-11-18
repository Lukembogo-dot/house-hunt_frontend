import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBullhorn, FaChartLine } from 'react-icons/fa';

const SmartOwnerBanner = ({ location, avgPrice, listingType }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !location) return null;

  // Format the location (e.g., "kilimani" -> "Kilimani")
  const locName = location.charAt(0).toUpperCase() + location.slice(1);
  const priceText = avgPrice ? `KES ${avgPrice.toLocaleString()}` : 'high rates';
  
  // Dynamic Motivation Text
  const motivationText = listingType === 'rent' 
    ? `Landlords in ${locName} are earning avg ${priceText}/mo.`
    : `Properties in ${locName} are selling fast around ${priceText}.`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-gradient-to-r from-blue-900 to-blue-700 text-white relative overflow-hidden shadow-lg mb-8 rounded-lg"
        >
          <div className="container mx-auto px-4 py-4 md:py-3 flex flex-col md:flex-row items-center justify-between relative z-10">
            
            {/* Text Section */}
            <div className="flex items-center gap-3 mb-3 md:mb-0">
              <div className="bg-white/20 p-2 rounded-full animate-pulse">
                <FaChartLine className="text-yellow-300" />
              </div>
              <div className="text-center md:text-left">
                <p className="font-bold text-sm md:text-base">
                  Own a property in <span className="text-yellow-300">{locName}</span>?
                </p>
                <p className="text-xs md:text-sm text-blue-100">
                  {motivationText} We have tenants waiting!
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-4">
              <Link
                to="/for-agents"
                className="bg-yellow-400 text-blue-900 px-5 py-2 rounded-full font-bold text-sm hover:bg-yellow-300 transition transform hover:scale-105 shadow-md whitespace-nowrap"
              >
                List in {locName} for Free
              </Link>
              
              {/* Close Button */}
              <button 
                onClick={() => setIsVisible(false)}
                className="text-blue-200 hover:text-white p-1"
                aria-label="Close banner"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Background Decorative Circles */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-white/5 rounded-full -translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 translate-y-10"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartOwnerBanner;