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

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center space-x-8 text-gray-700 dark:text-gray-300 font-medium text-sm lg:text-base">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Home</Link>
          <Link to="/buy" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Buy</Link>
          <Link to="/rent" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Rent</Link>
          
          <Link to="/services" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Services</Link>
          
          {/* ✅ COMMUNITY DROPDOWN */}
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition py-2">
              Community <FaChevronDown size={10} className="mt-0.5" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute left-0 mt-0 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50 overflow-hidden">
              <div className="py-2">
                <Link 
                  to="/community" 
                  className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-50 dark:border-gray-700/50"
                >
                  <span className="font-bold block text-blue-600 dark:text-blue-400">Insights & Questions</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Ask questions & read guides</span>
                </Link>
                <Link 
                  to="/living-feed" 
                  className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-50 dark:border-gray-700/50"
                >
                  <span className="font-bold block text-purple-600 dark:text-purple-400">Living Experience Feed</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Real-time updates from residents</span>
                </Link>
                {/* ✅ ADDED: RATED PROPERTIES LINK */}
                <Link 
                  to="/rated-properties" 
                  className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <span className="font-bold block text-green-600 dark:text-green-400">Rated Properties</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">See verified tenant reviews</span>
                </Link>
              </div>
            </div>
          </div>

          <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition">About</Link>
          
          {!user && (
            <Link to="/for-agents" className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow-md transform hover:-translate-y-0.5 text-sm font-bold">
              List Property
            </Link>
          )}
        </nav>
        
        {/* RIGHT SIDE CONTROLS */}
        <div className="hidden md:flex items-center space-x-4">
          
          {/* LOCKED DARK MODE TOGGLE */}
          <div className="relative">
            <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-full transition-all duration-300 ${
                !realUser 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 dark:bg-gray-800 text-yellow-500 dark:text-blue-400 hover:scale-110'
              }`}
            >
              {!realUser ? (
                <FaLock size={16} /> 
              ) : (
                isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />
              )}
            </button>
            {/* Tooltip */}
            {!realUser && showLoginTooltip && (
              <div className="absolute top-12 -left-12 w-40 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-xl z-50 animate-bounce text-center">
                <p className="font-bold mb-1">🔒 Login to Unlock</p>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>
            )}
          </div>

          {/* PROFILE SECTION (GAMIFIED) */}
          {loading ? (
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          ) : realUser ? ( 
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <NotificationBell />
              
              <div className="group relative">
                <ProfileDropdown 
                  customTrigger={
                    <button className="flex items-center gap-2 focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full pr-3 pl-1 py-1 transition-colors">
                      <div className="relative">
                        <img 
                          src={realUser.profilePicture || "https://placehold.co/100"} 
                          alt="Profile" 
                          className="h-9 w-9 rounded-full object-cover border-2 border-blue-500"
                        />
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                      </div>
                      
                      <div className="text-left hidden lg:block">
                        <p className="text-xs font-bold text-gray-800 dark:text-white leading-none mb-0.5">
                          {realUser.name.split(' ')[0]}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide bg-blue-50 dark:bg-blue-900/30 px-1.5 rounded-full w-max">
                          <FaShieldAlt size={8} />
                          {realUser.contributorLevel || 'Newbie'}
                        </div>
                      </div>
                    </button>
                  }
                />
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700 group">
               <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors border-2 border-transparent group-hover:border-blue-200">
                  <FaUserSecret size={18} />
               </div>
               <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-blue-600 transition-colors leading-none mb-0.5">
                    Guest Explorer
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 group-hover:text-blue-400">
                    Lvl 0 • Log in to play
                  </p>
               </div>
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
                    <p className="font-bold text-gray-800 dark:text-white text-lg">{realUser.name}</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <FaShieldAlt /> {realUser.contributorLevel || 'NEWBIE'}
                    </div>
                  </div>
                </div>
             ) : (
               <Link to="/login" className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl mb-2 border border-dashed border-gray-300 dark:border-gray-600" onClick={closeMobileMenu}>
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500">
                    <FaUserSecret size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-700 dark:text-gray-200">Guest Explorer</p>
                    <p className="text-xs text-blue-500 font-bold">Tap to Log In & Level Up</p>
                  </div>
               </Link>
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
  );
};

export default AppHeader;