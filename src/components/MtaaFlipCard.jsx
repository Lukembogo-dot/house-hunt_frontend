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
              className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Compact Header (Reduced Height) */}
              <div className={`relative h-24 shrink-0 bg-gradient-to-br ${property.gradient} flex items-center px-6 justify-between`}>
                 <div className="z-10 text-white">
                    <h2 className="text-2xl font-black drop-shadow-md truncate max-w-md">{property.title}</h2>
                    <p className="text-white/90 text-xs font-bold flex items-center gap-2">
                       <FaMapMarkerAlt /> {property.location}
                    </p>
                 </div>
                 
                 <div className="flex items-center gap-3 z-10">
                    <div className="flex flex-col items-end">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white`}>
                          {property.rentOpinion}
                       </span>
                       <div className="flex items-center gap-1 text-yellow-300 text-xs mt-1">
                          <span className="font-bold text-white text-lg leading-none">{property.rating}</span>
                          <FaStar />
                       </div>
                    </div>
                    <button 
                       onClick={() => setIsOpen(false)}
                       className="bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition"
                    >
                       <FaTimes />
                    </button>
                 </div>
                 <FaCity className="absolute text-white opacity-10 text-[8rem] -bottom-4 -left-4 rotate-12" />
              </div>

              {/* Denser Grid Body */}
              <div className="p-4 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900">
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    
                    {/* Water */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-sm flex flex-col justify-between">
                       <h4 className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300 text-xs uppercase mb-1">
                          <FaWater /> Water
                       </h4>
                       <div>
                          <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">
                             {property.mtaaScore.water}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1 leading-snug">
                             {property.mtaaScore.water.includes('24/7') ? "Consistent supply." : "Rationing likely."}
                          </p>
                       </div>
                    </div>

                    {/* Internet */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50 shadow-sm flex flex-col justify-between">
                       <h4 className="flex items-center gap-1.5 font-bold text-purple-800 dark:text-purple-300 text-xs uppercase mb-1">
                          <FaWifi /> Internet
                       </h4>
                       <div>
                          <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight">
                             {property.mtaaScore.internet}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                             <div className="flex gap-0.5">{renderStars(property.mtaaScore.internetReliability || 4)}</div>
                             <span className="text-[10px] font-bold text-purple-600">Fast</span>
                          </div>
                       </div>
                    </div>

                    {/* Security (Spans 1 col on mobile, 1 on desktop) */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-green-100 dark:border-green-900/50 shadow-sm flex flex-col justify-between">
                       <div className="flex justify-between items-start">
                          <h4 className="flex items-center gap-1.5 font-bold text-green-800 dark:text-green-300 text-xs uppercase">
                             <FaShieldAlt /> Safety
                          </h4>
                          <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold">{property.mtaaScore.security}/5</span>
                       </div>
                       <div className="mt-1">
                          <div className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-300 mb-1">
                             <FaMoon className="text-blue-400 text-[8px]"/> {property.mtaaScore.safeAtNight || 'Safe'}
                          </div>
                          <div className="flex overflow-x-auto gap-1 pb-1 no-scrollbar">
                             {(property.mtaaScore.securityFeatures || ['Gate']).slice(0, 2).map((f,i) => (
                                <span key={i} className="whitespace-nowrap text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">{f}</span>
                             ))}
                             {(property.mtaaScore.securityFeatures?.length > 2) && <span className="text-[9px] text-gray-400">+More</span>}
                          </div>
                       </div>
                    </div>

                    {/* Transport (Spans 2 cols) */}
                    <div className="col-span-2 md:col-span-2 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-300 text-xs uppercase">
                              <FaBus /> Commute (CBD)
                           </h4>
                           <span className="text-[10px] flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 font-bold">
                              <FaRoad /> {property.mtaaScore.roadCondition || 'Tarmac'}
                           </span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex-1">
                              <p className="text-[9px] text-gray-400 uppercase font-bold">Peak Fare</p>
                              <p className="text-base font-black text-gray-800 dark:text-white">
                                 {property.mtaaScore.fare} <span className="text-[10px] font-medium text-gray-500">KES</span>
                              </p>
                           </div>
                           <div className="w-px h-8 bg-gray-100 dark:bg-gray-700"></div>
                           <div className="flex-1">
                              <p className="text-[9px] text-gray-400 uppercase font-bold">Off-Peak</p>
                              <p className="text-base font-black text-green-600 dark:text-green-400">
                                 {property.mtaaScore.fareOffPeak || '--'} <span className="text-[10px] font-medium text-gray-500">KES</span>
                              </p>
                           </div>
                        </div>
                    </div>

                    {/* Vibe / Amenities (Spans 1 col on desktop) */}
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-orange-100 dark:border-orange-900/50 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-1">
                           <h4 className="flex items-center gap-1.5 font-bold text-orange-800 dark:text-orange-300 text-xs uppercase">
                              <FaShoppingBasket /> Vibe
                           </h4>
                           <FaVolumeUp className="text-orange-300 text-xs" title={property.mtaaScore.noiseLevel}/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                           <div className="flex flex-wrap gap-1">
                              {property.mtaaScore.amenities?.kiosk && <span className="text-[9px] px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded">Kiosk</span>}
                              {property.mtaaScore.amenities?.mamaMboga && <span className="text-[9px] px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded">Mama Mboga</span>}
                           </div>
                           <p className="text-[9px] text-gray-400 italic leading-tight">
                              {property.mtaaScore.noiseLevel || 'Moderate Noise'}
                           </p>
                        </div>
                    </div>

                 </div>
              </div>

              {/* Compact Footer CTA - Corrected Link */}
              <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-3 shrink-0">
                 <Link 
                   to={`/living-feed?buildingName=${encodeURIComponent(property.title)}`}
                   className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-md transition text-sm"
                 >
                   View Reviews for {property.title} <FaArrowRight />
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