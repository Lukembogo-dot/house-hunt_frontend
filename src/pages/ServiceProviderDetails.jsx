// src/pages/ServiceProviderDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'; // ✅ Added useLocation
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  FaMapMarkerAlt, FaPhone, FaWhatsapp, FaStar,
  FaUserCheck, FaArrowLeft, FaUserCircle,
  FaBoxOpen, FaGlobe, // ✅ Added FaGlobe
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

import { Helmet } from 'react-helmet-async';
import useSeoData from '../hooks/useSeoData';
import SeoInjector from '../components/SeoInjector';
import Breadcrumbs from '../components/Breadcrumbs';
import useAnalytics from '../hooks/useAnalytics';

const ServiceProviderDetails = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Capture location for redirect

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Slideshow State
  const [packagePage, setPackagePage] = useState(0);
  const PACKAGES_PER_PAGE = 4;

  const pagePath = `/services/${slug}`;
  const { seo } = useSeoData(pagePath);

  const fetchProvider = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/service-providers/${slug}`);
      setProvider(data);
    } catch (err) {
      console.error(err);
      setError('Service Provider not found or has been removed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvider();
  }, [slug]);

  // ✅ Handle Gated Actions (Call, WhatsApp, Website)
  // ✅ Handle Gated Actions (Call, WhatsApp, Website)
  const { trackEvent } = useAnalytics();

  const handleRestrictedAction = (url, target = '_blank', trackType, trackMetadata = {}) => {
    if (!user) {
      // Redirect to login, pass current path to return after
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (trackType) {
      trackEvent(trackType, 'service_provider_details', provider._id, trackMetadata);
    }

    // If it's a phone call, use window.location
    if (target === 'self') {
      window.location.href = url;
    } else {
      // Otherwise open in new tab (WhatsApp/Website)
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const nextPackagePage = () => {
    if (!provider?.packages) return;
    const totalPages = Math.ceil(provider.packages.length / PACKAGES_PER_PAGE);
    setPackagePage((prev) => (prev + 1) % totalPages);
  };

  const prevPackagePage = () => {
    if (!provider?.packages) return;
    const totalPages = Math.ceil(provider.packages.length / PACKAGES_PER_PAGE);
    setPackagePage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to leave a review.");
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setReviewSubmitting(true);
    try {
      await apiClient.post(`/service-providers/${provider._id}/reviews`,
        { rating, comment },
        { withCredentials: true }
      );
      alert('Review submitted successfully!');
      setComment('');
      setRating(5);
      fetchProvider();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const generateSchema = () => {
    if (!provider) return null;

    const imgUrl = provider.image?.url || provider.imageUrl;

    const schema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": provider.title,
      "image": imgUrl,
      "description": provider.description,
      "telephone": provider.phoneNumber,
      "sameAs": provider.website ? [provider.website] : [], // ✅ Add Website to Schema
      "address": {
        "@type": "PostalAddress",
        "addressLocality": provider.location,
        "addressCountry": "KE"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": provider.averageRating || 5,
        "reviewCount": provider.numReviews || 1
      }
    };

    if (provider.packages && provider.packages.length > 0) {
      schema.hasOfferCatalog = {
        "@type": "OfferCatalog",
        "name": "Service Packages",
        "itemListElement": provider.packages.map((pkg) => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": pkg.name,
            "description": pkg.description
          },
          "price": pkg.price.replace(/[^0-9]/g, ''),
          "priceCurrency": "KES",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": pkg.price.replace(/[^0-9]/g, ''),
            "priceCurrency": "KES",
            "name": pkg.price
          }
        }))
      };
    }

    return JSON.stringify(schema);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !provider) return (
    <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-2">404 Not Found</h2>
      <p className="text-gray-500 mb-6">{error}</p>
      <Link to="/services" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Back to Directory
      </Link>
    </div>
  );

  const finalSeo = {
    ...seo,
    metaTitle: seo.metaTitle && seo.metaTitle !== 'HouseHunt Kenya' ? seo.metaTitle : `${provider.title} | HouseHunt Services`,
    metaDescription: seo.metaDescription && seo.metaDescription !== 'Find your next home in Kenya.' ? seo.metaDescription : provider.description,
    pagePath: pagePath,
    schemaDescription: provider.description
  };

  const visiblePackages = provider.packages
    ? provider.packages.slice(packagePage * PACKAGES_PER_PAGE, (packagePage + 1) * PACKAGES_PER_PAGE)
    : [];

  const showControls = provider.packages && provider.packages.length > PACKAGES_PER_PAGE;

  const displayImage = provider.image?.url || provider.imageUrl || "https://placehold.co/1200x600/1e293b/ffffff?text=Service+Provider";
  const displayAlt = provider.image?.altText || provider.title;

  // Construct Prefilled Message
  const whatsappMessage = encodeURIComponent(
    `Hello ${provider.title}, I found your services on HouseHunt Kenya (https://househuntkenya.co.ke/services/${slug}). I am interested in your services.`
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter pb-20">
      <SeoInjector seo={finalSeo} />

      <Helmet>
        <script type="application/ld+json">
          {generateSchema()}
        </script>
      </Helmet>

      {/* --- Hero Header --- */}
      <div className="relative h-64 md:h-80 bg-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <img
          src={displayImage}
          alt={displayAlt}
          className="w-full h-full object-cover blur-sm scale-110"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">{provider.title}</h1>
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
            {provider.serviceType}
          </span>
        </div>
        <Link to="/services" className="absolute top-6 left-6 z-30 bg-white/20 hover:bg-white/30 backdrop-blur text-white p-3 rounded-full transition">
          <FaArrowLeft />
        </Link>
      </div>

      {/* Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-6 mt-6 relative z-30">
        <Breadcrumbs />
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6 relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* --- Left Sidebar (Contact Card) --- */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center border border-gray-100 dark:border-gray-700">
              <div className="w-32 h-32 mx-auto bg-white rounded-full p-1 shadow-md -mt-20 mb-4 overflow-hidden">
                <img
                  src={displayImage}
                  alt={displayAlt}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{provider.title}</h2>
              <div className="flex justify-center items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                <FaMapMarkerAlt className="mr-1 text-red-500" /> {provider.location}
              </div>

              <div className="flex justify-center gap-1 mb-6 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < Math.round(provider.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'} />
                ))}
                <span className="text-gray-400 ml-2 text-sm">({provider.numReviews} Verified Reviews)</span>
              </div>

              <div className="space-y-3">
                {/* ✅ Call Button (Gated) */}
                {provider.phoneNumber && (
                  <button
                    onClick={() => handleRestrictedAction(`tel:${provider.phoneNumber}`, 'self', 'call_click')}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-500/30"
                  >
                    <FaPhone /> Call Now
                  </button>
                )}

                {/* ✅ WhatsApp Button (Gated & Prefilled) */}
                {provider.whatsappNumber && (
                  <button
                    onClick={() => handleRestrictedAction(`https://wa.me/${provider.whatsappNumber.replace('+', '')}?text=${whatsappMessage}`, '_blank', 'whatsapp_click')}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition shadow-lg shadow-green-500/30"
                  >
                    <FaWhatsapp size={20} /> WhatsApp
                  </button>
                )}

                {/* ✅ Website Button (Gated) */}
                {provider.website && (
                  <button
                    onClick={() => handleRestrictedAction(provider.website, '_blank', 'social_click', { platform: 'website' })}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-bold transition shadow-sm border border-gray-300 dark:border-gray-600"
                  >
                    <FaGlobe size={18} /> Visit Website
                  </button>
                )}
              </div>

              {provider.author && provider.author.isAccountClaimed && (
                <div className="mt-6 pt-4 border-t dark:border-gray-700 flex items-center justify-center gap-2 text-green-600 text-sm font-semibold">
                  <FaUserCheck /> Verified Provider
                </div>
              )}
            </div>
          </div>

          {/* --- Right Content --- */}
          <div className="md:col-span-2 space-y-8 mt-4 md:mt-0">

            {/* About Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About Us</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {provider.description}
              </p>
              {provider.content && (
                <div
                  className="mt-6 prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: provider.content }}
                />
              )}
            </div>

            {/* ✅ UPDATED: Service Areas with pSEO Links */}
            {provider.serviceAreas && provider.serviceAreas.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Areas We Serve</h3>
                <div className="space-y-4">
                  {provider.serviceAreas.map((area, idx) => (
                    <div key={idx} className="border-b dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                      {/* County Name */}
                      {area.county && (
                        <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          {area.county}
                        </h4>
                      )}
                      {/* Locations Pills */}
                      <div className="flex flex-wrap gap-2">
                        {area.subLocations && area.subLocations.map((loc, locIdx) => (
                          // ✅ CHANGED: span -> Link to Search Page
                          <Link
                            key={locIdx}
                            to={`/search/rent/${loc.toLowerCase()}`}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 transition cursor-pointer"
                          >
                            {loc}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PACKAGES / PRODUCTS SLIDESHOW SECTION */}
            {provider.packages && provider.packages.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-gray-700 relative">

                {/* Header & Navigation */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FaBoxOpen className="text-orange-500" /> Packages / Products
                  </h3>

                  {showControls && (
                    <div className="flex gap-2">
                      <button
                        onClick={prevPackagePage}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 transition"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        onClick={nextPackagePage}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 transition"
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  )}
                </div>

                {/* Slideshow Grid (4 Items Max) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {visiblePackages.map((pkg, index) => (
                    <div key={index} className="flex flex-col p-5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 hover:shadow-md transition-shadow h-full">

                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1" title={pkg.name}>
                          {pkg.name}
                        </h4>
                        {pkg.type && (
                          <span className="shrink-0 ml-2 text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-md uppercase tracking-wide">
                            {pkg.type}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-3 flex-grow">
                        {pkg.description}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600 mt-auto">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Price</span>
                        <span className="font-bold text-lg text-green-600 dark:text-green-400">
                          {pkg.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {showControls && (
                  <div className="mt-4 text-center text-xs text-gray-400">
                    Showing {packagePage * PACKAGES_PER_PAGE + 1}-{Math.min((packagePage + 1) * PACKAGES_PER_PAGE, provider.packages.length)} of {provider.packages.length} products
                  </div>
                )}
              </div>
            )}

            {/* REVIEWS SECTION */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Reviews & Ratings ({provider.numReviews})
              </h3>

              {/* Review List */}
              <div className="space-y-6 mb-10">
                {provider.reviews && provider.reviews.length > 0 ? (
                  provider.reviews.map((rev, index) => (
                    <div key={index} className="border-b dark:border-gray-700 pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FaUserCircle className="text-gray-400 text-2xl" />
                          <span className="font-bold text-gray-800 dark:text-white">{rev.name}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center mb-2 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < rev.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} size={14} />
                        ))}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No reviews yet. Be the first to share your experience!</p>
                )}
              </div>

              {/* Write Review Form */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leave a Review</h4>
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`cursor-pointer text-2xl transition ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'}`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment</label>
                    <textarea
                      rows="3"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this provider..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ServiceProviderDetails;