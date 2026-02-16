// src/pages/MyProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  FaCog, FaEdit, FaHome, FaPlus, FaBullhorn, FaShareAlt,
  FaTwitter, FaWhatsapp, FaSpinner, FaTachometerAlt
} from 'react-icons/fa'; // Added FaTachometerAlt
import apiClient from '../utils/apiClient';

// Existing Components
import MyListings from '../components/MyListings';
import MyFavorites from '../components/MyFavorites';
import ScheduledViewings from '../components/ScheduledViewings';

// RPG Components
import HeroStats from '../components/Gamification/HeroStats';
import QuestLog from '../components/Gamification/QuestLog';
import BadgesGallery from '../components/Gamification/BadgesGallery';

// Residence Components
import AddResidencyModal from '../components/MyResidencies/AddResidencyModal';
import ResidenceList from '../components/MyResidencies/ResidenceList';
import MyPostsList from '../components/Community/MyPostsList';

const MyProfile = () => {
  const { user } = useAuth();
  const [isResidencyModalOpen, setIsResidencyModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Data States
  const [gameData, setGameData] = useState(null);
  const [loadingGameData, setLoadingGameData] = useState(true);
  const [validatingAccess, setValidatingAccess] = useState(false); // ✅ Loading state for button

  // 1. FETCH GAMIFICATION STATS
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const { data } = await apiClient.get('/users/my-abilities');
        setGameData(data);
      } catch (error) {
        console.error("Failed to fetch gamification stats:", error);
      } finally {
        setLoadingGameData(false);
      }
    };
    fetchGameData();
  }, [refreshTrigger]);

  // ✅ 2. OPEN MODAL DIRECTLY (Validation handled inside Modal)
  const handleOpenResidencyModal = () => {
    setIsResidencyModalOpen(true);
  };

  // 3. SHARE FUNCTIONALITY
  const handleShare = async (platform) => {
    if (!gameData) return;

    // ✅ UPDATE: Include Battle Stats in Share Text
    const battleText = gameData.battleWins > 0 ? ` & ${gameData.battleWins} Battle Wins 🏆` : '';
    const shareText = `I'm a Level ${gameData.level} ${gameData.title || 'Contributor'} on HouseHunt Kenya! 🛡️ I've earned ${gameData.score} XP${battleText}. Rate your building anonymously and join me!`;
    const shareUrl = 'https://househuntkenya.com';

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({ title: 'My HouseHunt Progress', text: shareText, url: shareUrl });
      } catch (err) { console.log('Share canceled'); }
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    }
  };

  if (!user) return <div className="p-10 text-center dark:text-gray-300">Loading profile...</div>;

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">

      {/* --- 1. Top Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={user.profilePicture || "https://placehold.co/100"}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
            />
            <Link to="/profile/edit" className="absolute bottom-0 right-0 bg-gray-800 text-white p-1 rounded-full text-xs hover:bg-blue-600 transition">
              <FaEdit />
            </Link>
          </div>
          <div>
            <h1 className="text-xl font-bold dark:text-white">{user.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role} Account</p>
          </div>
        </div>

        {/* Actions & Sharing */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm mr-2">
            <button onClick={() => handleShare('whatsapp')} className="p-2 text-green-500 hover:bg-gray-50 dark:hover:bg-gray-700 border-r border-gray-200 dark:border-gray-700" title="Share on WhatsApp">
              <FaWhatsapp />
            </button>
            <button onClick={() => handleShare('twitter')} className="p-2 text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-r border-gray-200 dark:border-gray-700" title="Share on X">
              <FaTwitter />
            </button>
            <button onClick={() => handleShare('native')} className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm font-bold">
              <FaShareAlt /> <span className="hidden sm:inline">Share Stats</span>
            </button>
          </div>

          {/* ✅ VALIDATED ADD BUTTON */}
          <button
            onClick={handleOpenResidencyModal}
            disabled={validatingAccess}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-70 disabled:cursor-wait"
          >
            {validatingAccess ? <FaSpinner className="animate-spin" /> : <FaPlus className="text-xs" />}
            <span className="hidden md:inline font-bold">Add Residence</span>
          </button>

          <Link
            to="/profile/edit"
            className="flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <FaCog />
          </Link>
        </div>
      </div>

      {/* --- 2. The RPG Hero Dashboard --- */}
      <div className="mb-8">
        {loadingGameData ? (
          <div className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl"></div>
        ) : (
          <HeroStats stats={gameData} />
        )}
      </div>

      {/* --- 3. Grid: Active Quests & Badges --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 items-stretch">
        <div className="h-full">
          <QuestLog quests={gameData?.quests || []} loading={loadingGameData} />
        </div>
        <div className="h-full">
          <BadgesGallery badges={gameData?.badges || []} />
        </div>
      </div>

      {/* --- SPECIAL: DASHBOARD ACCESS (ADMIN, AGENTS & MODERATORS ONLY) --- */}
      {(user.role === 'admin' || user.role === 'agent' || user.role === 'moderator') && (
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md p-6 mb-8 text-white relative overflow-hidden">
          {/* Decorative Overlay */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-5 rounded-full blur-xl"></div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaTachometerAlt className="text-yellow-400" />
                {user.role === 'admin' || user.role === 'moderator' ? 'Administrative Dashboard' : 'Agent Command Center'}
              </h3>
              <p className="text-blue-100 text-sm mt-1 max-w-lg">
                {user.role === 'admin' || user.role === 'moderator'
                  ? 'Access platform metrics, manage users, verify listings, and oversee system settings.'
                  : 'Manage your property listings, view leads, track performance metrics, and update your profile.'}
              </p>
            </div>
            <Link
              to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'moderator' ? '/moderator/dashboard' : '/agent/dashboard'}
              className="bg-white text-blue-900 font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition shadow-lg transform hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Access Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* --- 4. My Housing Passport --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaHome className="text-blue-500" /> My Housing Passport
          </h3>

          {/* ✅ VALIDATED ADD TEXT LINK */}
          <button
            onClick={handleOpenResidencyModal}
            disabled={validatingAccess}
            className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1"
          >
            {validatingAccess ? <FaSpinner className="animate-spin" /> : '+ Add New'}
          </button>
        </div>
        <ResidenceList refreshTrigger={refreshTrigger} />
      </div>

      {/* --- 5. My Community Contributions --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaBullhorn className="text-purple-500" /> My Community Updates
          </h3>
          <Link to="/living-feed" className="text-sm text-purple-600 hover:underline font-medium">
            View Feed
          </Link>
        </div>
        <MyPostsList />
      </div>

      {/* --- Divider --- */}
      <div className="border-t border-gray-200 dark:border-gray-800 my-8"></div>

      {/* --- 6. Functional Sections --- */}
      <div className="mb-10">
        <ScheduledViewings />
      </div>

      <div className="mb-10">
        <MyFavorites />
      </div>

      {(user.role === 'agent' || user.role === 'admin') && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-800 my-10"></div>
          <div className="mb-10">
            <MyListings />
          </div>
        </>
      )}

      <AddResidencyModal
        isOpen={isResidencyModalOpen}
        onClose={() => setIsResidencyModalOpen(false)}
        refresh={handleRefresh}
      />

    </div>
  );
};

export default MyProfile;