import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaStar, FaMapMarkerAlt, FaHome, FaShieldAlt, 
  FaWater, FaWifi, FaBus, FaCheckCircle, FaSpinner,
  FaCity, FaPassport, FaArrowRight, FaPlusCircle, FaTag
} from 'react-icons/fa';
import apiClient from '../utils/apiClient';
import MtaaFlipCard from '../components/MtaaFlipCard';

// --- PROMO CARD ---
const PassportPromoCard = () => (
  <div className="flex flex-col h-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl overflow-hidden text-white relative group transform hover:-translate-y-1 transition-all duration-300 min-h-[24rem]">
    <FaPassport className="absolute text-white opacity-10 text-[12rem] -bottom-10 -right-10 rotate-12 group-hover:rotate-6 transition-transform duration-700" />
    <div className="p-8 flex flex-col h-full relative z-10">
      <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/30">
        <FaPlusCircle className="text-3xl text-white" />
      </div>
      <h3 className="text-2xl font-extrabold mb-2 leading-tight">Own Your Rental History</h3>
      <p className="text-blue-100 text-sm mb-6 leading-relaxed">
        Get your <strong className="text-white">Housing Passport</strong> today. Rate your landlord, verify your history, and help the community.
      </p>
      <ul className="space-y-3 mb-8 text-sm font-medium text-blue-50">
        <li className="flex items-center gap-2"><FaCheckCircle className="text-green-400" /> Earn <strong>+50 XP</strong> per review</li>
        <li className="flex items-center gap-2"><FaCheckCircle className="text-green-400" /> Unlock "Verified Tenant" badge</li>
        <li className="flex items-center gap-2"><FaCheckCircle className="text-green-400" /> Access hidden reviews</li>
      </ul>
      <Link to="/living-feed" className="mt-auto w-full bg-white text-blue-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition shadow-lg">
        Create Passport <FaArrowRight />
      </Link>
    </div>
  </div>
);

// --- HELPER: Gradient ---
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
            
            // Helper to find the most common value (Mode)
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
            
            // Transport Aggregation
            const totalFare = items.reduce((sum, item) => sum + (item.accessibility?.matatuFarePeak || 0), 0);
            const validFareCount = items.filter(i => i.accessibility?.matatuFarePeak > 0).length;
            
            const totalOffPeak = items.reduce((sum, item) => sum + (item.accessibility?.matatuFareOffPeak || 0), 0);
            const validOffPeakCount = items.filter(i => i.accessibility?.matatuFareOffPeak > 0).length;

            const waterList = items.map(i => i.utilities?.waterConsistency).filter(Boolean);
            const netList = items.map(i => i.utilities?.internetProvider).filter(Boolean);
            const roadList = items.map(i => i.accessibility?.roadCondition).filter(Boolean);
            const noiseList = items.map(i => i.amenities?.noiseLevel).filter(Boolean);
            const safeNightList = items.map(i => i.security?.safeAtNight).filter(Boolean);

            // Opinion Mode
            const opinionList = items.map(i => i.rentalDetails?.rentOpinion).filter(Boolean);
            const modeOpinion = getMode(opinionList) || 'Fair Value';
            
            // Unit Type Mode
            const unitTypes = items.map(i => i.rentalDetails?.unitType).filter(Boolean);
            const modeUnitType = getMode(unitTypes) || '1 Bedroom'; 

            // Amenities Consensus (True if > 50% report it)
            const hasKiosk = items.filter(i => i.amenities?.proximityToKiosk).length > count / 2;
            const hasMamaMboga = items.filter(i => i.amenities?.proximityToMamaMboga).length > count / 2;
            const hasKibandaski = items.filter(i => i.amenities?.proximityToKibandaski).length > count / 2;

            return {
                id: items[0]._id, 
                title: group.name,
                location: items[0].location?.neighborhood || 'Nairobi',
                rating: (totalRating / count).toFixed(1),
                reviews: count,
                
                // Passed to FlipCard Front
                rentOpinion: modeOpinion,
                unitType: modeUnitType,
                gradient: getBuildingGradient(group.name),
                image: items[0].photos?.[0] || null, 
                badges: count > 2 ? ["Verified", "Trending"] : ["New Entry"],
                
                // Passed to FlipCard Back (Mtaa Score)
                mtaaScore: {
                    water: getMode(waterList) || 'Unknown',
                    internet: getMode(netList) || 'Unknown',
                    fare: validFareCount > 0 ? Math.round(totalFare / validFareCount) : 0,
                    fareOffPeak: validOffPeakCount > 0 ? Math.round(totalOffPeak / validOffPeakCount) : 0, // ✅ NEW
                    roadCondition: getMode(roadList) || 'Tarmac', // ✅ NEW
                    security: (totalSecurity / count).toFixed(1),
                    safeAtNight: getMode(safeNightList) || 'Safe', // ✅ NEW
                    noiseLevel: getMode(noiseList) || 'Moderate', // ✅ NEW
                    amenities: { // ✅ NEW
                       kiosk: hasKiosk,
                       mamaMboga: hasMamaMboga,
                       kibandaski: hasKibandaski
                    }
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
        
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            The <span className="text-blue-600">Reliability</span> Index
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            Real data from verified tenants. We aggregate "Housing Passports" to generate these scores.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <FaSpinner className="animate-spin text-blue-600 text-4xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <PassportPromoCard />
            {properties.map((property) => (
              <MtaaFlipCard key={property.id} property={property} />
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