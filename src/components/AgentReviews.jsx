import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { FaStar, FaUserCircle } from 'react-icons/fa';

// Star Rating Display Component
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className="text-yellow-400" />)}
      {halfStar && <FaStar key="half" className="text-yellow-400" />} {/* Simple version: just use full star for half */}
      {[...Array(emptyStars)].map((_, i) => <FaStar key={`empty-${i}`} className="text-gray-300" />)}
    </div>
  );
};

const AgentReviews = ({ agentId, agentName }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/agent-reviews/${agentId}`);
        setReviews(data);
      } catch (error) {
        console.error('Failed to fetch agent reviews', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [agentId]);

  if (loading) {
    return <div className="text-center dark:text-gray-300">Loading reviews...</div>;
  }

  return (
    <div className="w-full">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Reviews for {agentName}
      </h3>
      {reviews.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">This agent has no reviews yet.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <img
                  src={review.user.profilePicture || '/default-avatar.png'}
                  alt={review.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{review.user.name}</p>
                  <StarRating rating={review.rating} />
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentReviews;