import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import { 
  FaPlus, 
  FaSpinner, 
  FaHourglassHalf, 
  FaCheck, 
  FaRocket, 
  FaFlag 
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const FeatureApprovalQueue = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the "Submit" form
  const [newKey, setNewKey] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for loading on individual buttons
  const [actionLoading, setActionLoading] = useState({});

  // Fetch all pending, beta, and live updates
  const fetchUpdates = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/admin/updates', { withCredentials: true });
      setUpdates(data);
    } catch (err) {
      setError('Failed to fetch feature updates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  // Handle submitting a new feature for review
  const handleSubmitNewFeature = async (e) => {
    e.preventDefault();
    if (!newKey || !newDesc) {
      alert('Please provide a feature key and description.');
      return;
    }
    setIsSubmitting(true);
    try {
      const sanitizedKey = newKey.toLowerCase().trim().replace(/\s+/g, '-');
      // --- THIS IS THE FIX: Removed "/submit" ---
      const { data } = await apiClient.post('/admin/updates', 
        { featureKey: sanitizedKey, description: newDesc },
        { withCredentials: true }
      );
      setUpdates([data, ...updates]); // Add to top of list
      setNewKey('');
      setNewDesc('');
    } catch (err) {
      alert(`Failed to submit: ${err.response?.data?.message || 'Server Error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle approving a "pending" feature to "beta"
  const handleApproveBeta = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      const { data } = await apiClient.put(`/admin/updates/${id}/approve-beta`, {}, { withCredentials: true });
      // Update the item in our list
      setUpdates(updates.map(u => (u._id === id ? data : u)));
    } catch (err) {
      alert(`Failed to approve: ${err.response?.data?.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle promoting a "beta" feature to "live"
  const handleReleaseLive = async (id) => {
    if (!window.confirm('Are you sure you want to release this feature to all users?')) {
      return;
    }
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      const { data } = await apiClient.put(`/admin/updates/${id}/release-live`, {}, { withCredentials: true });
      // Update the item in our list
      setUpdates(updates.map(u => (u._id === id ? data : u)));
    } catch (err) {
      alert(`Failed to release: ${err.response?.data?.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return <p className="dark:text-gray-300">Loading feature queue...</p>;
  }
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // Helper to get status button/badge
  const getStatusDisplay = (update) => {
    const isLoading = actionLoading[update._id];
    
    switch (update.status) {
      case 'pending':
        return (
          <button 
            onClick={() => handleApproveBeta(update._id)}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
            <span>Approve for Beta</span>
          </button>
        );
      case 'beta':
        return (
          <button 
            onClick={() => handleReleaseLive(update._id)}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaRocket />}
            <span>Release to Live</span>
          </button>
        );
      case 'live':
        return (
          <div className="w-full flex items-center justify-center space-x-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-2 rounded-lg font-semibold">
            <FaFlag />
            <span>Live</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section id="approval-queue" className="mb-12">
      <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">Feature Approval Queue</h2>
      
      {/* --- Submit New Feature Form --- */}
      <form onSubmit={handleSubmitNewFeature} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 mb-6">
        <h3 className="text-lg font-semibold dark:text-gray-100 mb-3">Submit New Feature for Review</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="featureKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Feature Key (e.g., 'new-search')</label>
            <input
              type="text"
              id="featureKey"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="new-property-card"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="featureDesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <input
              type="text"
              id="featureDesc"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="The new card design for property lists"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-shrink-0 md:self-end bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaPlus />}
            <span>Submit for Review</span>
          </button>
        </div>
      </form>

      {/* --- List of Features --- */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr className="border-b dark:border-gray-600">
              <th className="p-3 text-left dark:text-gray-300">Feature</th>
              <th className="p-3 text-left dark:text-gray-300">Feature Key</th>
              <th className="p-3 text-left dark:text-gray-300">Submitted By</th>
              <th className="p-3 text-left dark:text-gray-300">Submitted</th>
              <th className="p-3 text-center dark:text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {updates.map((update) => (
              <tr key={update._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3 dark:text-gray-200 font-semibold">{update.description}</td>
                <td className="p-3 dark:text-gray-300 font-mono text-sm">{update.featureKey}</td>
                <td className="p-3 dark:text-gray-300">{update.submittedBy?.name || 'N/A'}</td>
                <td className="p-3 dark:text-gray-400 text-sm">
                  {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                </td>
                <td className="p-3 w-56">{getStatusDisplay(update)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default FeatureApprovalQueue;