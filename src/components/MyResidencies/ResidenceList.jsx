import React, { useEffect, useState } from 'react';
import { 
  FaHome, FaLock, FaUnlock, FaEyeSlash, FaBullhorn, FaEdit, 
  FaHistory, FaCheckCircle, FaSearch, FaStar, FaUserSecret, 
  FaChartLine, FaCamera, FaShareAlt, FaLightbulb 
} from 'react-icons/fa'; 
import apiClient from '../../utils/apiClient';
import { decryptData } from '../../utils/secureVault';
import AddCommunityPostModal from '../Community/AddCommunityPostModal';
import AddResidencyModal from './AddResidencyModal'; 
import { toast } from 'react-hot-toast';

const ResidenceList = ({ refreshTrigger }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlockedVaults, setUnlockedVaults] = useState({});
  const [pinInputs, setPinInputs] = useState({}); 

  // Modal States
  const [selectedResidence, setSelectedResidence] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const fetchHistory = async () => {
    try {
      const { data } = await apiClient.get('/living-community/my-history');
      setHistory(data);
    } catch (error) {
      console.error("Error loading history", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (id, encryptedBlob) => {
    const pin = pinInputs[id];
    if (!pin) return toast.error("Please enter your Vault PIN.");
    
    if (!encryptedBlob) return toast.error("No private data saved.");

    const decrypted = decryptData(encryptedBlob, pin);
    if (decrypted) {
      setUnlockedVaults(prev => ({ ...prev, [id]: decrypted }));
      toast.success("Vault Unlocked!");
    } else {
      toast.error("Incorrect PIN.");
    }
  };

  const handlePinChange = (id, value) => {
    setPinInputs(prev => ({ ...prev, [id]: value }));
  };

  const openPostModal = (residence) => {
    setSelectedResidence(residence);
    setIsPostModalOpen(true);
  };

  const openEditModal = (residence) => {
    setSelectedResidence(residence);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchHistory();
    toast.success("Passport Updated!");
  };

  const handleAddSuccess = () => {
    fetchHistory();
    toast.success("New Passport Created! (+50 XP)");
  };

  const handleShare = (buildingName) => {
    const text = `I'm a Verified Resident at ${buildingName} on HouseHunt Kenya! 🛡️ Check out my review and see if it's worth living here.`;
    if (navigator.share) {
      navigator.share({
        title: 'Verified Resident Review',
        text: text,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.origin}`);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400 animate-pulse">Loading your passports...</div>;

  // ZERO STATE (Incentive to Start)
  if (history.length === 0) {
    return (
      <>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700 rounded-xl p-8 text-center transition hover:shadow-lg">
          <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FaStar className="text-4xl text-yellow-400" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Unlock the Real Nairobi Market
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto leading-relaxed text-sm">
            Create a <strong>Housing Passport</strong> to see what others are actually paying, view water rationing schedules, and unlock hidden reviews.
          </p>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <FaSearch /> Rate My Current House (+50 XP)
          </button>
        </div>

        <AddResidencyModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          refresh={handleAddSuccess} 
        />
      </>
    );
  }

  const currentResidences = history.filter(h => h.residencyStatus !== 'Past Tenant');
  const pastResidences = history.filter(h => h.residencyStatus === 'Past Tenant');

  const renderCard = (item, isPast = false) => {
    const isUnlocked = unlockedVaults[item._id];
    const privateDetails = isUnlocked ? unlockedVaults[item._id] : null;
    const hasPrivateData = !!item.privateData;
    const isShadow = item.alias && item.alias !== 'Verified Resident' && !item.alias.includes('Resident');
    
    // Gamification Checks
    const hasPhotos = item.photos && item.photos.length > 0;
    const isDetailed = item.utilities && item.security && item.accessibility;

    return (
      <div key={item._id} className={`bg-white dark:bg-gray-800 border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all mb-6 ${isPast ? 'opacity-75 border-gray-200 dark:border-gray-700' : 'border-blue-100 dark:border-blue-800'}`}>
        
        {/* --- HEADER: IDENTITY & STATUS --- */}
        <div className={`p-5 flex items-start justify-between ${isPast ? 'bg-gray-50 dark:bg-gray-800' : 'bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800'}`}>
          <div className="flex gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${isPast ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white'}`}>
              {isPast ? <FaHistory size={20} /> : <FaCheckCircle size={20} />}
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-2">
                {item.buildingName}
                {item.residencyStatus === 'Moving Out Soon' && (
                   <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200 uppercase tracking-wide">Moving Out</span>
                )}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                {item.location?.neighborhood} 
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span> 
                <span className="font-medium text-blue-600 dark:text-blue-400">{item.rentalDetails?.unitType || 'Unit'}</span>
              </p>
              
              {isShadow && (
                  <p className="text-xs text-purple-600 font-bold mt-1 flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded w-fit">
                      <FaUserSecret /> Alias: {item.alias}
                  </p>
              )}
            </div>
          </div>
          
          <div className="text-right hidden sm:block">
             <button 
                onClick={() => handleShare(item.buildingName)}
                className="text-gray-400 hover:text-blue-600 transition p-2" 
                title="Share Verified Status"
             >
                <FaShareAlt />
             </button>
          </div>
        </div>

        {/* --- BODY: VALUE DASHBOARD --- */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Market Position (The "Useful" Part) */}
            <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1">
                    <FaChartLine /> Market Position
                </h5>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Your Deal:</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                            item.rentalDetails?.rentOpinion === 'Affordable' ? 'bg-green-100 text-green-700' :
                            item.rentalDetails?.rentOpinion === 'Overpriced' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                            {item.rentalDetails?.rentOpinion || 'Fair Value'}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                        Based on your unit type, you are paying <strong>{item.rentalDetails?.monthlyRent?.toLocaleString() || '---'} KES</strong>. 
                        {item.rentalDetails?.rentOpinion === 'Affordable' 
                            ? " You have a better deal than 60% of neighbors!" 
                            : " This aligns with current market rates."}
                    </div>
                </div>
            </div>

            {/* Right: Gamification / Missing Info */}
            <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1">
                    <FaLightbulb /> Passport Strength
                </h5>
                
                {hasPhotos && isDetailed ? (
                    <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                        <FaCheckCircle className="text-green-500 text-xl" />
                        <div>
                            <p className="text-sm font-bold text-green-700 dark:text-green-300">100% Complete</p>
                            <p className="text-xs text-green-600 dark:text-green-400">You are a top contributor!</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {!hasPhotos && (
                            <button onClick={() => openEditModal(item)} className="w-full flex justify-between items-center bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg border border-orange-100 dark:border-orange-800 text-xs text-orange-700 dark:text-orange-300 hover:bg-orange-100 transition">
                                <span className="flex items-center gap-2"><FaCamera /> Add Photos</span>
                                <span className="font-bold">+20 XP</span>
                            </button>
                        )}
                        <p className="text-[10px] text-gray-400 text-center">Complete profile to unlock 'Local Legend' badge.</p>
                    </div>
                )}
            </div>
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div className="flex gap-2">
                {!isPast && (
                  <button 
                    onClick={() => openPostModal(item)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    <FaBullhorn /> Post Alert
                  </button>
                )}
                <button 
                  onClick={() => openEditModal(item)}
                  className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition ml-2"
                >
                  <FaEdit /> Update Details
                </button>
            </div>

            {/* Vault Toggle */}
            {hasPrivateData && (
                <div className="flex items-center gap-2">
                    {isUnlocked ? (
                        <span className="text-xs font-mono text-green-600 bg-green-50 px-2 py-1 rounded">
                            Unit: {privateDetails.unitNumber}
                        </span>
                    ) : (
                        <div className="flex items-center gap-1">
                            <input 
                                type="password" 
                                placeholder="PIN" 
                                className="w-12 text-center text-xs border rounded py-1 bg-white dark:bg-gray-800 dark:text-white"
                                maxLength={4}
                                onChange={(e) => handlePinChange(item._id, e.target.value)}
                            />
                            <button onClick={() => handleUnlock(item._id, item.privateData)} className="text-gray-500 hover:text-blue-600">
                                <FaLock size={12} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. CURRENT RESIDENCES */}
      <div>
        {currentResidences.length > 0 ? (
           currentResidences.map(item => renderCard(item, false))
        ) : (
           history.length > 0 && <p className="text-gray-500 italic text-sm text-center py-4">No active residences.</p>
        )}
      </div>

      {/* 2. HISTORY SECTION */}
      {pastResidences.length > 0 && (
        <div className="border-t border-dashed border-gray-300 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <FaHistory /> Residence History
          </h3>
          <div className="opacity-90">
            {pastResidences.map(item => renderCard(item, true))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddCommunityPostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        residence={selectedResidence} 
      />
      
      <AddResidencyModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        refresh={handleEditSuccess}
        initialData={selectedResidence} 
      />
    </div>
  );
};

export default ResidenceList;