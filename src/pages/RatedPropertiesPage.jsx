import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaStar, FaMapMarkerAlt, FaHome, FaShieldAlt, 
  FaWater, FaWifi, FaBus, FaCheckCircle, FaSpinner,
  FaCity
} from 'react-icons/fa';
import apiClient from '../utils/apiClient';

// --- SHARED HELPER: Consistent Status Colors ---
// (Ideally, move this to a src/utils/colors.js file in future)
const getStatusColors = (type, value) => {
  if (!value) return 'text-gray-500 bg-gray-50 border-gray-100';

  if (type === 'water') {
    if (value.includes('24/7')) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (value.includes('Rationed')) return 'text-orange-600 bg-orange-50 border-orange-100';
    return 'text-red-600 bg-red-50 border-red-100'; 
  }
  
  if (type === 'security') {
    // Value is a number or string number
    const rating = Number(value);
    if (rating >= 4) return 'text-green-600 bg-green-50 border-green-100';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    return 'text-red-600 bg-red-50 border-red-100';
  }

  return 'text-gray-600 bg-gray-50 border-gray-100';
};

// --- HELPER: Generate Consistent Gradients based on Name ---
// Same logic as TrendingMtaaScores for visual consistency
const getBuildingGradient = (name) => {
  const gradients = [
    'from-blue-500 via-indigo-500 to-purple-600',
    'from-emerald-400 via-teal-500 to-cyan-600',
    'from-orange-400 via-pink-500 to-rose-600',
    'from-violet-500 via-purple-500 to-fuchsia-600',
    'from-cyan-500 via-blue-500 to-indigo-600'
  ];
  const index = name.length % gradients.length;
  return gradients[index];
};

const MtaaScoreGrid = ({ score }) => {
  if (!score) return null;

  return (
    <div className="grid grid-cols-2 gap-2 mt-4 mb-4">
      {/* Water Status */}
      <div className={`flex items-center gap-2 p-2 rounded-lg border ${getStatusColors('water', score.water)}`}>
        <FaWater className="text-lg flex-shrink-0" />
        <div className="overflow-hidden">
          <p className="text-[10px] uppercase font-bold opacity-60">Water</p>
          <p className="text-xs font-bold truncate" title={score.water}>{score.water || 'N/A'}</p>
        </div>
      </div>

      {/* Internet Provider */}
      <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <FaWifi className="text-lg text-purple-500 flex-shrink-0" />
        <div className="overflow-hidden">
          <p className="text-[10px] uppercase font-bold text-gray-400">Internet</p>
          <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{score.internet || 'N/A'}</p>
        </div>
      </div>

      {/* Transport (Fare) */}
      <div className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <FaBus className="text-lg text-green-600 flex-shrink-0" />
        <div>
          <p className="text-[10px] uppercase font-bold text-gray-400">To CBD</p>
          <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{score.fare ? `${score.fare} KES` : 'N/A'}</p>
        </div>
      </div>

      {/* Security Rating */}
      <div className={`flex items-center gap-2 p-2 rounded-lg border ${getStatusColors('security', score.security)}`}>
        <FaShieldAlt className="text-lg flex-shrink-0" />
        <div>
          <p className="text-[10px] uppercase font-bold opacity-60">Security</p>
          <p className="text-xs font-bold">{score.security > 0 ? `${score.security}/5.0` : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

const RatedPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { data: experiences } = await apiClient.get('/living-community/experience');
        
        const grouped = experiences.reduce((acc, curr) => {
          const key = curr.buildingName.trim().toLowerCase();
          if (!acc[key]) acc[key] = { name: curr.buildingName, items: [] };
          acc[key].items.push(curr);
          return acc;
        }, {});

        const aggregatedBuildings = Object.values(grouped).map(group => {
            const items = group.items;
            const count = items.length;
            
            const getMode = (arr) => {
                if (arr.length === 0) return null;
                const modeMap = {};
                let maxEl = arr[0], maxCount = 1;
                for(let i = 0; i < arr.length; i++) {
                    let el = arr[i];
                    if(modeMap[el] == null) modeMap[el] = 1;
                    else modeMap[el]++;  
                    if(modeMap[el] > maxCount) { maxEl = el; maxCount = modeMap[el]; }
                }
                return maxEl;
            };

            const totalRating = items.reduce((sum, item) => sum + (item.review?.rating || 0), 0);
            const totalSecurity = items.reduce((sum, item) => sum + (item.security?.rating || 0), 0);
            const totalFare = items.reduce((sum, item) => sum + (item.accessibility?.matatuFarePeak || 0), 0);
            const validFareCount = items.filter(i => i.accessibility?.matatuFarePeak > 0).length;
            
            const waterList = items.map(i => i.utilities?.waterConsistency).filter(Boolean);
            const netList = items.map(i => i.utilities?.internetProvider).filter(Boolean);
            const rentItem = items.find(i => i.rentalDetails?.monthlyRent > 0);

            return {
                id: items[0]._id, 
                title: group.name,
                location: items[0].location?.neighborhood || 'Nairobi',
                rating: (totalRating / count).toFixed(1),
                reviews: count,
                price: rentItem ? rentItem.rentalDetails.monthlyRent.toLocaleString() : '---',
                // ✅ UPDATED: Use consistent gradient logic instead of placeholder image
                gradient: getBuildingGradient(group.name),
                image: items[0].photos?.[0] || null, 
                badges: count > 2 ? ["Verified", "Trending"] : ["New Entry"],
                
                mtaaScore: {
                    water: getMode(waterList) || 'Unknown',
                    internet: getMode(netList) || 'Unknown',
                    fare: validFareCount > 0 ? Math.round(totalFare / validFareCount) : 0,
                    security: (totalSecurity / count).toFixed(1)
                },
                
                featuredPost: {
                    authorAlias: items[0].alias,
                    content: items[0].review?.content || "No written review provided.",
                    createdAt: items[0].createdAt
                }
            };
        });

        setProperties(aggregatedBuildings);
      } catch (error) {
        console.error("Error fetching rated properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 pt-10">
      <div className="container mx-auto px-6 md:px-10">
        
        {/* Page Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            The <span className="text-blue-600">Reliability</span> Index
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            Real data from verified tenants. We aggregate "Housing Passports" to generate these scores.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
             <FaSpinner className="animate-spin text-blue-600 text-4xl" />
          </div>
        ) : (
          /* Property Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div key={property.id} className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-full group">
                
                {/* 1. PROPERTY HEADER (Dynamic Gradient or Image) */}
                <Link to={`/property/${property.id}`} className="block relative h-56 overflow-hidden">
                  {property.image ? (
                     <img 
                       src={property.image} 
                       alt={property.title} 
                       className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                     />
                  ) : (
                    // ✅ FALLBACK: Consistent Gradient Animation
                    <div className={`w-full h-full bg-gradient-to-br ${property.gradient} flex items-center justify-center p-6 text-center`}>
                       <FaCity className="absolute text-white opacity-10 text-[10rem] -bottom-6 -right-6 rotate-12" />
                       <h3 className="text-2xl font-black text-white drop-shadow-md uppercase tracking-tight relative z-10">
                         {property.title}
                       </h3>
                    </div>
                  )}
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                    <FaStar className="text-yellow-400" size={14} />
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white">{property.rating}</span>
                    <span className="text-xs text-gray-500">({property.reviews})</span>
                  </div>

                  {/* Location Badge */}
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <FaMapMarkerAlt /> {property.location}
                  </div>
                </Link>

                {/* 2. CARD BODY */}
                <div className="px-6 pt-5 pb-4 flex-1 flex flex-col">
                  {/* Title & Price */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight hover:text-blue-600 transition cursor-pointer truncate w-full">
                      {property.title}
                    </h3>
                  </div>
                  <p className="font-bold text-blue-600 dark:text-blue-400 text-lg mb-2">
                    Ksh {property.price} <span className="text-sm text-gray-400 font-normal">/mo (est)</span>
                  </p>

                  {/* BADGES */}
                  <div className="flex flex-wrap gap-2 mb-3">
                      {property.badges.map((badge, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                           {badge}
                        </span>
                      ))}
                  </div>

                  {/* ✅ THE MTAA SCORE GRID */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 mb-4">
                     <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-1">
                       <FaCheckCircle className="text-blue-500"/> Verified Mtaa Score
                     </p>
                     <MtaaScoreGrid score={property.mtaaScore} />
                  </div>

                  {/* Latest Insight (Compact) */}
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] text-blue-600 dark:text-blue-300 font-bold">
                        R
                      </div>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate w-24">{property.featuredPost.authorAlias}</span>
                      <span className="text-[10px] text-gray-400">• Recent</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2">
                      "{property.featuredPost.content}"
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="block bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-3 text-center text-sm font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                   View Full Mtaa Report
                </div>

              </div>
            ))}
          </div>
        )}

        {!loading && properties.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <FaHome className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No Rated Properties Yet</h3>
            <p className="text-gray-500 mb-6">Be the first to create a Housing Passport and rate your apartment!</p>
            <Link to="/community" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">
               Add a Review
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatedPropertiesPage;