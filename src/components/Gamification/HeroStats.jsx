import React, { useEffect, useState } from 'react';
import { FaShieldAlt, FaStar, FaBolt } from 'react-icons/fa';
import apiClient from '../../utils/apiClient'; 

const HeroStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbilities = async () => {
      try {
        // Fetches from the new endpoint we made: /api/users/my-abilities
        const { data } = await apiClient.get('/users/my-abilities');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch gamification stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbilities();
  }, []);

  if (loading) return <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>;
  if (!stats) return null;

  // Calculate Progress Percentage
  const currentScore = stats.score;
  const pointsToNext = stats.nextMilestone?.pointsNeeded || 0;
  const totalForNextLevel = currentScore + pointsToNext;
  const progressPercent = Math.min(100, Math.round((currentScore / totalForNextLevel) * 100));

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
        <FaShieldAlt size={150} />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
        
        {/* Level Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-blue-200 font-bold uppercase tracking-wider text-xs mb-1">
            <FaShieldAlt /> Current Rank
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-2">{stats.level}</h2>
          
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
             <span className="bg-white/20 px-2 py-0.5 rounded text-white">{stats.score} XP</span>
             <span>•</span>
             <span>{pointsToNext} XP to {stats.nextMilestone?.level}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full md:w-1/2">
          <div className="flex justify-between text-xs font-bold mb-1 opacity-80">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-4 backdrop-blur-sm border border-white/10">
            <div 
              className="bg-yellow-400 h-4 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.6)] transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-xs mt-2 text-blue-100 italic">
            Next Unlock: {stats.nextMilestone?.unlocks?.[0] || 'Max Level Reached'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroStats;