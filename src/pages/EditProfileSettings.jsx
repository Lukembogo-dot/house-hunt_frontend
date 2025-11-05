import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import { useNavigate } from 'react-router-dom';

const EditProfileSettings = () => {
  const { user, login } = useAuth(); // Get login to update context
  const navigate = useNavigate();

  const [name, setName] = useState(user.name);
  const [whatsappNumber, setWhatsappNumber] = useState(user.whatsappNumber || '');
  const [profilePicture, setProfilePicture] = useState(null); // File object
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ message: '', type: '' });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('whatsappNumber', whatsappNumber);
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      const { data: updatedUser } = await apiClient.put('/users/profile', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update the user in our global AuthContext
      login(updatedUser); 
      
      setStatus({ message: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => navigate('/profile'), 1500); // Go back to profile
    } catch (err) {
      console.error(err);
      setStatus({ message: 'Failed to update profile.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:border dark:border-gray-700">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
          Edit Profile Settings
        </h1>
        
        {status.message && (
          <div className={`p-4 mb-6 text-sm rounded-lg ${
            status.type === 'success' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
          }`} role="alert">
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex items-center space-x-4">
            <img 
              src={profilePicture ? URL.createObjectURL(profilePicture) : user.profilePicture} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="profilePicture">
                Change Profile Picture
              </label>
              <input
                type="file"
                id="profilePicture"
                name="profilePicture"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files[0])}
                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">
              Username
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="whatsappNumber">
              WhatsApp Number
            </label>
            <input
              type="tel"
              id="whatsappNumber"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="e.g., 254712345678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Include country code (e.g., 254... not 07...).
            </p>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-lg font-medium text-white transition ${
                loading ? 'bg-blue-400 dark:bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500'
              }`}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileSettings;