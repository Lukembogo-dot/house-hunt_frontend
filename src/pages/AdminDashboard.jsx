import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios'; 
import { useAuth } from '../context/AuthContext';
import { 
  FaEdit, 
  FaTrash, 
  FaUserShield, 
  FaSitemap, 
  FaStreetView,
  FaUserPlus,
  FaTimes,
  FaSpinner,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaUsers,    // <-- NEW ICON
  FaGlobe,    // <-- NEW ICON
  FaLock      // <-- NEW ICON
} from 'react-icons/fa';
import FailedQueries from '../components/FailedQueries';
import PendingApprovals from '../components/PendingApprovals';
import FeatureApprovalQueue from '../components/FeatureApprovalQueue'; // <-- 1. IMPORT THE NEW COMPONENT
import { motion, AnimatePresence } from 'framer-motion'; 


// --- ASSIGN AGENT MODAL (Unchanged) ---
const AssignAgentModal = ({ show, onClose, property, agents, onAssign }) => {
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedAgentId) {
      alert('Please select an agent.');
      return;
    }
    setIsSubmitting(true);
    await onAssign(property._id, selectedAgentId);
    setIsSubmitting(false);
    onClose(); // Close modal on success
  };
  
  // Reset selected agent when property changes
  useEffect(() => {
    setSelectedAgentId('');
  }, [property]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          disabled={isSubmitting}
        >
          <FaTimes size={20} />
        </button>
        
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Assign Agent to Property
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-1">
          Property: <strong>{property?.title}</strong>
        </p>

        <div className="mb-4">
          <label htmlFor="agentSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select an Agent
          </label>
          <select
            id="agentSelect"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">-- Please choose an agent --</option>
            {agents.map(agent => (
              <option key={agent._id} value={agent._id}>
                {agent.name} ({agent.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedAgentId}
            className="w-32 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : 'Assign Agent'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
// ---------------------------------------------


const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [allAgents, setAllAgents] = useState([]); 
  const [featureFlags, setFeatureFlags] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const [newFeatureKey, setNewFeatureKey] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');
  const [isCreatingFeature, setIsCreatingFeature] = useState(false);
  
  // --- NEW STATE for the "Add User" dropdowns ---
  const [selectedUserMap, setSelectedUserMap] = useState({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [usersRes, propertiesRes, reviewsRes, servicesRes, agentsRes, featuresRes] = await Promise.all([
        apiClient.get('/users', { withCredentials: true }),
        apiClient.get('/properties'),
        apiClient.get('/reviews', { withCredentials: true }),
        apiClient.get('/services'), 
        apiClient.get('/users/all-agents', { withCredentials: true }), 
        apiClient.get('/admin/features', { withCredentials: true }) // This now populates 'allowedUsers'
      ]);
      setUsers(usersRes.data);
      setProperties(propertiesRes.data.properties);
      setReviews(reviewsRes.data);
      setServices(servicesRes.data.services);
      setAllAgents(agentsRes.data); 
      setFeatureFlags(featuresRes.data); 

    } catch (err) {
      setError('Failed to fetch admin data. You may not be authorized.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- (All delete... and updateUserRole functions are unchanged) ---
  const deleteProperty = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await apiClient.delete(`/properties/${id}`, { withCredentials: true });
        fetchData();
      } catch (err) {
        alert('Failed to delete property.');
      }
    }
  };

  const deleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await apiClient.delete(`/reviews/${id}`, { withCredentials: true });
        fetchData();
      } catch (err) {
        alert('Failed to delete review.');
      }
    }
  };
  
  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      if (id === user._id) {
        alert("You cannot delete your own admin account.");
        return;
      }
      try {
        await apiClient.delete(`/users/${id}`, { withCredentials: true });
        fetchData();
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  const deleteService = async (id) => {
    if (window.confirm('Are you sure you want to delete this service post?')) {
      try {
        await apiClient.delete(`/services/${id}`, { withCredentials: true });
        fetchData(); // Refresh data
      } catch (err) {
        alert('Failed to delete service post.');
      }
    }
  };

  const updateUserRole = async (id, newRole) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        await apiClient.put(`/users/${id}`, { role: newRole }, { withCredentials: true });
        fetchData(); // Refresh the user list
      } catch (err) {
        alert('Failed to update user role.');
      }
    }
  };
  
  // --- (Modal handlers are unchanged) ---
  const openAssignModal = (property) => {
    setSelectedProperty(property);
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setSelectedProperty(null);
    setIsAssignModalOpen(false);
  };

  const handleAssignAgent = async (propertyId, agentId) => {
    try {
      const { data } = await apiClient.put(
        `/admin/properties/${propertyId}/assign-agent`, 
        { agentId },
        { withCredentials: true }
      );
      alert(data.message);
      fetchData(); // Refresh all data on success
    } catch (err) {
      alert(`Failed to assign agent: ${err.response?.data?.message || 'Server Error'}`);
      console.error(err);
    }
  };

  // --- (handleCreateFeature is unchanged) ---
  const handleCreateFeature = async (e) => {
    e.preventDefault();
    if (!newFeatureKey || !newFeatureDesc) {
      alert('Please provide both a key and a description.');
      return;
    }
    setIsCreatingFeature(true);
    try {
      const { data } = await apiClient.post('/admin/features', { 
        key: newFeatureKey.toLowerCase().trim().replace(/\s+/g, '-'), // Sanitize key
        description: newFeatureDesc 
      }, { withCredentials: true });
      
      setFeatureFlags([data, ...featureFlags]); // Add new flag to top of list
      setNewFeatureKey('');
      setNewFeatureDesc('');
      alert('Feature flag created successfully.');
    } catch (err) {
      alert(`Failed to create feature: ${err.response?.data?.message || 'Server Error'}`);
    } finally {
      setIsCreatingFeature(false);
    }
  };

  // --- THIS FUNCTION IS REMOVED ---
  // const handleToggleFeature = async (id, currentStatus) => { ... };

  // --- NEW HANDLER FUNCTIONS ---
  const handleStrategyChange = async (flagId, newStrategy) => {
    try {
      const { data } = await apiClient.put(
        `/admin/features/${flagId}/strategy`, 
        { strategy: newStrategy }, 
        { withCredentials: true }
      );
      // Update local state
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
      // Update local state with populated data
      setFeatureFlags(flags => flags.map(f => f._id === flagId ? data : f));
      // Clear the dropdown
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
        // Update local state with populated data
        setFeatureFlags(flags => flags.map(f => f._id === flagId ? data : f));
      } catch (err) {
        alert(`Failed to remove user: ${err.response?.data?.message}`);
      }
    }
  };

  // Helper to update the "Add User" dropdown state
  const handleUserSelectChange = (flagId, userId) => {
    setSelectedUserMap(prev => ({ ...prev, [flagId]: userId }));
  };
  // ----------------------------------


  if (loading) return <div className="p-10 text-center dark:text-gray-300">Loading Admin Dashboard...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <>
      <div className="container mx-auto p-6 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Admin Dashboard</h1>

        {/* --- (Stats Section is Unchanged) --- */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link 
                  to="/admin/seo-manager" 
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-200 dark:border-gray-700 flex items-center space-x-4"
              >
                  <FaSitemap className="text-4xl text-blue-500" />
                  <div>
                      <h3 className="text-xl font-semibold dark:text-gray-100">SEO Manager</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage all meta tags & schema.</p>
                  </div>
              </Link>

              <Link 
                  to="#manage-services" // Link to the new section ID
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-200 dark:border-gray-700 flex items-center space-x-4"
              >
                  <FaStreetView className="text-4xl text-green-500" />
                  <div>
                      <h3 className="text-xl font-semibold dark:text-gray-100">Neighbourhood Watch</h3>
                      <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{services.length}</p>
                  </div>
              </Link>

              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold dark:text-gray-100">Total Properties</h3>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{properties.length}</p>
              </div>
              
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold dark:text-gray-100">Total Users</h3>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{users.length}</p>
              </div>
          </div>
        </section>
        
        <PendingApprovals />

        {/* --- 2. ADD THE NEW FEATURE APPROVAL QUEUE HERE --- */}
        <FeatureApprovalQueue />

        {/* === FEATURE FLAG MANAGEMENT (UPDATED UI) === */}
        <section id="feature-flags" className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">Feature Flag Management ({featureFlags.length})</h2>
          
          {/* --- Create New Flag Form (Unchanged) --- */}
          <form onSubmit={handleCreateFeature} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="featureKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feature Key (e.g., 'new-search')</label>
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
          </form>

          {/* --- List of Flags (NEW UI) --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featureFlags.map((flag) => {
              // Get users *not* already in this flag's beta list
              const allowedUserIds = (flag.allowedUsers || []).map(u => u._id);
              const availableUsers = users.filter(u => !allowedUserIds.includes(u._id));

              return (
                <div key={flag._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:border dark:border-gray-700 flex flex-col">
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold dark:text-white">{flag.description}</h3>
                    <p className="font-mono text-sm text-gray-500 dark:text-gray-400 mb-4">{flag.key}</p>
                    
                    {/* Strategy Selector */}
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

                    {/* Beta Testers Management (conditional) */}
                    {flag.rolloutStrategy === 'specific_users' && (
                      <div className="border-t dark:border-gray-700 pt-4">
                        <h4 className="text-lg font-semibold dark:text-gray-100 mb-2">Beta Testers ({(flag.allowedUsers || []).length})</h4>
                        
                        {/* List of current testers */}
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
                        
                        {/* Add new tester form */}
                        <div className="flex gap-2">
                          <select
                            value={selectedUserMap[flag._id] || ''}
                            // --- THIS IS THE FIX ---
                            onChange={(e) => handleUserSelectChange(flag._id, e.target.value)}
                            // -----------------------
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

                  {/* Status Indicator */}
                  <div className="border-t dark:border-gray-700 mt-4 pt-4">
                    {(flag.rolloutStrategy === 'all' || flag.isEnabled === true) && ( // Added fallback for old data
                      <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                        <FaGlobe />
                        <span>Live for all users</span>
                      </div>
                    )}
                    {flag.rollallStrategy === 'specific_users' && (
                      <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                        <FaUsers />
                        <span>Live for {(flag.allowedUsers || []).length} beta tester(s)</span>
                      </div>
                    )}
                    {(flag.rolloutStrategy === 'none' || (!flag.rolloutStrategy && !flag.isEnabled)) && ( // Added fallback for old data
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
        </section>
        {/* ---------------------------------- */}

        {/* --- (All other sections are unchanged) --- */}

        {/* === Manage Properties === */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold dark:text-gray-100">Manage Properties ({properties.length})</h2>
            <Link to="/add-property" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-500">
              + Add Property
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
            <table className="w-full min-w-[800px]"><thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-b dark:border-gray-600">
                  <th className="p-3 text-left dark:text-gray-300">Title</th>
                  <th className="p-3 text-left dark:text-gray-300">Location</th>
                  <th className="p-3 text-left dark:text-gray-300">Price (Ksh)</th>
                  <th className="p-3 text-left dark:text-gray-300">Agent</th>
                  <th className="p-3 text-left dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => (
                  <tr key={prop._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 dark:text-gray-200">{prop.title}</td>
                    <td className="p-3 dark:text-gray-200">{prop.location}</td>
                    <td className="p-3 dark:text-gray-200">{prop.price.toLocaleString()}</td>
                    
                    <td className="p-3 dark:text-gray-200 text-sm">
                      {prop.agent ? (
                        <span className="font-semibold">{prop.agent.name}</span>
                      ) : (
                        <span className="font-semibold text-red-500 dark:text-red-400">
                          Admin Property
                        </span>
                      )}
                    </td>
                    
                    <td className="p-3 flex space-x-3">
                      <Link to={`/admin/property/${prop._id}/edit`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" title="Edit">
                        <FaEdit />
                      </Link>
                      <button onClick={() => deleteProperty(prop._id)} className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400" title="Delete">
                        <FaTrash />
                      </button>
                      <button 
                        onClick={() => openAssignModal(prop)} 
                        className="text-green-600 dark:text-green-500 hover:text-green-800 dark:hover:text-green-400" 
                        title="Assign/Re-assign Agent"
                      >
                        <FaUserPlus />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* === Manage Neighbourhood Watch === */}
        <section id="manage-services" className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold dark:text-gray-100">Manage Neighbourhood Watch ({services.length})</h2>
            <Link to="/admin/add-service" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 dark:hover:bg-green-500">
              + Add Service Post
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
            <table className="w-full min-w-[600px]"><thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-b dark:border-gray-600">
                  <th className="p-3 text-left dark:text-gray-300">Title</th>
                  <th className="p-3 text-left dark:text-gray-300">Service Type</th>
                  <th className="p-3 text-left dark:text-gray-300">Location</th>
                  <th className="p-3 text-left dark:text-gray-300">Reviews</th>
                  <th className="p-3 text-left dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 dark:text-gray-200">{service.title}</td>
                    <td className="p-3 dark:text-gray-200">{service.serviceType}</td>
                    <td className="p-3 dark:text-gray-200">{service.location}</td>
                    <td className="p-3 dark:text-gray-200">{service.numReviews}</td>
                    <td className="p-3 flex space-x-3">
                      <Link to={`/admin/add-service/${service._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" title="Edit">
                        <FaEdit />
                      </Link>
                      <button onClick={() => deleteService(service._id)} className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400" title="Delete">
                        <FaTrash />
                      </button>
                      <Link to={`/services/slug/${service.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-blue-500" title="View Post">
                        (View)
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* === Manage Users === */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">Manage Users ({users.length})</h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
            <table className="w-full min-w-[500px]"><thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-b dark:border-gray-600">
                  <th className="p-3 text-left dark:text-gray-300">Name</th>
                  <th className="p-3 text-left dark:text-gray-300">Email</th>
                  <th className="p-3 text-left dark:text-gray-300">Role</th>
                  <th className="p-3 text-left dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 dark:text-gray-20Details">{u.name}</td>
                    <td className="p-3 dark:text-gray-20Details">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        u.role === 'admin' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : u.role === 'agent' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 flex space-x-3">
                      {u.role === 'user' && (
                        <button onClick={() => updateUserRole(u._id, 'agent')} className="text-purple-600 dark:text-purple-400 hover:text-purple-800" title="Promote to Agent">
                          <FaUserShield />
                        </button>
                      )}
                      {u.role === 'agent' && (
                        <button onClick={() => updateUserRole(u._id, 'user')} className="text-gray-500 hover:text-gray-700" title="Demote to User">
                          (demote)
                        </button>
                      )}
                      {u._id !== user._id && (
                        <button onClick={() => deleteUser(u._id)} className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400" title="Delete">
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <FailedQueries />

        {/* === Manage Reviews === */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">Manage Property Reviews ({reviews.length})</h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
            <table className="w-full min-w-[600px]"><thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-b dark:border-gray-600">
                  <th className="p-3 text-left dark:text-gray-300">Comment</th>
                  <th className="p-3 text-left dark:text-gray-300">Rating</th>
                  <th className="p-3 text-left dark:text-gray-300">User</th>
                  <th className="p-3 text-left dark:text-gray-300">Property</th>
                  <th className="p-3 text-left dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 truncate max-w-xs dark:text-gray-200">{review.comment}</td>
                    <td className="p-3 dark:text-gray-200">{review.rating} ★</td>
                    <td className="p-3 dark:text-gray-200">{review.user?.name || 'Anonymous'}</td>
                    <td className="p-3 truncate max-w-xs dark:text-gray-200">{review.property?.title || 'N/A'}</td>
                    <td className="p-3">
                      <button onClick={() => deleteReview(review._id)} className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400" title="Delete">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* --- (Modal is Unchanged) --- */}
      <AnimatePresence>
        <AssignAgentModal
          show={isAssignModalOpen}
          onClose={closeAssignModal}
          property={selectedProperty}
          agents={allAgents}
          onAssign={handleAssignAgent}
        />
      </AnimatePresence>
    </>
  );
};

export default AdminDashboard;