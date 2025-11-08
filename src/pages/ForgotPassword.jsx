import React, { useState } from 'react';
import apiClient from '../api/axios';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const { data } = await apiClient.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
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
          Forgot Your Password?
        </h1>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your email and we'll send you a link to reset it.
        </p>

        {message ? (
          <div className="p-4 text-center text-green-700 bg-green-100 dark:bg-green-800 dark:text-green-200 rounded-lg">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;