import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axios';
import { FaUserEdit, FaCheck, FaTimes, FaSpinner, FaBuilding, FaUser, FaBriefcase } from 'react-icons/fa'; // ✅ 1. ADDED FaBriefcase

const PendingApprovals = () => {
  const [propertyRequests, setPropertyRequests] = useState([]);
  const [userRequests, setUserRequests] = useState([]);

  // ✅ 2. NEW STATE FOR AGENT APPLICATIONS
  const [agentAppRequests, setAgentAppRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [activeTab, setActiveTab] = useState('property');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch property approvals (This endpoint now returns both profile updates AND agent apps)
      const propRes = await apiClient.get('/admin/pending-approvals', {
        withCredentials: true,
      });

      const allPending = propRes.data;

      // ✅ 3. FILTER THE REQUESTS BY TYPE
      // "Profile Updates" (Default type or explicit type)
      setPropertyRequests(allPending.filter(req => !req.type || req.type === 'profile_update'));

      // "Agent Applications" (New type)
      setAgentAppRequests(allPending.filter(req => req.type === 'agent_application'));

      // Fetch users for Voice Call Number approvals
      const userRes = await apiClient.get('/users', { withCredentials: true });
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

  // Handler for Profile Updates (Name/WhatsApp)
  const handlePropertyReview = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this change?`)) return;

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

  // Handler for Voice Call Numbers
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
    if (!window.confirm('Remove this request from the list?')) return;
    setUserRequests(userRequests.filter((req) => req._id !== id));
  };

  // ✅ 4. NEW HANDLER FOR AGENT APPLICATIONS
  const handleAgentApplicationAction = async (request, action) => {
    const confirmMsg = action === 'approve'
      ? `Approve ${request.agent.name} to become an AGENT?`
      : `Reject application for ${request.agent.name}?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(prev => ({ ...prev, [request._id]: true }));

    try {
      if (action === 'approve') {
        // 1. Promote User
        await apiClient.put(`/users/${request.agent._id}`, { role: 'agent' }, { withCredentials: true });
      }

      // 2. Close the Request (We use the same review-approval endpoint to delete/close the pending doc)
      // We send 'reject' to delete the pending doc without applying 'profile updates' logic, 
      // OR 'approve' if the backend supports the type. 
      // Since backend logic for 'agent_application' type might be missing in 'review-approval', 
      // we rely on the fact that we manually promoted the user above.
      // Sending 'reject' is a safe way to delete the pending doc.
      await apiClient.post(
        `/admin/review-approval/${request._id}`,
        { action: 'reject' }, // "Reject" here just means "Delete this pending request doc"
        { withCredentials: true }
      );

      setAgentAppRequests(prev => prev.filter(req => req._id !== request._id));

      if (action === 'approve') alert(`${request.agent.name} is now an Agent!`);

    } catch (err) {
      console.error(err);
      alert('Failed to process application.');
    } finally {
      setActionLoading(prev => ({ ...prev, [request._id]: false }));
    }
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

  const totalRequests = propertyRequests.length + userRequests.length + agentAppRequests.length;

  return (
    <section className="mb-12">
      <div className="flex items-center mb-4 space-x-2">
        <FaUserEdit className="text-2xl text-yellow-500" />
        <h2 className="text-2xl font-semibold dark:text-gray-100">
          Pending Approvals ({totalRequests})
        </h2>
      </div>

      {/* --- TAB NAVIGATION --- */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('property')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'property'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
        >
          <FaUserEdit />
          <span>Profile Updates ({propertyRequests.length})</span>
        </button>

        {/* ✅ 5. NEW TAB BUTTON */}
        <button
          onClick={() => setActiveTab('agent_apps')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'agent_apps'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
        >
          <FaBriefcase />
          <span>Agent Applications ({agentAppRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('user')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'user'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
        >
          <FaUser />
          <span>Voice Call ({userRequests.length})</span>
        </button>
      </div>

      {totalRequests === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:border dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
          No pending requests.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">

          {/* --- Property/Profile Requests Tab --- */}
          {activeTab === 'property' && (
            propertyRequests.length > 0 ? (
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
                          <td className={`p-3 dark:text-gray-200 font-medium ${req.newName ? 'border-t-0' : ''}`}>
                            WhatsApp
                          </td>
                          <td className={`p-3 dark:text-gray-300 italic ${req.newName ? 'border-t-0' : ''}`}>
                            {req.oldWhatsappNumber || 'N/A'}
                          </td>
                          <td className={`p-3 dark:text-gray-100 font-bold ${req.newName ? 'border-t-0' : ''}`}>
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

                    // ✅ NEW: Agent Type Change Row
                    if (req.newAgentType) {
                      rows.push(
                        <tr key={`${req._id}-type`} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          {/* Only show agent info if previous rows (name/whatsapp) weren't shown to avoid duplication if mixed request */}
                          {(!req.newName && !req.newWhatsappNumber) && (
                            <td className="p-3 dark:text-gray-200">
                              <div>{req.agent.name}</div>
                              <div className="text-xs text-gray-500">{req.agent.email}</div>
                            </td>
                          )}
                          {/* If merged with others, add empty cell or just simple handling. For simplicity, we assume one request usually or we just use border tricks */}
                          {(req.newName || req.newWhatsappNumber) && <td className="p-3 border-t-0"></td>}

                          <td className={`p-3 dark:text-gray-200 font-medium ${(req.newName || req.newWhatsappNumber) ? 'border-t-0' : ''}`}>
                            Agent Type
                          </td>
                          <td className={`p-3 dark:text-gray-300 italic ${(req.newName || req.newWhatsappNumber) ? 'border-t-0' : ''}`}>
                            {req.oldAgentType || 'Individual'}
                          </td>
                          <td className={`p-3 dark:text-gray-100 font-bold ${(req.newName || req.newWhatsappNumber) ? 'border-t-0' : ''}`}>
                            {req.newAgentType}
                          </td>

                          {(!req.newName && !req.newWhatsappNumber) && (
                            <td className="p-3 flex space-x-3">
                              <button onClick={() => handlePropertyReview(req._id, 'approve')} disabled={actionLoading[req._id]} className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 disabled:opacity-50">Approve</button>
                              <button onClick={() => handlePropertyReview(req._id, 'reject')} disabled={actionLoading[req._id]} className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:opacity-50">Reject</button>
                            </td>
                          )}
                        </tr>
                      )
                    }
                    return rows;
                  })}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400">No pending profile updates.</p>
            )
          )}

          {/* ✅ 6. NEW AGENT APPLICATIONS TAB CONTENT */}
          {activeTab === 'agent_apps' && (
            agentAppRequests.length > 0 ? (
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr className="border-b dark:border-gray-600">
                    <th className="p-3 text-left dark:text-gray-300">User</th>
                    <th className="p-3 text-left dark:text-gray-300">Current Role</th>
                    <th className="p-3 text-left dark:text-gray-300">Request</th>
                    <th className="p-3 text-left dark:text-gray-300">Date</th>
                    <th className="p-3 text-left dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agentAppRequests.map((req) => (
                    <tr key={req._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="p-3 dark:text-gray-200">
                        <div>{req.agent.name}</div>
                        <div className="text-xs text-gray-500">{req.agent.email}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200">
                          User
                        </span>
                      </td>
                      <td className="p-3 dark:text-gray-100 font-bold">
                        Agent Account
                      </td>
                      <td className="p-3 text-sm text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 flex space-x-3">
                        <button
                          onClick={() => handleAgentApplicationAction(req, 'approve')}
                          disabled={actionLoading[req._id]}
                          className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading[req._id] ? <FaSpinner className="animate-spin h-4 w-4" /> : 'Promote'}
                        </button>
                        <button
                          onClick={() => handleAgentApplicationAction(req, 'reject')}
                          disabled={actionLoading[req._id]}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:opacity-50"
                        >
                          {actionLoading[req._id] ? <FaSpinner className="animate-spin h-4 w-4" /> : 'Reject'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400">No pending agent applications.</p>
            )
          )}

          {/* --- User Requests Tab --- */}
          {activeTab === 'user' && (
            userRequests.length > 0 ? (
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
            ) : (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400">No pending voice call requests.</p>
            )
          )}

        </div>
      )}
    </section>
  );
};

export default PendingApprovals;