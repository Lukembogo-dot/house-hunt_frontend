import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaWater, FaWifi, FaBus, FaShieldAlt, FaStar, 
  FaMapMarkerAlt, FaInfoCircle, FaArrowRight, FaCity,
  FaTimes, FaRoad, FaMoon, FaShoppingBasket, FaVolumeUp, 
  FaBolt, FaCheckCircle, FaExclamationTriangle, FaWalking,
  FaCloudRain
} from 'react-icons/fa';

// --- SHARED HELPER: Status Colors ---
const getStatusColors = (type, value) => {
  if (!value) return 'text-gray-500 bg-gray-50 border-gray-100';

  if (type === 'water') {
    if (value.includes('24/7')) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (value.includes('Rationed')) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200'; 
  }
  if (type === 'opinion') {
    if (value === 'Affordable') return 'text-green-700 bg-green-50 border-green-200';
    if (value === 'Fair Value') return 'text-blue-700 bg-blue-50 border-blue-200';
    if (value === 'Overpriced') return 'text-red-700 bg-red-50 border-red-200';
  }
  return 'text-gray-600 bg-gray-50 border-gray-100';
};

const MtaaFlipCard = ({ property }) => {
  const [isOpen, setIsOpen] = useState(false);
  const score = property.mtaaScore; // Shortcut

  return (
    <>
      {/* === 1. COMPACT CARD (Grid View) === */}
      <motion.div 
        layoutId={`card-${property.id}`}
        onClick={() => setIsOpen(true)}
        className="relative w-full h-96 cursor-pointer group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
      >
        <div className={`h-48 w-full relative bg-gradient-to-br ${property.gradient} flex items-center justify-center overflow-hidden`}>
          {property.image ? (
              <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
          ) : (
              <FaCity className="absolute text-white opacity-10 text-[10rem] -bottom-6 -right-6 rotate-12" />
          )}
          {!property.image && (
              <div className="z-10 text-center px-4">
                  <h3 className="text-2xl font-black text-white drop-shadow-md uppercase tracking-tight leading-none">{property.title}</h3>
              </div>
          )}
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/30">
            <FaStar className="text-yellow-300 text-sm" />
            <span className="text-sm font-bold text-white">{property.rating}</span>
          </div>
          <div className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1 border border-white/10 group-hover:bg-black/60 transition">
              <FaInfoCircle /> See Full Analysis
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-center">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-1 truncate">{property.title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center gap-2 mb-4 uppercase tracking-wide">
            <FaMapMarkerAlt className="text-red-500" /> {property.location}
          </p>
          <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getStatusColors('opinion', property.rentOpinion)}`}>
                  {property.rentOpinion}
              </span>
              <span className="text-xs text-gray-500">for {property.unitType}</span>
          </div>
          <div className="flex flex-wrap gap-2">
              {property.badges.map((b, i) => (
                <span key={i} className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-800">{b}</span>
              ))}
          </div>
        </div>
      </motion.div>

      {/* === 2. EXPANDED MODAL (Narrative View) === */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div 
              layoutId={`card-${property.id}`}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className={`relative h-28 shrink-0 bg-gradient-to-br ${property.gradient} flex items-end p-6`}>
                 <div className="z-10 text-white w-full flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black drop-shadow-md leading-none mb-1">{property.title}</h2>
                        <p className="text-white/90 text-sm font-bold flex items-center gap-2"><FaMapMarkerAlt /> {property.location}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-yellow-300 text-2xl font-black drop-shadow-sm">{property.rating} <FaStar className="text-xl" /></div>
                        <span className="text-[10px] uppercase font-bold text-white/80">{property.reviews} Verified Reviews</span>
                    </div>
                 </div>
                 <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition backdrop-blur-sm"><FaTimes /></button>
                 <FaCity className="absolute text-white opacity-10 text-[10rem] -bottom-4 -left-10 rotate-12" />
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900 space-y-6">
                 
                 {/* UTILITIES */}
                 <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h4 className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400 text-sm uppercase mb-3"><FaWater /> Utilities</h4>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className={`mt-1 p-1.5 rounded-full ${score.water.includes('24/7') ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                {score.water.includes('24/7') ? <FaCheckCircle size={12}/> : <FaExclamationTriangle size={12}/>}
                            </div>
                            <div>
                                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">Water availability is <span className="font-bold">{score.water}</span>.</p>
                                {score.waterRationingSchedule && <p className="text-xs text-gray-500 mt-1">Rationing: <strong className="text-gray-700 dark:text-gray-300">{score.waterRationingSchedule}</strong>.</p>}
                            </div>
                        </div>
                        <div className="flex items-start gap-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                            <div className="mt-1 p-1.5 rounded-full bg-purple-100 text-purple-600"><FaWifi size={12}/></div>
                            <div>
                                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                    Internet is generally <span className="font-bold">{score.internetSpeed || 'Reliable'}</span>.
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Most popular provider: <strong className="text-gray-700 dark:text-gray-300">{score.internet || 'Safaricom/Zuku'}</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* COMMUTE & ROADS */}
                 <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h4 className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase mb-3"><FaBus /> Commute & Access</h4>
                    <div className="flex justify-between items-center mb-3">
                        <div className="text-center w-1/2 border-r border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-gray-500 block">Peak Fare</span>
                            <span className="font-black text-lg text-gray-800 dark:text-white">{score.fare} KES</span>
                        </div>
                        <div className="text-center w-1/2">
                            <span className="text-xs text-gray-500 block">Off-Peak</span>
                            <span className="font-black text-lg text-green-600">{score.fareOffPeak || '--'} KES</span>
                        </div>
                    </div>
                    {/* ✅ DISPLAY RAIN & ROADS */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                        <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                            <FaRoad /> Condition: <strong>{score.roadCondition}</strong>
                        </p>
                        {score.rainySeason && score.rainySeason.length > 0 ? (
                            <p className="text-xs text-orange-600 font-bold mt-1 flex items-center gap-2">
                                <FaCloudRain /> During Rain: {score.rainySeason.join(', ')}
                            </p>
                        ) : (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-2">
                                <FaCheckCircle /> Roads remain passable when raining.
                            </p>
                        )}
                    </div>
                 </div>

                 {/* SECURITY SECTION */}
                 <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="flex items-center gap-2 font-bold text-green-700 dark:text-green-400 text-sm uppercase">
                           <FaShieldAlt /> Security & Safety
                        </h4>
                        <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100">
                            Rated {score.security}/5
                        </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                       Area is considered <strong className={score.safeAtNight?.includes('Unsafe') ? 'text-red-600' : 'text-green-600'}>{score.safeAtNight || 'Safe'}</strong> at night.
                    </p>

                    {score.securityFeatures && score.securityFeatures.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {score.securityFeatures.map((feat, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded flex items-center gap-1">
                                    <FaCheckCircle className="text-green-500 text-[10px]" /> {feat}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 italic">No specific security features listed.</p>
                    )}
                 </div>

                 {/* VIBE & FOOD */}
                 <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h4 className="flex items-center gap-2 font-bold text-orange-700 dark:text-orange-400 text-sm uppercase mb-3"><FaShoppingBasket /> Vibe & Noise</h4>
                    
                    {/* NOISE SOURCES */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-800 dark:text-white font-medium mb-1">
                           Noise Level: {score.noiseLevel || 'Moderate'}
                        </p>
                        {score.noiseSources && score.noiseSources.length > 0 && (
                            <p className="text-xs text-gray-500">
                                Common sources: {score.noiseSources.join(', ')}
                            </p>
                        )}
                    </div>

                    {/* ✅ DISPLAY FOOD AMENITIES */}
                    <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Local Eats & Amenities</span>
                        <div className="flex flex-wrap gap-2">
                            {score.food && score.food.map(f => (
                                <span key={f} className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded border border-orange-100 font-medium">{f}</span>
                            ))}
                            {score.amenities?.kiosk && <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">Kiosk</span>}
                            {score.amenities?.mamaMboga && <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">Mama Mboga</span>}
                        </div>
                    </div>
                 </div>

              </div>

              {/* Footer CTA */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center gap-4 shrink-0">
                 <div className="text-xs text-gray-500"><span className="font-bold text-gray-900 dark:text-white">{property.rentOpinion}</span> for this area.</div>
                 <Link to={`/living-feed?buildingName=${encodeURIComponent(property.title)}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition text-sm flex items-center gap-2">
                   Read All Reviews <FaArrowRight />
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