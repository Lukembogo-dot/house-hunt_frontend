import React, { useState, useEffect } from 'react';
import { FaHome, FaLock, FaUnlock, FaPlus, FaEyeSlash } from 'react-icons/fa';
import AddResidencyModal from '../../components/MyResidencies/AddResidencyModal';
import apiClient from '../../utils/apiClient'; // Assuming you have an axios instance
import { decryptData } from '../../utils/secureVault';

const MyResidencies = () => {
  const [residencies, setResidencies] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [vaultPin, setVaultPin] = useState('');
  const [isVaultUnlocked, setVaultUnlocked] = useState(false);

  // Fetch data on load
  useEffect(() => {
    fetchResidencies();
  }, []);

  const fetchResidencies = async () => {
    try {
      // Calls the 'living-community' endpoint we made earlier
      const { data } = await apiClient.get('/living-community/my-history'); 
      setResidencies(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleUnlockVault = (e) => {
    e.preventDefault();
    // In a real app, you might verify a hash of the PIN, 
    // but here we just set state to attempt decryption render.
    if (vaultPin.length >= 4) {
      setVaultUnlocked(true);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Housing Passport</h1>
          <p className="text-gray-500 text-sm">Track your living history. Your private notes are encrypted.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <FaPlus /> Add Home
        </button>
      </div>

      {/* Vault Lock Controls */}
      {!isVaultUnlocked ? (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-yellow-800">
            <FaLock />
            <span className="text-sm font-medium">Private details are encrypted. Enter Vault PIN to view.</span>
          </div>
          <form onSubmit={handleUnlockVault} className="flex gap-2">
            <input 
              type="password" 
              placeholder="Enter PIN" 
              className="px-3 py-1 rounded border border-yellow-300 text-sm"
              value={vaultPin}
              onChange={(e) => setVaultPin(e.target.value)}
            />
            <button type="submit" className="text-xs bg-yellow-600 text-white px-3 py-1 rounded">Unlock</button>
          </form>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6 flex items-center justify-between text-green-800">
          <div className="flex items-center gap-3">
            <FaUnlock />
            <span className="text-sm font-medium">Vault Unlocked. You can see your private notes.</span>
          </div>
          <button onClick={() => { setVaultUnlocked(false); setVaultPin(''); }} className="text-xs underline">Lock Vault</button>
        </div>
      )}

      {/* Timeline List */}
      <div className="space-y-6">
        {residencies.map((residency) => (
          <div key={residency._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Public/Shared Section (Top) */}
            <div className="p-5 flex justify-between items-start bg-gray-50 dark:bg-gray-700/50">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <FaHome size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{residency.buildingName}</h3>
                  <p className="text-sm text-gray-500">{residency.location?.neighborhood || 'Nairobi'} • {residency.residencyStatus}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">
                      {residency.rentalDetails?.unitType || 'Unit'}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      Rated: {residency.review?.rating}/5
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Move In</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {new Date(residency.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Private Vault Section (Bottom) */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                <FaLock size={10} /> Private Vault (Only You)
              </h4>
              
              {isVaultUnlocked ? (
                // Try to decrypt. If 'privateData' exists, decrypt it.
                (() => {
                  const decrypted = decryptData(residency.privateData, vaultPin);
                  return decrypted ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="block text-xs text-gray-400">Exact Unit No</span>
                        <span className="font-mono font-medium text-gray-700">{decrypted.unitNumber}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <span className="block text-xs text-gray-400">Actual Rent Paid</span>
                        <span className="font-mono font-medium text-gray-700">KES {decrypted.exactRent}</span>
                      </div>
                      <div className="col-span-2 bg-gray-50 p-3 rounded">
                        <span className="block text-xs text-gray-400">Private Notes</span>
                        <p className="text-gray-600 italic">"{decrypted.notes}"</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-500 text-sm">Incorrect PIN. Cannot decrypt data.</p>
                  );
                })()
              ) : (
                <div className="flex items-center gap-2 text-gray-400 italic text-sm">
                  <FaEyeSlash />
                  <span>Data is encrypted. Unlock vault to view Unit #, Rent, and Notes.</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AddResidencyModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} refresh={fetchResidencies} />
    </div>
  );
};

export default MyResidencies;