// src/pages/NotFound.jsx
// NEW FILE

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <>
      {/* Tell Google not to index this 404 page */}
      <Helmet>
        <title>404 - Page Not Found</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 dark:bg-gray-950">
        <FaExclamationTriangle className="text-9xl text-yellow-400 mb-8" />
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
          We're sorry, but the page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
        >
          <FaHome className="mr-2" />
          Go Back Home
        </Link>
      </div>
    </>
  );
};

export default NotFound;