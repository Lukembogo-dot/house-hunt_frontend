// src/pages/PropertyDetails.jsx
// (UPDATED: Fixed Sidebar visibility issue by removing viewport-based animation)

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import apiClient from "../api/axios";
import { extractVideoThumbnail } from "../utils/videoUtils";
import {
  FaStar, FaTimes, FaRegHeart, FaHeart,
  FaSchool, FaHospital, FaShoppingCart, FaUtensils,
  FaShoppingBag, FaShieldAlt, FaHotel, FaTree, FaLandmark,
  FaGem, FaPlay, FaMapMarkerAlt, FaBus, FaWifi, FaImages
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import PropertyCard from "../components/PropertyCard";
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import useSeoData from "../hooks/useSeoData";
import Breadcrumbs from "../components/Breadcrumbs";
import PropertyFaqSection from "../components/PropertyFaqSection";

// IMPORT NEW COMPONENTS
import PropertySidebar from "../components/property/PropertySidebar";
import PropertyReviewsSection from "../components/property/PropertyReviewsSection";
import PropertyAmenities from "../components/property/PropertyAmenities";
import PropertySeoInjector from '../components/SeoInjector';
import PropertyAIInsights from '../components/PropertyAIInsights';
import LivingEssentialsWidget from "../components/LivingEssentialsWidget";
import PropertyLocalServices from "../components/property/PropertyLocalServices";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const placeIconMap = {
  school: { icon: <FaSchool className="text-green-500" />, label: "School" },
  hospital: { icon: <FaHospital className="text-red-500" />, label: "Hospital" },
  supermarket: { icon: <FaShoppingCart className="text-orange-500" />, label: "Supermarket" },
  restaurant: { icon: <FaUtensils className="text-yellow-500" />, label: "Restaurant" },
  shopping_mall: { icon: <FaShoppingBag className="text-purple-500" />, label: "Mall" },
  police: { icon: <FaShieldAlt className="text-blue-500" />, label: "Police" },
  lodging: { icon: <FaHotel className="text-cyan-500" />, label: "Hotel" },
  park: { icon: <FaTree className="text-green-700" />, label: "Park" },
  tourist_attraction: { icon: <FaLandmark className="text-yellow-700" />, label: "Attraction" },
  default: { icon: <FaStar className="text-gray-400" />, label: "Place" },
};

const placeholderImage = "https://placehold.co/1000x600/e2e8f0/64748b?text=No+Image+Available";

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d.toFixed(1);
}

const getSafeImageDetails = (imagesArray, propertyTitle) => {
  if (!Array.isArray(imagesArray) || imagesArray.length === 0) return [];
  return imagesArray.map((img, index) => {
    if (typeof img === 'string') return { url: img, altText: `${propertyTitle} image ${index + 1}` };
    return { url: img.url, altText: img.altText || `${propertyTitle} image ${index + 1}` };
  });
};

// --- INTERNAL COMPONENTS (Modal, SEO & Video) ---

const VideoPlayerSection = ({ videoUrl, propertySlug }) => {
  if (!videoUrl) return null;

  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isVimeo = videoUrl.includes('vimeo.com');

  return (
    <div className="mb-10 group">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaPlay className="text-red-600 text-lg" /> Virtual Tour
          </h2>
          <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs px-2 py-0.5 rounded-full font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <FaGem size={10} /> Premium
          </span>
        </div>
        {/* ✅ LINK TO DEDICATED VIDEO WATCH PAGE - For Google Video Indexing */}
        <Link
          to={`/properties/${propertySlug}/video`}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
          title="Watch video in full screen mode"
        >
          <FaPlay size={12} />
          <span className="hidden sm:inline">Watch Full Video</span>
        </Link>
      </div>

      <div className="p-1 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 shadow-xl transform transition-transform duration-300 hover:scale-[1.01]">
        <div className="bg-black rounded-xl overflow-hidden relative shadow-inner">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            {isYouTube ? (
              <iframe
                src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Property Video Tour"
              ></iframe>
            ) : isVimeo ? (
              <iframe
                src={videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
                title="Property Video Tour"
              ></iframe>
            ) : (
              <video
                src={videoUrl}
                controls
                controlsList="nodownload"
                className="absolute top-0 left-0 w-full h-full object-contain bg-black"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ScheduleModal = ({ show, onClose, propertyId, propertyTitle }) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!scheduledDate) { setError('Please select a date and time.'); return; }
    if (new Date(scheduledDate) < new Date()) { setError('You cannot schedule a viewing in the past.'); return; }

    setSubmitting(true);
    try {
      await apiClient.post(`/viewings/${propertyId}`, { scheduledDate, message });
      setSuccess('Viewing request sent successfully! The agent will contact you to confirm.');
      setScheduledDate(''); setMessage('');
      setTimeout(() => { onClose(); setSuccess(''); }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (!show) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ duration: 0.2, ease: "easeOut" }} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition" disabled={submitting}><FaTimes size={20} /></button>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Schedule a Viewing</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-1">For: {propertyTitle}</p>
        {success ? (
          <div className="text-center p-4"><p className="text-lg font-semibold text-green-600 dark:text-green-400">{success}</p></div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Date & Time</label>
              <input type="datetime-local" id="scheduledDate" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message (Optional)</label>
              <textarea id="message" rows="3" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Any questions or specific requests for the agent?" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>}
            <button type="submit" disabled={submitting} className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? "Sending..." : "Send Request"}</button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

// PropertySeoInjector removed (imported from component)

const PropertyDetails = () => {
  const { slug } = useParams();
  const { user, addFavoriteContext, removeFavoriteContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [agentProperties, setAgentProperties] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [amenitiesPage, setAmenitiesPage] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const itemsPerPage = 8;

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [localServices, setLocalServices] = useState([]);
  const [viewId, setViewId] = useState(null);
  const [schemaFaqs, setSchemaFaqs] = useState([]); // ✅ Store FAQs for SEO

  const pagePath = `/properties/${slug}`;
  const { seo, loading: seoLoading } = useSeoData(pagePath, 'Property Listing | HouseHunt Kenya', 'View details for this property.');

  const handleLogLead = () => { if (property?._id) apiClient.post(`/properties/${property._id}/log-lead`).catch(err => console.error(err)); };
  const safeImageDetails = property ? getSafeImageDetails(property.images, property.title) : [];
  const allImageUrls = safeImageDetails.map(img => img.url);

  // Logic: Determine if image section should be shown
  const hasImages = allImageUrls.length > 0;
  const hasVideo = property?.video && property.video.length > 0;

  const fetchPropertyData = async () => {
    try {
      setLoading(true); setAgentProperties([]);
      const propertyRes = await apiClient.get(`/properties/slug/${slug}`);
      const propData = propertyRes.data;
      setProperty(propData);
      if (propData.viewId) setViewId(propData.viewId); // ✅ Capture Session ID

      const imagesList = getSafeImageDetails(propData.images, propData.title);
      const urlsList = imagesList.map(img => img.url);

      // ✅ LOGIC: Use video thumbnail as fallback if no images exist
      if (urlsList.length > 0) {
        setActiveImage(urlsList[0]);
      } else if (propData.video) {
        // Extract video thumbnail for display when no property images
        const videoThumb = extractVideoThumbnail(propData.video);
        setActiveImage(videoThumb || placeholderImage);
      } else {
        setActiveImage(placeholderImage);
      }

      if (propData.agent && propData.agent._id) {
        const agentRes = await apiClient.get(`/properties/by-agent/${propData.agent._id}`);
        setAgentProperties(agentRes.data.filter(p => p._id !== propData._id));
      }
      const reviewsRes = await apiClient.get(`/reviews/${propData._id}`);
      setComments(reviewsRes.data || []);

    } catch (error) { console.error("❌ Error fetching property:", error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchPropertyData(); }, [slug]);

  useEffect(() => {
    if (property && property.coordinates?.lat) {
      const fetchNearbyPlaces = async () => {
        try {
          setLoadingPlaces(true);
          const { lat, lng } = property.coordinates;
          const { data } = await apiClient.get(`/maps/nearby?lat=${lat}&lng=${lng}`);
          setNearbyPlaces(data.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)));
        } catch (error) { console.error("Failed to fetch places:", error); } finally { setLoadingPlaces(false); }
      };
      fetchNearbyPlaces();
    } else if (property) { setLoadingPlaces(false); }
  }, [property]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText || rating === 0 || !property) return;
    try {
      setSubmitting(true);
      await apiClient.post(`/reviews/${property._id}`, { comment: reviewText, rating }, { withCredentials: true });
      fetchPropertyData(); setReviewText(""); setRating(0); setHoverRating(0);
    } catch (error) { console.error("❌ Error submitting review:", error); alert(error.response?.data?.message || "Failed to submit review."); } finally { setSubmitting(false); }
  };

  const isFavorited = user && Array.isArray(user.favorites) && user.favorites.includes(property?._id);
  const handleFavoriteClick = () => {
    if (!user || !property) { alert("Please log in to save properties."); navigate("/login", { state: { from: location.pathname } }); return; }
    if (isFavorited) { removeFavoriteContext(property._id); } else { addFavoriteContext(property._id); }
  };

  const totalPages = Math.ceil(nearbyPlaces.length / itemsPerPage);
  const currentAmenities = nearbyPlaces.slice((amenitiesPage - 1) * itemsPerPage, amenitiesPage * itemsPerPage);
  const handleAmenityClick = (place) => {
    const distance = getDistance(property.coordinates.lat, property.coordinates.lng, place.location.lat, place.location.lng);
    setSelectedPlace({ ...place, distance });
  };

  const handleScheduleClick = () => {
    if (!user) { navigate('/login', { state: { from: location.pathname } }); return; }
    handleLogLead(); setShowScheduleModal(true);
  };

  const handleStartChat = async () => {
    if (!user || !property) { navigate('/login', { state: { from: location.pathname } }); return; }
    handleLogLead(); setIsStartingChat(true);
    try {
      const { data } = await apiClient.post('/chat/conversations', { propertyId: property._id });
      navigate(`/chat/${data._id}`);
    } catch (error) { console.error('Failed to start chat:', error); alert('Could not start chat.'); } finally { setIsStartingChat(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-6">
        {/* ✅ SEO content for crawlers */}
        <Helmet>
          <title>Property Details | House Hunt Kenya</title>
          <meta name="description" content="Browse verified property listings in Kenya. Find homes for rent and sale in Nairobi, Mombasa, Kisumu and more." />
          <meta name="robots" content="index, follow" />
        </Helmet>

        <div className="sr-only" aria-hidden="true">
          <h1>Property Listings in Kenya</h1>
          <p>Find your perfect home. Browse thousands of verified properties for rent and sale across Kenya.</p>
        </div>

        {/* Skeleton Loading UI */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="md:col-span-3 h-6 bg-gray-200 dark:bg-gray-800 rounded w-64"></div>

          {/* Main content skeleton */}
          <div className="md:col-span-2 space-y-6">
            {/* Title skeleton */}
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48"></div>

            {/* Image skeleton */}
            <div className="w-full h-96 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>

            {/* Description skeleton */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 space-y-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6"></div>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 space-y-4">
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        {/* ✅ CRITICAL SEO FIX: Prevent Google from indexing 404 pages */}
        <Helmet>
          <title>Property Not Found | House Hunt Kenya</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <div className="max-w-2xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200 dark:border-gray-700"
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400 mb-4">
                <FaMapMarkerAlt className="text-4xl" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Property Not Found
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                This property may have been sold, rented, or is no longer available.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Don't worry though - we have thousands of other great properties!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                to="/search/rent/all/all"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
              >
                <FaHome /> Browse Rentals
              </Link>
              <Link
                to="/search/sale/all/all"
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 dark:hover:bg-gray-600 transition"
              >
                <FaStar /> View Properties for Sale
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Need help finding something specific?</p>
              <Link
                to="/contact"
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm"
              >
                Contact our team →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const avgRating = comments.length > 0 ? (comments.reduce((acc, c) => acc + (c.rating || 0), 0) / comments.length).toFixed(1) : 0;
  const isAgentOwner = user && property.agent && user._id === property.agent._id;

  return (
    <>
      <PropertySeoInjector seo={seo} property={property} faqs={schemaFaqs} reviews={comments} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="md:col-span-3"><Breadcrumbs /></div>

          {/* ✅ SEO STRATEGY: Show sold/unavailable properties with clear status for indexing */}
          {property.status !== 'available' && (
            <div className="md:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-500 dark:bg-orange-600 rounded-full flex items-center justify-center">
                    <FaMapMarkerAlt className="text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {property.status === 'sold' && 'Property Sold'}
                      {property.status === 'rented' && 'Property Rented'}
                      {property.status === 'archived' && 'Property No Longer Available'}
                      {!['sold', 'rented', 'archived', 'available'].includes(property.status) && 'Property Status Updated'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      This property is no longer available. Browse similar properties in <strong>{property.location}</strong> below or search our active listings.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/search/${property.listingType || 'rent'}/${property.type || 'all'}/${property.location?.toLowerCase().replace(/\s+/g, '-') || 'all'}`}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
                      >
                        <FaHome /> Browse Similar in {property.location}
                      </Link>
                      <Link
                        to="/search/rent/all/all"
                        className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                      >
                        View All Properties
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Main Content */}
          <div className="md:col-span-2">

            {/* ✅ GEO OPTIMIZATION: Hidden Summary for AI Crawlers */}
            {/* This block is 'sr-only' (screen reader only) but accessible to search bots */}
            <article className="sr-only" aria-hidden="true">
              <h2>Quick Property Summary for AI & Search Engines</h2>
              <p>
                Looking for a <strong>{property.bedrooms || '0'} bedroom {property.type}</strong> in <strong>{property.location}</strong>?
                This property matches a budget of <strong>Ksh {property.price}</strong>.
                Key features include: {property.amenities?.join(', ') || 'Standard amenities'}.
                {property.status === 'available' ? 'It is currently available for viewing.' : 'It is currently off the market.'}
                Contact {isAgentOwner ? 'the owner directly' : 'the verified agent'} to schedule a visit.
              </p>
              <dl>
                <dt>Type</dt><dd>{property.type}</dd>
                <dt>Location</dt><dd>{property.location}</dd>
                <dt>Price</dt><dd>Ksh {property.price}</dd>
                <dt>Beds</dt><dd>{property.bedrooms}</dd>
              </dl>
            </article>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">{property.title}</h1>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleFavoriteClick} className="flex items-center space-x-2 px-4 py-2 border rounded-lg transition dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                {isFavorited ? <><FaHeart className="text-red-500" /><span className="dark:text-gray-200">Saved</span></> : <><FaRegHeart className="text-gray-600 dark:text-gray-400" /><span className="text-gray-700 dark:text-gray-200">Save Property</span></>}
              </motion.button>
            </div>
            <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-4">
              Ksh {property.price?.toLocaleString()} {property.listingType === 'rent' && <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month</span>}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{property.location}</p>

            {/* ✅ LOGIC: Conditionally Render Image Section */}
            {(hasImages || !hasVideo) && (
              <motion.div className="mb-8" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                <img src={activeImage} alt={safeImageDetails?.[0]?.altText || property.title} className="rounded-lg w-full h-96 object-cover mb-4 shadow-md" />
                {allImageUrls.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {allImageUrls.map((imgUrl, index) => (
                      <img key={imgUrl} src={imgUrl} alt={safeImageDetails?.[index]?.altText || `Thumbnail ${index + 1}`} onClick={() => setActiveImage(imgUrl)} className={`rounded-lg w-full h-20 object-cover cursor-pointer transition ${activeImage === imgUrl ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'} active:scale-95`} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <VideoPlayerSection videoUrl={property.video} propertySlug={property.slug} />
            </motion.div>

            <motion.div className="mb-8" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 border-b dark:border-gray-800 pb-2">Description</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            </motion.div>

            {/* NAIROBI ESSENTIALS (Only shows if data exists) */}
            {(property.matatuRoute || property.mamaMbogaDistance || (property.internetProviders && property.internetProviders.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-8 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-800 rounded-3xl shadow-sm border border-orange-100 dark:border-gray-700"
              >
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FaBus className="text-orange-500" /> Living Essentials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {property.matatuRoute && (
                    <div className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <FaBus className="text-orange-500 text-2xl mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Matatu Route</h3>
                        <p className="text-gray-600 dark:text-gray-300">{property.matatuRoute}</p>
                        {property.matatuFare && (
                          <span className="inline-block mt-1 text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md border border-orange-200">
                            Fare: Ksh {property.matatuFare}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {property.mamaMbogaDistance && (
                    <div className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <FaShoppingCart className="text-green-500 text-2xl mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Mama Mboga</h3>
                        <p className="text-gray-600 dark:text-gray-300">{property.mamaMbogaDistance} away</p>
                      </div>
                    </div>
                  )}
                  {property.internetProviders && property.internetProviders.length > 0 && (
                    <div className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <FaWifi className="text-blue-500 text-2xl mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Internet Providers</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {property.internetProviders.map((isp, idx) => (
                            <span key={idx} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800">
                              {isp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* AI MARKET ANALYSIS (Using Gemma 3) */}
            {property && (
              <PropertyAIInsights
                propertyId={property._id}
                propertyTitle={property.title}
                propertyLocation={property.location}
                propertyDescription={property.description}
                propertyPostedDate={property.createdAt}
                propertyStatus={property.status}
                propertyType={property.type}
                propertyPrice={property.price}
                agentName={property.ownerDetails?.name || property.agent?.name}
                agentImage={property.agent?.profilePicture || null}
                agentContact={property.ownerDetails?.whatsapp || property.agent?.whatsappNumber}
                cachedAiAnalysis={property.aiAnalysis}
              />
            )}

            {property.amenities && property.amenities.length > 0 && (
              <PropertyAmenities amenities={property.amenities} />
            )}

            <motion.div className="mb-8" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Location & Nearby Amenities</h2>
              {(property.coordinates?.lat &&
                (Math.abs(property.coordinates.lat - (-1.286389)) > 0.0001 ||
                  Math.abs(property.coordinates.lng - 36.817223) > 0.0001)) ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    View the exact pin location of this property on Google Maps.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowMap(true);
                        trackInteraction('mapClicks');
                      }}
                      className="flex-1 bg-green-100 text-green-700 py-3 rounded-xl font-bold hover:bg-green-200 transition flex items-center justify-center gap-2"
                    >
                      <FaMapMarkerAlt /> View on Map
                    </button>
                    <button
                      onClick={() => {
                        document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
                        trackInteraction('photoScrolls');
                      }}
                      className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-200 transition flex items-center justify-center gap-2"
                    >
                      <FaImages /> Photos
                    </button>
                  </div>
                </div>
              ) : property.location ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    View the approximate location of this property on Google Maps.
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <FaMapMarkerAlt /> View on Google Maps
                  </a>
                </div>
              ) : <p className="text-gray-500 dark:text-gray-400">Location data is not available for this property.</p>}
            </motion.div>

            {/* What's Nearby Removed (Consolidated to AI Insights) */}

            {/* PropertyLocalServices Removed (Consolidated to AI Insights) */}

            {/* PropertyFaqSection Removed (Consolidated to AI Insights) */}

            <PropertyReviewsSection
              property={property}
              user={user}
              comments={comments}
              avgRating={avgRating}
              reviewText={reviewText} setReviewText={setReviewText}
              rating={rating} setRating={setRating}
              hoverRating={hoverRating} setHoverRating={setHoverRating}
              handleReviewSubmit={handleReviewSubmit}
              submitting={submitting}
              variants={sectionVariants}
            />

          </div>

          {/* ✅ FIXED: Removed motion.div wrapper from Sidebar to ensure immediate visibility */}
          <div>
            <PropertySidebar
              property={property}
              user={user}
              isAgentOwner={isAgentOwner}
              handleScheduleClick={handleScheduleClick}
              handleStartChat={handleStartChat}
              isStartingChat={isStartingChat}
              handleLogLead={handleLogLead}
            />
          </div>
        </div >

        {agentProperties.length > 0 && property.agent && (
          <section className="max-w-6xl mx-auto mt-16">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
              More from {property.agent.name}
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {agentProperties.slice(0, 4).map((prop) => (
                <PropertyCard key={prop._id} property={prop} />
              ))}
            </div>
            {agentProperties.length > 4 && (
              <div className="mt-8 text-center">
                <Link
                  to={`/agent/${property.agent._id}`}
                  className="inline-block px-6 py-3 border border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-50 transition"
                >
                  View All {agentProperties.length} Listings
                </Link>
              </div>
            )}
          </section>
        )}
      </div >

      <AnimatePresence>
        <ScheduleModal show={showScheduleModal} onClose={() => setShowScheduleModal(false)} propertyId={property?._id} propertyTitle={property.title} />
      </AnimatePresence>

      <AnimatePresence>
        {selectedPlace && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPlace(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ duration: 0.2, ease: "easeOut" }} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedPlace(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"><FaTimes size={20} /></button>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">{placeIconMap[selectedPlace.type]?.icon || placeIconMap.default.icon}</span>
                <div><h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{selectedPlace.name}</h3><p className="text-sm font-bold text-blue-600 dark:text-blue-400">{placeIconMap[selectedPlace.type]?.label || placeIconMap.default.label}</p></div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300"><span className="font-semibold">Proximity:</span> {selectedPlace.distance} km away</p>
                <p className="text-gray-700 dark:text-gray-300"><span className="font-semibold">Address:</span> {selectedPlace.vicinity}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertyDetails;