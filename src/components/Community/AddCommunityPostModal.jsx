import React, { useState } from 'react';
import { FaBullhorn, FaTag, FaTimes } from 'react-icons/fa';
import apiClient from '../../utils/apiClient';

const AddCommunityPostModal = ({ isOpen, onClose, residence }) => {
  if (!isOpen || !residence) return null;

  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await apiClient.post('/living-community/posts', {
        residenceId: residence._id,
        content,
        category
      });
      alert('Update posted successfully! +2 XP');
      setContent('');
      onClose();
    } catch (error) {
      console.error("Failed to post update:", error);
      alert('Failed to post update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70]">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">
            <FaBullhorn /> Post Update
          </h3>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded transition">
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-300 font-bold uppercase tracking-wide mb-1">
              Posting as
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {residence.alias || `${residence.location.neighborhood} Resident`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Linked to: {residence.buildingName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Category</label>
              <div className="relative">
                <FaTag className="absolute left-3 top-3 text-gray-400" />
                <select 
                  className="w-full pl-10 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>General</option>
                  <option>Security Alert</option>
                  <option>Water/Power Status</option>
                  <option>Event</option>
                  <option>Question</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Your Update</label>
              <textarea 
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                rows="4"
                placeholder={`What's happening at ${residence.buildingName}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {content.length}/500
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !content.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition shadow-md flex justify-center items-center gap-2"
            >
              {loading ? 'Posting...' : 'Post to Community Feed'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCommunityPostModal;