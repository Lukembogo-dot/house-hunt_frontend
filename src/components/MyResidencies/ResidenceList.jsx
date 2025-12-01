import React, { useEffect, useState } from 'react';
import { FaHome, FaLock, FaUnlock, FaEyeSlash, FaBullhorn, FaEdit, FaHistory, FaCheckCircle, FaSearch, FaStar } from 'react-icons/fa'; 
import apiClient from '../../utils/apiClient';
import { decryptData } from '../../utils/secureVault';
import AddCommunityPostModal from '../Community/AddCommunityPostModal';
import AddResidencyModal from './AddResidencyModal'; 

const ResidenceList = ({ refreshTrigger }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlockedVaults, setUnlockedVaults] = useState({});
  const [pinInputs, setPinInputs] = useState({}); 

  // Modal States
  const [selectedResidence, setSelectedResidence] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // State to trigger the "Add" modal from the Zero State card
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const fetchHistory = async () => {
    try {
      // ✅ This endpoint now uses ownerHash on the backend, but the frontend call remains the same.
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
    if (!pin) return alert("Please enter your Vault PIN.");
    
    // Safety check: if blob is missing/null (e.g. user skipped Step 3)
    if (!encryptedBlob) {
       return alert("No private data was saved for this residence.");
    }

    const decrypted = decryptData(encryptedBlob, pin);
    if (decrypted) {
      setUnlockedVaults(prev => ({ ...prev, [id]: decrypted }));
    } else {
      alert("Incorrect PIN. Access Denied.");
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
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleAddSuccess = () => {
    fetchHistory();
    setTimeout(() => window.location.reload(), 1000);
  };

  if (loading) return <div className="text-center py-4 text-gray-400">Loading passport...</div>;

  // ✅ THE NEW "ZERO STATE" PROMO CARD
  if (history.length === 0) {
    return (
      <>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700 rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FaStar className="text-4xl text-yellow-400" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            You haven't activated your Housing Passport
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto leading-relaxed">
            Did you know? You can rate <strong>ANY apartment or building</strong> in Kenya using your passport—even if it's not listed on our site!
          </p>

          <ul className="text-sm text-left max-w-xs mx-auto space-y-3 mb-8 text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500 flex-shrink-0" />
              <span>Review your landlord & water consistency.</span>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500 flex-shrink-0" />
              <span>Help the community discover hidden gems.</span>
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500 flex-shrink-0" />
              <span>Earn <strong>+100 XP</strong> immediately.</span>
            </li>
          </ul>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <FaSearch /> Rate My Apartment Now
          </button>
        </div>

        {/* We include the modal here specifically for the Zero State trigger */}
        <AddResidencyModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          refresh={handleAddSuccess} 
        />
      </>
    );
  }

  // ✅ Filter Lists
  const currentResidences = history.filter(h => h.residencyStatus !== 'Past Tenant');
  const pastResidences = history.filter(h => h.residencyStatus === 'Past Tenant');

  const renderCard = (item, isPast = false) => {
    const isUnlocked = unlockedVaults[item._id];
    const privateDetails = isUnlocked ? unlockedVaults[item._id] : null;
    
    // Check if vault data actually exists (User might have skipped Step 3)
    const hasPrivateData = !!item.privateData;

    return (
      <div key={item._id} className={`bg-white dark:bg-gray-800 border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-4 ${isPast ? 'opacity-75 border-gray-200 dark:border-gray-700' : 'border-blue-100 dark:border-blue-800'}`}>
        
        {/* Header */}
        <div className={`p-5 flex items-start justify-between ${isPast ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}>
          <div className="flex gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isPast ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
              {isPast ? <FaHistory size={20} /> : <FaHome size={20} />}
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-2">
                {item.buildingName}
                {item.residencyStatus === 'Moving Out Soon' && (
                   <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200 uppercase tracking-wide">Moving Out</span>
                )}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.location?.neighborhood} • <span className="font-medium">{item.residencyStatus}</span>
              </p>
              
              <div className="flex gap-2 mt-3">
                {!isPast && (
                  <button 
                    onClick={() => openPostModal(item)}
                    className="flex items-center gap-1 text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition shadow-sm"
                  >
                    <FaBullhorn /> Post Update
                  </button>
                )}
                {/* EDIT BUTTON */}
                <button 
                  onClick={() => openEditModal(item)}
                  className="flex items-center gap-1 text-xs font-bold bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition shadow-sm"
                >
                  <FaEdit /> Edit Status
                </button>
              </div>
            </div>
          </div>
          
          {/* Date Display */}
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">{isPast ? 'Moved Out' : 'Verified'}</p>
            <p className="font-mono text-sm font-bold text-gray-600 dark:text-gray-300">
              {new Date(item.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Vault Section - Only show if private data exists */}
        {hasPrivateData ? (
          <div className="p-5 border-t border-gray-100 dark:border-gray-700 relative">
            <div className="flex items-center gap-2 mb-3">
              {isUnlocked ? <FaUnlock className="text-green-500"/> : <FaLock className="text-red-500"/>}
              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Private Vault
              </h5>
            </div>

            {isUnlocked ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800 animate-in fade-in">
                <div>
                  <span className="block text-xs text-gray-500 dark:text-green-200">Unit Number</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-green-100 text-lg">{privateDetails.unitNumber || 'N/A'}</span>
                </div>
                {/* Note: Rent is now Public/Anonymous by default (in rentalDetails), 
                   but if user saved old private rent or specific notes, show them here.
                */}
                <div className="md:col-span-3">
                  <span className="block text-xs text-gray-500 dark:text-green-200">Private Notes</span>
                  <p className="text-sm text-gray-700 dark:text-green-100 italic">"{privateDetails.notes || 'No notes'}"</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex-1 text-sm text-gray-500 dark:text-gray-400 italic flex items-center gap-2">
                  <FaEyeSlash /> Data encrypted. {isPast ? 'Access archived data with PIN.' : 'Enter PIN to view.'}
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <input 
                    type="password"
                    placeholder="PIN"
                    maxLength={4}
                    className="w-24 px-3 py-2 text-center border rounded bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white text-sm font-bold tracking-widest"
                    value={pinInputs[item._id] || ''}
                    onChange={(e) => handlePinChange(item._id, e.target.value)}
                  />
                  <button 
                    onClick={() => handleUnlock(item._id, item.privateData)}
                    className="bg-gray-800 text-white px-4 py-2 rounded text-xs font-bold hover:bg-gray-700 transition"
                  >
                    Unlock
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Fallback if no private vault data was set
          <div className="p-5 border-t border-gray-100 dark:border-gray-700">
             <p className="text-xs text-gray-400 italic text-center">No private vault data stored.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
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