import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBolt, FaGift, FaChevronRight, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import apiClient from '../../utils/apiClient';

const QuestLog = () => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        // Fetch from the endpoint we just updated
        const { data } = await apiClient.get('/users/my-abilities');
        setQuests(data.quests || []);
      } catch (error) {
        console.error("Failed to load quests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuests();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full flex items-center justify-center">
        <FaSpinner className="animate-spin text-blue-500 text-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex justify-between items-center text-white">
        <h3 className="font-bold flex items-center gap-2 text-lg">
          <FaBolt className="text-yellow-300" /> Quest Log
        </h3>
        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full border border-white/20">
          {quests.length} Available
        </span>
      </div>

      {/* Quest List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
        {quests.length > 0 ? (
          quests.map((quest, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group relative">
              
              {/* Quest Header */}
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                  {quest.title}
                </h4>
                <span className="text-xs font-extrabold text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  +{quest.xp} XP
                </span>
              </div>
              
              {/* Description */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                {quest.description}
              </p>

              {/* Footer: Rewards & Action */}
              <div className="flex justify-between items-end mt-2">
                <div className="flex flex-col">
                   <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Reward</span>
                   <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-bold">
                     <FaGift size={12} /> {quest.unlocks}
                   </div>
                </div>
                
                <Link 
                  to={quest.actionLink}
                  className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-2 rounded-lg font-bold flex items-center gap-1 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all transform active:scale-95 shadow-sm"
                >
                  Start Quest <FaChevronRight size={10} />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-4 text-3xl">
              <FaCheckCircle />
            </div>
            <h4 className="text-gray-800 dark:text-white font-bold text-lg">All Caught Up!</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
              You've completed all available quests. You are a true HouseHunt Legend.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestLog;