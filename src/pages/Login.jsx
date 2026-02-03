// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import apiClient from "../api/axios";
import { useAuth } from "../context/AuthContext";
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaSpinner, FaShieldAlt, FaKey, FaUserCheck, FaArrowRight, FaWhatsapp, FaArrowLeft } from 'react-icons/fa';

// ✅ 1. Import Google Login Component
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  // --- UI STATES ---
  const [step, setStep] = useState('CHECK_USER'); // CHECK_USER | PASSWORD | CLAIM | 2FA
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState(null); // Stores name/email from Step 1

  // --- 2FA STATES ---
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  // --- CLAIM STATES ---
  const [claimDetails, setClaimDetails] = useState({ name: '', email: '', whatsappNumber: '' });

  // --- FEEDBACK STATES ---
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ 2. Handle Google Login Success
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      const { credential } = credentialResponse;

      const response = await apiClient.post(
        "/auth/google",
        { token: credential },
        { withCredentials: true }
      );

      // Log the user in
      login(response.data);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });

    } catch (err) {
      console.error("Google Login Error:", err);
      setError(err.response?.data?.message || "Google sign-in failed.");
    }
  };

  // ---------------------------------------------------------
  // STEP 1: CHECK USER IDENTITY
  // ---------------------------------------------------------
  const handleCheckUser = async (e) => {
    e.preventDefault();
    if (!identifier) { setError("Please enter your email or phone number."); return; }

    setSubmitting(true);
    setError("");

    try {
      const { data } = await apiClient.post("/auth/check-user", { identifier });

      if (data.found) {
        setUserData(data);
        if (data.isShadow) {
          setClaimDetails({
            shadowUserId: data.userId,
            name: data.name,
            whatsappNumber: identifier.includes('@') ? '' : identifier,
            email: identifier.includes('@') ? identifier : ''
          });
          setStep('CLAIM');
        } else {
          setStep('PASSWORD');
        }
      } else {
        setError("Account not found. Please register first.");
      }
    } catch {
      setError("Connection failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // STEP 2: PASSWORD LOGIN
  // ---------------------------------------------------------
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!password) { setError("Please enter your password."); return; }

    setSubmitting(true);
    setError("");

    try {
      const response = await apiClient.post(
        "/auth/login",
        { email: userData.email, password },
        { withCredentials: true }
      );

      if (response.data.twoFactorRequired) {
        setTempToken(response.data.tempToken);
        setStep('2FA');
        setSubmitting(false);
      } else {
        login(response.data);
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }

    } catch (err) {
      setError(err.response?.data?.message || "Incorrect password.");
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // STEP 2 ALTERNATIVE: SUBMIT CLAIM REQUEST
  // ---------------------------------------------------------
  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimDetails.name || !claimDetails.email || !claimDetails.whatsappNumber) {
      setError("Please fill in all details to verify your identity.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const { data } = await apiClient.post("/auth/claim-request", claimDetails);
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit claim.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // STEP 3: 2FA VERIFICATION
  // ---------------------------------------------------------
  const handle2FAVerify = async (e) => {
    e.preventDefault();
    const requiredLength = useBackupCode ? 8 : 6;

    if (twoFactorCode.length < requiredLength) {
      setError(`Invalid code length.`);
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const response = await apiClient.post(
        "/auth/2fa/validate",
        { tempToken, twoFactorCode },
        { withCredentials: true }
      );

      login(response.data);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });

    } catch {
      setError("Invalid code. Please try again.");
      setSubmitting(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <motion.div
        className="max-w-md w-full bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg dark:border dark:border-gray-700 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {step !== 'CHECK_USER' && !success && (
          <button
            onClick={() => {
              setStep('CHECK_USER');
              setError('');
              setPassword('');
            }}
            className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <FaArrowLeft />
          </button>
        )}

        <div className="text-center">
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
            {step === 'CHECK_USER' && "Welcome Back"}
            {step === 'PASSWORD' && `Hi, ${userData?.name}`}
            {step === 'CLAIM' && "Claim Your Profile"}
            {step === '2FA' && "Two-Step Verification"}
          </h1>
          {step === 'CHECK_USER' && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Enter your details to continue</p>}
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200 rounded-md text-center text-sm">
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200 rounded-md text-center">
            <h3 className="font-bold text-lg mb-2">Request Sent!</h3>
            <p>{success}</p>
            <button onClick={() => navigate('/')} className="mt-4 text-sm underline hover:text-green-900 dark:hover:text-green-100">Return Home</button>
          </motion.div>
        )}

        {!success && (
          <div className="mt-8">

            {/* STEP 1: IDENTIFIER INPUT */}
            {step === 'CHECK_USER' && (
              <>
                <form onSubmit={handleCheckUser} className="space-y-6">
                  <div>
                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email or WhatsApp Number
                    </label>
                    <input
                      id="identifier"
                      type="text"
                      required
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g. 0712345678 or user@example.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {submitting ? <FaSpinner className="animate-spin" /> : <span className="flex items-center">Continue <FaArrowRight className="ml-2" /></span>}
                  </button>
                </form>

                {/* ✅ 3. Google Sign-In Button */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError("Google Sign In Failed")}
                      theme="filled_blue"
                      shape="pill"
                      width="350px"
                    />
                  </div>
                </div>

                <div className="text-center text-sm mt-4">
                  <span className="text-gray-600 dark:text-gray-400">New to HouseHunt? </span>
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Create an account
                  </Link>
                </div>
              </>
            )}

            {/* STEP 2: PASSWORD INPUT */}
            {step === 'PASSWORD' && (
              <form onSubmit={handlePasswordLogin} className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline dark:text-blue-400">Forgot?</Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    autoComplete="off"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : "Sign In"}
                </button>
              </form>
            )}

            {/* STEP 2 ALTERNATIVE: CLAIM PROFILE */}
            {step === 'CLAIM' && (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700 mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Is this you?</strong> We found a profile for "{userData?.name}". To access your listings, please verify your identity below.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Full Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={claimDetails.name}
                    onChange={(e) => setClaimDetails({ ...claimDetails, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Email (For Login)</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={claimDetails.email}
                    onChange={(e) => setClaimDetails({ ...claimDetails, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp Number (Verification)</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={claimDetails.whatsappNumber}
                    onChange={(e) => setClaimDetails({ ...claimDetails, whatsappNumber: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : <span className="flex items-center gap-2"><FaUserCheck /> Submit Claim Request</span>}
                </button>
              </form>
            )}

            {/* STEP 3: 2FA VERIFICATION */}
            {step === '2FA' && (
              <form onSubmit={handle2FAVerify} className="space-y-6">
                <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {useBackupCode
                    ? "Enter an 8-character backup code."
                    : "Enter the 6-digit code from your authenticator app."}
                </p>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    {useBackupCode ? <FaKey className="text-gray-400" /> : <FaShieldAlt className="text-gray-400" />}
                  </span>
                  <input
                    type="text"
                    inputMode={useBackupCode ? "text" : "numeric"}
                    autoComplete="one-time-code"
                    required
                    className="appearance-none block w-full px-3 py-3 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={useBackupCode ? "backup-code" : "123456"}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    maxLength={useBackupCode ? 8 : 6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : "Verify"}
                </button>

                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUseBackupCode(!useBackupCode);
                      setTwoFactorCode("");
                      setError("");
                    }}
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {useBackupCode ? "Use Authenticator App" : "Use Backup Code"}
                  </button>
                </div>
              </form>
            )}

          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;