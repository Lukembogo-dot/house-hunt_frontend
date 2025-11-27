import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaLock } from 'react-icons/fa';
import apiClient from '../../utils/apiClient';

const AbilitiesList = () => {
  const [abilities, setAbilities] = useState([]);

  useEffect(() => {
    const fetchAbilities = async () => {
      try {
        const { data } = await apiClient.get('/users/my-abilities');
        setAbilities(data.abilities || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAbilities();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 h-full">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        ⚡ Unlocked Abilities
      </h3>
      
      {abilities.length > 0 ? (
        <div className="space-y-3">
          {abilities.map((ability, index) => (
            <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition">
              <FaCheckCircle className="text-green-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{ability}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Level up to unlock special abilities!</p>
      )}
    </div>
  );
};

export default AbilitiesList;