import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import { FaUserEdit, FaCheck, FaTimes, FaSpinner, FaBuilding, FaUser } from 'react-icons/fa';

const PendingApprovals = () => {
  const [propertyRequests, setPropertyRequests] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [activeTab, setActiveTab] = useState('property');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch property approvals
      const propRes = await apiClient.get('/admin/pending-approvals', {
        withCredentials: true,
      });
      setPropertyRequests(propRes.data);

      // --- THIS IS THE FIX ---
      // Removed the extra '/api' from the URL.
      const userRes = await apiClient.get('/users', { withCredentials: true });
      // -----------------------

      const pendingUsers = userRes.data.filter(
        (user) => user.isVoiceCallNumberPending === true
      );
      setUserRequests(pendingUsers);

    } catch (err) {
      setError('Failed to load requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePropertyReview = async (id, action) => {
    if (
      !window.confirm(
        `Are you sure you want to ${action} this change?`
      )
    )
      return;

    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await apiClient.post(
        `/admin/review-approval/${id}`,
        { action },
        { withCredentials: true }
      );
      setPropertyRequests((prev) => prev.filter((req) => req._id !== id));
    } catch (err) {
      alert(`Failed to ${action} request.`);
      console.error(err);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };
  
  const handleApproveUser = async (id) => {
    if (!window.confirm('Are you sure you want to APPROVE this number?')) return;
    
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await apiClient.put(
        `/api/admin/users/${id}/approve-call-number`,
        {},
        { withCredentials: true }
      );
      setUserRequests(userRequests.filter((req) => req._id !== id));
    } catch (err) {
      alert(`Failed to approve request: ${err.response?.data?.message || 'Server Error'}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRejectUser = async (id) => {
    if (!window.confirm('REJECTING is not yet fully implemented on the backend. This will only remove it from your list for this session. The user will need to re-submit. Proceed?')) {
       return;
    }
    // TODO: Create a backend endpoint to set pendingVoiceCallNumber to null
    // For now, just filter from UI
    setUserRequests(userRequests.filter((req) => req._id !== id));
  };
  

  if (loading) {
    return (
      <div className="p-4 dark:text-gray-300">
        Loading pending requests...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  const totalRequests = propertyRequests.length + userRequests.length;

  return (
    <section className="mb-12">
      <div className="flex items-center mb-4 space-x-2">
        <FaUserEdit className="text-2xl text-yellow-500" />
        <h2 className="text-2xl font-semibold dark:text-gray-100">
          Pending Agent Changes ({totalRequests})
        </h2>
      </div>

      {/* --- TAB NAVIGATION --- */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab('property')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium ${
            activeTab === 'property'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <FaBuilding />
          <span>Name/WhatsApp ({propertyRequests.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('user')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium ${
            activeTab === 'user'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <FaUser />
          <span>Call Number ({userRequests.length})</span>
        </button>
      </div>
      
      {totalRequests === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:border dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
          No pending requests.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
          
          {/* --- Property Requests Tab --- */}
          {activeTab === 'property' && propertyRequests.length > 0 && (
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-b dark:border-gray-600">
                  <th className="p-3 text-left dark:text-gray-300">Agent</th>
                  <th className="p-3 text-left dark:text-gray-300">Change</th>
                  <th className="p-3 text-left dark:text-gray-300">Old Value</th>
                  <th className="p-3 text-left dark:text-gray-300">New Value</th>
                  <th className="p-3 text-left dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {propertyRequests.flatMap((req) => {
                  const rows = [];
                  if (req.newName) {
                    rows.push(
                      <tr key={`${req._id}-name`} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="p-3 dark:text-gray-200">
                          <div>{req.agent.name}</div>
                          <div className="text-xs text-gray-500">
                            {req.agent.email}
                          </div>
                        </td>
                        <td className="p-3 dark:text-gray-200 font-medium">Name</td>
                        <td className="p-3 dark:text-gray-300 italic">
                          {req.oldName}
                        </td>
                        <td className="p-3 dark:text-gray-100 font-bold">
                          {req.newName}
                        </td>
                        <td className="p-3 flex space-x-3">
                          <button
                            onClick={() => handlePropertyReview(req._id, 'approve')}
                            disabled={actionLoading[req._id]}
                            className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 disabled:opacity-50"
                          >
                            {actionLoading[req._id] ? <FaSpinner className="animate-spin h-4 w-4" /> : 'Approve'}
                          </button>
                          <button
                            onClick={() => handlePropertyReview(req._id, 'reject')}
                            disabled={actionLoading[req._id]}
                            className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:opacity-50"
                          >
                            {actionLoading[req._id] ? <FaSpinner className="animate-spin h-4 w-4" /> : 'Reject'}
                          </button>
                        </td>
                      </tr>
                    );
                  }
                  if (req.newWhatsappNumber) {
                    rows.push(
                      <tr key={`${req._id}-whatsapp`} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        {!req.newName && (
                          <td className="p-3 dark:text-gray-200">
                            <div>{req.agent.name}</div>
                            <div className="text-xs text-gray-500">
                              {req.agent.email}
                            </div>
                          </td>
                        )}
                        <td className={`p-3 dark:text-gray-200 font-medium ${ req.newName ? 'border-t-0' : ''}`}>
                          WhatsApp
                        </td>
                        <td className={`p-3 dark:text-gray-300 italic ${ req.newName ? 'border-t-0' : ''}`}>
                          {req.oldWhatsappNumber || 'N/A'}
                        </td>
                        <td className={`p-3 dark:text-gray-100 font-bold ${ req.newName ? 'border-t-0' : ''}`}>
                          {req.newWhatsappNumber}
                        </td>
                        {!req.newName && (
                          <td className="p-3 flex space-x-3">
                            <button
                              onClick={() => handlePropertyReview(req._id, 'approve')}
                              disabled={actionLoading[req._id]}
                              className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 disabled:opacity-50"
                            >
                              {actionLoading[req._id] ? <FaSpinner className="animate-spin h-4 w-4" /> : 'Approve'}
                            </button>
                            <button
                              onClick={() => handlePropertyReview(req._id, 'reject')}
                              disabled={actionLoading[req._id]}
                              className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:opacity-50"
                            >
                              {actionLoading[req._id] ? <FaSpinner className="animate-spin h-4 w-4" /> : 'Reject'}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  }
                  return rows;
                })}
              </tbody>
            </table>
          )}
          
          {/* --- User Requests Tab --- */}
          {activeTab === 'user' && userRequests.length > 0 && (
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-b dark:border-gray-600">
                  <th className="p-3 text-left dark:text-gray-300">Agent</th>
                  <th className="p-3 text-left dark:text-gray-300">Request Type</th>
                  <th className="p-3 text-left dark:text-gray-300">New Number</th>
                  <th className="p-3 text-left dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userRequests.map((req) => (
                  <tr key={req._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 dark:text-gray-200">{req.name} ({req.email})</td>
                    <td className="p-3 dark:text-gray-200">Voice Call Number</td>
                    <td className="p-3 dark:text-gray-100 font-bold">{req.pendingVoiceCallNumber}</td>
                    <td className="p-3">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleApproveUser(req._id)}
                          disabled={actionLoading[req._id]}
                          className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 disabled:opacity-50"
                        >
                          {actionLoading[req._id] ? <FaSpinner className="animate-spin h-4 w-4" /> : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleRejectUser(req._id)}
                          disabled={actionLoading[req._id]}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:opacity-50"
                        >
                          {actionLoading[req._id] ? <FaSpinner className="animate-spin h-4 w-4" /> : 'Reject'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {/* Show empty state for the active tab if it's empty but the other has items */}
          {activeTab === 'property' && propertyRequests.length === 0 && totalRequests > 0 && (
             <p className="p-4 text-center text-gray-500 dark:text-gray-400">No pending property requests.</p>
          )}
          {activeTab === 'user' && userRequests.length === 0 && totalRequests > 0 && (
             <p className="p-4 text-center text-gray-500 dark:text-gray-400">No pending user requests.</p>
          )}

        </div>
      )}
    </section>
  );
};

export default PendingApprovals;