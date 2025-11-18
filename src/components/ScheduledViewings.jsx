// src/components/ScheduledViewings.jsx
// (UPDATED - Added missing data fetching, loading state, and update handler)

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import { FaSpinner, FaCheck, FaTimes, FaWhatsapp, FaUserCircle, FaClock, FaCalendarAlt, FaTimesCircle, FaInfoCircle } from 'react-icons/fa'; // Added FaCalendarAlt, FaTimesCircle, FaInfoCircle
import { Link } from 'react-router-dom';
import { format } from 'date-fns'; // Added for formatting date/time
import { motion } from 'framer-motion';


// Helper component for displaying status (Keep this section)
const StatusBadge = ({ status }) => {
  // Assuming this is correctly implemented outside the scope provided
  const colors = {
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };
  return (
    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full capitalize ${colors[status] || colors.pending}`}>
      {status === 'confirmed' && <FaCheck size={10} />}
      {status === 'cancelled' && <FaTimes size={10} />}
      {status === 'pending' && <FaClock size={10} />}
      {status}
    </span>
  );
};


const ScheduledViewings = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ NEW STATE
  const [error, setError] = useState(null); // ✅ NEW STATE

  // Helper to format date/time
  const formatDateTime = (dateString) => {
    return dateString ? format(new Date(dateString), 'MMM dd, yyyy @ hh:mm a') : 'N/A';
  };

  // ✅ NEW: API Call Logic
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const endpoint = user.role === 'agent' ? '/viewings/my-bookings' : '/viewings/my-viewings';

    try {
      const { data } = await apiClient.get(endpoint);
      setData(data);
    } catch (err) {
      console.error(`Failed to fetch viewings for ${user.role}:`, err);
      // If the error is 404, the routes are likely not mounted in server.js
      setError(`Failed to load schedule. (Error: ${err.response?.status || 'Network Error'}). 
              Ensure 'viewingRoutes.js' is mounted in your server.js.`);
    } finally {
      setLoading(false);
    }
  }, [user]); // Re-fetch when user object changes

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ NEW: Agent update handler (calls API and re-fetches list)
  const handleUpdateStatus = async (viewingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to set status to ${newStatus}?`)) return;
    try {
        await apiClient.put(`/viewings/${viewingId}`, { status: newStatus });
        // After successful update, re-fetch data to reflect status change
        await fetchData(); 
    } catch (err) {
        alert("Failed to update viewing status.");
    }
  };

  // Render content based on role
  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        {user.role === 'agent' ? 'Viewing Requests' : 'My Scheduled Viewings'}
      </h2>
      
      {loading && (
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <FaSpinner className="animate-spin" /> Loading your schedule...
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm flex items-center gap-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            <FaInfoCircle /> {error}
        </div>
      )}

      {!loading && data.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FaCalendarAlt size={30} className="mx-auto mb-2" />
              <p>You have no {user.role === 'agent' ? 'requests' : 'viewings'} scheduled.</p>
          </div>
      ) : (
          <div className="space-y-4">
              {user.role === 'agent'
              ? data.map((booking) => (
                  // AGENT CARD (My Bookings)
                  <AgentBookingCard 
                      key={booking._id} 
                      booking={booking} 
                      onUpdate={handleUpdateStatus} 
                      formatDateTime={formatDateTime}
                  />
              ))
              : data.map((viewing) => (
                  // USER CARD (My Viewings)
                  <UserViewingCard 
                      key={viewing._id} 
                      viewing={viewing} 
                      formatDateTime={formatDateTime}
                  />
              ))}
          </div>
      )}
    </motion.div>
  );
};


// --- Sub-Components for Rendering (Unchanged) ---

// Card for AGENTS (My Bookings)
const AgentBookingCard = ({ booking, onUpdate, formatDateTime }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
    <div className="flex flex-col sm:flex-row justify-between">
      {/* User Info */}
      <div className="flex items-start space-x-3 mb-3 sm:mb-0">
        {/* ✅ Check if user exists before rendering image */}
        {booking.user ? (
          <img 
            src={booking.user.profilePicture} 
            alt={booking.user.name} 
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <FaUserCircle className="w-12 h-12 text-gray-400" />
        )}
        <div>
          {/* ✅ Check if user exists before rendering text */}
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {booking.user ? booking.user.name : 'Deleted User'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {booking.user ? booking.user.email : 'N/A'}
          </p>
          {/* ✅ Check if user AND whatsappNumber exist */}
          {booking.user && booking.user.whatsappNumber && (
            <a
              href={`https://wa.me/${booking.user.whatsappNumber.replace(/\+/g, '')}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center space-x-1 text-sm text-green-600 dark:text-green-400 hover:underline"
            >
              <FaWhatsapp />
              <span>Contact User</span>
            </a>
          )}
        </div>
      </div>
      {/* Status Badge */}
      <div className="flex-shrink-0">
        <StatusBadge status={booking.status} />
      </div>
    </div>
    
    <div className="border-t dark:border-gray-700 my-4"></div>

    {/* Property & Date Info */}
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Requested viewing for: 
        {/* This is safe because if the property was deleted, the booking would be gone */}
        <Link to={`/properties/${booking.property.slug}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline ml-1">
          {booking.property.title}
        </Link>
      </p>
      <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
        <FaClock className="inline mr-2" />
        {formatDateTime(booking.scheduledDate)}
      </p>
      {booking.message && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
          <span className="font-semibold">Message:</span> "{booking.message}"
        </p>
      )}
    </div>

    {/* Action Buttons for Agent */}
    {booking.status === 'pending' && (
      <div className="flex items-center space-x-3 mt-4">
        <button
          onClick={() => onUpdate(booking._id, 'confirmed')}
          className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-4 py-2 rounded-md bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition"
        >
          <FaCheck />
          <span>Confirm</span>
        </button>
        <button
          onClick={() => onUpdate(booking._id, 'cancelled')}
          className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-4 py-2 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
        >
          <FaTimes />
          <span>Cancel</span>
        </button>
      </div>
    )}
  </div>
);

// Card for USERS (My Viewings)
const UserViewingCard = ({ viewing, formatDateTime }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
    <div className="flex flex-col sm:flex-row items-start">
      <img 
        src={viewing.property.images?.[0]?.url || 'https://placehold.co/150x150/e2e8f0/64748b?text=Property'} 
        alt={viewing.property.title}
        className="w-full sm:w-32 h-32 object-cover rounded-lg mb-3 sm:mb-0 sm:mr-4"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <Link to={`/properties/${viewing.property._id}`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition">
              {viewing.property.title}
            </h3>
          </Link>
          <StatusBadge status={viewing.status} />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{viewing.property.location}</p>
        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-1">
          Ksh {viewing.property.price?.toLocaleString()}
        </p>
        
        <div className="border-t dark:border-gray-700 my-3"></div>

        <p className="font-semibold text-gray-800 dark:text-gray-200">
          <FaClock className="inline mr-2" />
          {formatDateTime(viewing.scheduledDate)}
        </p>
        {/* ✅ Check if agent exists before rendering text */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Agent: {viewing.agent ? `${viewing.agent.name} (${viewing.agent.email})` : 'Deleted Agent (N/A)'}
        </p>
      </div>
    </div>
  </div>
);

export default ScheduledViewings;