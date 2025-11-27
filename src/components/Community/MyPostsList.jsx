import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBullhorn, FaMapMarkerAlt, FaCommentDots } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import apiClient from '../../utils/apiClient';

const MyPostsList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const { data } = await apiClient.get('/living-community/my-posts');
        setPosts(data);
      } catch (error) {
        console.error("Error fetching my posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, []);

  if (loading) return <div className="text-center py-4 text-gray-400">Loading your updates...</div>;

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
        <p className="text-gray-500 dark:text-gray-400 text-sm">You haven't posted any community updates yet.</p>
        <p className="text-xs text-gray-400 mt-1">Share what's happening in your area to earn XP!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Link 
          key={post._id} 
          to={`/living-feed/${post._id}`}
          className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium line-clamp-2 mb-3">
            {post.content}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-500" /> 
              {post.neighborhood} (as {post.authorAlias})
            </div>
            <div className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
              <FaCommentDots /> {post.replies?.length || 0} Replies
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MyPostsList;