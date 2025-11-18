// src/pages/PaymentSuccess.jsx
// NEW FILE

import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // You can get these from the URL if Pesapal adds them
  const transactionId = searchParams.get('pesapal_transaction_tracking_id');
  const merchantRef = searchParams.get('pesapal_merchant_reference');

  // Automatically redirect the user after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Redirect to the agent's dashboard or property page
      // For now, we'll send them to their profile
      navigate('/profile'); 
    }, 5000); // 5-second delay

    return () => clearTimeout(timer); // Clear timer on unmount
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 dark:bg-gray-950 text-center px-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
        className="p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border dark:border-gray-700"
      >
        <FaCheckCircle className="text-7xl text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
          Payment Successful!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Your listing has been featured and is now live on the homepage.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Transaction ID: {transactionId || 'Processing...'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You will be redirected to your dashboard shortly.
        </p>
        <Link
          to="/profile"
          className="mt-6 inline-block bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Dashboard Now
        </Link>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;