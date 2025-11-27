import React, { useEffect, useState } from 'react';
import apiClient from '../../utils/apiClient';

const BadgesGallery = () => {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const { data } = await apiClient.get('/users/my-abilities');
        setBadges(data.badges || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBadges();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 h-full">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        🏆 Badges Earned
      </h3>

      {badges.length > 0 ? (
        <div className="grid grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center group relative cursor-help">
              <div className="w-12 h-12 bg-blue-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl shadow-sm border border-blue-100 dark:border-gray-600">
                {badge.icon || '🏅'}
              </div>
              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 mt-2 text-center leading-tight">
                {badge.name}
              </span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block w-32 bg-gray-900 text-white text-xs p-2 rounded z-10 text-center">
                Earned: {new Date(badge.awardedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
            <p className="text-gray-400 text-3xl mb-2">🛡️</p>
            <p className="text-gray-500 text-sm">No badges yet.</p>
            <p className="text-xs text-blue-500 mt-1">Post reviews to earn!</p>
        </div>
      )}
    </div>
  );
};

export default BadgesGallery;