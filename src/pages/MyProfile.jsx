import React from 'react';
import { useAuth } from '../context/AuthContext';
import MyListings from '../components/MyListings';

const MyProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-10 text-center dark:text-gray-300">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto p-6 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <h1 className="text-3xl font-bold mb-2 dark:text-white">My Profile</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Hello, {user.name} ({user.email})</p>

      {/* Other profile settings can go here (e.g., change password) */}

      {/* ✅ Show "My Listings" section ONLY if the user is an agent or admin */}
      {(user.role === 'agent' || user.role === 'admin') && (
        <MyListings />
      )}
    </div>
  );
};

export default MyProfile;