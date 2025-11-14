// src/pages/ServicePostDetails.jsx
// (UPDATED)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useFeatureFlag } from '../context/FeatureFlagContext.jsx';
import { FaStar, FaUserAlt } from 'react-icons/fa'; // Added FaUserAlt
import { formatDistanceToNow } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion'; 

// Re-usable Star Rating Component (safe version)
const StarRating = ({ rating }) => {
  const safeRating = Number(rating) || 0;
  const fullStars = Math.floor(safeRating);
  const emptyStars = 5 - fullStars;

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className="text-yellow-400" />)}
      {[...Array(emptyStars)].map((_, i) => <FaStar key={`empty-${i}`} className="text-gray-300" />)}
    </div>
  );
};

// 1. --- NEW: SEO INJECTOR COMPONENT ---
// This component generates the required schema.org JSON-LD for your page.
const ServiceSeoInjector = ({ service }) => {
  
  // ▼▼▼ THIS IS THE FIX ▼▼▼
  // 1. Start with the main BlogPosting schema
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": service.metaTitle || service.title,
    "description": service.metaDescription || service.content.substring(0, 160),
    "image": service.imageUrl || "https://www.househuntkenya.co.ke/default-image.png", // Fallback image
    "datePublished": service.createdAt,
    "dateModified": service.updatedAt,
    "author": {
      "@type": "Person",
      "name": service.author?.name || "HouseHunt Admin"
    },
    "publisher": {
      "@type": "Organization",
      "name": "House Hunt Kenya",
      "logo": {
        "@type":"ImageObject",
        "url": "https://www.househuntkenya.co.ke/icons/icon-512x512.png" // Path to your logo
      }
    },
    // 2. Prepare mainEntity (it might be FAQPage or just text)
    "mainEntity": undefined, 
  };

  // 3. If FAQs exist, nest them correctly as the mainEntity
  if (service.faqs && service.faqs.length > 0) {
    blogPostingSchema.mainEntity = {
      "@type": "FAQPage",
      "mainEntity": service.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  } else {
    // 4. If no FAQs, just use the article body as the mainEntity (less common, but valid)
    // Or, you can just remove the mainEntity property. We'll remove it.
    delete blogPostingSchema.mainEntity;
  }
  // ▲▲▲ END OF FIX ▲▲▲

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{service.metaTitle || service.title}</title>
      <meta name="description" content={service.metaDescription || service.content.substring(0, 160)} />
      
      {/* Open Graph Tags (for social media) */}
      <meta property="og:title" content={service.metaTitle || service.title} />
      <meta property="og:description" content={service.metaDescription || service.content.substring(0, 160)} />
      <meta property="og:image" content={service.imageUrl} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={window.location.href} />
      
      {/* 5. Render the single, combined schema */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
    </Helmet>
  );
};
// ------------------------------------

// ✅ 2. ADD ANIMATION VARIANTS
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};


