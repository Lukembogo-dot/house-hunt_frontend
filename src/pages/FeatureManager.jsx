import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios'; 
import { 
  FaUserPlus,
  FaTimes,
  FaSpinner,
  FaPlus,
  FaUsers,
  FaGlobe,
  FaLock
} from 'react-icons/fa';
import FeatureApprovalQueue from '../components/FeatureApprovalQueue'; // We will use this here

// This component combines both the queue and the management UI
const FeatureManager = () => {
  const [users, setUsers] = useState([]);
  const [featureFlags, setFeatureFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for the "Create Flag Manually" form
  const [newFeatureKey, setNewFeatureKey] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');
  const [isCreatingFeature, setIsCreatingFeature] = useState(false);
  
  // State for the "Add User" dropdowns
  const [selectedUserMap, setSelectedUserMap] = useState({});

  // This fetch is for the "Flag Management" section
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // We need users (for the dropdown) and the feature flags
      const [usersRes, featuresRes] = await Promise.all([
        apiClient.get('/users', { withCredentials: true }),
        apiClient.get('/admin/features', { withCredentials: true }) 
      ]);
      setUsers(usersRes.data);
      setFeatureFlags(featuresRes.data); 

    } catch (err) {
      setError('Failed to fetch feature data. You may not be authorized.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- All the handlers from AdminDashboard.jsx are moved here ---

  const handleCreateFeature = async (e) => {
    e.preventDefault();
    if (!newFeatureKey || !newFeatureDesc) {
      alert('Please provide both a key and a description.');
      return;
    }
    setIsCreatingFeature(true);
    try {
      const { data } = await apiClient.post('/admin/features', { 
        key: newFeatureKey.toLowerCase().trim().replace(/\s+/g, '-'),
        description: newFeatureDesc 
      }, { withCredentials: true });
      
      setFeatureFlags([data, ...featureFlags]);
      setNewFeatureKey('');
      setNewFeatureDesc('');
      alert('Feature flag created successfully.');
    } catch (err) {
      alert(`Failed to create feature: ${err.response?.data?.message || 'Server Error'}`);
    } finally {
      setIsCreatingFeature(false);
    }
  };

  const handleStrategyChange = async (flagId, newStrategy) => {
    try {
      const { data } = await apiClient.put(
        `/admin/features/${flagId}/strategy`, 
        { strategy: newStrategy }, 
        { withCredentials: true }
      );
      setFeatureFlags(flags => flags.map(f => f._id === flagId ? { ...f, rolloutStrategy: data.rolloutStrategy } : f));
    } catch (err) {
      alert(`Failed to update strategy: ${err.response?.data?.message}`);
    }
  };

  const handleAddUserToFlag = async (flagId) => {
    const userId = selectedUserMap[flagId];
    if (!userId) {
      alert('Please select a user to add.');
      return;
    }
    
    try {
      const { data } = await apiClient.put(
        `/admin/features/${flagId}/add-user`, 
        { userId }, 
        { withCredentials: true }
      );
      setFeatureFlags(flags => flags.map(f => f._id === flagId ? data : f));
      setSelectedUserMap(prev => ({ ...prev, [flagId]: '' }));
    } catch (err) {
      alert(`Failed to add user: ${err.response?.data?.message}`);
    }
  };

  const handleRemoveUserFromFlag = async (flagId, userId) => {
    if (window.confirm('Are you sure you want to remove this user from the beta test?')) {
      try {
        const { data } = await apiClient.put(
          `/admin/features/${flagId}/remove-user`, 
          { userId }, 
          { withCredentials: true }
        );
        setFeatureFlags(flags => flags.map(f => f._id === flagId ? data : f));
      } catch (err) {
        alert(`Failed to remove user: ${err.response?.data?.message}`);
      }
    }
  };

  const handleUserSelectChange = (flagId, userId) => {
    setSelectedUserMap(prev => ({ ...prev, [flagId]: userId }));
  };

  return (
    <div className="container mx-auto p-6 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Feature Management</h1>
      
      {/* 1. APPROVAL QUEUE (Self-contained component) */}
      <FeatureApprovalQueue />

      {/* 2. FLAG MANAGEMENT (All the JSX from AdminDashboard) */}
      <section id="feature-flags" className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">Feature Flag Controls ({featureFlags.length})</h2>
        
        {/* --- Create New Flag Form --- */}
        <form onSubmit={handleCreateFeature} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 mb-6">
          <h3 className="text-lg font-semibold dark:text-gray-100 mb-3">Create Flag Manually</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Use this only if a feature was not submitted via the approval queue.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="featureKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feature Key</label>
              <input
                type="text"
                id="featureKey"
                value={newFeatureKey}
                onChange={(e) => setNewFeatureKey(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="new-ai-chat"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="featureDesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <input
                type="text"
                id="featureDesc"
                value={newFeatureDesc}
                onChange={(e) => setNewFeatureDesc(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="The new AI-powered chat widget"
              />
            </div>
            <button
              type="submit"
              disabled={isCreatingFeature}
              className="flex-shrink-0 md:self-end bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isCreatingFeature ? <FaSpinner className="animate-spin" /> : <FaPlus />}
              <span>Create Feature</span>
            </button>
          </div>
        </form>

        {/* --- List of Flags --- */}
        {loading ? (
          <p className="dark:text-gray-300">Loading feature flags...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featureFlags.map((flag) => {
              const allowedUserIds = (flag.allowedUsers || []).map(u => u._id);
              const availableUsers = users.filter(u => !allowedUserIds.includes(u._id));

              return (
                <div key={flag._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:border dark:border-gray-700 flex flex-col">
                  {/* ... (This is the same card JSX from AdminDashboard.jsx) ... */}
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold dark:text-white">{flag.description}</h3>
                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mb-4">{flag.key}</p>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rollout Strategy</label>
                      <select
                        value={flag.rolloutStrategy || 'none'}
                        onChange={(e) => handleStrategyChange(flag._id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="none">Locked (Off for Everyone)</option>
                        <option value="all">Unlocked (On for Everyone)</option>
                        <option value="specific_users">Beta (Specific Users Only)</option>
                      </select>
                    </div>

                    {flag.rolloutStrategy === 'specific_users' && (
                      <div className="border-t dark:border-gray-700 pt-4">
                        <h4 className="text-lg font-semibold dark:text-gray-100 mb-2">Beta Testers ({(flag.allowedUsers || []).length})</h4>
                        
                        <ul className="mb-4 space-y-2 max-h-40 overflow-y-auto">
                          {(flag.allowedUsers || []).length > 0 ? (
                            flag.allowedUsers.map(user => (
                              <li key={user._id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                <span className="dark:text-gray-200 text-sm">{user.name} ({user.email})</span>
                                <button
                                  onClick={() => handleRemoveUserFromFlag(flag._id, user._id)}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                  title="Remove user"
                                >
                                  <FaTimes />
                                </button>
                              </li>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No users in this beta test.</p>
                          )}
                        </ul>
                        
                        <div className="flex gap-2">
                          <select
                            value={selectedUserMap[flag._id] || ''}
                            onChange={(e) => handleUserSelectChange(flag._id, e.target.value)}
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="">-- Select a user to add --</option>
                            {availableUsers.map(user => (
                              <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAddUserToFlag(flag._id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex-shrink-0"
                          >
                            <FaUserPlus />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t dark:border-gray-700 mt-4 pt-4">
                    {/* ... (This is the same status indicator JSX) ... */}
                    {(flag.rolloutStrategy === 'all' || flag.isEnabled === true) && (
                      <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                        <FaGlobe />
                        <span>Live for all users</span>
                      </div>
                    )}
                    {flag.rolloutStrategy === 'specific_users' && (
                      <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                        <FaUsers />
                        <span>Live for {(flag.allowedUsers || []).length} beta tester(s)</span>
                      </div>
                    )}
                    {(flag.rolloutStrategy === 'none' || (!flag.rolloutStrategy && !flag.isEnabled)) && (
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <FaLock />
                        <span>Locked for all users</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default FeatureManager;