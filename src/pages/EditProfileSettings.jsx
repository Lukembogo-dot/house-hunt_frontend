// src/pages/EditProfileSettings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaWhatsapp, FaCamera, FaLock, FaInfoCircle } from 'react-icons/fa'; // ✅ 1. Import new icon

// (VerifyEmailPrompt component is unchanged)
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
      {/* ... (content unchanged) ... */}
    </div>
  );
};
// ---------------------------------------------

const EditProfileSettings = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user.name);
  const [whatsappNumber, setWhatsappNumber] = useState(user.whatsappNumber || '');
  
  // ✅ 2. Add 'about' state
  const [about, setAbout] = useState(user.about || '');
  
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(user.profilePicture);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ message: '', type: '' });

  const [isAgent, setIsAgent] = useState(user.role === 'agent');
  const [pendingRequest, setPendingRequest] = useState(null);
  const [checkingRequest, setCheckingRequest] = useState(true);

  // (useEffect for pending request is unchanged)
  useEffect(() => {
    if (isAgent) {
      const fetchPendingRequest = async () => {
        setCheckingRequest(true);
        try {
          const { data } = await apiClient.get(
            '/users/profile/my-pending-request',
            { withCredentials: true }
          );
          setPendingRequest(data); 
        } catch (err) {
          console.error('Could not fetch pending request', err);
          setStatus({
            message: 'Could not check for pending requests.',
            type: 'error',
          });
        } finally {
          setCheckingRequest(false);
        }
      };
      fetchPendingRequest();
    } else {
      setCheckingRequest(false);
    }
  }, [isAgent]);

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
    
    // ✅ 3. Append 'about' to formData
    formData.append('about', about);
    
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      const response = await apiClient.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        validateStatus: (status) => status >= 200 && status < 300,
      });

      const { data, status } = response;

      if (status === 202) {
        // 202: Accepted (Pending Approval)
        setStatus({ message: data.message, type: 'info' });
        setPendingRequest(data.request); // Assuming backend sends pending request in 'request' field
        if (data.user) {
          // This happens if pic/about was also updated
          login(data.user);
        }
      } else {
        // 200: OK (Instant Update)
        login(data.user); // Update user context
        setStatus({ message: data.message, type: 'success' });
      }
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
    // ... (password change logic is unchanged) ...
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

  const fieldsLocked = isAgent && !!pendingRequest;

  if (checkingRequest) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">
          Checking profile status...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:border dark:border-gray-700">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
          Edit Profile Settings
        </h1>

        {!user.isVerified && <VerifyEmailPrompt user={user} />}

        {/* ... (status message display is unchanged) ... */}
        {status.message && (
          <div
            className={`p-4 mb-4 text-sm rounded-lg ${
              status.type === 'success'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : status.type === 'error'
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' // 'info' type
            }`}
          >
            {status.message}
          </div>
        )}

        {/* ... (locked fields banner is unchanged) ... */}
        {fieldsLocked && (
          <div className="p-4 mb-6 rounded-lg bg-yellow-50 border border-yellow-300 dark:bg-gray-800 dark:border-yellow-700 flex items-start space-x-3">
            <FaLock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                Changes Awaiting Approval
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Your request to update your name and/or WhatsApp number is
                pending admin review. These fields are locked.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... (Profile Picture section is unchanged) ... */}
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
          
          {/* ... (Name input is unchanged) ... */}
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70 disabled:bg-gray-200 dark:disabled:bg-gray-600"
                required
                disabled={loading || fieldsLocked} // 👈 Apply lock
              />
            </div>
          </div>

          {/* ... (WhatsApp input is unchanged) ... */}
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70 disabled:bg-gray-200 dark:disabled:bg-gray-600"
                disabled={loading || fieldsLocked} // 👈 Apply lock
              />
            </div>
          </div>

          {/* ✅ 4. Add 'About Me' Textarea for agents */}
          {isAgent && (
            <div>
              <label
                htmlFor="about"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                About Me (Public Bio)
              </label>
              <div className="relative">
                <span className="absolute top-3 left-0 flex items-center pl-3">
                  <FaInfoCircle className="h-5 w-5 text-gray-400" />
                </span>
                <textarea
                  id="about"
                  rows="4"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Tell clients a bit about yourself..."
                  disabled={loading} // This field is NOT locked
                />
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              // ✅ 5. Update disable logic
              disabled={loading || (fieldsLocked && !profilePicture && about === user.about)}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
        
        {/* ... (Change Password section is unchanged) ... */}
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-6">
            {/* ... (password fields are unchanged) ... */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileSettings;