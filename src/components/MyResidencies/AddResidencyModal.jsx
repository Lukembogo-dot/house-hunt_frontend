import React, { useState, useEffect } from 'react';
import { 
  FaShieldAlt, FaLock, FaBuilding, FaWater, FaWifi, 
  FaBus, FaLightbulb, FaStar, FaCheck, FaMoneyBillWave, FaBed, FaTag,
  FaRoad, FaShoppingBasket, FaMoon, FaVolumeUp
} from 'react-icons/fa';
import apiClient from '../../utils/apiClient';
import { encryptData } from '../../utils/secureVault';

const AddResidencyModal = ({ isOpen, onClose, refresh, initialData = null }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Internet "Other" Logic
  const commonProviders = ['Safaricom Home', 'Zuku', 'JTL Faiba', 'Liquid', 'Mawingu'];
  const [isCustomInternet, setIsCustomInternet] = useState(false);

  // 1. PUBLIC BASIC DATA
  const [formData, setFormData] = useState({
    buildingName: '',
    neighborhood: '',
    residencyStatus: 'Current Tenant',
    rating: 5,
    reviewContent: '',
    unitType: '1 Bedroom',
    monthlyRent: '',
    rentOpinion: 'Fair Value'
  });

  // 2. MTAA SCORE DATA (Expanded with new fields)
  const [mtaaData, setMtaaData] = useState({
    // Utilities
    waterConsistency: '24/7 Council Water',
    waterBackup: false,
    powerStability: 'Stable',
    internetProvider: '',
    internetReliability: 5,
    
    // Accessibility
    distanceToStage: 'Less than 5 min walk', 
    matatuFarePeak: '',
    matatuFareOffPeak: '', 
    roadCondition: 'Tarmac',
    
    // Security
    securityRating: 4,
    safeAtNight: 'Safe until 10pm',
    securityFeatures: [],
    
    // Amenities (Convenience)
    proximityToKiosk: false,
    proximityToMamaMboga: false,
    proximityToKibandaski: false,
    noiseLevel: 'Moderate' // ✅ State exists, now we add UI for it
  });

  // 3. PRIVATE DATA
  const [privateData, setPrivateData] = useState({
    unitNumber: '',
    notes: ''
  });

  const [vaultPin, setVaultPin] = useState('');

  // PRE-FILL LOGIC
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
        rentOpinion: initialData.rentalDetails?.rentOpinion || 'Fair Value'
      });
      
      if (initialData.utilities) {
        const provider = initialData.utilities.internetProvider || '';
        const isCustom = provider && !commonProviders.includes(provider);
        setIsCustomInternet(isCustom);

        setMtaaData({
          waterConsistency: initialData.utilities.waterConsistency || '24/7 Council Water',
          waterBackup: initialData.utilities.waterBackup || false,
          powerStability: initialData.utilities.powerStability || 'Stable',
          internetProvider: provider,
          internetReliability: initialData.utilities.internetReliability || 5,
          
          securityRating: initialData.security?.rating || 4,
          safeAtNight: initialData.security?.safeAtNight || 'Safe until 10pm',
          securityFeatures: initialData.security?.features || [],
          
          distanceToStage: initialData.accessibility?.distanceToStage || 'Less than 5 min walk',
          matatuFarePeak: initialData.accessibility?.matatuFarePeak || '',
          matatuFareOffPeak: initialData.accessibility?.matatuFareOffPeak || '',
          roadCondition: initialData.accessibility?.roadCondition || 'Tarmac',

          proximityToKiosk: initialData.amenities?.proximityToKiosk || false,
          proximityToMamaMboga: initialData.amenities?.proximityToMamaMboga || false,
          proximityToKibandaski: initialData.amenities?.proximityToKibandaski || false,
          noiseLevel: initialData.amenities?.noiseLevel || 'Moderate'
        });
      }
    }
  }, [initialData]);

  // Handlers
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

  const toggleSecurityFeature = (feature) => {
    setMtaaData(prev => {
      const exists = prev.securityFeatures.includes(feature);
      return {
        ...prev,
        securityFeatures: exists ? prev.securityFeatures.filter(f => f !== feature) : [...prev.securityFeatures, feature]
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
      let encryptedBlob = null;
      if (vaultPin && (privateData.unitNumber || privateData.notes)) {
         encryptedBlob = encryptData(privateData, vaultPin);
      }

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
          waterConsistency: mtaaData.waterConsistency,
          waterBackup: mtaaData.waterBackup,
          powerStability: mtaaData.powerStability,
          internetProvider: mtaaData.internetProvider,
          internetReliability: mtaaData.internetReliability
        },
        accessibility: {
          distanceToStage: mtaaData.distanceToStage,
          matatuFarePeak: Number(mtaaData.matatuFarePeak),
          matatuFareOffPeak: Number(mtaaData.matatuFareOffPeak),
          roadCondition: mtaaData.roadCondition
        },
        security: { 
          rating: mtaaData.securityRating, 
          safeAtNight: mtaaData.safeAtNight,
          features: mtaaData.securityFeatures 
        },
        amenities: { 
          proximityToKiosk: mtaaData.proximityToKiosk,
          proximityToMamaMboga: mtaaData.proximityToMamaMboga,
          proximityToKibandaski: mtaaData.proximityToKibandaski,
          noiseLevel: mtaaData.noiseLevel // ✅ Correctly mapped
        },
        privateData: encryptedBlob 
      };

      if (initialData) {
        await apiClient.put(`/living-community/experience/${initialData._id}`, payload);
      } else {
        await apiClient.post('/living-community/experience', payload);
      }
      refresh(); onClose();
    } catch (error) { 
      console.error(error);
      alert('Failed to save residency. Please try again.'); 
    } finally { setLoading(false); }
  };

  const getStepTitle = () => {
    if (step === 1) return { title: 'Basic Info', icon: <FaBuilding className="text-blue-500"/> };
    if (step === 2) return { title: 'The Vibe Check', icon: <FaWater className="text-blue-500"/> };
    return { title: 'Private Vault', icon: <FaShieldAlt className="text-green-500"/> };
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
            {getStepTitle().icon} {getStepTitle().title}
          </h2>
          <div className="flex items-center gap-1">
             <span className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
             <span className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
             <span className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 ml-4">✕</button>
        </div>

        <div className="p-6">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Building Name</label>
                <div className="relative">
                    <input 
                      className="w-full p-2 pl-9 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g. Prestige Plaza"
                      value={formData.buildingName}
                      onChange={handleBuildingChange}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />
                    <FaBuilding className="absolute left-3 top-3 text-gray-400" />
                </div>
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mt-1 shadow-xl max-h-48 overflow-y-auto">
                        {suggestions.map((b) => (
                            <li key={b._id} onClick={() => selectBuilding(b)} className="p-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 flex justify-between">
                                <span className="text-sm dark:text-white">{b.name}</span>
                            </li>
                        ))}
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
                    <option>Current Tenant</option>
                    <option>Moving Out Soon</option>
                    <option>Past Tenant</option>
                  </select>
                </div>
              </div>

              {/* MARKET DATA SECTION */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Market Data (Anonymous)</h4>
                 <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                        <label className="text-xs font-medium mb-1 dark:text-gray-300 flex items-center gap-1"><FaBed /> Unit Type</label>
                        <select 
                          className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                          value={formData.unitType} 
                          onChange={e => setFormData({...formData, unitType: e.target.value})}
                        >
                          <option>Bedsitter</option>
                          <option>Studio</option>
                          <option>1 Bedroom</option>
                          <option>2 Bedroom</option>
                          <option>3 Bedroom</option>
                          <option>4+ Bedroom</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1 dark:text-gray-300 flex items-center gap-1"><FaMoneyBillWave /> Rent (KES)</label>
                        <input 
                          type="number" 
                          className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                          placeholder="Internal use only"
                          value={formData.monthlyRent} 
                          onChange={e => setFormData({...formData, monthlyRent: e.target.value})} 
                        />
                    </div>
                 </div>
                 
                 <div>
                    <label className="text-xs font-medium mb-1 dark:text-gray-300 flex items-center gap-1"><FaTag /> How's the price?</label>
                    <select 
                        className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold text-blue-600"
                        value={formData.rentOpinion}
                        onChange={e => setFormData({...formData, rentOpinion: e.target.value})}
                    >
                      <option value="Affordable">Affordable (Good Deal)</option>
                      <option value="Fair Value">Fair Value (Standard)</option>
                      <option value="Overpriced">Overpriced (Too Expensive)</option>
                    </select>
                 </div>

                 <p className="text-[10px] text-gray-400 mt-2 italic">
                   * We use the exact amount for internal stats, but the public only sees your opinion (e.g. "Overpriced").
                 </p>
              </div>

              <textarea className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" rows="3" placeholder="Quick review... (Noise? Neighbors?)" value={formData.reviewContent} onChange={e => setFormData({...formData, reviewContent: e.target.value})} />
              <button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold mt-2">Next: The Vibe Check</button>
            </div>
          )}

          {/* STEP 2: The Vibe Check (UPDATED) */}
          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300">
               
               {/* Water & Power */}
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1"><FaWater /> Water</label>
                    <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={mtaaData.waterConsistency} onChange={e => setMtaaData({...mtaaData, waterConsistency: e.target.value})}>
                      <option>24/7 Council Water</option>
                      <option>Rationed (Weekly)</option>
                      <option>Borehole Only (Salty)</option>
                      <option>Frequent Shortages</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1"><FaLightbulb /> Power</label>
                    <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={mtaaData.powerStability} onChange={e => setMtaaData({...mtaaData, powerStability: e.target.value})}>
                      <option>Stable</option>
                      <option>Occasional Outages</option>
                      <option>Frequent Blackouts</option>
                    </select>
                 </div>
               </div>

               {/* Internet */}
               <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1"><FaWifi /> Internet</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      {!isCustomInternet ? (
                        <select 
                          className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                          value={commonProviders.includes(mtaaData.internetProvider) ? mtaaData.internetProvider : (mtaaData.internetProvider ? 'Other' : '')} 
                          onChange={handleProviderSelect}
                        >
                          <option value="">Select Provider</option>
                          {commonProviders.map(p => <option key={p} value={p}>{p}</option>)}
                          <option value="Other">Other (Type below)</option>
                        </select>
                      ) : (
                        <div className="relative">
                          <input 
                            autoFocus
                            placeholder="Type Provider Name..."
                            className="w-full p-2 text-sm border rounded-lg border-blue-500 ring-1 ring-blue-500 dark:bg-gray-700 dark:text-white"
                            value={mtaaData.internetProvider}
                            onChange={(e) => setMtaaData({...mtaaData, internetProvider: e.target.value})}
                          />
                          <button onClick={() => setIsCustomInternet(false)} className="absolute right-2 top-2 text-xs text-gray-400 hover:text-red-500">✕</button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-2 rounded-lg border dark:border-gray-600">
                       <span className="text-xs text-gray-500">Speed:</span>
                       {[1,2,3,4,5].map(star => (
                         <FaStar key={star} className={`cursor-pointer text-sm ${star <= mtaaData.internetReliability ? 'text-yellow-400' : 'text-gray-300'}`} onClick={() => setMtaaData({...mtaaData, internetReliability: star})} />
                       ))}
                    </div>
                  </div>
               </div>

               {/* Transport & Roads (Expanded) */}
               <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1"><FaBus /> Transport & Roads</label>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                     <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={mtaaData.distanceToStage} onChange={e => setMtaaData({...mtaaData, distanceToStage: e.target.value})}>
                        <option>Doorstep</option>
                        <option>Less than 5 min walk</option>
                        <option>5-15 min walk</option>
                        <option>Boda required</option>
                      </select>
                      <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={mtaaData.roadCondition} onChange={e => setMtaaData({...mtaaData, roadCondition: e.target.value})}>
                        <option>Tarmac</option>
                        <option>Cabro</option>
                        <option>Murram (All Weather)</option>
                        <option>Rough Road</option>
                        <option>Muddy when raining</option>
                      </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <input type="number" placeholder="Peak Fare (KES)" className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={mtaaData.matatuFarePeak} onChange={e => setMtaaData({...mtaaData, matatuFarePeak: e.target.value})} />
                     <input type="number" placeholder="Off-Peak (KES)" className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={mtaaData.matatuFareOffPeak} onChange={e => setMtaaData({...mtaaData, matatuFareOffPeak: e.target.value})} />
                  </div>
               </div>

               {/* Amenities (New Section) */}
               <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1"><FaShoppingBasket /> Convenience</label>
                  
                  {/* ✅ FIXED: Added Noise Level Dropdown */}
                  <div className="mb-3">
                     <label className="text-[10px] text-gray-400 mb-1 block">Noise Levels:</label>
                     <select 
                        className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                        value={mtaaData.noiseLevel} 
                        onChange={e => setMtaaData({...mtaaData, noiseLevel: e.target.value})}
                     >
                        <option>Silent</option>
                        <option>Moderate</option>
                        <option>Noisy (Club/Road)</option>
                     </select>
                  </div>

                  <div className="flex gap-2 mb-2">
                     <button onClick={() => setMtaaData({...mtaaData, proximityToKiosk: !mtaaData.proximityToKiosk})} className={`flex-1 text-xs py-2 rounded border ${mtaaData.proximityToKiosk ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>Kiosk Nearby</button>
                     <button onClick={() => setMtaaData({...mtaaData, proximityToMamaMboga: !mtaaData.proximityToMamaMboga})} className={`flex-1 text-xs py-2 rounded border ${mtaaData.proximityToMamaMboga ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>Mama Mboga</button>
                     <button onClick={() => setMtaaData({...mtaaData, proximityToKibandaski: !mtaaData.proximityToKibandaski})} className={`flex-1 text-xs py-2 rounded border ${mtaaData.proximityToKibandaski ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>Kibandaski</button>
                  </div>
               </div>

               {/* Security (Expanded) */}
               <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 flex items-center gap-1"><FaShieldAlt /> Security</label>
                  <div className="mb-2">
                     <select className="w-full p-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={mtaaData.safeAtNight} onChange={e => setMtaaData({...mtaaData, safeAtNight: e.target.value})}>
                        <option>Very Safe</option>
                        <option>Safe until 10pm</option>
                        <option>Risky after dark</option>
                        <option>Unsafe</option>
                     </select>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Biometric Entry', '24h Guard', 'Night Security Guard', 'Locked Key Gate', 'CCTV', 'Electric Fence', 'Perimeter Wall'].map(feat => (
                      <span key={feat} onClick={() => toggleSecurityFeature(feat)} className={`text-xs px-2 py-1 rounded-full border cursor-pointer transition select-none ${mtaaData.securityFeatures.includes(feat) ? 'bg-green-100 text-green-700 border-green-300 font-bold' : 'bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}>{feat}</span>
                    ))}
                  </div>
               </div>

               <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700 text-sm">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold shadow-md">Next: Secure Vault</button>
               </div>
            </div>
          )}

          {/* STEP 3: Private Vault (Reduced) */}
          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-3 rounded-lg text-xs flex gap-2 border border-green-200 dark:border-green-800">
                <FaLock className="mt-1 flex-shrink-0"/> <p><strong>Encrypted Vault:</strong> Store specific details here (like your door number) that only you can unlock later.</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    Unit Number <span className="text-green-600 dark:text-green-400 font-bold text-xs ml-2">(Optional)</span>
                  </label>
                  <input className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g. B4" value={privateData.unitNumber} onChange={e => setPrivateData({...privateData, unitNumber: e.target.value})} />
                </div>
              </div>
              <input type="password" className="w-full p-3 border-2 border-green-500 rounded-lg dark:bg-gray-700 dark:text-white tracking-widest text-center text-lg mt-4" placeholder="Set Vault PIN" maxLength={4} value={vaultPin} onChange={e => setVaultPin(e.target.value)} />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(2)} className="flex-1 text-gray-500">Back</button>
                <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold"><FaCheck className="inline mr-2"/> Save</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AddResidencyModal;