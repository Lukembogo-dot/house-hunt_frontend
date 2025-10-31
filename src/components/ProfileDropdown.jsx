import React, { useState, useEffect, useRef } from 'react'; // ✅ 1. Import useEffect and useRef
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from "react-icons/fa";

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // ✅ 2. Create a ref to refer to the dropdown element

  const handleLogout = async () => {
    await logout();
    navigate('/'); // Redirect to home after logout
  };

  // ✅ 3. Add effect to handle clicks outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the dropdown is open and the click is outside of the dropdown's area, close it
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    // Add event listener when the component mounts
    document.addEventListener('mousedown', handleClickOutside);
    // Cleanup the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]); // Rerun effect if the ref changes

  return (
    // ✅ 4. Attach the ref to the main container
    <div className="relative" ref={dropdownRef}>
      <button
        // ✅ 5. Change the event to onClick to toggle the menu
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-600 font-medium hover:text-blue-600 transition"
      >
        <FaUserCircle size={24} />
        <span>{user?.name}</span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50 border border-gray-100 py-1"
        >
          {user && user.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              onClick={() => setIsOpen(false)} // Close menu on navigation
              className="block px-4 py-2 text-sm font-bold text-blue-700 hover:bg-gray-100"
            >
              Admin Dashboard
            </Link>
          )}

          <Link
            to="/profile"
            onClick={() => setIsOpen(false)} // Close menu on navigation
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Edit Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;