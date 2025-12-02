import React, { useState } from 'react';
import { FaFistRaised, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import apiClient from '../../utils/apiClient';
import { toast } from 'react-hot-toast';

const BattleManager = () => {
  const [formData, setFormData] = useState({
    neighborhood1: '',
    neighborhood2: '',
    title: '',
    durationDays: 7
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.neighborhood1 || !formData.neighborhood2) {
      toast.error("Please enter two neighborhoods");
      return;
    }

    setLoading(true);
    try {
      // Calculate End Date
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(formData.durationDays));

      const payload = {
        neighborhood1: formData.neighborhood1,
        neighborhood2: formData.neighborhood2,
        title: formData.title || `${formData.neighborhood1} vs ${formData.neighborhood2}`,
        endDate: endDate
      };

      await apiClient.post('/battles/create', payload);
      toast.success('⚔️ Battle Created Successfully!');
      setFormData({ neighborhood1: '', neighborhood2: '', title: '', durationDays: 7 }); // Reset
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create battle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
          <FaFistRaised size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Battle Command Center</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Launch a new "Mtaa of the Week" face-off.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contender 1 */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Red Corner (Contender 1)</label>
            <input 
              type="text" 
              placeholder="e.g. Kileleshwa"
              value={formData.neighborhood1}
              onChange={(e) => setFormData({...formData, neighborhood1: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none transition"
            />
          </div>

          {/* Contender 2 */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Blue Corner (Contender 2)</label>
            <input 
              type="text" 
              placeholder="e.g. Kilimani"
              value={formData.neighborhood2}
              onChange={(e) => setFormData({...formData, neighborhood2: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Title (Optional) */}
        <div>
           <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Battle Title (Optional)</label>
           <input 
              type="text" 
              placeholder="e.g. The Battle of the Suburbs"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
            />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transform active:scale-95 transition flex justify-center items-center gap-2"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaFistRaised />}
          Launch Battle
        </button>
      </form>
    </div>
  );
};

export default BattleManager;