import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeatureFlag } from '../context/FeatureFlagContext';
import { FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';

const ProfileDropdown = () => {
  // ✅ 1. Get the new values from useAuth
  const { user, logout, realUser, startPreview } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const isAnalyticsEnabled = useFeatureFlag('agent-analytics-dashboard');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
      >
        <FaUserCircle size={24} />
        {/* ✅ 2. This will now show your "preview" name or your real name */}
        <span>{user?.name}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl z-50 border border-gray-100 dark:border-gray-700 py-1"
          >
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              My Profile
            </Link>

            <Link
              to="/chat"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              My Messages
            </Link>

            {/* ✅ 3. AGENT LINKS - UPDATED FOR DASHBOARD & WALLET */}
            {user && user.role === 'agent' && (
              <>
                {/* Dashboard Link */}
                <Link
                  to="/agent/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  My Listings
                </Link>

                {/* ✅ NEW WALLET LINK */}
                <Link
                  to="/agent/wallet"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  My Wallet
                </Link>

                <Link
                  to="/add-property"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Post New Property
                </Link>

                {isAnalyticsEnabled && (
                  <Link
                    to="/profile/analytics"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    My Analytics
                  </Link>
                )}
              </>
            )}

            {/* This block also correctly hides/shows based on preview */}
            {user && (user.role === 'admin' || user.role === 'moderator') && (
              <>
                <Link
                  to="/add-property"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  List Property
                </Link>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                <Link
                  to={user.role === 'moderator' ? "/moderator/dashboard" : "/admin/dashboard"}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm font-bold text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {user.role === 'moderator' ? "Moderator Panel" : "Admin Dashboard"}
                </Link>

                {/* Admin ONLY extra tools */}
                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/seo-manager"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      SEO Manager
                    </Link>
                    <Link
                      to="/admin/feature-manager"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-sm font-bold text-purple-600 dark:text-purple-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Feature Manager
                    </Link>
                  </>
                )}
              </>
            )}

            {/* ✅ 4. PREVIEW SECTION */}
            {realUser && realUser.role === 'admin' && (
              <>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Preview As...
                </div>
                <button
                  onClick={() => { startPreview('guest'); setIsOpen(false); }}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Guest Visitor
                </button>
                <button
                  onClick={() => { startPreview('user'); setIsOpen(false); }}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Basic User
                </button>
                <button
                  onClick={() => { startPreview('agent'); setIsOpen(false); }}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Agent
                </button>
              </>
            )}
            {/* --- END OF PREVIEW SECTION --- */}

            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

            <button
              onClick={handleLogout}
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;