// src/pages/ServicePostDetails.jsx
// (UPDATED: Merged Blog Logic with Provider Contact Features)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useFeatureFlag } from '../context/FeatureFlagContext.jsx';
import { FaStar, FaUserAlt, FaLightbulb, FaPhone, FaWhatsapp, FaMapMarkerAlt, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

// Re-usable Star Rating Component
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

// ✅ 1. REBUILT SEO INJECTOR (FIXES FAQ + CANONICAL URL ISSUES)
const ServiceSeoInjector = ({ service }) => {
  // ✅ Generate canonical URL
  const canonicalUrl = `https://www.househuntkenya.co.ke/services/${service.slug}`;

  // ✅ BlogPosting schema for article rich results (FAQs removed)
  const blogSchema = {
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#article`,
    "headline": service.metaTitle || service.title,
    "description": service.metaDescription || service.content?.substring(0, 160),
    "image": service.imageUrl || "https://www.househuntkenya.co.ke/default-image.png",
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
        "@type": "ImageObject",
        "url": "https://www.househuntkenya.co.ke/icons/icon-512x512.png"
      }
    }
  };

  const localBusinessSchema = {
    "@type": "LocalBusiness",
    "@id": `${canonicalUrl}#business`,
    "name": service.title,
    "image": service.imageUrl,
    "telephone": service.phoneNumber,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": service.location || "Nairobi",
      "addressCountry": "KE"
    },
    "priceRange": "$$", // Generic, required for LocalBusiness
    ...(service.numReviews > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": service.averageRating,
        "reviewCount": service.numReviews
      }
    })
  };

  // ✅ NEW: Separate FAQPage schema for Google FAQ enhancements
  const faqSchema = service.faqs && service.faqs.length > 0 ? {
    "@type": "FAQPage",
    "@id": `${canonicalUrl}#faq`,
    "mainEntity": service.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  // ✅ Include all schemas: BlogPosting + LocalBusiness + FAQPage
  const schemaGraph = [
    blogSchema,
    localBusinessSchema,
    ...(faqSchema ? [faqSchema] : [])  // Add FAQPage if FAQs exist
  ];

  return (
    <Helmet>
      <title>{service.metaTitle || service.title}</title>
      <meta name="description" content={service.metaDescription || service.content?.substring(0, 160)} />

      {/* ✅ ADDED: Canonical URL for proper indexing */}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={service.metaTitle || service.title} />
      <meta property="og:description" content={service.metaDescription || service.content?.substring(0, 160)} />
      <meta property="og:image" content={service.imageUrl} />
      <meta property="og:type" content="business.business" />
      <meta property="og:url" content={canonicalUrl} />

      {/* We inject the graph with a SINGLE top-level @context */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": schemaGraph }) }}
      />
    </Helmet>
  );
};

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
        <Helmet>
          <title>Service Guide | House Hunt Kenya</title>
          <meta name="description" content="Expert guides and tips for property-related services in Kenya. Find trusted service providers and helpful advice." />
          <meta name="robots" content="index, follow" />
        </Helmet>

        <div className="sr-only" aria-hidden="true">
          <h2>Service Guides</h2>
          <p>Comprehensive guides for property-related services in Kenya. Learn how to find and work with service providers for your property needs.</p>
          <ul>
            <li>Finding reliable service providers</li>
            <li>Service pricing guides</li>
            <li>Quality assurance tips</li>
            <li>Property maintenance advice</li>
          </ul>
        </div>

        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) return <div className="text-center mt-20 text-red-500 dark:text-red-400"><p className="text-lg">{error}</p><Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Back to Home</Link></div>;
  if (!service) return null;

  const avgRating = service.averageRating ? service.averageRating.toFixed(1) : 0;

  const articleClass = `
    prose prose-xl max-w-none bg-white dark:bg-gray-900 p-8 shadow-sm rounded-2xl border border-gray-100 dark:border-gray-700
    dark:prose-invert 
    prose-img:w-full prose-img:rounded-lg prose-img:shadow-md prose-img:my-6
    prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
    prose-headings:text-gray-900 dark:prose-headings:text-gray-100
    prose-strong:text-gray-900 dark:prose-strong:text-gray-100
    text-gray-800 dark:text-gray-200
  `;

  return (
    <>
      <ServiceSeoInjector service={service} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8 font-inter">
        <div className="max-w-6xl mx-auto">

          {/* --- HEADER SECTION --- */}
          <motion.header
            className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Image Banner */}
            {service.imageUrl && (
              <div className="h-64 md:h-80 w-full relative group">
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent flex items-end p-6 md:p-10">
                  <div className="w-full">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                        {service.serviceType}
                      </span>
                      {service.isVerified && (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm flex items-center gap-1">
                          <FaCheckCircle /> Verified
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-md">{service.title}</h1>
                    <div className="flex flex-wrap items-center text-gray-200 text-sm md:text-base gap-4">
                      <span className="flex items-center"><FaMapMarkerAlt className="mr-2 text-red-400" /> {service.location}</span>
                      <span className="hidden md:inline">|</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-bold">★ {avgRating}</span>
                        <span className="font-semibold">({service.numReviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Action Bar */}
            <div className="flex md:hidden justify-between items-center p-4 border-t dark:border-gray-700 gap-2">
              {service.phoneNumber && (
                <a href={`tel:${service.phoneNumber}`} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                  <FaPhone /> Call
                </a>
              )}
              {service.whatsappNumber && (
                <a href={`https://wa.me/${service.whatsappNumber}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition">
                  <FaWhatsapp /> WhatsApp
                </a>
              )}
            </div>
          </motion.header>

          <div className="grid md:grid-cols-3 gap-8">

            {/* --- LEFT COLUMN: ARTICLE & REVIEWS --- */}
            <div className="md:col-span-2 space-y-8">

              <motion.article
                className={articleClass}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div dangerouslySetInnerHTML={{ __html: service.content }} />
              </motion.article>

              <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {service.faqs && service.faqs.length > 0 && (
                  <section className="mt-8 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
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

                {/* Community Insights CTA */}
                {service.location && (
                  <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl text-center shadow-sm">
                    <div className="flex justify-center mb-3">
                      <FaLightbulb className="text-3xl text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-2">
                      Curious about life in {service.location}?
                    </h3>
                    <p className="text-purple-700 dark:text-purple-300 mb-6 max-w-lg mx-auto">
                      Discover real stories from residents in {service.location}, or share your own experience.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Link
                        to={`/search/rent/${service.location.toLowerCase()}`}
                        className="px-6 py-3 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-300 font-bold border border-purple-200 dark:border-gray-600 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 transition shadow-sm"
                      >
                        View Insights
                      </Link>
                      <Link
                        to="/share-insight"
                        state={{ location: service.location }}
                        className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition shadow-md"
                      >
                        Write a Review
                      </Link>
                    </div>
                  </div>
                )}

                <section className="mt-12">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    Reviews ({service.numReviews})
                  </h2>

                  {user ? (
                    <form onSubmit={handleReviewSubmit} className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="text-lg font-medium dark:text-gray-100 mb-2">Leave your feedback</h3>
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <motion.div key={i} whileTap={{ scale: 1.2, y: -2 }}>
                            <FaStar
                              size={24}
                              className={`cursor-pointer transition-colors ${i < (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"
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
                        placeholder="Share your experience..."
                        className="w-full px-4 py-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      ></textarea>
                      {reviewError && <p className="text-sm text-red-500 mb-2">{reviewError}</p>}
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-bold"
                      >
                        {submitting ? "Submitting..." : "Submit Feedback"}
                      </button>
                    </form>
                  ) : (
                    <div className="mb-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
                      <p className="text-gray-600 dark:text-gray-300 mb-2">Have you used this service?</p>
                      <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in to share your experience</Link>
                    </div>
                  )}

                  {service.reviews.length > 0 ? (
                    <ul className="space-y-4">
                      {service.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((review) => (
                        <li key={review._id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                          <div className="flex items-center mb-3">
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
                              <StarRating rating={review.rating} />
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p>
                          <p className="text-xs text-gray-400 mt-3">
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

            {/* --- RIGHT COLUMN: STICKY SIDEBAR --- */}
            <div className="md:col-span-1 hidden md:block">
              <div className="sticky top-24 space-y-6">

                {/* Contact Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={service.author?.profilePicture || "https://placehold.co/100x100?text=User"}
                      alt="Provider"
                      className="w-14 h-14 rounded-full border-2 border-white/30"
                    />
                    <div>
                      <p className="text-blue-200 text-xs font-bold uppercase">Service Provider</p>
                      <h3 className="font-bold text-lg">{service.author?.name || "Verified Agent"}</h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {service.phoneNumber && (
                      <a href={`tel:${service.phoneNumber}`} className="flex items-center justify-center gap-3 w-full bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-sm">
                        <FaPhone /> Call Now
                      </a>
                    )}
                    {service.whatsappNumber && (
                      <a href={`https://wa.me/${service.whatsappNumber}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-400 transition shadow-lg border border-green-400">
                        <FaWhatsapp className="text-xl" /> WhatsApp
                      </a>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-blue-500/50 flex items-center justify-center gap-2 text-xs text-blue-200">
                    <FaCheckCircle /> Verified by HouseHunt Kenya
                  </div>
                </div>

                {/* Safety Tip */}
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 p-5 rounded-2xl">
                  <h4 className="text-orange-800 dark:text-orange-200 font-bold text-sm mb-2 flex items-center">
                    <FaShieldAlt className="mr-2" /> Safety Tip
                  </h4>
                  <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                    Always verify credentials before making payments. Meet inside secure premises or use official paybill numbers.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ServicePostDetails;