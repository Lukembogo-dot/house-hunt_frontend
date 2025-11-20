// src/components/admin/CommunityModeration.jsx
import React, { useEffect, useState } from 'react';
import apiClient from '../../api/axios';
import { FaCheck, FaTimes, FaTrash, FaEye, FaFilter } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const CommunityModeration = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/community/admin/all');
      setInsights(data);
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`Mark this post as ${newStatus}?`)) return;
    try {
      await apiClient.put(`/community/admin/${id}/status`, { status: newStatus });
      // Optimistic update
      setInsights(prev => prev.map(item => 
        item._id === id ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to DELETE this story permanently?")) return;
    try {
      await apiClient.delete(`/community/admin/${id}`);
      setInsights(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      alert("Failed to delete post");
    }
  };

  // Filter Logic
  const filteredInsights = insights.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  if (loading) return <div className="p-8 text-center text-gray-500">Loading community data...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Community Moderation ({filteredInsights.length})
        </h2>
        
        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                filter === f 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Author / Location</th>
              <th className="px-6 py-3">Title / Preview</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInsights.map((post) => (
              <tr key={post._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(post.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900 dark:text-white">{post.location}</div>
                  <div className="text-xs">{post.authorName || 'Anonymous'}</div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <Link to={`/community/${post.slug}`} target="_blank" className="font-semibold text-blue-600 hover:underline block truncate">
                    {post.title}
                  </Link>
                  <div className="text-xs text-gray-500 truncate">{post.metaDescription}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                    post.status === 'approved' ? 'bg-green-100 text-green-800' :
                    post.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  {post.status !== 'approved' && (
                    <button 
                      onClick={() => handleStatusChange(post._id, 'approved')}
                      className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200" 
                      title="Approve"
                    >
                      <FaCheck />
                    </button>
                  )}
                  {post.status !== 'rejected' && (
                    <button 
                      onClick={() => handleStatusChange(post._id, 'rejected')}
                      className="p-2 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200" 
                      title="Reject (Hide)"
                    >
                      <FaTimes />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(post._id)}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200" 
                    title="Delete Permanently"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {filteredInsights.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No stories found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommunityModeration;