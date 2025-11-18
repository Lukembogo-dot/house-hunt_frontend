// src/pages/EditProfileSettings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, FaWhatsapp, FaCamera, FaLock, FaInfoCircle, FaPhone, 
  FaShieldAlt, FaSpinner, FaCheckCircle, FaCopy, FaExclamationTriangle, 
  FaBriefcase // ✅ 1. IMPORT NEW ICON
} from 'react-icons/fa';
import { useFeatureFlag } from '../context/FeatureFlagContext.jsx';

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
      <div className="flex items-start">
        <FaInfoCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Please Verify Your Email
          </h3>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            Your email ({user.email}) is not verified. Please check your inbox.
          </p>
          {message && <p className="mt-2 text-sm font-bold">{message}</p>}
          <button
            onClick={handleResend}
            disabled={loading}
            className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>
      </div>
    </div>
  );
};


// (TwoFactorAuthSetup component is unchanged)
const TwoFactorAuthSetup = () => {
  const { user, login } = useAuth(); 
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [step, setStep] = useState(1); 

  const handleSetup2FA = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await apiClient.post('/auth/2fa/setup');
      setQrCode(data.qrCodeUrl);
      setStep(2); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start 2FA setup.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await apiClient.post('/auth/2fa/verify', { token });
      setBackupCodes(data.backupCodes); 
      setStep(3); 
      setSuccess('2FA Verified! Now save your backup codes.');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid 6-digit code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSetup = () => {
    login({ ...user, isTwoFactorEnabled: true });
    setStep(1); 
    setBackupCodes([]);
  };
  
  const copyCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    alert('Backup codes copied to clipboard!');
  };
  
  if (user.isTwoFactorEnabled) {
    return (
      <div className="p-4 rounded-lg bg-green-100 border border-green-300 dark:bg-green-900/50 dark:border-green-700">
        <div className="flex items-center">
          <FaCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              Two-Factor Authentication is Active
            </h3>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              Your account is protected with 2FA.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/30 rounded-md">
          {error}
        </div>
      )}
      {step === 1 && (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add an extra layer of security to your account using an authenticator app (like Google Authenticator).
          </p>
          <button
            onClick={handleSetup2FA}
            disabled={loading}
            className="w-full sm:w-auto flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? <FaSpinner className="animate-spin" /> : 'Enable 2FA'}
          </button>
        </>
      )}
      {step === 2 && (
        <div className="text-center space-y-6 border-t pt-6 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Step 1: Scan QR Code</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Open your authenticator app and scan this code.
          </p>
          <div className="bg-white p-4 inline-block rounded-lg shadow-md">
             <img src={qrCode} alt="2FA QR Code" className="mx-auto w-48 h-48" />
          </div>
          
          <div className="max-w-xs mx-auto">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Step 2: Enter 6-Digit Code
            </label>
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-2 text-center text-lg tracking-widest border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="000000"
                maxLength={6}
                required
              />
              <button
                type="submit"
                disabled={loading || token.length < 6}
                className="w-full flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? <FaSpinner className="animate-spin" /> : 'Verify Code'}
              </button>
            </form>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-6 border-t pt-6 dark:border-gray-700">
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
             <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
             <div>
               <h3 className="font-bold text-yellow-800 dark:text-yellow-200">Save These Backup Codes!</h3>
               <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                 If you lose your phone, these are the <strong>only way</strong> to recover your account. 
                 Each code can be used once. Store them in a safe place (like a password manager).
               </p>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-gray-100 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm text-gray-800 dark:text-gray-200 text-center">
            {backupCodes.map((code, index) => (
              <div key={index} className="tracking-wider">{code}</div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={copyCodes}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <FaCopy className="mr-2" /> Copy Codes
            </button>
            <button
              onClick={handleFinishSetup}
              className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              I Have Saved Them
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


const EditProfileSettings = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const is2FAEnabled = useFeatureFlag('two-factor-authentication');

  const [name, setName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [about, setAbout] = useState('');
  const [voiceCallNumber, setVoiceCallNumber] = useState('');
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
  
  // ✅ 2. NEW STATE FOR AGENT APPLICATION
  const [applyingAgent, setApplyingAgent] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setWhatsappNumber(user.whatsappNumber || '');
      setAbout(user.about || '');
      setVoiceCallNumber(user.pendingVoiceCallNumber || user.voiceCallNumber || '');
      setPreviewImage(user.profilePicture);
      setIsAgent(user.role === 'agent');
    }
  }, [user]);

  // ✅ 3. UPGRADED CHECK FOR PENDING REQUESTS (RUNS FOR EVERYONE)
  const fetchPendingRequest = useCallback(async () => {
    setCheckingRequest(true);
    try {
      const { data } = await apiClient.get(
        '/users/profile/my-pending-request',
        { withCredentials: true }
      );
      setPendingRequest(data); 
    } catch (err) {
      console.error('Could not fetch pending request', err);
    } finally {
      setCheckingRequest(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequest();
  }, [fetchPendingRequest]);

  // ✅ 4. NEW HANDLER FOR AGENT APPLICATION
  const handleApplyAgent = async () => {
    if (!window.confirm("Are you sure you want to apply for an Agent account? Admins will review your request.")) return;
    
    setApplyingAgent(true);
    try {
      await apiClient.post('/users/apply-agent', {}, { withCredentials: true });
      setStatus({ message: 'Application submitted successfully!', type: 'success' });
      fetchPendingRequest(); // Refresh to show pending status
    } catch (err) {
      setStatus({
        message: err.response?.data?.message || 'Failed to submit application.',
        type: 'error',
      });
    } finally {
      setApplyingAgent(false);
    }
  };

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
    formData.append('about', about);
    formData.append('voiceCallNumber', voiceCallNumber);
    
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

      const { data, status: httpStatus } = response;
      login(data.user); 

      if (httpStatus === 202) {
        setStatus({ message: data.message, type: 'info' });
        fetchPendingRequest(); // Refresh to show pending lock
      } else {
        setStatus({ message: data.message, type: 'success' });
      }
      
      setProfilePicture(null);

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

  // ✅ 5. UPDATED LOCK LOGIC (Only lock if it's a profile update request)
  // If it's an 'agent_application', we don't lock the profile fields.
  const fieldsLocked = !!pendingRequest && (!pendingRequest.type || pendingRequest.type === 'profile_update');

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

        {status.message && (
          <div
            className={`p-4 mb-4 text-sm rounded-lg ${
              status.type === 'success'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : status.type === 'error'
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            }`}
          >
            {status.message}
          </div>
        )}

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
          {/* Profile Picture */}
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
          
          {/* Name */}
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
                disabled={loading || fieldsLocked}
              />
            </div>
          </div>

          {/* WhatsApp */}
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
                disabled={loading || fieldsLocked}
              />
            </div>
          </div>

          {/* Agent Fields */}
          {isAgent && (
            <>
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
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label
                  htmlFor="voiceCallNumber"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Public Voice Call Number (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaPhone className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    type="tel"
                    id="voiceCallNumber"
                    value={voiceCallNumber}
                    onChange={(e) => setVoiceCallNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="+254712345678"
                    disabled={loading}
                  />
                </div>
                {user.isVoiceCallNumberPending && (
                  <div className="mt-2 p-3 rounded-lg bg-yellow-50 border border-yellow-300 dark:bg-gray-800 dark:border-yellow-700">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Your new number (<b>{user.pendingVoiceCallNumber}</b>) is awaiting admin approval. 
                      Your current public number is <b>{user.voiceCallNumber || 'not set'}</b>.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || (fieldsLocked && !profilePicture && about === user.about && voiceCallNumber === (user.pendingVoiceCallNumber || user.voiceCallNumber || ''))}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
        
        {/* ✅ 6. NEW "BECOME AN AGENT" SECTION */}
        {!isAgent && (
          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <FaBriefcase className="mr-3 text-blue-500" />
              Become an Agent
            </h2>
            
            {pendingRequest && pendingRequest.type === 'agent_application' ? (
               <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 flex items-center">
                  <FaSpinner className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">Application Pending</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your request to become an agent is under review. We will notify you once approved.
                    </p>
                  </div>
               </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you a real estate agent or property manager? Upgrade your account to list properties, track leads, and build your brand.
                </p>
                <button
                  onClick={handleApplyAgent}
                  disabled={applyingAgent}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                >
                  {applyingAgent ? <FaSpinner className="animate-spin mr-2" /> : null}
                  {applyingAgent ? 'Submitting...' : 'Apply for Agent Account'}
                </button>
              </div>
            )}
          </div>
        )}
        {/* --- END OF AGENT APPLICATION SECTION --- */}

        {/* Change Password */}
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Change Password
          </h2>
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
              />
            </div>

            {passwordStatus.message && (
              <div
                className={`p-3 text-sm rounded-lg ${
                  passwordStatus.type === 'success'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }`}
              >
                {passwordStatus.message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        {/* 2FA Section */}
        {is2FAEnabled && (
          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <FaShieldAlt className="mr-3 text-blue-500" />
              Account Security
            </h2>
            <TwoFactorAuthSetup />
          </div>
        )}

      </div>
    </div>
  );
};

export default EditProfileSettings;