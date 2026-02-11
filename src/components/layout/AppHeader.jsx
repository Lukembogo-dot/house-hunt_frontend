// src/components/layout/AppHeader.jsx
// (UPDATED: Added Rated Properties Link)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileDropdown from '../ProfileDropdown';
import NotificationBell from '../NotificationBell';
import { FaBars, FaTimes, FaLock, FaSun, FaMoon, FaShieldAlt, FaUserSecret, FaChevronDown } from 'react-icons/fa';

const AppHeader = () => {
  const { user, loading, realUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const canListProperty = user && (user.role === 'admin' || user.role === 'agent');

  // LOCKED DARK MODE STATE
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);

  // Initialize Theme on Load
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleThemeToggle = () => {
    if (!realUser) {
      setShowLoginTooltip(true);
      setTimeout(() => setShowLoginTooltip(false), 3000);
      return;
    }

    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  const handleMobileLogout = async () => {
    await logout();
    closeMobileMenu();
  };

  return (
    <>
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="relative z-40 container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">

          <div className="flex items-center space-x-2.5">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/icons/icon-192x192.png" alt="HouseHunt Kenya Logo" className="h-9 w-9 object-contain rounded-lg" />
              <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 bg-clip-text text-transparent tracking-tight">HouseHunt Kenya</span>
            </Link>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center space-x-6 text-gray-700 dark:text-gray-300 font-medium text-sm">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Home</Link>
            <Link to="/buy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Buy</Link>
            <Link to="/rent" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Rent</Link>

            <Link to="/services" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Services</Link>

            {/* ✅ COMMUNITY DROPDOWN */}
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 py-2">
                Community <FaChevronDown size={9} className="mt-0.5" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute left-0 mt-0 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50 overflow-hidden">
                <div className="py-1.5">
                  <Link
                    to="/community"
                    className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/30"
                  >
                    <span className="font-semibold block text-blue-600 dark:text-blue-400">Insights & Questions</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Ask questions & read guides</span>
                  </Link>
                  <Link
                    to="/living-feed"
                    className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50/50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/30"
                  >
                    <span className="font-semibold block text-purple-600 dark:text-purple-400">Living Experience Feed</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Real-time updates from residents</span>
                  </Link>
                  <Link
                    to="/rated-properties"
                    className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50/50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="font-semibold block text-green-600 dark:text-green-400">Rated Properties</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">See verified tenant reviews</span>
                  </Link>
                </div>
              </div>
            </div>

            <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">About</Link>
            <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Contact</Link>

            {!user && (
              <Link to="/for-agents" className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm font-bold">
                List Property
              </Link>
            )}
          </nav>

          {/* RIGHT SIDE CONTROLS */}
          <div className="hidden md:flex items-center space-x-3">

            {/* LOCKED DARK MODE TOGGLE - ✅ MODERNIZED */}
            <div className="relative">
              <button
                onClick={handleThemeToggle}
                className={`p-2 rounded-lg transition-all duration-200 ${!realUser
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 dark:bg-gray-800 text-yellow-500 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
                  }`}
                title={!realUser ? 'Login to Unlock' : (isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode')}
              >
                {!realUser ? (
                  <FaLock size={16} />
                ) : (
                  isDarkMode ? <FaSun size={16} /> : <FaMoon size={16} />
                )}
              </button>
              {/* Tooltip */}
              {!realUser && showLoginTooltip && (
                <div className="absolute top-12 -left-10 w-36 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-xl py-2 px-3 shadow-2xl z-50 animate-bounce text-center border border-gray-700">
                  <p className="font-bold mb-0.5">🔒 Login to Unlock</p>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45"></div>
                </div>
              )}
            </div>

            {/* PROFILE SECTION (GAMIFIED) - ✅ MODERNIZED */}
            {loading ? (
              <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ) : realUser ? (
              <div className="flex items-center gap-2.5 pl-2.5 border-l border-gray-200 dark:border-gray-700">
                <NotificationBell />

                <div className="group relative">
                  <ProfileDropdown
                    customTrigger={
                      <button className="flex items-center gap-2 focus:outline-none hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl pr-2.5 pl-1 py-1 transition-all duration-200">
                        <div className="relative">
                          <img
                            src={realUser.profilePicture || "https://placehold.co/100"}
                            alt="Profile"
                            className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/50 hover:ring-blue-500 transition-all"
                          />
                          <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                        </div>

                        <div className="text-left hidden lg:block">
                          <p className="text-xs font-bold text-gray-800 dark:text-white leading-none mb-0.5">
                            {realUser.name.split(' ')[0]}
                          </p>
                          <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">
                            {realUser.name.split(' ').slice(1).join(' ')}
                          </p>
                        </div>
                      </button>
                    }
                  />
                </div>
              </div>
            ) : (
              <Link to="/login" className="ml-2 px-5 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white font-bold hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-sm">
                Log In
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-3">
            <button onClick={handleThemeToggle} className="text-gray-500">
              {!realUser ? <FaLock /> : (isDarkMode ? <FaSun /> : <FaMoon />)}
            </button>

            {realUser && !loading && <NotificationBell />}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none">
              {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-50 h-screen overflow-y-auto pb-20">
            <nav className="flex flex-col p-6 space-y-4">
              {realUser ? (
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-gray-700/50 p-4 rounded-xl mb-2">
                  <img src={realUser.profilePicture || "https://placehold.co/100"} className="w-12 h-12 rounded-full border-2 border-blue-500" alt="Profile" />
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white text-lg">
                      {realUser.name.split(' ')[0]}
                    </p>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                      {realUser.name.split(' ').slice(1).join(' ')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <Link to="/login" className="block w-full text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 rounded-xl hover:opacity-90 transition shadow-lg" onClick={closeMobileMenu}>
                    Log In
                  </Link>
                </div>
              )}

              <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium" onClick={closeMobileMenu}>Home</Link>
              <Link to="/buy" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium" onClick={closeMobileMenu}>Buy</Link>
              <Link to="/rent" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium" onClick={closeMobileMenu}>Rent</Link>
              <Link to="/services" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium" onClick={closeMobileMenu}>Services</Link>

              {/* Mobile Community Dropdown (Expanded) */}
              <div className="border-l-2 border-blue-100 dark:border-gray-700 pl-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Community</p>
                <Link to="/community" className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium" onClick={closeMobileMenu}>
                  Insights & Questions
                </Link>
                <Link to="/living-feed" className="block text-gray-700 dark:text-gray-200 hover:text-purple-600 font-medium" onClick={closeMobileMenu}>
                  Living Experience Feed
                </Link>
                {/* ✅ ADDED: RATED PROPERTIES (MOBILE) */}
                <Link to="/rated-properties" className="block text-gray-700 dark:text-gray-200 hover:text-green-600 font-medium" onClick={closeMobileMenu}>
                  Rated Properties
                </Link>
              </div>

              <Link to="/about" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium" onClick={closeMobileMenu}>About</Link>
              <Link to="/contact" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium" onClick={closeMobileMenu}>Contact</Link>

              {!user && (
                <Link to="/for-agents" className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow-md transform hover:-translate-y-0.5 text-sm font-bold" onClick={closeMobileMenu}>
                  List Property
                </Link>
              )}

              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
                {realUser && (
                  <>
                    <Link to="/profile" className="block text-gray-700 dark:text-gray-200 hover:text-blue-600" onClick={closeMobileMenu}>My Profile</Link>
                    <Link to="/chat" className="block text-gray-700 dark:text-gray-200 hover:text-blue-600" onClick={closeMobileMenu}>My Messages</Link>
                    <button onClick={handleMobileLogout} className="w-full text-left block text-red-500 font-medium mt-2">Sign Out</button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-[60px] md:h-[64px]" />
    </>
  );
};

export default AppHeader;