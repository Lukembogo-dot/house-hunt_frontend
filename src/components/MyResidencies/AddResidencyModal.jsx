import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaMapMarkerAlt, FaLock, FaStar, FaBuilding } from 'react-icons/fa';
import apiClient from '../../utils/apiClient';
import { encryptData } from '../../utils/secureVault';

const AddResidencyModal = ({ isOpen, onClose, refresh, initialData = null }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // ✅ Auto-Complete State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Public Data
  const [formData, setFormData] = useState({
    buildingName: '',
    neighborhood: '',
    residencyStatus: 'Current Tenant',
    rating: 5,
    reviewContent: '',
    unitType: '1 Bedroom',
  });

  // Private Data
  const [privateData, setPrivateData] = useState({
    unitNumber: '',
    exactRent: '',
    notes: ''
  });

  const [vaultPin, setVaultPin] = useState('');

  // PRE-FILL DATA IF EDITING
  useEffect(() => {
    if (initialData) {
      setFormData({
        buildingName: initialData.buildingName || '',
        neighborhood: initialData.location?.neighborhood || '',
        residencyStatus: initialData.residencyStatus || 'Current Tenant',
        rating: initialData.review?.rating || 5,
        reviewContent: initialData.review?.content || '',
        unitType: initialData.rentalDetails?.unitType || '1 Bedroom',
      });
    } else {
      // Reset
      setFormData({
        buildingName: '',
        neighborhood: '',
        residencyStatus: 'Current Tenant',
        rating: 5,
        reviewContent: '',
        unitType: '1 Bedroom',
      });
    }
  }, [initialData]);

  // ✅ HANDLE BUILDING SEARCH (Auto-Complete)
  const handleBuildingChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, buildingName: value });

    if (value.length > 2) {
      try {
        const { data } = await apiClient.get(`/living-community/search-buildings?query=${value}`);
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Search failed", error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // ✅ HANDLE BUILDING SELECTION
  const selectBuilding = (building) => {
    setFormData({
      ...formData,
      buildingName: building.name,
      neighborhood: building.neighborhood // Auto-fill neighborhood
    });
    setShowSuggestions(false); // Hide dropdown
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let encryptedBlob = null;
      if (vaultPin && (privateData.unitNumber || privateData.exactRent)) {
         encryptedBlob = encryptData(privateData, vaultPin);
      }

      const payload = {
        buildingName: formData.buildingName,
        location: {
          address: formData.neighborhood,
          neighborhood: formData.neighborhood,
        },
        review: {
          title: `${formData.residencyStatus} Review`,
          content: formData.reviewContent,
          rating: formData.rating
        },
        residencyStatus: formData.residencyStatus,
        rentalDetails: {
          unitType: formData.unitType,
        },
        privateData: encryptedBlob 
      };

      if (initialData) {
        await apiClient.put(`/living-community/experience/${initialData._id}`, payload);
        alert('Passport updated successfully!');
      } else {
        await apiClient.post('/living-community/experience', payload);
        alert('Passport created! Welcome home.');
      }
      
      refresh(); 
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to save residency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
            {step === 1 ? <FaMapMarkerAlt className="text-blue-500"/> : <FaShieldAlt className="text-green-500"/>}
            {initialData ? 'Edit Residence' : 'Claim Your Residence'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">✕</button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              
              {/* ✅ BUILDING NAME INPUT WITH AUTO-COMPLETE */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Building Name</label>
                <div className="relative">
                    <input 
                      className="w-full p-2 pl-9 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Prestige Plaza"
                      value={formData.buildingName}
                      onChange={handleBuildingChange}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                      autoComplete="off"
                    />
                    <FaBuilding className="absolute left-3 top-3 text-gray-400" />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mt-1 shadow-xl max-h-48 overflow-y-auto">
                        {suggestions.map((b) => (
                            <li 
                                key={b._id}
                                onClick={() => selectBuilding(b)}
                                className="p-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 flex justify-between items-center"
                            >
                                <div>
                                    <div className="font-bold text-gray-800 dark:text-gray-200 text-sm">{b.name}</div>
                                    <div className="text-xs text-gray-500">{b.neighborhood}</div>
                                </div>
                                <div className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300">
                                    {b.totalReviews} reviews
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <p className="text-xs text-gray-500 mt-1">Start typing to see if your building is already rated.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Neighborhood</label>
                  <input 
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g. Kilimani"
                    value={formData.neighborhood}
                    onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label>
                  <select 
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={formData.residencyStatus}
                    onChange={e => setFormData({...formData, residencyStatus: e.target.value})}
                  >
                    <option>Current Tenant</option>
                    <option>Moving Out Soon</option>
                    <option>Past Tenant</option>
                  </select>
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium mb-1 dark:text-gray-300">Public Review</label>
                 <textarea 
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                    rows="2"
                    placeholder="What is it like living here?"
                    value={formData.reviewContent}
                    onChange={e => setFormData({...formData, reviewContent: e.target.value})}
                 />
              </div>
              <button 
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold mt-4 transition"
              >
                Next: Vault Details (Optional)
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-3 rounded-lg text-xs flex gap-2 border border-green-200 dark:border-green-800">
                <FaLock className="mt-1 flex-shrink-0"/>
                <p>Data entered here is <strong>Encrypted</strong>. HouseHunt admins cannot read this.</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                 <FaStar />
                 <span><strong>Tip:</strong> Filling these optional fields earns you +50 Bonus XP!</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Unit Number <span className="text-gray-400 text-xs">(Optional)</span></label>
                  <input 
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g. B4"
                    value={privateData.unitNumber}
                    onChange={e => setPrivateData({...privateData, unitNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Rent (KES) <span className="text-gray-400 text-xs">(Optional)</span></label>
                  <input 
                    type="number"
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g. 45000"
                    value={privateData.exactRent}
                    onChange={e => setPrivateData({...privateData, exactRent: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 border-t dark:border-gray-700">
                <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-white">Set Vault PIN (Required if filling above)</label>
                <input 
                  type="password"
                  className="w-full p-3 border-2 border-green-500 rounded-lg dark:bg-gray-700 dark:text-white tracking-widest text-center text-lg"
                  placeholder="****"
                  maxLength={4}
                  value={vaultPin}
                  onChange={e => setVaultPin(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="flex-1 text-gray-500 hover:text-gray-700">Back</button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition shadow-lg"
                >
                  {loading ? 'Saving...' : 'Save & Finish'}
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