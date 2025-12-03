import React, { useState, useEffect } from 'react';
import { 
  FaBuilding, FaWater, FaWifi, FaBus, FaLightbulb, 
  FaStar, FaCheck, FaMoneyBillWave, FaBed, FaTag,
  FaRoad, FaShoppingBasket, FaCloudRain, FaShieldAlt, FaVolumeUp,
  FaUserSecret, FaUserTie, FaCalendarAlt
} from 'react-icons/fa';
import apiClient from '../../utils/apiClient';
import { useAuth } from '../../context/AuthContext'; 

const AddResidencyModal = ({ isOpen, onClose, refresh, initialData = null }) => {
  if (!isOpen) return null;

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const commonProviders = ['Safaricom Home', 'Zuku', 'JTL Faiba', 'Liquid', 'Mawingu', 'Starlink'];
  const [isCustomInternet, setIsCustomInternet] = useState(false);

  const [formData, setFormData] = useState({
    buildingName: '',
    neighborhood: '',
    residencyStatus: 'Current Tenant',
    rating: 5,
    reviewContent: '',
    unitType: '1 Bedroom',
    monthlyRent: '',
    rentOpinion: 'Fair Value',
    customAlias: '',
    customDate: ''
  });

  const [mtaaData, setMtaaData] = useState({
    waterSource: 'Council Water', 
    waterConsistency: '24/7',     
    waterRationingSchedule: '',   
    waterQuality: 'Fresh', 
    powerStability: 'Stable', // ✅ RESTORED
    internetProvider: '',
    internetSpeed: '', 
    internetReliability: 5, 
    distanceToStage: 'Less than 5 min walk', // ✅ RESTORED
    matatuAvailability: '24/7', // ✅ RESTORED
    matatuFarePeak: '',
    matatuFareOffPeak: '', 
    roadCondition: 'Tarmac',
    rainySeasonFeatures: [], 
    safeAtNight: 'Safe until 10pm',
    securityFeatures: [],
    supermarketNearby: false,
    foodAmenities: [], 
    noiseLevel: 'Moderate',
    noiseSources: [],
    mgmtRating: 3,
    mgmtResponsiveness: 'Within 24h',
    mgmtFriendliness: 'Professional'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        buildingName: initialData.buildingName || '',
        neighborhood: initialData.location?.neighborhood || '',
        residencyStatus: initialData.residencyStatus || 'Current Tenant',
        rating: initialData.review?.rating || 5,
        reviewContent: initialData.review?.content || '',
        unitType: initialData.rentalDetails?.unitType || '1 Bedroom',
        monthlyRent: initialData.rentalDetails?.monthlyRent || '',
        rentOpinion: initialData.rentalDetails?.rentOpinion || 'Fair Value',
        customAlias: '', 
        customDate: ''
      });
      
      if (initialData.utilities) {
        setMtaaData(prev => ({
          ...prev,
          waterSource: initialData.utilities.waterSource || 'Council Water',
          waterConsistency: initialData.utilities.waterConsistency || '24/7',
          waterRationingSchedule: initialData.utilities.waterRationingSchedule || '',
          waterQuality: initialData.utilities.waterQuality || 'Fresh',
          powerStability: initialData.utilities.powerStability || 'Stable',
          internetProvider: initialData.utilities.internetProvider || '',
          internetSpeed: initialData.utilities.internetSpeed || '',
          internetReliability: initialData.utilities.internetReliability || 5,
          safeAtNight: initialData.security?.safeAtNight || 'Safe until 10pm',
          securityFeatures: initialData.security?.features || [],
          distanceToStage: initialData.accessibility?.distanceToStage || 'Less than 5 min walk',
          matatuAvailability: initialData.accessibility?.matatuAvailability || '24/7',
          matatuFarePeak: initialData.accessibility?.matatuFarePeak || '',
          matatuFareOffPeak: initialData.accessibility?.matatuFareOffPeak || '',
          roadCondition: initialData.accessibility?.roadCondition || 'Tarmac',
          rainySeasonFeatures: initialData.accessibility?.rainySeasonFeatures || [],
          supermarketNearby: initialData.amenities?.supermarketNearby || false,
          foodAmenities: initialData.amenities?.foodAmenities || [],
          noiseLevel: initialData.amenities?.noiseLevel || 'Moderate',
          noiseSources: initialData.amenities?.noiseSources || [],
          mgmtRating: initialData.management?.rating || 3,
          mgmtResponsiveness: initialData.management?.responsiveness || 'Within 24h',
          mgmtFriendliness: initialData.management?.caretakerFriendliness || 'Professional'
        }));
      }
    }
  }, [initialData]);

  const handleBuildingChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, buildingName: value });
    if (value.length > 2) {
      try {
        const { data } = await apiClient.get(`/living-community/search-buildings?query=${value}`);
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) { console.error(error); }
    } else {
      setSuggestions([]); setShowSuggestions(false);
    }
  };

  const selectBuilding = (building) => {
    setFormData({ ...formData, buildingName: building.name, neighborhood: building.neighborhood });
    setShowSuggestions(false); 
  };

  const toggleArrayItem = (field, item) => {
    setMtaaData(prev => {
      const list = prev[field] || [];
      const exists = list.includes(item);
      return {
        ...prev,
        [field]: exists ? list.filter(i => i !== item) : [...list, item]
      };
    });
  };

  const handleProviderSelect = (e) => {
    const val = e.target.value;
    if (val === 'Other') {
      setIsCustomInternet(true);
      setMtaaData({ ...mtaaData, internetProvider: '' });
    } else {
      setIsCustomInternet(false);
      setMtaaData({ ...mtaaData, internetProvider: val });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let mappedNoise = mtaaData.noiseLevel;
      if (mappedNoise === 'Noisy') mappedNoise = 'Noisy (Club/Road)';

      const payload = {
        buildingName: formData.buildingName,
        location: { address: formData.neighborhood, neighborhood: formData.neighborhood },
        review: { title: `${formData.residencyStatus} Review`, content: formData.reviewContent, rating: formData.rating },
        residencyStatus: formData.residencyStatus,
        rentalDetails: { 
          unitType: formData.unitType,
          monthlyRent: Number(formData.monthlyRent),
          rentOpinion: formData.rentOpinion 
        },
        utilities: {
          waterSource: mtaaData.waterSource,
          waterConsistency: mtaaData.waterConsistency === '24/7' ? '24/7 Council Water' : `${mtaaData.waterConsistency}`,
          waterRationingSchedule: mtaaData.waterRationingSchedule,
          waterQuality: mtaaData.waterQuality, 
          powerStability: mtaaData.powerStability, // ✅ Sending to backend
          internetProvider: mtaaData.internetProvider,
          internetSpeed: mtaaData.internetSpeed, 
          internetReliability: mtaaData.internetReliability
        },
        accessibility: {
          distanceToStage: mtaaData.distanceToStage, // ✅ Sending to backend
          matatuAvailability: mtaaData.matatuAvailability, // ✅ Sending to backend
          matatuFarePeak: Number(mtaaData.matatuFarePeak),
          matatuFareOffPeak: Number(mtaaData.matatuFareOffPeak),
          roadCondition: mtaaData.roadCondition,
          rainySeasonFeatures: mtaaData.rainySeasonFeatures 
        },
        security: { 
          safeAtNight: mtaaData.safeAtNight,
          features: mtaaData.securityFeatures 
        },
        amenities: { 
          supermarketNearby: mtaaData.supermarketNearby, 
          foodAmenities: mtaaData.foodAmenities, 
          noiseLevel: mappedNoise,
          noiseSources: mtaaData.noiseSources
        },
        management: {
            rating: mtaaData.mgmtRating,
            responsiveness: mtaaData.mgmtResponsiveness,
            caretakerFriendliness: mtaaData.mgmtFriendliness
        },
        lifestyleTags: [...mtaaData.securityFeatures, ...mtaaData.noiseSources, mtaaData.roadCondition],
        customAlias: isAdmin ? formData.customAlias : undefined,
        customDate: isAdmin ? formData.customDate : undefined
      };

      if (initialData) {
        await apiClient.put(`/living-community/experience/${initialData._id}`, payload);
      } else {
        await apiClient.post('/living-community/experience', payload);
      }
      refresh(); onClose();
    } catch (error) { 
      console.error(error);
      alert(`Failed to save residency: ${error.response?.data?.message || error.message}`); 
    } finally { setLoading(false); }
  };

  const getStepTitle = () => {
    if (step === 1) return { title: 'Basic Info', icon: <FaBuilding className="text-blue-500"/> };
    if (step === 2) return { title: 'Mtaa Realities', icon: <FaStar className="text-yellow-500"/> };
  };

  const SECURITY_OPTIONS = ['CCTV', '24h Guard', 'Night Guard', 'Biometric', 'Electric Fence', 'Perimeter Wall', 'Locked Gate'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] overflow-y-auto">
        
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold text-center py-1.5">
           🚀 Pro Tip: More details = More XP = Higher Contributor Status!
        </div>

        <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
            {getStepTitle().icon} {getStepTitle().title}
          </h2>
          <div className="flex items-center gap-1">
             <span className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
             <span className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 ml-4">✕</button>
        </div>

        <div className="p-6">
          
          {/* ADMIN OVERRIDE */}
          {isAdmin && step === 1 && (
             <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 mb-4">
                <h4 className="text-xs font-bold text-red-700 dark:text-red-300 uppercase mb-2 flex items-center gap-1">
                   <FaUserSecret /> Admin Override
                </h4>
                <div className="grid grid-cols-2 gap-3">
                   <input type="text" placeholder="Custom Alias (e.g. Resident #42)" className="w-full p-2 text-sm border rounded bg-white dark:bg-gray-800 dark:text-white" value={formData.customAlias} onChange={(e) => setFormData({...formData, customAlias: e.target.value})} />
                   <input type="date" className="w-full p-2 text-sm border rounded bg-white dark:bg-gray-800 dark:text-white" value={formData.customDate} onChange={(e) => setFormData({...formData, customDate: e.target.value})} />
                </div>
             </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Building Name <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input className="w-full p-2 pl-9 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g. Prestige Plaza" value={formData.buildingName} onChange={handleBuildingChange} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} />
                    <FaBuilding className="absolute left-3 top-3 text-gray-400" />
                </div>
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mt-1 shadow-xl max-h-48 overflow-y-auto">
                        {suggestions.map((b) => <li key={b._id} onClick={() => selectBuilding(b)} className="p-3 hover:bg-blue-50 cursor-pointer border-b"><span className="text-sm dark:text-white">{b.name}</span></li>)}
                    </ul>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Neighborhood</label>
                  <input className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label>
                  <select className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.residencyStatus} onChange={e => setFormData({...formData, residencyStatus: e.target.value})}>
                    <option>Current Tenant</option><option>Moving Out Soon</option><option>Past Tenant</option>
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Market Data (Anonymous)</h4>
                 <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                        <label className="text-xs font-medium mb-1 dark:text-gray-300 flex items-center gap-1"><FaBed /> Unit Type</label>
                        <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.unitType} onChange={e => setFormData({...formData, unitType: e.target.value})}>
                          <option>Bedsitter</option><option>Studio</option><option>1 Bedroom</option><option>2 Bedroom</option><option>3 Bedroom</option><option>4+ Bedroom</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1 dark:text-gray-300 flex items-center gap-1"><FaMoneyBillWave /> Rent (KES)</label>
                        <input type="number" className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Optional" value={formData.monthlyRent} onChange={e => setFormData({...formData, monthlyRent: e.target.value})} />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-medium mb-1 dark:text-gray-300 flex items-center gap-1"><FaTag /> How's the price?</label>
                    <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white font-bold text-blue-600" value={formData.rentOpinion} onChange={e => setFormData({...formData, rentOpinion: e.target.value})}>
                      <option value="Affordable">Affordable (Good Deal)</option><option value="Fair Value">Fair Value (Standard)</option><option value="Overpriced">Overpriced (Too Expensive)</option>
                    </select>
                 </div>
              </div>
              <textarea className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white text-sm" rows="3" placeholder="Quick review..." value={formData.reviewContent} onChange={e => setFormData({...formData, reviewContent: e.target.value})} />
              <button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold mt-2">Next: The Vibe Check</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               
               {/* UTILITIES */}
               <section>
                   <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 border-b pb-1">Utilities</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                     <div>
                        <label className="text-xs mb-1 block dark:text-gray-300">Water Source</label>
                        <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white" value={mtaaData.waterSource} onChange={e => setMtaaData({...mtaaData, waterSource: e.target.value})}>
                          <option>Council Water</option><option>Borehole (Treated)</option><option>Borehole (Untreated)</option><option>Mixed (Council + Borehole)</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-xs mb-1 block dark:text-gray-300">Quality/Taste</label>
                        <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white" value={mtaaData.waterQuality} onChange={e => setMtaaData({...mtaaData, waterQuality: e.target.value})}>
                          <option>Fresh</option><option>Slightly Salty</option><option>Salty</option>
                        </select>
                     </div>
                     {/* ✅ RESTORED: POWER STABILITY */}
                     <div>
                        <label className="text-xs mb-1 block dark:text-gray-300">Power</label>
                        <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white" value={mtaaData.powerStability} onChange={e => setMtaaData({...mtaaData, powerStability: e.target.value})}>
                          <option>Stable</option><option>Occasional Outages</option><option>Frequent Blackouts</option>
                        </select>
                     </div>
                     
                     <div className="col-span-1 md:col-span-3">
                        <label className="text-xs mb-1 block dark:text-gray-300">Water Reliability</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['24/7', 'Rationed (Weekly)', 'Frequent Shortages'].map(opt => (
                                <button key={opt} onClick={() => setMtaaData({...mtaaData, waterConsistency: opt})} className={`text-xs p-2 rounded-lg border text-center ${mtaaData.waterConsistency === opt ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-700 dark:text-gray-300'}`}>{opt}</button>
                            ))}
                        </div>
                     </div>
                   </div>
                   {mtaaData.waterConsistency.includes('Rationed') && (
                        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                            <label className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1 block">Rationing Schedule:</label>
                            <div className="flex gap-2 flex-wrap">
                                {['1-2 Days/Week', '3-4 Days/Week', 'Weekends Only', 'Weekdays Only'].map(opt => (
                                    <button key={opt} onClick={() => setMtaaData({...mtaaData, waterRationingSchedule: opt})} className={`text-[10px] px-3 py-1.5 rounded-full border transition ${mtaaData.waterRationingSchedule === opt ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'}`}>{opt}</button>
                                ))}
                            </div>
                        </div>
                   )}
               </section>

               {/* MANAGEMENT */}
               <section>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 border-b pb-1">Management & Caretaker</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                     <div>
                        <label className="text-xs mb-1 block dark:text-gray-300">Responsiveness</label>
                        <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white" value={mtaaData.mgmtResponsiveness} onChange={e => setMtaaData({...mtaaData, mgmtResponsiveness: e.target.value})}>
                          <option>Immediate</option><option>Within 24h</option><option>Slow/Days</option><option>Ghosted</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-xs mb-1 block dark:text-gray-300">Friendliness</label>
                        <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white" value={mtaaData.mgmtFriendliness} onChange={e => setMtaaData({...mtaaData, mgmtFriendliness: e.target.value})}>
                          <option>Professional</option><option>Friendly</option><option>Strict</option><option>Rude</option>
                        </select>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-xs text-gray-500">Overall Management Rating:</span>
                     {[1,2,3,4,5].map(star => (
                         <FaUserTie key={star} className={`cursor-pointer text-sm ${star <= mtaaData.mgmtRating ? 'text-blue-500' : 'text-gray-300'}`} onClick={() => setMtaaData({...mtaaData, mgmtRating: star})} />
                     ))}
                  </div>
               </section>

               {/* SECURITY */}
               <section>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 border-b pb-1">Security</h4>
                  <div className="mb-3">
                      <label className="text-xs mb-1 block dark:text-gray-300">Safety at Night?</label>
                      <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white" value={mtaaData.safeAtNight} onChange={e => setMtaaData({...mtaaData, safeAtNight: e.target.value})}>
                        <option>Very Safe</option><option>Safe until 10pm</option><option>Risky after dark</option><option>Unsafe</option>
                      </select>
                  </div>
                  <label className="text-xs text-gray-500 mb-1 block">Features:</label>
                  <div className="flex flex-wrap gap-2">
                    {SECURITY_OPTIONS.map(feat => (
                      <span key={feat} onClick={() => toggleArrayItem('securityFeatures', feat)} className={`text-xs px-2 py-1 rounded-full border cursor-pointer select-none ${mtaaData.securityFeatures.includes(feat) ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-50 text-gray-500 dark:bg-gray-700'}`}>{feat}</span>
                    ))}
                  </div>
               </section>

               {/* NOISE */}
               <section>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 border-b pb-1">Noise Levels</h4>
                  <div className="flex gap-2 mb-3">
                      {['Silent', 'Moderate', 'Noisy'].map(lvl => (
                          <button key={lvl} onClick={() => setMtaaData({...mtaaData, noiseLevel: lvl})} className={`flex-1 py-2 text-xs rounded-lg border ${mtaaData.noiseLevel === lvl ? 'bg-orange-500 text-white border-orange-600' : 'bg-gray-50 dark:bg-gray-700 dark:text-white'}`}>{lvl}</button>
                      ))}
                  </div>
                  {mtaaData.noiseLevel !== 'Silent' && (
                      <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border border-orange-100 dark:border-orange-800">
                          <label className="text-xs font-bold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-1"><FaVolumeUp /> Primary Noise Sources:</label>
                          <div className="flex flex-wrap gap-2">
                              {['Road/Traffic', 'Club/Bar', 'Church/Mosque', 'Construction', 'Children Playing', 'Neighbors'].map(src => (
                                  <span key={src} onClick={() => toggleArrayItem('noiseSources', src)} className={`text-[10px] px-2 py-1 rounded border cursor-pointer ${mtaaData.noiseSources.includes(src) ? 'bg-orange-200 text-orange-900 border-orange-300' : 'bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>{src}</span>
                              ))}
                          </div>
                      </div>
                  )}
               </section>

               {/* INTERNET */}
               <section>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 border-b pb-1">Internet</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      {!isCustomInternet ? (
                        <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white" value={commonProviders.includes(mtaaData.internetProvider) ? mtaaData.internetProvider : (mtaaData.internetProvider ? 'Other' : '')} onChange={handleProviderSelect}>
                          <option value="">Provider</option>{commonProviders.map(p => <option key={p} value={p}>{p}</option>)}<option value="Other">Other</option>
                        </select>
                      ) : (
                        <input placeholder="Provider Name..." className="w-full p-2 text-sm border rounded-lg border-blue-500 dark:bg-gray-700 dark:text-white" value={mtaaData.internetProvider} onChange={(e) => setMtaaData({...mtaaData, internetProvider: e.target.value})} />
                      )}
                    </div>
                    <div>
                       <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white" value={mtaaData.internetSpeed} onChange={e => setMtaaData({...mtaaData, internetSpeed: e.target.value})}>
                          <option value="">Speed</option><option>5 Mbps</option><option>10 Mbps</option><option>20 Mbps</option><option>40+ Mbps</option>
                       </select>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 px-2 rounded-lg border dark:border-gray-600">
                       <span className="text-xs text-gray-500">Stability:</span>
                       {[1,2,3,4,5].map(star => <FaStar key={star} className={`cursor-pointer text-sm ${star <= mtaaData.internetReliability ? 'text-yellow-400' : 'text-gray-300'}`} onClick={() => setMtaaData({...mtaaData, internetReliability: star})} />)}
                    </div>
                  </div>
               </section>

               {/* ✅ RESTORED: ROADS & TRANSPORT (With Time & Distance) */}
               <section>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 border-b pb-1">Roads & Transport</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white" value={mtaaData.roadCondition} onChange={e => setMtaaData({...mtaaData, roadCondition: e.target.value})}>
                        <option>Tarmac</option><option>Cabro</option><option>Murram (All Weather)</option><option>Rough Road</option>
                      </select>
                      <div className="flex flex-col justify-center">
                          <span className="text-xs text-gray-500 mb-1 block"><FaCloudRain className="inline" /> When it rains:</span>
                          <div className="flex flex-wrap gap-1">
                            {['Passable', 'Muddy', 'Flooded', 'Slippery'].map(feat => (
                              <span key={feat} onClick={() => toggleArrayItem('rainySeasonFeatures', feat)} className={`text-[10px] px-2 py-1 rounded-full border cursor-pointer select-none ${mtaaData.rainySeasonFeatures.includes(feat) ? 'bg-blue-100 text-blue-700 border-blue-300 font-bold' : 'bg-gray-50 text-gray-500 dark:bg-gray-700'}`}>{feat}</span>
                            ))}
                          </div>
                      </div>
                  </div>
                  {/* Distance & Hours */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                     <div>
                        <label className="text-xs mb-1 block dark:text-gray-300">Distance to Stage</label>
                        <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white" value={mtaaData.distanceToStage} onChange={e => setMtaaData({...mtaaData, distanceToStage: e.target.value})}>
                          <option>Doorstep</option><option>Less than 5 min walk</option><option>5-15 min walk</option><option>Boda required</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-xs mb-1 block dark:text-gray-300">Matatu Hours</label>
                        <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white" value={mtaaData.matatuAvailability} onChange={e => setMtaaData({...mtaaData, matatuAvailability: e.target.value})}>
                          <option>24/7</option><option>Until Midnight</option><option>Until 10pm</option><option>Irregular</option>
                        </select>
                     </div>
                  </div>
                  {/* Fares */}
                  <div className="grid grid-cols-2 gap-3">
                     <div><label className="text-xs mb-1 block dark:text-gray-300">Peak Fare</label><input type="number" className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white" value={mtaaData.matatuFarePeak} onChange={e => setMtaaData({...mtaaData, matatuFarePeak: e.target.value})} /></div>
                     <div><label className="text-xs mb-1 block dark:text-gray-300">Off-Peak</label><input type="number" className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white" value={mtaaData.matatuFareOffPeak} onChange={e => setMtaaData({...mtaaData, matatuFareOffPeak: e.target.value})} /></div>
                  </div>
               </section>

               {/* FOOD & VIBES */}
               <section>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 border-b pb-1">Food & Vibes</h4>
                  <div className="flex items-center justify-between mb-3 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                     <span className="text-sm font-medium dark:text-white flex items-center gap-2"><FaShoppingBasket /> Supermarket Nearby?</span>
                     <button onClick={() => setMtaaData({...mtaaData, supermarketNearby: !mtaaData.supermarketNearby})} className={`px-3 py-1 rounded text-xs font-bold ${mtaaData.supermarketNearby ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>{mtaaData.supermarketNearby ? 'YES' : 'NO'}</button>
                  </div>
                  <div className="mb-2">
                     <span className="text-xs text-gray-500 mb-1 block">Street Food Available:</span>
                     <div className="flex flex-wrap gap-2">
                        {['Chapo/Smocha Base', 'Mayai Pasua', 'Mutura', 'Fast Food/KFC', 'Kibandaski', 'Mama Mboga'].map(feat => (
                          <span key={feat} onClick={() => toggleArrayItem('foodAmenities', feat)} className={`text-xs px-2 py-1 rounded-full border cursor-pointer select-none ${mtaaData.foodAmenities.includes(feat) ? 'bg-orange-100 text-orange-700 border-orange-300 font-bold' : 'bg-gray-50 text-gray-500 dark:bg-gray-700'}`}>{feat}</span>
                        ))}
                     </div>
                  </div>
               </section>

               <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                  <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700 text-sm px-4">Back</button>
                  <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-lg transform hover:-translate-y-1 transition flex items-center justify-center gap-2">
                     {loading ? 'Submitting...' : <><FaCheck /> Submit Review</>}
                  </button>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default AddResidencyModal;