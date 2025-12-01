import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaWater, FaWifi, FaBus, FaShieldAlt, FaStar, 
  FaMapMarkerAlt, FaInfoCircle, FaArrowRight, FaCity,
  FaBed, FaTag, FaTimes, FaCheckCircle, FaExclamationTriangle,
  FaRoad, FaMoon, FaShoppingBasket, FaVolumeUp
} from 'react-icons/fa';

// --- SHARED HELPER: Status Colors ---
const getStatusColors = (type, value) => {
  if (!value) return 'text-gray-500 bg-gray-50 border-gray-100';

  if (type === 'water') {
    if (value.includes('24/7')) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (value.includes('Rationed')) return 'text-orange-600 bg-orange-50 border-orange-100';
    return 'text-red-600 bg-red-50 border-red-100'; 
  }
  if (type === 'security') {
    const rating = Number(value);
    if (rating >= 4) return 'text-green-600 bg-green-50 border-green-100';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    return 'text-red-600 bg-red-50 border-red-100';
  }
  if (type === 'opinion') {
    if (value === 'Affordable') return 'text-green-600 bg-green-50 border-green-100';
    if (value === 'Fair Value') return 'text-blue-600 bg-blue-50 border-blue-100';
    if (value === 'Overpriced') return 'text-red-600 bg-red-50 border-red-100';
  }
  return 'text-gray-600 bg-gray-50 border-gray-100';
};

const MtaaFlipCard = ({ property }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to render stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={`text-xs ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`} />
    ));
  };

  return (
    <>
      {/* === 1. COMPACT CARD (Grid View) === */}
      <motion.div 
        layoutId={`card-${property.id}`}
        onClick={() => setIsOpen(true)}
        className="relative w-full h-96 cursor-pointer group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
      >
        {/* Header Image/Gradient */}
        <div className={`h-48 w-full relative bg-gradient-to-br ${property.gradient} flex items-center justify-center overflow-hidden`}>
          {property.image ? (
              <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
          ) : (
              <FaCity className="absolute text-white opacity-10 text-[10rem] -bottom-6 -right-6 rotate-12" />
          )}
          
          {!property.image && (
              <div className="z-10 text-center px-4">
                  <h3 className="text-2xl font-black text-white drop-shadow-md uppercase tracking-tight leading-none">
                      {property.title}
                  </h3>
                  <div className="w-12 h-1 bg-white/50 mx-auto mt-2 rounded-full"></div>
              </div>
          )}

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/30">
            <FaStar className="text-yellow-300 text-sm" />
            <span className="text-sm font-bold text-white">{property.rating}</span>
          </div>

          <div className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1 border border-white/10 group-hover:bg-black/60 transition">
              <FaInfoCircle /> Tap for Full Report
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-center">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-1 truncate">
              {property.title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center gap-2 mb-4 uppercase tracking-wide">
            <FaMapMarkerAlt className="text-red-500" /> {property.location}
          </p>
          
          {/* Opinion Tag on Front */}
          <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getStatusColors('opinion', property.rentOpinion)}`}>
                  {property.rentOpinion}
              </span>
              <span className="text-xs text-gray-500">for {property.unitType}</span>
          </div>

          <div className="flex flex-wrap gap-2">
              {property.badges.map((b, i) => (
                <span key={i} className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-800">
                  {b}
                </span>
              ))}
          </div>
        </div>
      </motion.div>

      {/* === 2. EXPANDED MODAL (Detailed View) === */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div 
              layoutId={`card-${property.id}`}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className={`relative h-40 bg-gradient-to-br ${property.gradient} flex items-center justify-center`}>
                 <button 
                   onClick={() => setIsOpen(false)}
                   className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition z-20"
                 >
                   <FaTimes />
                 </button>
                 <FaCity className="absolute text-white opacity-10 text-[12rem] -bottom-10 -left-10 rotate-12" />
                 <div className="text-center z-10">
                    <h2 className="text-3xl font-black text-white drop-shadow-md">{property.title}</h2>
                    <p className="text-white/80 font-bold flex items-center justify-center gap-2 mt-1">
                       <FaMapMarkerAlt /> {property.location}
                    </p>
                 </div>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto">
                 
                 {/* Top Stats */}
                 <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl border border-blue-100 dark:border-blue-800">
                          {property.rating}
                       </div>
                       <div>
                          <p className="text-xs uppercase font-bold text-gray-400">Overall Rating</p>
                          <div className="flex text-yellow-400 text-sm">
                             {renderStars(Math.round(property.rating))}
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className={`text-sm font-bold px-3 py-1 rounded-full border ${getStatusColors('opinion', property.rentOpinion)}`}>
                          {property.rentOpinion}
                       </span>
                       <p className="text-xs text-gray-400 mt-1">Unit: {property.unitType}</p>
                    </div>
                 </div>

                 {/* Detailed Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Water Detail */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                       <h4 className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300 mb-2">
                          <FaWater /> Water Consistency
                       </h4>
                       <p className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                          {property.mtaaScore.water}
                       </p>
                       <p className="text-xs text-gray-500 dark:text-gray-400">
                          {property.mtaaScore.water.includes('24/7') 
                             ? "Reliable council water reported by tenants." 
                             : "Tenants report rationing. Check for backup tanks."}
                       </p>
                    </div>

                    {/* Internet Detail */}
                    <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                       <h4 className="flex items-center gap-2 font-bold text-purple-800 dark:text-purple-300 mb-2">
                          <FaWifi /> Internet Provider
                       </h4>
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                                {property.mtaaScore.internet}
                             </p>
                             <div className="flex gap-1 text-purple-400 text-xs">
                                {renderStars(property.mtaaScore.internetReliability || 4)} 
                             </div>
                          </div>
                          <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded font-bold">Fast</span>
                       </div>
                    </div>

                    {/* Security Detail (Expanded) */}
                    <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800 md:col-span-2">
                       <div className="flex justify-between items-start mb-3">
                          <h4 className="flex items-center gap-2 font-bold text-green-800 dark:text-green-300">
                             <FaShieldAlt /> Security & Safety
                          </h4>
                          <div className="text-right">
                             <span className="text-xl font-bold text-green-700 dark:text-green-400 block">{property.mtaaScore.security}/5.0</span>
                             <span className="text-[10px] text-gray-500 bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 flex items-center gap-1">
                               <FaMoon className="text-blue-400"/> {property.mtaaScore.safeAtNight || 'Safe'}
                             </span>
                          </div>
                       </div>
                       
                       {/* Feature List */}
                       <div className="flex flex-wrap gap-2">
                          {(property.mtaaScore.securityFeatures && property.mtaaScore.securityFeatures.length > 0) ? (
                             property.mtaaScore.securityFeatures.map((feat, i) => (
                               <span key={i} className="flex items-center gap-1 text-xs font-bold bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                                  <FaCheckCircle className="text-green-500" /> {feat}
                               </span>
                             ))
                          ) : (
                             <span className="text-xs text-gray-400 italic">No specific features reported.</span>
                          )}
                       </div>
                    </div>

                    {/* Transport Detail (Expanded) */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 md:col-span-2">
                       <div className="flex justify-between items-center mb-4">
                          <h4 className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300">
                             <FaBus /> Transport & Roads
                          </h4>
                          <span className="flex items-center gap-1 text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                             <FaRoad /> {property.mtaaScore.roadCondition || 'Tarmac'}
                          </span>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600 text-center">
                             <p className="text-[10px] uppercase font-bold text-gray-400">Peak Fare</p>
                             <p className="text-lg font-black text-gray-800 dark:text-white">
                                {property.mtaaScore.fare} <span className="text-xs font-normal text-gray-500">KES</span>
                             </p>
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600 text-center">
                             <p className="text-[10px] uppercase font-bold text-gray-400">Off-Peak</p>
                             <p className="text-lg font-black text-green-600 dark:text-green-400">
                                {property.mtaaScore.fareOffPeak || '--'} <span className="text-xs font-normal text-gray-500">KES</span>
                             </p>
                          </div>
                       </div>
                    </div>

                    {/* Amenities Detail (New) */}
                    <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-800 md:col-span-2">
                        <div className="flex justify-between items-center mb-3">
                           <h4 className="flex items-center gap-2 font-bold text-orange-800 dark:text-orange-300">
                              <FaShoppingBasket /> Convenience
                           </h4>
                           <span className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-300">
                              <FaVolumeUp /> Noise: {property.mtaaScore.noiseLevel || 'Moderate'}
                           </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {property.mtaaScore.amenities?.kiosk && (
                              <span className="px-2 py-1 bg-white dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 rounded border border-orange-200">🏪 Kiosk Nearby</span>
                           )}
                           {property.mtaaScore.amenities?.mamaMboga && (
                              <span className="px-2 py-1 bg-white dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 rounded border border-orange-200">🥬 Mama Mboga</span>
                           )}
                           {property.mtaaScore.amenities?.kibandaski && (
                              <span className="px-2 py-1 bg-white dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 rounded border border-orange-200">🍲 Kibandaski</span>
                           )}
                           {!property.mtaaScore.amenities?.kiosk && !property.mtaaScore.amenities?.mamaMboga && (
                              <span className="text-xs text-gray-400 italic">No specific amenities reported.</span>
                           )}
                        </div>
                    </div>

                 </div>
              </div>

              {/* Footer CTA */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
                 <button 
                   onClick={() => setIsOpen(false)}
                   className="flex-1 py-3 text-gray-500 font-bold text-sm hover:text-gray-700 transition"
                 >
                   Close
                 </button>
                 <Link 
                   to={`/living-feed?neighborhood=${property.location}`}
                   className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
                 >
                   Read Resident Reviews <FaArrowRight />
                 </Link>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MtaaFlipCard;