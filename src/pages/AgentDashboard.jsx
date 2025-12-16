// src/pages/AgentDashboard.jsx
// (UPDATED: Removed Delete -> Added Archive Option)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { FaEdit, FaArchive, FaEye, FaChartLine, FaPlus, FaSpinner, FaCheckCircle, FaTimesCircle, FaSyncAlt } from 'react-icons/fa'; // ✅ Swapped FaTrash for FaArchive
import { motion } from 'framer-motion';

// ✅ 1. IMPORT THE VIEWINGS COMPONENT
import ScheduledViewings from '../components/ScheduledViewings';

// ✅ 2. IMPORT THE NEW SUBSCRIPTION COMPONENT
// ✅ 2. IMPORT THE NEW SUBSCRIPTION COMPONENT
import LeadSubscriptionPanel from '../components/agent/LeadSubscriptionPanel';
import AgentPPCWallet from '../components/agent/AgentPPCWallet';

// Status badge component
const StatusBadge = ({ status }) => {
  const colors = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    sold: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    rented: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    archived: 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300' // ✅ Added Archived Style
  };
  return (
    <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${colors[status] || colors.draft}`}>
      {status}
    </span>
  );
};

export default function AgentDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null); // ID of property being updated
  const [refreshing, setRefreshing] = useState(null);

  // Fetch Listings
  const fetchListings = async () => {
    try {
      const { data } = await apiClient.get('/properties/my-listings');
      setListings(data);
      setError('');
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setError('Failed to load your properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Handle Status Change (Supports Archive Removal)
  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      const { data } = await apiClient.patch(`/properties/${id}/status`, { status: newStatus });

      // If the backend archived it (sold/rented), remove it from this list or update
      if (data.isArchived) {
        // Option: You can remove it or just show it as sold
        setListings(prev => prev.map(p => p._id === id ? { ...p, status: newStatus } : p));
        alert(data.message || `Property marked as ${newStatus}.`);
      } else {
        setListings(prev => prev.map(p => p._id === id ? { ...p, status: newStatus } : p));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  // ✅ UPDATED: Handle Archive (Soft Delete)
  // Agents can no longer permanently delete. This sets status to 'archived'.
  const handleArchive = async (id) => {
    if (!window.confirm("Are you sure you want to archive this listing? It will be hidden from the public but you can restore it later.")) return;
    setUpdating(id);
    try {
      // Calling the DELETE endpoint now triggers the Soft Delete (Archive) logic in the controller
      await apiClient.delete(`/properties/${id}`);

      // Update local state to show 'archived' instead of removing it completely
      setListings(prev => prev.map(p => p._id === id ? { ...p, status: 'archived' } : p));

    } catch (err) {
      console.error(err);
      alert('Failed to archive property.');
    } finally {
      setUpdating(null);
    }
  };

  // Handle Listing Refresh Payment
  const handleRefreshListing = async (propertyId) => {
    if (!window.confirm("Refresh this listing for 72 hours? Cost: 100 Ksh.")) return;

    setRefreshing(propertyId);
    try {
      const { data } = await apiClient.post('/payments/create-order', {
        propertyId: propertyId,
        orderType: 'listing_refresh',
        amount: 100,
        description: 'Listing Refresh (72 Hours)'
      });

      if (data.paymentRedirectUrl) {
        window.location.href = data.paymentRedirectUrl;
      } else {
        alert('Payment initiation failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to start payment.');
    } finally {
      setRefreshing(null);
    }
  };

  // Helper: Check if property is eligible for refresh (> 14 days old)
  const isEligibleForRefresh = (property) => {
    if (property.status !== 'available') return false;
    const createdDate = new Date(property.createdAt);
    const daysOld = (new Date() - createdDate) / (1000 * 60 * 60 * 24);
    return daysOld >= 14;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              My Listings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your portfolio, track views, and update status.
            </p>
          </div>
          <Link
            to="/add-property"
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <FaPlus className="mr-2" /> Post New Property
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* ✅ PPC WALLET SECTION */}
        <div className="mb-10">
          <AgentPPCWallet />
        </div>

        {/* Lead Subscription Panel */}
        <div className="mb-10">
          <LeadSubscriptionPanel />
        </div>

        {/* Pending Approvals / Viewings */}
        <div className="mb-10">
          <ScheduledViewings />
        </div>

        {/* Listings Table */}
        {listings.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">You haven't posted any properties yet.</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by listing your first property today.</p>
            <Link to="/add-property" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">List a Property</Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg border dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stats</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {listings.map((property) => (
                    <motion.tr
                      key={property._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img className="h-12 w-12 rounded object-cover" src={property.images[0]?.url} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs" title={property.title}>
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {property.location}
                            </div>
                            {isEligibleForRefresh(property) && (
                              <button
                                onClick={() => handleRefreshListing(property._id)}
                                disabled={refreshing === property._id}
                                className="mt-2 flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full hover:bg-orange-200 transition"
                              >
                                {refreshing === property._id ? <FaSpinner className="animate-spin" /> : <FaSyncAlt />}
                                Refresh Listing (100 Ksh)
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* Status Dropdown */}
                        <select
                          value={property.status}
                          onChange={(e) => handleStatusChange(property._id, e.target.value)}
                          disabled={updating === property._id}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${property.status === 'available' ? 'bg-green-100 text-green-800' :
                            property.status === 'sold' ? 'bg-red-100 text-red-800' :
                              property.status === 'rented' ? 'bg-purple-100 text-purple-800' :
                                property.status === 'archived' ? 'bg-gray-300 text-gray-700' :
                                  'bg-gray-100 text-gray-800'
                            }`}
                        >
                          <option value="available">Available</option>
                          <option value="sold">Sold</option>
                          <option value="rented">Rented</option>
                          <option value="draft">Draft</option>
                          {/* Allow manual selection of archived if needed */}
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-200 flex flex-col gap-1">
                          <span className="flex items-center text-xs" title="Total Unique Views">
                            <FaEye className="mr-1 text-blue-400" /> {property.views} Views
                          </span>
                          <span className="flex items-center text-xs" title="Total Leads Generated">
                            <FaChartLine className="mr-1 text-green-400" /> {property.leads} Leads
                          </span>

                          {/* ✅ NEW: ANALYTICS PREVIEW */}
                          <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                            <span className="block text-[10px] text-gray-500">
                              Runs: <span className="font-bold text-gray-700 dark:text-gray-300">
                                {property.views > 0
                                  ? Math.round(((property.analytics?.totalDurationSeconds || 0) / property.views)) + 's'
                                  : '0s'}
                              </span> avg
                            </span>
                            <span className="block text-[10px] text-gray-500">
                              Conv: <span className="font-bold text-gray-700 dark:text-gray-300">
                                {property.views > 0
                                  ? ((property.leads / property.views) * 100).toFixed(1) + '%'
                                  : '0%'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        Ksh {property.price.toLocaleString()}
                        {property.analytics?.interactionCount > 0 && (
                          <div className="text-[10px] text-purple-500 mt-1">
                            🔥 {property.analytics.interactionCount} Interactions
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <Link to={`/admin/property/${property._id}/edit`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          <FaEdit className="inline text-lg" title="Edit" />
                        </Link>

                        {/* ✅ UPDATED: Archive Button instead of Delete */}
                        <button
                          onClick={() => handleArchive(property._id)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          disabled={updating === property._id}
                          title="Archive (Hide from public)"
                        >
                          {updating === property._id ? <FaSpinner className="animate-spin" /> : <FaArchive className="inline text-lg" />}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}