// src/components/Community/CommunityPostCard.jsx
import React from 'react';
import { Link } from 'react-router-dom'; 
import { formatDistanceToNow } from 'date-fns';
import { FaMapMarkerAlt, FaUserSecret, FaShieldAlt } from 'react-icons/fa';

const CommunityPostCard = ({ post }) => {
  // Color coding for categories
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Security Alert': return 'bg-red-100 text-red-600 border-red-200';
      case 'Water/Power Status': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Event': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'Question': return 'bg-orange-100 text-orange-600 border-orange-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Helper to stop card click when clicking the pSEO link
  const handleLocationClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="block bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all mb-4 relative group">
      
      {/* Main Card Link (Background Overlay) */}
      <Link to={`/living-feed/${post._id}`} className="absolute inset-0 z-0" />

      {/* Header: Author Identity */}
      <div className="flex items-center justify-between mb-3 relative z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            {post.authorAlias.includes('Resident') ? <FaShieldAlt size={14} /> : <FaUserSecret size={16} />}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1">
              {post.authorAlias}
              {post.authorAlias.includes('Resident') && (
                <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full border border-green-200">
                  Verified
                </span>
              )}
            </h4>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getCategoryColor(post.category)}`}>
          {post.category}
        </span>
      </div>

      {/* Content */}
      <div className="pl-13 relative z-10 pointer-events-none"> 
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* Footer: Location Tag & Thread Link */}
      <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between relative z-20">
        
        {/* Left: pSEO Location Link */}
        <Link 
          to={`/search/rent/${post.neighborhood.toLowerCase()}`}
          onClick={handleLocationClick}
          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md"
          title={`View properties for rent in ${post.neighborhood}`}
        >
          <FaMapMarkerAlt />
          {post.neighborhood} (View Rentals)
        </Link>
        
        {/* Right: Thread Link (Now clickable) */}
        <Link 
          to={`/living-feed/${post._id}`}
          className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold hover:underline flex items-center"
        >
           Reply / View Thread →
        </Link>
      </div>
    </div>
  );
};

export default CommunityPostCard;