// src/pages/EditProfileSettings.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaWhatsapp, FaCamera } from 'react-icons/fa';

// ✅ --- NEW VERIFICATION PROMPT COMPONENT ---
const VerifyEmailPrompt = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { data } = await apiClient.post(
        '/auth/resend-verification',
        {},
        { withCredentials: true }
      );
      setMessage(data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 mb-6 rounded-lg bg-yellow-50 border border-yellow-300 dark:bg-gray-800 dark:border-yellow-700">
      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
        Please verify your email address.
      </h3>
      <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
        Your email ({user.email}) is not verified. Please check your inbox for a
        verification link, or request a new one.
      </p>
      <button
        onClick={handleResend}
        disabled={loading}
        className="mt-3 px-4 py-2 bg-yellow-400 text-yellow-900 text-sm font-medium rounded-lg hover:bg-yellow-500 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Resend Verification Email'}
      </button>
      {message && (
        <p className="text-sm mt-3 text-gray-700 dark:text-gray-300">
          {message}
        </p>
      )}
    </div>
  );
};
// ---------------------------------------------

const EditProfileSettings = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user.name);
  const [whatsappNumber, setWhatsappNumber] = useState(user.whatsappNumber || '');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(user.profilePicture);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ message: '', type: '' });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

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
      const { data } = await apiClient.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      login(data.user); // Update user context
      setStatus({ message: data.message, type: 'success' });
    } catch (err) {
      setStatus({
        message: err.response?.data?.message || 'Failed to update profile.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordStatus({ message: 'New passwords do not match.', type: 'error' });
      return;
    }

    setPasswordLoading(true);
    setPasswordStatus({ message: '', type: '' });

    try {
      const { data } = await apiClient.put(
        '/users/change-password',
        { oldPassword, newPassword },
        { withCredentials: true }
      );
      setPasswordStatus({ message: data.message, type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordStatus({
        message: err.response?.data?.message || 'Failed to change password.',
        type: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:border dark:border-gray-700">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
          Edit Profile Settings
        </h1>

        {/* ✅ --- ADD THE PROMPT HERE --- */}
        {!user.isVerified && <VerifyEmailPrompt user={user} />}
        {/* ----------------------------- */}

        {status.message && (
          <div
            className={`p-4 mb-4 text-sm rounded-lg ${
              status.type === 'success'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}
          >
            {status.message}
          </div>
        )}

        {/* ✅ --- SOLUTION: Re-added the form contents --- */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={previewImage || '/default-avatar.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
              />
              <label
                htmlFor="profilePicture"
                className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition"
              >
                <FaCamera />
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaUser className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="whatsappNumber"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              WhatsApp Number (e.g., +254712345678)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaWhatsapp className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="tel"
                id="whatsappNumber"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
        {/* --------------------------------------------- */}

        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Change Password
          </h2>
          {passwordStatus.message && (
            <div
              className={`p-4 mb-4 text-sm rounded-lg ${
                passwordStatus.type === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}
            >
              {passwordStatus.message}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label
                htmlFor="oldPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Old Password
              </label>
              <input
                type="password"
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label
                htmlFor="confirmNewPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileSettings;