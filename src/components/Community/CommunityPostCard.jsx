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

  return (
    <Link 
      to={`/living-feed/${post._id}`} // ✅ FIX: Point to the Detail Page ID
      className="block bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all mb-4 cursor-pointer group"
    >
      
      {/* Header: Author Identity (Anonymous) */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            {/* If they are a "Resident", show shield. If "Local", show user icon */}
            {post.authorAlias.includes('Resident') ? <FaShieldAlt size={14} /> : <FaUserSecret size={16} />}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1 group-hover:text-blue-600 transition-colors">
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
        
        {/* Category Badge */}
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getCategoryColor(post.category)}`}>
          {post.category}
        </span>
      </div>

      {/* Content */}
      <div className="pl-13"> 
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Footer: Location Tag */}
      <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
          <FaMapMarkerAlt className="text-blue-500" />
          {post.neighborhood} Area
        </div>
        
        {/* View More Indicator */}
        <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
           Reply / View Thread →
        </div>
      </div>
    </Link>
  );
};

export default CommunityPostCard;