import React from 'react';
import { useAuth } from '../context/AuthContext';
import MyListings from '../components/MyListings';
import { Link } from 'react-router-dom';
import { FaCog } from 'react-icons/fa'; // Settings Icon
import MyFavorites from '../components/MyFavorites'; 
import ScheduledViewings from '../components/ScheduledViewings'; // ✅ 1. Import the new component

const MyProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-10 text-center dark:text-gray-300">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto p-6 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen">
      
      {/* --- Profile Header --- */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          <img 
            src={user.profilePicture} 
            alt={user.name} 
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500" 
          />
          <div>
            <h1 className="text-3xl font-bold mb-1 dark:text-white">Hello, {user.name}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              You are logged in as an <span className="font-semibold capitalize">{user.role}</span>.
            </p>
          </div>
        </div>
        
        <Link
          to="/profile/edit"
          className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-150 active:scale-95"
        >
          <FaCog />
          <span>Settings</span>
        </Link>
      </div>

      {/* --- ✅ 2. Add the Scheduled Viewings Component --- */}
      <div className="mb-10">
        <ScheduledViewings />
      </div>

      {/* --- Divider --- */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-10"></div>

      {/* --- Favorites Section --- */}
      <div className="mb-10">
        <MyFavorites />
      </div>

      {/* --- Listings Section (Agent/Admin only) --- */}
      {(user.role === 'agent' || user.role === 'admin') && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700 my-10"></div>
          <div className="mb-10">
            <MyListings />
          </div>
        </>
      )}
    </div>
  );
};

export default MyProfile;