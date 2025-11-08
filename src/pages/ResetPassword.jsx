import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await apiClient.post(`/auth/reset-password/${token}`, { password });
      setSuccess('Password reset successfully! Logging you in...');
      setUser(data); // Log the user in
      setTimeout(() => navigate('/profile'), 2000); // Redirect
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950 px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Reset Your Password
        </h1>
        
        {success ? (
          <div className="p-4 text-center text-green-700 bg-green-100 dark:bg-green-800 dark:text-green-200 rounded-lg">
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Update Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;