const ServicePostDetails = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  
  const isNewDesignEnabled = useFeatureFlag('new-service-post-design');

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchService = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await apiClient.get(`/services/slug/${slug}`);
      setService(data);
    } catch (err) {
      console.error("Error fetching service post:", err);
      setError('Service post not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [slug]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || !comment) {
      setReviewError('Please select a rating and write a comment.');
      return;
    }
    setSubmitting(true);
    setReviewError('');
    try {
      await apiClient.post(`/services/${service._id}/reviews`, {
        rating,
        comment,
      });
      // Reset form and re-fetch data to show new review
      setRating(0);
      setHoverRating(0);
      setComment('');
      fetchService(); 
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-500 dark:text-red-400">
        <p className="text-lg">{error}</p>
        <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!service) return null;
  
  const avgRating = service.averageRating ? service.averageRating.toFixed(1) : 0;

  // ================================================================
  // --- ✅ THIS IS THE FIX ---
  // Added Tailwind 'prose-img:*' classes to auto-style all images in the post.
  // ================================================================
  const articleClass = "prose prose-xl dark:prose-invert max-w-3xl mx-auto bg-white dark:bg-gray-900 p-8 shadow-xl rounded-lg prose-img:w-full prose-img:rounded-lg prose-img:shadow-md prose-img:my-6";


  return (
    <>
      <ServiceSeoInjector service={service} />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-6">
        <div className="mx-auto"> 
          
          {/* ✅ 4. ALIGN & ANIMATE HEADER */}
          <motion.header 
            className="mb-8 max-w-3xl mx-auto" // Aligned to max-w-3xl
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-white px-3 py-1 rounded-full">
                {service.serviceType}
              </span>
              <span className="text-sm font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full">
                {service.location}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
              {service.title}
            </h1>
            
            {/* ✅ 3. RESTORED AUTHOR BLOCK */}
            <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                {service.author ? (
                  <img 
                    src={service.author.profilePicture || `https://ui-avatars.com/api/?name=${service.author.name}&background=random`}
                    alt={service.author.name}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                ) : (
                  <FaUserAlt className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 p-2 mr-3" />
                )}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  By {service.author?.name || 'HouseHunt Staff'}
                </span>
              </div>
              <span className="hidden md:inline">|</span>
              <span>
                Posted {formatDistanceToNow(new Date(service.createdAt), { addSuffix: true })}
              </span>
            </div>
          </motion.header>

          {/* ✅ 4. ALIGN & ANIMATE IMAGE */}
          {service.imageUrl && (
            <motion.img 
              src={service.imageUrl}
              alt={service.title}
              className="w-full max-w-3xl mx-auto h-64 md:h-96 object-cover rounded-lg shadow-md mb-8 border dark:border-gray-700"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          )}

          {/* ✅ 5. ANIMATE ARTICLE - NOW HAS BETTER BACKGROUND & PADDING */}
          <motion.article 
            className={articleClass} // Uses the new, larger, defined class
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div dangerouslySetInnerHTML={{ __html: service.content }} />
          </motion.article>

          {/* ✅ 4. ALIGN & ANIMATE REVIEWS/FAQS */}
          <motion.div 
            className="max-w-3xl mx-auto" // Aligned to max-w-3xl
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* --- RENDER THE FAQ SECTION --- */}
            {service.faqs && service.faqs.length > 0 && (
              <section className="mt-12 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md border dark:border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  {service.faqs.map((faq, index) => (
                    <div key={index} className="border-b dark:border-gray-700 pb-4 last:border-b-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {/* --------------------------------- */}


            {/* Reviews/Comments Section */}
            <section className="mt-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Neighbourhood Feedback ({service.numReviews}) 
                <span className="ml-2 text-yellow-400">★ {avgRating}</span>
              </h2>

              {/* Review Submission Form */}
              {user ? (
                <form onSubmit={handleReviewSubmit} className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                  <h3 className="text-lg font-medium dark:text-gray-100 mb-2">Leave your feedback</h3>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <motion.div key={i} whileTap={{ scale: 1.2, y: -2 }}>
                        <FaStar
                          size={24}
                          className={`cursor-pointer transition-colors ${
                            i < (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"
                          }`}
                          onMouseEnter={() => setHoverRating(i + 1)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(i + 1)}
                        />
                      </motion.div>
                    ))}
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="3"
                    placeholder="Share your experience with this service..."
                    className="w-full px-4 py-3 border rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  ></textarea>
                  {reviewError && <p className="text-sm text-red-500 mb-2">{reviewError}</p>}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                    whileHover={{ y: -3 }} // Bouncy interaction
                  >
                    {submitting ? "Submitting..." : "Submit Feedback"}
                  </motion.button>
                </form>
              ) : (
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You must be <Link to="/login" className="text-blue-600 dark:text-blue-400 underline">logged in</Link> to leave feedback.
                </p>
              )}

              {/* Existing Reviews List */}
              {service.reviews.length > 0 ? (
                <ul className="space-y-4">
                  {service.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((review) => (
                    <li key={review._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center mb-2">
                        {review.user ? (
                           <img 
                            src={review.user.profilePicture || `https://ui-avatars.com/api/?name=${review.name}&background=random`}
                            alt={review.name} 
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <FaUserAlt className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 p-2 mr-3" />
                        )}
                        <div>
                          <p className="font-bold dark:text-gray-100">{review.user?.name || review.name}</p>
                          <div className="flex">
                            <StarRating rating={review.rating} />
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No feedback yet. Be the first to share your experience!</p>
              )}
            </section>

          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ServicePostDetails;