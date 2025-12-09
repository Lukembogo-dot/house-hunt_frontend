import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaStar, FaHome, FaSpinner, FaPassport, FaArrowRight, FaPlusCircle,
  FaCheckCircle, FaCrown, FaTrophy, FaFire, FaFistRaised
} from 'react-icons/fa';
import apiClient from '../utils/apiClient';
import MtaaFlipCard from '../components/MtaaFlipCard';
import { toast } from 'react-hot-toast';
import { calculateAdvancedMtaaScore } from '../utils/mtaaAlgoEngine';
import SeoInjector from '../components/SeoInjector'; // ✅ IMPORT SEO ENGINE

// --- 1. PROMO CARD ---
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

// --- 2. MTAA BATTLE ARENA ---
const MtaaBattleArena = () => {
  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const { data } = await apiClient.get('/battles/active');
        setBattle(data);
      } catch (error) {
        console.error("No active battle found", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBattle();
  }, []);

  const handleVote = async (neighborhood) => {
    if (!user) {
      toast.error("Please login to vote!");
      navigate('/login');
      return;
    }
    try {
      const { data } = await apiClient.post(`/battles/${battle._id}/vote`, { neighborhood });
      toast.success(`Voted for ${neighborhood}! (+${data.weightApplied} points)`);

      setBattle(prev => ({
        ...prev,
        contenders: prev.contenders.map(c =>
          c.neighborhood === neighborhood
            ? { ...c, voteCount: (data.updatedCounts[neighborhood]) }
            : c
        )
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Voting failed");
    }
  };

  if (loading) return null;
  if (!battle || !battle.contenders) return null;

  const c1 = battle.contenders[0];
  const c2 = battle.contenders[1];
  const totalVotes = c1.voteCount + c2.voteCount || 1;
  const c1Percent = Math.round((c1.voteCount / totalVotes) * 100);
  const c2Percent = 100 - c1Percent;

  return (
    <div className="w-full max-w-5xl mx-auto mb-12 transform hover:scale-[1.01] transition-transform duration-300">
      <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-700 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 to-blue-900/40 z-0"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-6 py-1 rounded-b-xl font-black text-xs uppercase tracking-widest shadow-lg z-20 flex items-center gap-2">
          <FaTrophy /> Mtaa Battle of the Week
        </div>

        <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2">
              {c1.neighborhood}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-300 justify-center md:justify-start mb-4">
              <span className="bg-gray-800 px-2 py-1 rounded">💧 Water: {c1.statsSnapshot?.waterScore || 50}%</span>
              <span className="bg-gray-800 px-2 py-1 rounded">🛡️ Safety: {c1.statsSnapshot?.securityScore || 50}%</span>
            </div>
            <button
              onClick={() => handleVote(c1.neighborhood)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-8 rounded-full shadow-lg shadow-red-900/50 transition flex items-center gap-2 mx-auto md:mx-0"
            >
              <FaFire /> Vote {c1.neighborhood}
            </button>
          </div>

          <div className="shrink-0">
            <div className="w-20 h-20 rounded-full bg-gray-800 border-4 border-gray-700 flex items-center justify-center shadow-xl">
              <span className="font-black text-2xl text-gray-400 italic">VS</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-right">
            <h3 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 mb-2">
              {c2.neighborhood}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-300 justify-center md:justify-end mb-4">
              <span className="bg-gray-800 px-2 py-1 rounded">💧 Water: {c2.statsSnapshot?.waterScore || 50}%</span>
              <span className="bg-gray-800 px-2 py-1 rounded">🛡️ Safety: {c2.statsSnapshot?.securityScore || 50}%</span>
            </div>
            <button
              onClick={() => handleVote(c2.neighborhood)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-full shadow-lg shadow-blue-900/50 transition flex items-center gap-2 mx-auto md:ml-auto md:mr-0"
            >
              Vote {c2.neighborhood} <FaFistRaised />
            </button>
          </div>
        </div>

        <div className="relative h-4 w-full bg-gray-800">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-1000 ease-out"
            style={{ width: `${c1Percent}%` }}
          ></div>
          <div
            className="absolute top-0 right-0 h-full bg-gradient-to-l from-cyan-500 to-blue-600 transition-all duration-1000 ease-out"
            style={{ width: `${c2Percent}%` }}
          ></div>
          <div className="absolute inset-0 flex justify-between px-4 items-center text-[10px] font-bold text-white uppercase tracking-widest">
            <span>{c1Percent}% Votes</span>
            <span>{c2Percent}% Votes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  // ✅ SEO CONFIG
  const seoConfig = {
    metaTitle: "Rated Properties in Nairobi | The Reliability Index",
    metaDescription: "See verified tenant reviews for apartments in Nairobi. Check water consistency, internet speeds, and security ratings before you move.",
    pagePath: "/rated-properties",
    schemaDescription: "A database of aggregated tenant reviews for residential buildings in Nairobi, ranked by reliability scores.",
    focusKeyword: "Apartment Reviews Nairobi"
  };

  // ✅ Read 'building' param for Global Search deep-linking
  const params = new URLSearchParams(window.location.search);
  const filterBuilding = params.get('building');

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

          const algoStats = calculateAdvancedMtaaScore(items);

          const getMode = (arr) => {
            if (arr.length === 0) return null;
            const modeMap = {};
            let maxEl = arr[0], maxCount = 1;
            for (let i = 0; i < arr.length; i++) {
              let el = arr[i];
              if (modeMap[el] == null) modeMap[el] = 1;
              else modeMap[el]++;
              if (modeMap[el] > maxCount) { maxEl = el; maxCount = modeMap[el]; }
            }
            return maxEl;
          };



          const waterSourceList = items.map(i => {
            if (i.utilities?.waterSource) return i.utilities.waterSource;
            const consistency = i.utilities?.waterConsistency?.toLowerCase() || '';
            if (consistency.includes('borehole')) return 'Borehole';
            if (consistency.includes('council')) return 'Council Water';
            return 'Council Water';
          }).filter(Boolean);
          const modeWaterSource = getMode(waterSourceList);

          const netList = items.map(i => i.utilities?.internetProvider).filter(Boolean);
          const speedList = items.map(i => i.utilities?.internetSpeed).filter(Boolean);
          const modeSpeed = getMode(speedList) || 'Not listed';

          const netRelList = items.map(i => i.utilities?.internetReliability).filter(n => n > 0);
          const avgNetRel = netRelList.length > 0 ? Math.round(netRelList.reduce((a, b) => a + b, 0) / netRelList.length) : 3;

          const roadList = items.map(i => i.accessibility?.roadCondition).filter(Boolean);
          const safeNightList = items.map(i => i.security?.safeAtNight).filter(Boolean);
          const noiseList = items.map(i => i.amenities?.noiseLevel).filter(Boolean);

          const allSecurityFeatures = [...new Set(items.flatMap(i => i.security?.features || []))];
          const allRainFeatures = [...new Set(items.flatMap(i => i.accessibility?.rainySeasonFeatures || []))];

          const allFoodAmenities = [...new Set(items.flatMap(i => i.amenities?.foodAmenities || []))];
          const allNoiseSources = [...new Set(items.flatMap(i => i.amenities?.noiseSources || []))];

          const opinionList = items.map(i => i.rentalDetails?.rentOpinion).filter(Boolean);
          const modeOpinion = getMode(opinionList) || 'Fair Value';
          const unitTypes = items.map(i => i.rentalDetails?.unitType).filter(Boolean);
          const modeUnitType = getMode(unitTypes) || '1 Bedroom';

          const waterList = items.map(i => i.utilities?.waterConsistency).filter(Boolean);
          const modeWater = getMode(waterList) || '24/7';

          const waterQualityList = items.map(i => i.utilities?.waterQuality).filter(Boolean);
          const modeWaterQuality = getMode(waterQualityList) || 'Fresh';

          const powerList = items.map(i => i.utilities?.powerStability).filter(Boolean);
          const modePowerStability = getMode(powerList) || 'Stable';

          const ratings = items.map(i => i.review?.rating).filter(n => n > 0);
          const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "5.0";

          const mgmtRatings = items.map(i => i.management?.rating).filter(n => n > 0);
          const avgMgmt = mgmtRatings.length > 0 ? (mgmtRatings.reduce((a, b) => a + b, 0) / mgmtRatings.length).toFixed(1) : "3.0";

          // RENT RANGE CALCULATION
          const rentList = items.map(i => i.rentalDetails?.monthlyRent).filter(n => n > 0);
          let rentRange = "Ask Agent";
          if (rentList.length > 0) {
            const minRent = Math.min(...rentList);
            const maxRent = Math.max(...rentList);
            const formatRent = (val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val;

            rentRange = minRent === maxRent
              ? `${formatRent(minRent)}`
              : `${formatRent(minRent)} - ${formatRent(maxRent)}`;
          }

          // NEW AGGREGATIONS
          const cleanlinessRatings = items.map(i => i.sanitation?.cleanlinessRating).filter(n => n > 0);
          const avgCleanliness = cleanlinessRatings.length > 0 ? (cleanlinessRatings.reduce((a, b) => a + b, 0) / cleanlinessRatings.length).toFixed(1) : "3.0";

          const garbageList = items.map(i => i.sanitation?.garbageCollection).filter(Boolean);
          const modeGarbage = getMode(garbageList) || 'Weekly';

          const sewerList = items.map(i => i.sanitation?.sewerSystem);
          const sewerConsensus = sewerList.filter(Boolean).length > (sewerList.length / 2);

          const allFacilities = [...new Set(items.flatMap(i => i.buildingFacilities || []))];

          const schoolsList = items.map(i => i.socialAmenities?.schools).filter(Boolean);
          const mallsList = items.map(i => i.socialAmenities?.malls).filter(Boolean);
          const hospitalsList = items.map(i => i.socialAmenities?.hospitals).filter(Boolean);

          const improvementList = items.map(i => i.improvementSuggestion).filter(Boolean);

          return {
            id: group.name,
            title: group.name,
            location: items[0].location?.neighborhood || 'Nairobi',
            image: null,
            gradient: "from-blue-600 to-blue-900",
            rating: avgRating,
            reviews: items.length,
            rentOpinion: modeOpinion,
            rentRange: rentRange, // ✅ NEW FIELD
            unitType: modeUnitType,
            mtaaScore: {
              water: modeWater,
              waterSource: items[0].utilities?.waterSource,
              waterRationingSchedule: items[0].utilities?.waterRationingSchedule,
              security: items[0].security?.safeAtNight === 'Very Safe' ? '5.0' : '3.0',
              safeAtNight: items[0].security?.safeAtNight,
              securityFeatures: [...new Set(items.flatMap(i => i.security?.features || []))],
              roads: items[0].accessibility?.roadCondition,
              roadCondition: items[0].accessibility?.roadCondition,
              rainySeasonFeatures: [...new Set(items.flatMap(i => i.accessibility?.rainySeasonFeatures || []))],
              amenities: {
                supermarket: items.some(i => i.amenities?.supermarketNearby),
                noiseLevel: items[0].amenities?.noiseLevel,
                noiseSources: allNoiseSources
              },
              fare: items[0].accessibility?.matatuFarePeak || 50,
              fareOffPeak: items[0].accessibility?.matatuFareOffPeak || 30,
              distanceToStage: items[0].accessibility?.distanceToStage,
              matatuAvailability: items[0].accessibility?.matatuAvailability,
              internetReliability: items[0].utilities?.internetReliability,
              internetProvider: items[0].utilities?.internetProvider,
              internetSpeed: items[0].utilities?.internetSpeed,
              food: [...new Set(items.flatMap(i => i.amenities?.foodAmenities || []))],

              management: {
                rating: avgMgmt,
                responsiveness: items[0].management?.responsiveness,
                friendliness: items[0].management?.caretakerFriendliness
              },

              sanitation: {
                cleanliness: avgCleanliness,
                garbage: modeGarbage,
                sewer: sewerConsensus
              },
              social: {
                schools: getMode(schoolsList) || 'Short Drive',
                malls: getMode(mallsList) || 'Short Drive',
                hospitals: getMode(hospitalsList) || 'Short Drive'
              },
              facilities: allFacilities,
              improvements: improvementList.slice(0, 3)
            }
          };
        });

        const sorted = aggregatedBuildings.sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.reviews - a.reviews;
        });

        // ✅ APPLY FILTER from Query Param
        if (filterBuilding) {
          const filtered = sorted.filter(p => p.title.toLowerCase().includes(filterBuilding.toLowerCase()));
          setProperties(filtered);
        } else {
          setProperties(sorted);
        }
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

      {/* ✅ INJECT GLOBAL SEO ENGINE */}
      <SeoInjector seo={seoConfig} />

      <div className="container mx-auto px-6 md:px-10">

        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            The <span className="text-blue-600">Reliability</span> Index
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            Real data from verified tenants. We aggregate "Housing Passports" to generate these scores.
          </p>
        </div>

        <MtaaBattleArena />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-blue-600 text-4xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <PassportPromoCard />
            {properties.map((property, index) => (
              <div key={property.id} className="relative">
                {index === 0 && property.rating > 0 && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
                    <FaCrown className="text-4xl text-yellow-400 drop-shadow-lg animate-bounce" />
                    <span className="bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                      Top Rated
                    </span>
                  </div>
                )}
                <div className={index === 0 ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900 rounded-2xl" : ""}>
                  <MtaaFlipCard property={property} />
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
            <Link to="/living-feed" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">
              Create Passport
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatedPropertiesPage;