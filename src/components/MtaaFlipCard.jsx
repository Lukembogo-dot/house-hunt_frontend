import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaWater, FaWifi, FaBus, FaShieldAlt, FaStar, 
  FaMapMarkerAlt, FaInfoCircle, FaArrowRight, FaCity,
  FaTimes, FaRoad, FaMoon, FaShoppingBasket, FaVolumeUp, 
  FaBolt, FaCheckCircle, FaExclamationTriangle, FaWalking,
  FaCloudRain
} from 'react-icons/fa';
import { calculatePersonaMatches, calculateTrueCostBreakdown } from '../utils/mtaaAlgoEngine';

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
  const score = property.mtaaScore; 

  // ✅ CALCULATE DERIVED INSIGHTS
  // 1. Personas: Who matches this building?
  const personas = useMemo(() => 
    calculatePersonaMatches({ 
        breakdown: { 
            water: score.water?.includes('24/7') ? 100 : 50, 
            security: parseFloat(score.security) * 20, // Convert 5 to 100
            vibe: score.amenities?.supermarket ? 80 : 50, // Simple proxy
            roads: score.roadCondition === 'Tarmac' ? 100 : 50 
        }, 
        averages: {} 
    }), [score]
  );

  // 2. Cost Breakdown: What is the real monthly price?
  const costBreakdown = useMemo(() => 
    calculateTrueCostBreakdown({ 
        averages: { 
            rent: 0, // Visual placeholder since we don't have exact rent in this view context often
            commutePeak: score.fare || 0, 
            commuteOffPeak: score.fareOffPeak || 0 
        } 
    }), [score]
  );

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
          {/* ✅ PERSONA BADGES (New Feature) */}
          <div className="flex flex-wrap gap-2">
              {personas.map((p, i) => (
                <span key={i} className="text-[10px] font-bold uppercase bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2.5 py-1 rounded-md border border-purple-100 dark:border-purple-800 flex items-center gap-1">
                  {p.icon} {p.name}
                </span>
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
              <div className={`relative h-28 shrink-0 bg-gradient-to-br ${property.gradient} flex items-end p-6 justify-between`}>
                 <div className="z-10 text-white w-full flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black drop-shadow-md leading-none mb-1">{property.title}</h2>
                        <p className="text-white/90 text-sm font-bold flex items-center gap-2"><FaMapMarkerAlt /> {property.location}</p>
                    </div>
                    {/* Persona Icons in Header */}
                    <div className="flex gap-2 mb-1">
                        {personas.map((p, i) => (
                            <div key={i} className="bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold border border-white/10 flex items-center gap-1" title={`Good match for ${p.name}`}>
                                {p.icon} {p.name}
                            </div>
                        ))}
                    </div>
                 </div>
                 <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition backdrop-blur-sm"><FaTimes /></button>
                 <FaCity className="absolute text-white opacity-10 text-[10rem] -bottom-4 -left-10 rotate-12" />
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900 space-y-6">
                 
                 {/* 1. KEY METRICS ROW */}
                 <div className="grid grid-cols-3 gap-3">
                    <div className={`p-3 rounded-xl border ${score.water.includes('24/7') ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <FaWater className="text-lg" />
                            {score.water.includes('24/7') && <FaCheckCircle />}
                        </div>
                        <p className="text-[10px] uppercase font-bold opacity-70">Water</p>
                        <p className="text-sm font-black leading-tight">{score.water}</p>
                    </div>
                    
                    <div className="p-3 rounded-xl border bg-green-50 border-green-100 text-green-700">
                        <div className="flex justify-between items-start mb-2">
                            <FaShieldAlt className="text-lg" />
                            <span className="text-xs font-black">{score.security}/5</span>
                        </div>
                        <p className="text-[10px] uppercase font-bold opacity-70">Security</p>
                        <p className="text-sm font-black leading-tight">{score.safeAtNight || 'Safe'}</p>
                    </div>

                    <div className="p-3 rounded-xl border bg-purple-50 border-purple-100 text-purple-700">
                        <div className="flex justify-between items-start mb-2">
                            <FaWifi className="text-lg" />
                            <span className="text-xs font-black">{score.internetSpeed}</span>
                        </div>
                        <p className="text-[10px] uppercase font-bold opacity-70">Internet</p>
                        <p className="text-sm font-black leading-tight">{score.internet || 'Fiber'}</p>
                    </div>
                 </div>

                 {/* 2. TRUE COST OF LIVING (Visual Bar) */}
                 {costBreakdown && (
                     <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-3 flex justify-between">
                           <span>💰 True Monthly Cost</span>
                           <span className="text-gray-400 font-normal text-xs">Est. Transport & Food added</span>
                        </h4>
                        
                        {/* Stacked Bar */}
                        <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex mb-2">
                            {costBreakdown.parts.map((part, i) => (
                                <div key={i} className={`h-full ${part.color}`} style={{ width: `${part.width}%` }} title={`${part.label}: ${part.value.toLocaleString()} KES`}></div>
                            ))}
                        </div>
                        
                        {/* Legend */}
                        <div className="flex justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Rent</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Transport ({score.fare} KES/Trip)</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Food/Utils</div>
                        </div>
                     </div>
                 )}

                 {/* 3. LIFESTYLE & DETAILS */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold text-gray-700 dark:text-gray-300 text-xs uppercase mb-2 flex items-center gap-2">
                           <FaBus /> Commute
                        </h4>
                        <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                            <li className="flex justify-between"><span>Condition:</span> <strong className="text-gray-900 dark:text-white">{score.roadCondition}</strong></li>
                            {score.rainySeason?.length > 0 && (
                                <li className="flex justify-between text-orange-600"><span>Rain:</span> <strong>{score.rainySeason[0]}</strong></li>
                            )}
                            <li className="flex justify-between"><span>Off-Peak Fare:</span> <strong className="text-green-600">{score.fareOffPeak} KES</strong></li>
                        </ul>
                     </div>

                     <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold text-gray-700 dark:text-gray-300 text-xs uppercase mb-2 flex items-center gap-2">
                           <FaShoppingBasket /> Vibe & Food
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {score.amenities?.supermarket && <span className="text-[10px] px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded font-bold">Supermarket Nearby</span>}
                            {score.food && score.food.map((f, i) => (
                                <span key={i} className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">{f}</span>
                            ))}
                            {score.noiseSources?.length > 0 && <span className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded">Noise: {score.noiseSources[0]}</span>}
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