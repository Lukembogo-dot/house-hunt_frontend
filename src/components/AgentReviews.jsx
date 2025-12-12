import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { FaStar, FaUserCircle, FaReply, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

// Star Rating Input Component
const StarRatingInput = ({ rating, setRating, hoverRating, setHoverRating }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="text-2xl focus:outline-none transition-transform hover:scale-110"
        >
          <FaStar
            className={
              star <= (hoverRating || rating)
                ? 'text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }
          />
        </button>
      ))}
    </div>
  );
};

// Display Stars
const StarRatingDisplay = ({ rating }) => {
  return (
    <div className="flex text-yellow-400 text-sm">
      {[...Array(5)].map((_, i) => (
        <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
      ))}
    </div>
  );
};

const AgentReviews = ({ agentId, agentName }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New Review State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  // Reply State
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // Review ID being replied to

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/users/${agentId}/reviews`);
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) fetchReviews();
  }, [agentId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to leave a review.');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await apiClient.post(`/users/${agentId}/reviews`, {
        rating,
        comment
      });
      toast.success('Review posted successfully!');
      setReviews([data.review, ...reviews]); // Prepend new review (or re-fetch)
      // Reset form
      setRating(0);
      setComment('');
      fetchReviews(); // Re-fetch to get populated fields correctly if needed
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      const { data } = await apiClient.post(`/users/${agentId}/reviews/${reviewId}/reply`, {
        reply: replyText
      });
      toast.success('Reply added!');
      setReplyingTo(null);
      setReplyText('');
      // Update local state
      setReviews(reviews.map(r => r._id === reviewId ? { ...r, reply: data.review.reply, replyDate: data.review.replyDate } : r));
    } catch (error) {
      toast.error('Failed to reply');
    }
  };

  const isAgent = user && user._id === agentId;
  const hasReviewed = user && reviews.some(r => r.user._id === user._id);

  if (loading) {
    return <div className="p-4 text-center text-gray-500 animate-pulse">Loading reviews...</div>;
  }

  return (
    <div className="w-full">
      {/* Review Submission Form */}
      {user && !isAgent && !hasReviewed && (
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3">Rate your experience with {agentName}</h4>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-3">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rating</label>
              <StarRatingInput rating={rating} setRating={setRating} hoverRating={hoverRating} setHoverRating={setHoverRating} />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                rows="3"
                placeholder="Share your honest feedback..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Posting...' : 'Post Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-white dark:bg-gray-800/50 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {review.user?.profilePicture ? (
                      <img src={review.user.profilePicture} alt={review.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <FaUserCircle className="w-full h-full text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-gray-900 dark:text-white">{review.user?.name || 'Anonymous User'}</h5>
                    <StarRatingDisplay rating={review.rating} />
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <FaClock /> {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </div>
              </div>

              {/* Comment */}
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
                {review.comment}
              </p>

              {/* Agent Reply Section */}
              {review.reply ? (
                <div className="mt-3 ml-4 pl-4 border-l-2 border-blue-500 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-r-lg">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                    <FaReply /> Response from {agentName}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-xs italic">
                    "{review.reply}"
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 text-right">
                    {formatDistanceToNow(new Date(review.replyDate), { addSuffix: true })}
                  </p>
                </div>
              ) : isAgent && (
                <div className="mt-2">
                  {replyingTo === review._id ? (
                    <div className="mt-2 animate-fadeIn">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full p-2 text-xs rounded border border-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none mb-2"
                        placeholder="Write your reply..."
                        rows="2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReply(review._id)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Send Reply
                        </button>
                        <button
                          onClick={() => { setReplyingTo(null); setReplyText(''); }}
                          className="px-3 py-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(review._id)}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <FaReply /> Reply directly
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentReviews;