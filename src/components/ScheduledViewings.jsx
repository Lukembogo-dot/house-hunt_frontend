// src/pages/ScheduledViewings.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import { FaSpinner, FaCheck, FaTimes, FaWhatsapp, FaUserCircle, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Helper component for displaying status
const StatusBadge = ({ status }) => {
  // ... (no change) ...
};

// Main component
const ScheduledViewings = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  // ... (rest of main component is unchanged) ...
  
  // Render content based on role
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        {user.role === 'agent' ? 'Viewing Requests' : 'My Scheduled Viewings'}
      </h2>
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
    </div>
  );
};


// --- Sub-Components for Rendering ---

// ✅ --- FIX APPLIED TO THIS COMPONENT ---
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
        <Link to={`/properties/${booking.property._id}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline ml-1">
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
        {/* ... (buttons are unchanged) ... */}
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

// ✅ --- FIX APPLIED TO THIS COMPONENT ---
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