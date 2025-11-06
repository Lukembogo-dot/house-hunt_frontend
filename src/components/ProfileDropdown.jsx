import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion'; // ✅ Import motion

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); 

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
        whileTap={{ scale: 0.95 }} // ✅ Bouncy click
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
      >
        <FaUserCircle size={24} />
        <span>{user?.name}</span>
      </motion.button>

      {/* ✅ Animate the dropdown menu */}
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
              onClick={() => setIsOpen(false)} // ✅ This is the bug fix
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              My Profile
            </Link>
            
            {user && user.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsOpen(false)} // ✅ This is the bug fix
                className="block px-4 py-2 text-sm font-bold text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Admin Dashboard
              </Link>
            )}

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