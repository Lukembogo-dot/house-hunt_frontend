// src/pages/Register.jsx
// (UPDATED with WhatsApp & Shadow Claim Logic)

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // navigate removed as not used in success flow
import apiClient from "../api/axios"; 
import { motion } from 'framer-motion'; 
// ✅ IMPORT NEW ICONS
import { FaWhatsapp, FaUserCheck, FaExclamationCircle } from 'react-icons/fa';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // ✅ 1. Added WhatsApp State
  const [whatsappNumber, setWhatsappNumber] = useState('');
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  
  // ✅ 2. Added Shadow Account State
  const [shadowAccount, setShadowAccount] = useState(null); // Stores { id, name } if found
  const [claimSuccess, setClaimSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!name || !email || !password || !whatsappNumber) { // ✅ Added whatsapp check
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    setShadowAccount(null);

    try {
      const response = await apiClient.post(
        '/auth/register',
        { name, email, password, whatsappNumber }, // ✅ Send whatsappNumber
        { withCredentials: true }
      );
      
      setSuccess(response.data.message);

    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      
      // ✅ 3. Check for Shadow Account Signal (409 Conflict + flag)
      if (status === 409 && data?.isShadowAccount) {
         setShadowAccount({
            id: data.shadowUserId,
            name: data.shadowName
         });
         setError(''); // Clear generic error
      } else {
         const message = data?.message || 'Registration failed. Please try again.';
         setError(message);
      }
      console.error('Registration error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ 4. Handle Claim Request
  const handleClaimProfile = async () => {
    if (!shadowAccount) return;
    setSubmitting(true);
    try {
        await apiClient.post('/auth/claim-request', {
            shadowUserId: shadowAccount.id,
            name: name,
            email: email,
            whatsappNumber: whatsappNumber
        });
        setClaimSuccess(`Request sent! An admin has been notified to approve your claim for the "${shadowAccount.name}" profile.`);
        setShadowAccount(null); // Hide the claim UI to show success message
    } catch (err) {
        setError(err.response?.data?.message || "Failed to send claim request.");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg dark:border dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {shadowAccount ? 'Profile Found' : 'Create your account'}
          </h2>
        </div>

        {/* ✅ 5. Handle Success Messages (Registration OR Claim) */}
        {success || claimSuccess ? (
          <div className="p-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-md text-center">
            <h3 className="font-bold text-lg">Success!</h3>
            <p>{success || claimSuccess}</p>
            <p className="mt-2">You may now close this page.</p>
          </div>
        ) : shadowAccount ? (
          
          /* ✅ 6. SHADOW ACCOUNT CLAIM UI */
          <div className="text-center space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <FaUserCheck className="mx-auto text-4xl text-blue-500 mb-2" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      We found a profile for this number!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      The WhatsApp number <strong>{whatsappNumber}</strong> is already linked to a property portfolio under the name <strong>"{shadowAccount.name}"</strong>.
                  </p>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Is this you? Claim this profile to instantly access your listings and stats.
              </p>
              
              <button
                onClick={handleClaimProfile}
                disabled={submitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-all ${
                  submitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? 'Sending Request...' : 'Yes, Claim My Profile'}
              </button>
              
              <button
                onClick={() => setShadowAccount(null)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
              >
                Cancel (Use a different number)
              </button>
          </div>

        ) : (
          /* ✅ 7. STANDARD REGISTRATION FORM */
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-md text-center flex items-center justify-center gap-2">
                <FaExclamationCircle /> {error}
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              {/* ✅ 8. WhatsApp Input Field */}
              <div>
                <label htmlFor="whatsapp" className="sr-only">
                  WhatsApp Number
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaWhatsapp className="text-gray-400" />
                    </div>
                    <input
                    id="whatsapp"
                    name="whatsappNumber"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    placeholder="WhatsApp (e.g. 2547...)"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    />
                </div>
              </div>

              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                  Already have an account? Sign in
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 active:scale-[0.98] ${
                  submitting ? "opacity-50 cursor-not-allowed" : "dark:hover:bg-blue-500"
                }`}
              >
                {submitting ? 'Checking account...' : 'Sign up'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Register;