// src/components/property/PropertyReviewsSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns'; // ✅ IMPORT DATE FORMATTER
import CommunityInsightsCTA from './CommunityInsightsCTA';

const PropertyReviewsSection = ({ 
  property, 
  user, 
  comments, 
  avgRating, 
  reviewText, setReviewText,
  rating, setRating,
  hoverRating, setHoverRating,
  handleReviewSubmit,
  submitting,
  variants 
}) => {
  return (
    <motion.div 
      className="mb-8"
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <CommunityInsightsCTA location={property.location} />

      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Reviews ({comments.length}) ⭐ {avgRating}
      </h2>

      {user ? (
        <form onSubmit={handleReviewSubmit} className="mb-6">
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                size={24}
                className={`cursor-pointer transition-colors ${
                  i < (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"
                }`}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i + 1)}
              />
            ))}
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows="3"
            placeholder="Write your review..."
            className="w-full px-4 py-3 border rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          ></textarea>
          <button
            type="submit"
            disabled={submitting}
            className={`bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-[0.98] ${
              submitting ? "opacity-50 cursor-not-allowed dark:bg-blue-800" : "dark:hover:bg-blue-500"
            }`}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You must be <Link to="/login" className="text-blue-600 dark:text-blue-400 underline">logged in</Link> to write a review.
        </p>
      )}

      {comments.length > 0 ? (
        <ul className="space-y-4">
          {comments.map((review) => (
            <li key={review._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center">
                   <div>
                     <p className="font-bold mr-2 dark:text-gray-100">
                       {review.user ? review.user.name : "Deleted User"}
                     </p>
                     <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} size={14} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                        ))}
                     </div>
                   </div>
                 </div>
                 {/* ✅ DISPLAY REVIEW DATE */}
                 <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                   {review.createdAt && !isNaN(new Date(review.createdAt)) 
                     ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) 
                     : "Just now"}
                 </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mt-1">{review.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
      )}
    </motion.div>
  );
};

export default PropertyReviewsSection;