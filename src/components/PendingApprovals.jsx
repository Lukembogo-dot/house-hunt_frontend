import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { FaUserEdit } from 'react-icons/fa';

const PendingApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await apiClient.get('/admin/pending-approvals', {
        withCredentials: true,
      });
      setRequests(data);
    } catch (err) {
      setError('Failed to load requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = async (id, action) => {
    if (
      !window.confirm(
        `Are you sure you want to ${action} this change?`
      )
    )
      return;

    try {
      await apiClient.post(
        `/admin/review-approval/${id}`,
        { action },
        { withCredentials: true }
      );
      // Refresh the list by removing the reviewed item
      setRequests((prev) => prev.filter((req) => req._id !== id));
    } catch (err) {
      alert(`Failed to ${action} request.`);
      console.error(err);
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

  return (
    <section className="mb-12">
      <div className="flex items-center mb-4 space-x-2">
        <FaUserEdit className="text-2xl text-yellow-500" />
        <h2 className="text-2xl font-semibold dark:text-gray-100">
          Pending Agent Changes ({requests.length})
        </h2>
      </div>
      {requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:border dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
          No pending requests.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
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
            {/* --- REFACTORED TBODY TO FIX HYDRATION ERROR --- */}
            <tbody>
              {requests.flatMap((req) => { // Use flatMap to flatten the array of rows
                const rows = [];

                // Row for Name Change
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
                          onClick={() => handleReview(req._id, 'approve')}
                          className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReview(req._id, 'reject')}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  );
                }

                // Row for WhatsApp Change
                if (req.newWhatsappNumber) {
                  rows.push(
                    <tr key={`${req._id}-whatsapp`} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      {!req.newName && ( // Only show agent info if name wasn't shown
                        <td className="p-3 dark:text-gray-200">
                          <div>{req.agent.name}</div>
                          <div className="text-xs text-gray-500">
                            {req.agent.email}
                          </div>
                        </td>
                      )}
                      <td
                        className={`p-3 dark:text-gray-200 font-medium ${
                          req.newName ? 'border-t-0' : ''
                        }`}
                      >
                        WhatsApp
                      </td>
                      <td
                        className={`p-3 dark:text-gray-300 italic ${
                          req.newName ? 'border-t-0' : ''
                        }`}
                      >
                        {req.oldWhatsappNumber || 'N/A'}
                      </td>
                      <td
                        className={`p-3 dark:text-gray-100 font-bold ${
                          req.newName ? 'border-t-0' : ''
                        }`}
                      >
                        {req.newWhatsappNumber}
                      </td>
                      {!req.newName && ( // Only show buttons if name wasn't shown
                        <td className="p-3 flex space-x-3">
                          <button
                            onClick={() => handleReview(req._id, 'approve')}
                            className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(req._id, 'reject')}
                            className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                }
                
                return rows; // Return the array of <tr> elements
              })}
            </tbody>
            {/* --- END OF REFACTOR --- */}
          </table>
        </div>
      )}
    </section>
  );
};

export default PendingApprovals;