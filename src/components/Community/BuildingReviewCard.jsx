import React, { useState } from 'react';
import { FaStar, FaWater, FaShieldAlt, FaQuoteLeft, FaCheckCircle } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const BuildingReviewCard = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={`text-xs ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`} />
    ));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 hover:shadow-md transition-all">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg shadow-sm">
            {(review.alias || 'R').charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              {review.alias || 'Verified Resident'}
              {review.isVerified && <FaCheckCircle className="text-green-500 text-xs" title="Verified Tenant" />}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="bg-gray-100 dark:bg-gray-700 px-1.5 rounded text-[10px] font-bold uppercase">
                 {review.rentalDetails?.unitType || 'Unit'}
              </span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
           <div className="flex gap-0.5 mb-1">{renderStars(review.review?.rating || 0)}</div>
        </div>
      </div>

      {/* Stats Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
         {review.utilities?.waterConsistency && (
            <span className={`text-[10px] px-2 py-1 rounded border flex items-center gap-1 font-bold uppercase tracking-wide ${
                review.utilities.waterConsistency.includes('24/7') 
                ? 'text-blue-600 bg-blue-50 border-blue-100' 
                : 'text-orange-600 bg-orange-50 border-orange-100'
            }`}>
               <FaWater /> {review.utilities.waterConsistency}
            </span>
         )}
         {review.security?.safeAtNight && (
            <span className="text-[10px] px-2 py-1 rounded border bg-green-50 text-green-700 border-green-100 flex items-center gap-1 font-bold uppercase tracking-wide">
               <FaShieldAlt /> {review.security.safeAtNight}
            </span>
         )}
      </div>

      {/* Content */}
      <div className="relative bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
         <FaQuoteLeft className="text-gray-300 dark:text-gray-600 mb-1 text-xs" />
         <h5 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1">
            {review.review?.title}
         </h5>
         <p className={`text-gray-600 dark:text-gray-300 text-sm leading-relaxed ${!isExpanded && review.review?.content?.length > 150 ? 'line-clamp-2' : ''}`}>
           {review.review?.content || "No detailed feedback provided."}
         </p>
         
         {review.review?.content?.length > 150 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 dark:text-blue-400 text-xs font-bold mt-2 hover:underline"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
         )}
      </div>
    </div>
  );
};

export default BuildingReviewCard;