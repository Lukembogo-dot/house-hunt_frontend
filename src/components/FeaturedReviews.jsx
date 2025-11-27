import React, { useEffect, useState } from 'react';
import { FaStar, FaQuoteLeft, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import apiClient from '../api/axios'; // Ensure this points to your axios instance
import { Link } from 'react-router-dom';

const FeaturedReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch latest reviews (no filters = get all sorted by date)
        const { data } = await apiClient.get('/living-community/experience');
        // Take top 3 or 6
        setReviews(data.slice(0, 3)); 
      } catch (error) {
        console.error("Failed to load reviews", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) return null; // Or a simple spinner
  if (reviews.length === 0) return null;

  return (
    <section className="py-16 px-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Verified Resident Reviews
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            See what actual tenants are saying about water, security, and landlords in buildings near you.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review._id} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative border border-gray-100 dark:border-gray-700 flex flex-col">
              
              {/* Quote Icon Decoration */}
              <FaQuoteLeft className="text-blue-100 dark:text-gray-700 text-4xl absolute top-6 right-6" />

              {/* Location Tag */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <FaMapMarkerAlt /> {review.location?.neighborhood || 'Nairobi'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate">
                  {review.buildingName}
                </h3>
              </div>

              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={i} 
                    className={i < review.review.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} 
                    size={14} 
                  />
                ))}
              </div>

              {/* Content */}
              <div className="flex-grow">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-2">
                  "{review.review.title}"
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">
                  {review.review.content}
                </p>
              </div>

              {/* Footer: Author Info */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <FaShieldAlt size={12} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {review.alias}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link 
            to="/profile" 
            className="inline-flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Write a Review & Earn Points →
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturedReviews;