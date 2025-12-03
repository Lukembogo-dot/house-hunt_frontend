import React, { useState, useMemo } from 'react';
import { 
  FaStar, FaWater, FaShieldAlt, FaQuoteLeft, FaCheckCircle, 
  FaWifi, FaUserTie, FaExclamationTriangle, FaVolumeUp, FaUserSecret 
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
// ✅ FIX: Go back two levels to reach src/utils
import { calculatePersonaMatches } from '../../utils/mtaaAlgoEngine';

// --- SHARED HELPER: Status Colors ---
const getStatusColors = (type, value) => {
  if (!value) return 'text-gray-500 bg-gray-50 border-gray-100';

  if (type === 'water') {
    if (value.includes('24/7')) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (value.includes('Rationed')) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200'; 
  }
  if (type === 'security') {
    const rating = parseFloat(value);
    if (rating >= 4) return 'text-green-700 bg-green-50 border-green-200';
    if (rating >= 3) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
  }
  return 'text-gray-600 bg-gray-50 border-gray-100';
};

// --- HELPER: Generate Unique Anonymous Identity ---
const getAnonymousIdentity = (review) => {
  // 1. Generate a consistent color based on the string (Simple Hash)
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  // 2. Determine Display Name (Priority: Alias -> Neighborhood -> Generic)
  const displayName = review.alias || `${review.location?.neighborhood || 'Nairobi'} Resident`;
  
  // 3. Generate Initials (e.g., "Kileleshwa Resident" -> "KR")
  const initials = displayName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return {
    name: displayName,
    color: stringToColor(displayName),
    initials: initials
  };
};

const BuildingReviewCard = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate Personas
  const personas = useMemo(() => 
    calculatePersonaMatches({ 
        breakdown: { 
            water: review.utilities?.waterConsistency?.includes('24/7') ? 100 : 50, 
            security: (review.security?.rating || 3) * 20, 
            vibe: review.amenities?.supermarketNearby ? 80 : 50, 
            roads: review.accessibility?.roadCondition === 'Tarmac' ? 100 : 50 
        }, 
        averages: {} 
    }), [review]
  );

  const identity = useMemo(() => getAnonymousIdentity(review), [review]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={`text-xs ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`} />
    ));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 hover:shadow-md transition-all">
      
      {/* --- HEADER: ANONYMOUS IDENTITY --- */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {/* Unique Avatar generated from Location Name */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm border-2 border-white dark:border-gray-700"
            style={{ backgroundColor: identity.color }}
          >
            {identity.initials}
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              {identity.name}
              {/* Show Secret Icon to emphasize Anonymity */}
              <FaUserSecret className="text-gray-400 text-xs" title="Anonymous Source" />
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {review.isVerified && (
                 <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                    <FaCheckCircle size={10} /> Verified Tenant
                 </span>
              )}
              {!review.isVerified && <span>•</span>}
              <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
           <div className="flex gap-0.5 mb-1">{renderStars(review.review?.rating || 0)}</div>
           <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
             {review.rentalDetails?.unitType || 'Unit'}
           </span>
        </div>
      </div>

      {/* --- REVIEW CONTENT --- */}
      <div className="relative bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl mb-4">
         <FaQuoteLeft className="text-gray-300 dark:text-gray-600 mb-2 text-sm" />
         <h5 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1">
            {review.review?.title}
         </h5>
         <p className={`text-gray-600 dark:text-gray-300 text-sm leading-relaxed ${!isExpanded && review.review?.content?.length > 150 ? 'line-clamp-2' : ''}`}>
           {review.review?.content || "No detailed feedback provided."}
         </p>
         
         {review.review?.content?.length > 150 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 dark:text-blue-400 text-xs font-bold mt-2 hover:underline"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
         )}
      </div>

      {/* --- MTAA REALITIES GRID --- */}
      <div className="grid grid-cols-2 gap-2 mb-4">
          
          {/* Water */}
          <div className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center ${getStatusColors('water', review.utilities?.waterConsistency)}`}>
             <div className="flex items-center gap-1 mb-1">
                <FaWater className="text-sm" /> 
                <span className="text-[10px] uppercase font-bold opacity-70">Water</span>
             </div>
             <span className="text-xs font-bold">{review.utilities?.waterConsistency?.replace('Council Water', '') || 'N/A'}</span>
             {review.utilities?.waterRationingSchedule && (
                <span className="text-[9px] mt-1 bg-white/50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                   <FaExclamationTriangle /> {review.utilities.waterRationingSchedule}
                </span>
             )}
          </div>

          {/* Internet */}
          <div className="p-2 rounded-lg border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-600 flex flex-col items-center justify-center text-center">
             <div className="flex items-center gap-1 mb-1">
                <FaWifi className="text-sm text-indigo-500" /> 
                <span className="text-[10px] uppercase font-bold opacity-70 text-gray-500">Internet</span>
             </div>
             <span className="text-xs font-bold text-gray-800 dark:text-white">{review.utilities?.internetProvider || 'N/A'}</span>
             <div className="flex items-center gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1 w-2 rounded-full ${i < (review.utilities?.internetReliability || 0) ? 'bg-indigo-400' : 'bg-gray-200'}`} />
                ))}
             </div>
          </div>

          {/* Security */}
          <div className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center ${getStatusColors('security', review.security?.rating)}`}>
             <div className="flex items-center gap-1 mb-1">
                <FaShieldAlt className="text-sm" /> 
                <span className="text-[10px] uppercase font-bold opacity-70">Safety</span>
             </div>
             <span className="text-xs font-bold">{review.security?.rating ? `${review.security.rating}/5` : 'N/A'}</span>
             <span className="text-[9px] mt-1 opacity-80">{review.security?.safeAtNight || 'Status Unknown'}</span>
          </div>

          {/* Management */}
          <div className="p-2 rounded-lg border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-600 flex flex-col items-center justify-center text-center">
             <div className="flex items-center gap-1 mb-1">
                <FaUserTie className="text-sm text-gray-600 dark:text-gray-400" /> 
                <span className="text-[10px] uppercase font-bold opacity-70 text-gray-500">Landlord</span>
             </div>
             <span className="text-xs font-bold text-gray-800 dark:text-white">{review.management?.responsiveness || 'N/A'}</span>
             <span className="text-[9px] mt-1 text-gray-500">{review.management?.caretakerFriendliness || 'Unknown'}</span>
          </div>
      </div>

      {/* --- FOOTER: NOISE & PERSONAS --- */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
         
         {/* Noise Indicator */}
         {review.amenities?.noiseLevel && (
             <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md border ${
                 review.amenities.noiseLevel === 'Silent' ? 'bg-green-50 text-green-700 border-green-200' : 
                 'bg-orange-50 text-orange-700 border-orange-200'
             }`}>
                <FaVolumeUp className="text-[10px]" />
                {review.amenities.noiseLevel}
             </div>
         )}

         {/* Persona Badges */}
         <div className="flex flex-wrap gap-2">
            {personas.slice(0, 2).map((p, i) => (
              <span key={i} className="text-[10px] font-bold uppercase bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded border border-purple-100 dark:border-purple-800 flex items-center gap-1">
                {p.icon} {p.name}
              </span>
            ))}
         </div>

      </div>
    </div>
  );
};

export default BuildingReviewCard;