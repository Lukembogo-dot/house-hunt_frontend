// src/pages/EditProfileSettings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';
import { useNavigate } from 'react-router-dom';
import {
  FaUser, FaWhatsapp, FaCamera, FaLock, FaInfoCircle, FaPhone,
  FaShieldAlt, FaSpinner, FaCheckCircle, FaCopy, FaExclamationTriangle,
  FaBriefcase, FaTools, FaInstagram, FaTwitter, FaFacebook, FaTiktok, FaEnvelope // ✅ Added Icons
} from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6"; // Standard X icon


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


// ✅ FIXED: TwoFactorAuthSetup
const TwoFactorAuthSetup = () => {
  const { user, login } = useAuth(); // Access global user state
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [step, setStep] = useState(1);

  // Fix: Check if user is enabled locally or via prop
  const isEnabled = user?.isTwoFactorEnabled;

  const handleSetup2FA = async () => {
    setLoading(true);
    setError('');
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
    try {
      const { data } = await apiClient.post('/auth/2fa/verify', { token });
      setBackupCodes(data.backupCodes);
      setStep(3);
      setSuccess('2FA Verified! Now save your backup codes.');

      // ✅ Update global auth state immediately
      const updatedUser = { ...user, isTwoFactorEnabled: true };
      login(updatedUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid 6-digit code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSetup = () => {
    setStep(1);
    setBackupCodes([]);
  };

  const copyCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    alert('Backup codes copied to clipboard!');
  };

  // ✅ FIX: Render the active state if user.isTwoFactorEnabled is true
  if (isEnabled) {
    return (
      <div className="p-4 rounded-lg bg-green-100 border border-green-300 dark:bg-green-900/50 dark:border-green-700">
        <div className="flex items-center">
          <FaCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              Two-Factor Authentication is Active
            </h3>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              Your account is protected.
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
            Add an extra layer of security to your account using an authenticator app.
          </p>
          <button
            onClick={handleSetup2FA}
            disabled={loading}
            className="w-full sm:w-auto flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {loading ? <FaSpinner className="animate-spin" /> : 'Enable 2FA'}
          </button>
        </>
      )}
      {step === 2 && (
        <div className="text-center space-y-6 border-t pt-6 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Step 1: Scan QR Code</h3>
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
                className="w-full px-4 py-2 text-center text-lg tracking-widest border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="000000"
                maxLength={6}
                required
              />
              <button
                type="submit"
                disabled={loading || token.length < 6}
                className="w-full flex justify-center py-2.5 px-6 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
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
                Store them in a safe place.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-gray-100 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm text-gray-800 dark:text-gray-200 text-center">
            {backupCodes.map((code, index) => (
              <div key={index} className="tracking-wider">{code}</div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={copyCodes} className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <FaCopy className="mr-2" /> Copy Codes
            </button>
            <button onClick={handleFinishSetup} className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
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

  // --- Form States ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // ✅ Added Email
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [agentType, setAgentType] = useState('Individual'); // ✅ Agent Type State
  const [about, setAbout] = useState('');
  const [voiceCallNumber, setVoiceCallNumber] = useState('');

  // ✅ Social Media States
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: ''
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(user.profilePicture);

  // --- UI States ---
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });

  // --- Password States ---
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ message: '', type: '' });

  // --- Request States ---
  const [pendingRequest, setPendingRequest] = useState(null);
  const [checkingRequest, setCheckingRequest] = useState(true);
  const [applyingAgent, setApplyingAgent] = useState(false);
  const [applyingProvider, setApplyingProvider] = useState(false); // ✅ Service Provider State

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email); // ✅
      setWhatsappNumber(user.whatsappNumber || '');
      setAgentType(user.agentType || 'Individual'); // ✅
      setAbout(user.about || '');
      setVoiceCallNumber(user.pendingVoiceCallNumber || user.voiceCallNumber || '');
      setPreviewImage(user.profilePicture);

      // ✅ Populate Socials
      if (user.socialLinks) {
        setSocialLinks({
          facebook: user.socialLinks.facebook || '',
          instagram: user.socialLinks.instagram || '',
          twitter: user.socialLinks.twitter || '',
          tiktok: user.socialLinks.tiktok || ''
        });
      }
    }
  }, [user]);

  // Fetch Pending Request Logic
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

  // Handle Social Input Change
  const handleSocialChange = (e) => {
    setSocialLinks({ ...socialLinks, [e.target.name]: e.target.value });
  };

  // ✅ Apply for Agent
  const handleApplyAgent = async () => {
    if (!window.confirm("Apply for an Agent account? Admins will review your request.")) return;
    setApplyingAgent(true);
    try {
      await apiClient.post('/users/apply-agent', {}, { withCredentials: true });
      setStatus({ message: 'Agent application submitted!', type: 'success' });
      fetchPendingRequest();
    } catch (err) {
      setStatus({ message: err.response?.data?.message || 'Failed.', type: 'error' });
    } finally {
      setApplyingAgent(false);
    }
  };

  // ✅ Apply for Service Provider
  const handleApplyServiceProvider = async () => {
    if (!window.confirm("Apply for a Service Provider account? Admins will review your request.")) return;
    setApplyingProvider(true);
    try {
      await apiClient.post('/users/apply-service-provider', {}, { withCredentials: true });
      setStatus({ message: 'Service Provider application submitted!', type: 'success' });
      fetchPendingRequest();
    } catch (err) {
      setStatus({ message: err.response?.data?.message || 'Failed.', type: 'error' });
    } finally {
      setApplyingProvider(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // ✅ Update Profile Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ message: '', type: '' });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email); // ✅ Send Email
    formData.append('whatsappNumber', whatsappNumber);
    formData.append('agentType', agentType); // ✅ Send Agent Type
    formData.append('about', about);
    formData.append('voiceCallNumber', voiceCallNumber);
    formData.append('socialLinks', JSON.stringify(socialLinks)); // ✅ Send Socials

    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      const response = await apiClient.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      const { data, status: httpStatus } = response;
      login(data.user);

      if (httpStatus === 202) {
        setStatus({ message: 'Changes submitted for admin approval.', type: 'info' });
        fetchPendingRequest();
      } else {
        setStatus({ message: 'Profile updated successfully!', type: 'success' });
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
      setPasswordStatus({ message: 'Passwords do not match.', type: 'error' });
      return;
    }
    setPasswordLoading(true);
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
      setPasswordStatus({ message: err.response?.data?.message || 'Failed.', type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // ✅ Lock fields if there is a pending profile update
  const fieldsLocked = !!pendingRequest && (!pendingRequest.type || pendingRequest.type === 'profile_update');
  // ✅ Specific check for pending email
  const emailLocked = fieldsLocked || (user.pendingEmail && user.pendingEmail !== user.email);

  if (checkingRequest) return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:border dark:border-gray-700">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
          Edit Profile Settings
        </h1>

        {!user.isVerified && <VerifyEmailPrompt user={user} />}

        {status.message && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${status.type === 'success' ? 'bg-green-100 text-green-700' :
            status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
            {status.message}
          </div>
        )}

        {fieldsLocked && (
          <div className="p-4 mb-6 rounded-lg bg-yellow-50 border border-yellow-300 dark:bg-gray-800 dark:border-yellow-700 flex items-start space-x-3">
            <FaLock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Changes Awaiting Approval</h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Critical details (Name, Email, Agent Type, WhatsApp) are locked pending admin review.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img src={previewImage || '/default-avatar.png'} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700" />
              <label htmlFor="profilePicture" className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition">
                <FaCamera />
                <input type="file" id="profilePicture" name="profilePicture" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaUser className="h-5 w-5 text-gray-400" /></span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-60" required disabled={loading || fieldsLocked} />
            </div>
          </div>

          {/* ✅ Email with Approval Lock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaEnvelope className="h-5 w-5 text-gray-400" /></span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-60" required disabled={loading || emailLocked} />
            </div>
            {emailLocked && user.pendingEmail && (
              <p className="text-xs text-yellow-600 mt-1">Pending approval for change to: {user.pendingEmail}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaWhatsapp className="h-5 w-5 text-gray-400" /></span>
              <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-60" disabled={loading || fieldsLocked} />
            </div>
          </div>

          {/* Agent/Provider Fields */}
          {(user.role === 'agent' || user.role === 'service_provider') && (
            <>
              {/* ✅ Agent Type Toggle */}
              {user.role === 'agent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Operating As</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-between transition ${agentType === 'Individual'
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      } ${fieldsLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${agentType === 'Individual' ? 'border-blue-600' : 'border-gray-400'
                          }`}>
                          {agentType === 'Individual' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                        </span>
                        <div className="text-left">
                          <span className="block font-bold text-sm text-gray-900 dark:text-white">Freelance Agent</span>
                          <span className="text-xs text-gray-500">I work independently.</span>
                        </div>
                      </div>
                      <input type="radio" name="agentType" value="Individual" checked={agentType === 'Individual'} onChange={(e) => setAgentType(e.target.value)} disabled={fieldsLocked} className="hidden" />
                    </label>

                    <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-between transition ${agentType === 'Agency'
                      ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      } ${fieldsLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${agentType === 'Agency' ? 'border-purple-600' : 'border-gray-400'
                          }`}>
                          {agentType === 'Agency' && <span className="w-2 h-2 rounded-full bg-purple-600" />}
                        </span>
                        <div className="text-left">
                          <span className="block font-bold text-sm text-gray-900 dark:text-white">Agency</span>
                          <span className="text-xs text-gray-500">I represent a company.</span>
                        </div>
                      </div>
                      <input type="radio" name="agentType" value="Agency" checked={agentType === 'Agency'} onChange={(e) => setAgentType(e.target.value)} disabled={fieldsLocked} className="hidden" />
                    </label>
                  </div>
                  {/* Show pending status if pending agent type exists (we can infer from locked + mismatch) */}
                  {fieldsLocked && user.agentType !== agentType && (
                    <p className="text-xs text-yellow-600 mt-2">
                      Pending approval to change to: <strong>{agentType}</strong>
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About Me / Business Bio</label>
                <div className="relative">
                  <span className="absolute top-3 left-0 flex items-center pl-3"><FaInfoCircle className="h-5 w-5 text-gray-400" /></span>
                  <textarea rows="4" value={about} onChange={(e) => setAbout(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={loading} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Public Voice Call Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaPhone className="h-5 w-5 text-gray-400" /></span>
                  <input type="tel" value={voiceCallNumber} onChange={(e) => setVoiceCallNumber(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={loading} />
                </div>
              </div>
            </>
          )}

          {/* ✅ Social Media Links Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaFacebook className="text-blue-600" /></span>
                <input type="text" name="facebook" placeholder="Facebook URL" value={socialLinks.facebook} onChange={handleSocialChange} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaInstagram className="text-pink-600" /></span>
                <input type="text" name="instagram" placeholder="Instagram URL" value={socialLinks.instagram} onChange={handleSocialChange} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaXTwitter className="text-gray-900 dark:text-white" /></span>
                <input type="text" name="twitter" placeholder="X (Twitter) URL" value={socialLinks.twitter} onChange={handleSocialChange} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaTiktok className="text-black dark:text-white" /></span>
                <input type="text" name="tiktok" placeholder="TikTok URL" value={socialLinks.tiktok} onChange={handleSocialChange} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading || fieldsLocked} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>

        {/* ✅ UPGRADE SECTION (Separated) */}
        {user.role === 'user' && (
          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700 grid gap-6 md:grid-cols-2">

            {/* Agent Application */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 text-center flex flex-col items-center">
              <FaBriefcase className="text-4xl text-purple-600 mb-3" />
              <h3 className="font-bold text-lg dark:text-white">Real Estate Agent</h3>
              <p className="text-sm text-gray-500 mb-4">List properties & track leads.</p>

              {pendingRequest?.type === 'agent_application' ? (
                <span className="text-blue-600 font-bold text-sm bg-blue-100 px-3 py-1 rounded-full">Pending Approval</span>
              ) : (
                <button onClick={handleApplyAgent} disabled={applyingAgent || applyingProvider} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50">
                  {applyingAgent ? 'Applying...' : 'Apply as Agent'}
                </button>
              )}
            </div>

            {/* ✅ Service Provider Application */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 text-center flex flex-col items-center">
              <FaTools className="text-4xl text-green-600 mb-3" />
              <h3 className="font-bold text-lg dark:text-white">Service Provider</h3>
              <p className="text-sm text-gray-500 mb-4">Offer moving, internet, etc.</p>

              {pendingRequest?.type === 'service_provider_application' ? (
                <span className="text-blue-600 font-bold text-sm bg-blue-100 px-3 py-1 rounded-full">Pending Approval</span>
              ) : (
                <button onClick={handleApplyServiceProvider} disabled={applyingAgent || applyingProvider} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">
                  {applyingProvider ? 'Applying...' : 'Apply as Provider'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Change Password */}
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Old Password</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            {passwordStatus.message && (
              <div className={`p-3 text-sm rounded-lg ${passwordStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {passwordStatus.message}
              </div>
            )}

            <div>
              <button type="submit" disabled={passwordLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50">
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        {/* 2FA Section - Available to All Users */}
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <FaShieldAlt className="mr-3 text-blue-500" />
            Two-Factor Authentication
          </h2>
          <TwoFactorAuthSetup />
        </div>

      </div>
    </div>
  );
};

export default EditProfileSettings;