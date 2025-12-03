import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaWater, FaWifi, FaBus, FaShieldAlt, FaStar, 
  FaMapMarkerAlt, FaInfoCircle, FaArrowRight, FaCity,
  FaBullhorn, FaUsers, FaCommentDots
} from 'react-icons/fa';
import apiClient from '../api/axios';

// --- SHARED HELPER: Consistent Status Colors ---
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

  return 'text-gray-600 bg-gray-50 border-gray-100';
};

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

// --- COMPONENT: The "Join Feed" Promo Card (Always First) ---
const FeedPromoCard = () => (
  <div className="relative w-full h-80 group cursor-pointer perspective-1000">
     <div className="w-full h-full relative transition-all duration-300 transform hover:-translate-y-2">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden text-white flex flex-col p-6">
           
           {/* Background Texture */}
           <FaBullhorn className="absolute text-white opacity-10 text-[10rem] -bottom-8 -right-8 rotate-12 group-hover:rotate-6 transition-transform duration-700" />
           
           <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 shadow-inner border border-white/30">
                 <FaUsers className="text-2xl text-white" />
              </div>
              
              <h3 className="text-2xl font-black mb-2 leading-tight">
                 What's happening in <span className="text-yellow-300">your mtaa?</span>
              </h3>
              
              <p className="text-indigo-100 text-sm mb-4 leading-relaxed line-clamp-3">
                 Don't just look at scores. Read real stories about security, water rationing, and neighborhood drama directly from the feed.
              </p>

              <div className="mt-auto">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-indigo-200">
                   <span className="flex items-center gap-1"><FaCommentDots /> Live Discussions</span>
                   <span className="w-1 h-1 bg-white rounded-full"></span>
                   <span>Real-time Alerts</span>
                </div>
                
                <Link 
                  to="/living-feed" 
                  className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl text-center shadow-lg hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                >
                  View Living Feed <FaArrowRight />
                </Link>
              </div>
           </div>
        </div>
     </div>
  </div>
);

// --- COMPONENT: Score Grid (Back of Card) ---
const MtaaScoreGrid = ({ score }) => {
  if (!score) return null;

  // Formatting Helper for long strings
  const formatWater = (w) => {
    if (!w) return 'Unknown';
    if (w.includes('24/7')) return '24/7 Flow';
    if (w.includes('Rationed')) return 'Rationed';
    return w;
  };

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {/* Water */}
      <div className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center ${getStatusColors('water', score.water)}`}>
        <FaWater className="text-xl mb-1" />
        <p className="text-[10px] uppercase font-bold opacity-70">Water</p>
        <p className="text-xs font-bold truncate w-full">{formatWater(score.water)}</p>
      </div>

      {/* Internet */}
      <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-center flex flex-col items-center justify-center">
        <FaWifi className="text-xl text-purple-500 mb-1" />
        <p className="text-[10px] uppercase font-bold opacity-70">Top Net</p>
        <p className="text-xs font-bold truncate w-full dark:text-gray-200">{score.internet || 'N/A'}</p>
      </div>

      {/* Security */}
      <div className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center ${getStatusColors('security', score.security)}`}>
        <FaShieldAlt className="text-xl mb-1" />
        <p className="text-[10px] uppercase font-bold opacity-70">Safety</p>
        <p className="text-xs font-bold">{score.security}/5</p>
      </div>

      {/* Fare */}
      <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-center flex flex-col items-center justify-center">
        <FaBus className="text-xl text-green-600 mb-1" />
        <p className="text-[10px] uppercase font-bold opacity-70">Fare (Peak)</p>
        <p className="text-xs font-bold dark:text-gray-200">{score.fare !== '-' ? `~${score.fare}` : 'N/A'}</p>
      </div>
    </div>
  );
};

// --- COMPONENT: The Flip Card ---
const MtaaFlipCard = ({ item }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const handleFlip = () => setIsFlipped(!isFlipped);

  const variants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  };

  return (
    <div 
      className="relative w-full h-80 cursor-pointer group perspective-1000"
      onMouseLeave={() => setIsFlipped(false)}
      onClick={handleFlip}
    >
      <motion.div
        className="w-full h-full relative transition-all duration-500 preserve-3d"
        variants={variants}
        initial="front"
        animate={isFlipped ? "back" : "front"}
      >
        {/* FRONT SIDE */}
        <div className="absolute inset-0 backface-hidden w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col">
          
          <div className={`h-48 w-full relative bg-gradient-to-br ${getBuildingGradient(item.title)} flex items-center justify-center overflow-hidden`}>
            <FaCity className="absolute text-white opacity-10 text-[10rem] -bottom-6 -right-6 rotate-12" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="z-10 text-center px-4"
            >
               <h3 className="text-2xl font-black text-white drop-shadow-md uppercase tracking-tight leading-none">
                 {item.title}
               </h3>
               <div className="w-12 h-1 bg-white/50 mx-auto mt-2 rounded-full"></div>
            </motion.div>

            <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/30">
              <FaStar className="text-yellow-300 text-sm" />
              <span className="text-sm font-bold text-white">{item.rating}</span>
            </div>

            <div className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1 border border-white/10 group-hover:bg-black/60 transition">
               <FaInfoCircle /> Tap for Stats
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold flex items-center gap-2 mb-3 uppercase tracking-wide">
              <FaMapMarkerAlt className="text-red-500" /> {item.location}
            </p>
            <div className="flex flex-wrap gap-2">
               {item.badges.map((b, i) => (
                 <span key={i} className="text-[10px] font-bold uppercase bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-600">
                   {b}
                 </span>
               ))}
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div 
          className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-blue-100 dark:border-blue-900 overflow-hidden p-6 flex flex-col"
        >
          <div className="text-center">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reliability Score</h4>
            <h3 className="text-lg font-extrabold text-blue-600 dark:text-blue-400 truncate mt-1">{item.title}</h3>
          </div>

          <div className="flex-1 flex items-center justify-center w-full">
             <MtaaScoreGrid score={item.mtaaScore} />
          </div>

          <Link 
            to={`/living-feed?buildingName=${encodeURIComponent(item.title)}`} 
            onClick={(e) => e.stopPropagation()}
            className="mt-auto w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
          >
            View Full Report <FaArrowRight />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const TrendingMtaaScores = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: Find the most frequent item in an array
  const getMode = (arr) => {
      if (!arr || arr.length === 0) return null;
      const counts = {};
      let maxCount = 0;
      let mode = arr[0];
      for (const item of arr) {
          counts[item] = (counts[item] || 0) + 1;
          if (counts[item] > maxCount) {
              maxCount = counts[item];
              mode = item;
          }
      }
      return mode;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: experiences } = await apiClient.get('/living-community/experience');
        
        // 1. Group by Building Name
        const grouped = experiences.reduce((acc, curr) => {
          const key = curr.buildingName.trim().toLowerCase();
          if (!acc[key]) acc[key] = { name: curr.buildingName, items: [] };
          acc[key].items.push(curr);
          return acc;
        }, {});

        // 2. Aggregate Data
        const aggregated = Object.values(grouped).map(group => {
            const list = group.items;
            const count = list.length;

            // Extract Arrays for Mode Calculation
            const waterList = list.map(i => i.utilities?.waterConsistency).filter(Boolean);
            const netList = list.map(i => i.utilities?.internetProvider).filter(Boolean);
            const faresList = list.map(i => i.accessibility?.matatuFarePeak).filter(f => f > 0);

            // Calculate Averages
            const totalRating = list.reduce((sum, i) => sum + (i.review?.rating || 0), 0);
            const totalSec = list.reduce((sum, i) => sum + (i.security?.rating || 0), 0);
            const totalFare = faresList.reduce((sum, val) => sum + val, 0);

            return {
                id: list[0]._id,
                title: group.name,
                location: list[0].location?.neighborhood || 'Nairobi',
                rating: (totalRating / count).toFixed(1),
                badges: count > 3 ? ["Verified", "Hot"] : count > 1 ? ["Trending"] : ["New"],
                
                // ✅ CORRECTLY MAPPED MTAA SCORE
                mtaaScore: {
                    water: getMode(waterList) || 'N/A',
                    internet: getMode(netList) || 'N/A',
                    fare: faresList.length > 0 ? Math.round(totalFare / faresList.length) : '-',
                    security: (totalSec / count).toFixed(1)
                }
            };
        });

        // 3. Sort by Rating and Take Top 2 (Since Promo Card is #1)
        setItems(aggregated.sort((a, b) => b.rating - a.rating).slice(0, 2));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return null;
  // Always render to show the Promo Card even if no items exist yet
  
  return (
    <section className="py-12 px-6 bg-gradient-to-b from-blue-50/80 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10">
          <div>
             <span className="text-xs font-bold uppercase text-blue-600 tracking-wider mb-2 block">Community Insights</span>
             <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
               Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Mtaa Scores</span>
             </h2>
             <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-xl text-lg">
               Tap a card to reveal the real living experience (Water, Internet, Security) as rated by actual tenants.
             </p>
          </div>
          <Link to="/rated-properties" className="hidden md:flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:text-blue-600 transition">
            See All Rated Buildings <FaArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ✅ 1. THE PROMO CARD (Always First) */}
          <FeedPromoCard />

          {/* 2. THE TOP RATED CARDS */}
          {items.map(item => (
            <MtaaFlipCard key={item.id} item={item} />
          ))}
        </div>
        
        <Link to="/rated-properties" className="md:hidden mt-8 flex justify-center items-center gap-2 text-blue-600 font-bold hover:underline">
            See All Rated Buildings <FaArrowRight />
        </Link>
      </div>
    </section>
  );
};

export default TrendingMtaaScores;