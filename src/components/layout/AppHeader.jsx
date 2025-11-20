import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileDropdown from '../ProfileDropdown';
import NotificationBell from '../NotificationBell';
import ThemeToggle from '../ThemeToggle';
import { FaBars, FaTimes } from 'react-icons/fa';

const AppHeader = () => {
  const { user, loading, realUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const canListProperty = user && (user.role === 'admin' || user.role === 'agent');

  const handleMobileLogout = async () => {
    await logout();
    closeMobileMenu();
  };

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
      <div className="relative z-40 container mx-auto px-6 md:px-10 py-4 flex justify-between items-center">
        
        <div className="flex items-center space-x-3">
          <Link to="/">
            <img src="/icons/icon-192x192.png" alt="HouseHunt Kenya Logo" className="h-10 w-10 object-contain rounded-md"/>
          </Link>
          <Link to="/" className="text-2xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight">
            HouseHunt Kenya
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-10 text-gray-700 dark:text-gray-300 font-medium">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Home</Link>
          <Link to="/buy" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Buy</Link>
          <Link to="/rent" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Rent</Link>
          <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition">About</Link>
          <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Contact</Link>
          {!user && (
            <Link to="/for-agents" className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow-md transform hover:-translate-y-0.5">
              List Property
            </Link>
          )}
        </nav>
        
        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggle />
          {loading ? (
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          ) : realUser ? ( 
            <>
              <NotificationBell />
              <ProfileDropdown />
            </>
          ) : (
            <Link to="/login" className="font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
              Login
            </Link>
          )}
        </div>
        
        <div className="md:hidden flex items-center space-x-3">
          <ThemeToggle />
          {realUser && !loading && <NotificationBell />} 
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none">
            {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-50">
          <nav className="flex flex-col p-6 space-y-4">
            <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition" onClick={closeMobileMenu}>Home</Link>
            <Link to="/buy" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition" onClick={closeMobileMenu}>Buy</Link>
            <Link to="/rent" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition" onClick={closeMobileMenu}>Rent</Link>
            <Link to="/about" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition" onClick={closeMobileMenu}>About</Link>
            <Link to="/contact" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition" onClick={closeMobileMenu}>Contact</Link>
            {!user && <Link to="/for-agents" className="block text-blue-600 dark:text-blue-400 font-bold" onClick={closeMobileMenu}>Partner with Us (Agents)</Link>}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
              {loading ? <div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div> : realUser ? ( 
                <>
                  <Link to="/profile" className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 transition" onClick={closeMobileMenu}>My Profile</Link>
                  <Link to="/chat" className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 transition" onClick={closeMobileMenu}>My Messages</Link>
                  {user && user.role === 'admin' && (
                    <>
                      <Link to="/admin/dashboard" className="block font-bold text-red-600 hover:text-red-800 transition" onClick={closeMobileMenu}>Admin Dashboard</Link>
                      <Link to="/admin/seo-manager" className="block font-bold text-blue-600 hover:text-blue-800 transition" onClick={closeMobileMenu}>SEO Manager</Link>
                      <Link to="/admin/feature-manager" className="block font-bold text-purple-600 hover:text-purple-800 transition" onClick={closeMobileMenu}>Feature Manager</Link>
                    </>
                  )}
                  {canListProperty && (
                    <>
                      <Link to="/agent/dashboard" className="block font-bold text-blue-600 hover:text-blue-800 transition" onClick={closeMobileMenu}>My Listings</Link>
                      <Link to="/add-property" className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 transition" onClick={closeMobileMenu}>List Property</Link>
                    </>
                  )}
                  <button onClick={handleMobileLogout} className="w-full text-left block text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Sign Out</button>
                </>
              ) : (
                <Link to="/login" className="block w-full text-center bg-gray-100 dark:bg-gray-700 py-2.5 rounded-lg font-medium text-gray-700 hover:text-blue-600 transition" onClick={closeMobileMenu}>Login</Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default AppHeader;