// src/pages/PaymentCancel.jsx
// NEW FILE

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const merchantRef = searchParams.get('pesapal_merchant_reference');
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 dark:bg-gray-950 text-center px-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
        className="p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border dark:border-gray-700"
      >
        <FaTimesCircle className="text-7xl text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
          Payment Canceled
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Your payment was not processed and your listing has not been featured.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your property has been saved as a draft. You can feature it from your dashboard at any time.
        </p>
        <div className="flex gap-4 mt-8">
          <Link
            to="/profile" // Link to their dashboard
            className="flex-1 inline-block bg-gray-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-gray-700 transition"
          >
            My Dashboard
          </Link>
          <Link
            to="/add-property" // Let them try again
            className="flex-1 inline-block bg-blue-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;