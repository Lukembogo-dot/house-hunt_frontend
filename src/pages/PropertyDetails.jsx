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
  FaGem, FaPlay, FaMapMarkerAlt, FaBus, FaWifi, FaImages,
  FaHome, FaBuilding, FaArrowRight
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
import PropertyImageCarousel from "../components/property/PropertyImageCarousel";

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 relative border border-white/20 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition hover:bg-white/10 dark:hover:bg-white/5 w-10 h-10 rounded-full flex items-center justify-center"
          disabled={submitting}
        >
          <FaTimes size={20} />
        </button>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Schedule a Viewing</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-1 text-sm">For: <span className="font-semibold text-gray-900 dark:text-gray-100">{propertyTitle}</span></p>

        {success ? (
          <div className="text-center p-6 bg-green-500/10 dark:bg-green-900/20 rounded-2xl border border-green-200/50 dark:border-green-800/50">
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="scheduledDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Preferred Date & Time</label>
              <input
                type="datetime-local"
                id="scheduledDate"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/30 dark:bg-white/5 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Message (Optional)</label>
              <textarea
                id="message"
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Any questions or specific requests for the agent?"
                className="w-full px-4 py-3 bg-white/30 dark:bg-white/5 border border-white/30 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none transition"
              />
            </div>
            {error && <p className="text-sm text-red-500 dark:text-red-400 bg-red-500/10 dark:bg-red-900/20 p-3 rounded-lg border border-red-200/50 dark:border-red-800/50">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {submitting ? "Sending..." : "Send Request"}
            </button>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 py-10 px-6 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          />
        </div>

        {/* ✅ SEO content for crawlers */}
        <Helmet>
          <title>Property Details | House Hunt Kenya</title>
          <meta name="description" content="Browse verified property listings in Kenya. Find homes for rent and sale in Nairobi, Mombasa, Kisumu and more." />
          <meta name="robots" content="index, follow" />
        </Helmet>

        <div className="sr-only" aria-hidden="true">
          <h2>Property Listings in Kenya</h2>
          <p>Find your perfect home. Browse thousands of verified properties for rent and sale across Kenya.</p>
        </div>

        {/* Skeleton Loading UI */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 relative z-10">
          {/* Breadcrumb skeleton */}
          <div className="md:col-span-3 h-6 bg-white/20 dark:bg-white/10 rounded-full w-64 animate-pulse backdrop-blur-md"></div>

          {/* Main content skeleton */}
          <div className="md:col-span-2 space-y-6">
            {/* Title skeleton */}
            <div className="space-y-3">
              <div className="h-12 bg-white/20 dark:bg-white/10 rounded-xl w-3/4 animate-pulse backdrop-blur-md"></div>
              <div className="h-6 bg-white/20 dark:bg-white/10 rounded-full w-48 animate-pulse backdrop-blur-md"></div>
            </div>

            {/* Image skeleton */}
            <div className="w-full h-96 bg-white/20 dark:bg-white/10 rounded-3xl animate-pulse backdrop-blur-md"></div>

            {/* Description skeleton */}
            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 space-y-3 border border-white/30 dark:border-white/20 animate-pulse">
              <div className="h-6 bg-white/30 dark:bg-white/20 rounded-xl w-32"></div>
              <div className="h-4 bg-white/30 dark:bg-white/20 rounded-lg w-full"></div>
              <div className="h-4 bg-white/30 dark:bg-white/20 rounded-lg w-5/6"></div>
              <div className="h-4 bg-white/30 dark:bg-white/20 rounded-lg w-4/6"></div>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 space-y-4 border border-white/30 dark:border-white/20 animate-pulse">
              <div className="h-12 bg-white/30 dark:bg-white/20 rounded-xl"></div>
              <div className="h-12 bg-white/30 dark:bg-white/20 rounded-xl"></div>
              <div className="h-12 bg-white/30 dark:bg-white/20 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 flex items-center justify-center px-4 relative overflow-hidden py-10">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          />
        </div>

        {/* ✅ CRITICAL SEO FIX: Prevent Google from indexing 404 pages */}
        <Helmet>
          <title>Property Not Found | House Hunt Kenya</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <div className="max-w-2xl w-full text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/20 dark:bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/30 dark:border-white/20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500/20 to-red-500/20 dark:from-orange-600/30 dark:to-red-600/30 rounded-full text-orange-600 dark:text-orange-400 mb-6 border border-orange-200/50 dark:border-orange-600/50"
            >
              <FaMapMarkerAlt className="text-5xl" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Property Not Found
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-3 font-medium">
              This property may have been sold, rented, or is no longer available.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
              Don't worry though - we have thousands of other great properties!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search/rent/all/all"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <FaHome /> Browse Rentals
              </Link>
              <Link
                to="/search/sale/all/all"
                className="inline-flex items-center justify-center gap-2 bg-white/30 dark:bg-white/10 backdrop-blur-md border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-xl font-bold hover:bg-white/50 dark:hover:bg-white/20 transition-all"
              >
                <FaStar /> View for Sale
              </Link>
            </div>

            <div className="mt-10 pt-8 border-t border-white/30 dark:border-white/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">Need help finding something specific?</p>
              <Link
                to="/contact"
                className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 text-base transition inline-flex items-center gap-2"
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

      {/* FULL-SCREEN IMAGE CAROUSEL */}
      <PropertyImageCarousel
        property={property}
        user={user}
        isFavorited={isFavorited}
        onFavoriteClick={handleFavoriteClick}
      />

      {/* MAIN CONTENT AREA */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 relative overflow-hidden py-10 px-6">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 relative z-10">
          <div className="md:col-span-3"><Breadcrumbs /></div>

          {/* ✅ SEO STRATEGY: Show sold/unavailable properties with clear status for indexing */}
          {property.status !== 'available' && (
            <div className="md:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-orange-200/50 dark:border-orange-500/30"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <FaMapMarkerAlt className="text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {property.status === 'sold' && 'Property Sold'}
                      {property.status === 'rented' && 'Property Rented'}
                      {property.status === 'archived' && 'Property No Longer Available'}
                      {!['sold', 'rented', 'archived', 'available'].includes(property.status) && 'Property Status Updated'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                      This property is no longer available. Browse similar properties in <strong>{property.location}</strong> below or search our active listings.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/search/${property.listingType || 'rent'}/${property.type || 'all'}/${property.location?.toLowerCase().replace(/\s+/g, '-') || 'all'}`}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                      >
                        <FaHome /> Browse Similar in {property.location}
                      </Link>
                      <Link
                        to="/search/rent/all/all"
                        className="inline-flex items-center gap-2 bg-white/30 dark:bg-white/10 backdrop-blur-md border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-xl font-bold hover:bg-white/50 dark:hover:bg-white/20 transition-all"
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

            <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <VideoPlayerSection videoUrl={property.video} propertySlug={property.slug} />
            </motion.div>

            <motion.div
              className="mb-8"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 dark:border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-white/20 dark:border-white/10 flex items-center gap-2">
                  <FaBuilding className="text-blue-600 dark:text-blue-400" />
                  Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base lg">{property.description}</p>
              </div>
            </motion.div>

            {/* NAIROBI ESSENTIALS (Only shows if data exists) */}
            {(property.matatuRoute || property.mamaMbogaDistance || (property.internetProviders && property.internetProviders.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8 bg-gradient-to-br from-orange-100/50 to-amber-100/50 dark:from-orange-900/20 dark:to-amber-900/20 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-orange-200/50 dark:border-orange-500/30"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 dark:bg-orange-600/30 rounded-xl">
                    <FaBus className="text-orange-600 dark:text-orange-400 text-xl" />
                  </div>
                  Living Essentials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {property.matatuRoute && (
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/50 dark:border-white/20 shadow-lg hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-orange-500/20 dark:bg-orange-600/30 rounded-xl">
                          <FaBus className="text-orange-600 dark:text-orange-400 text-2xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Matatu Route</h3>
                          <p className="text-gray-700 dark:text-gray-300 mt-2">{property.matatuRoute}</p>
                          {property.matatuFare && (
                            <span className="inline-block mt-3 text-xs font-bold bg-orange-500/20 dark:bg-orange-600/30 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-lg border border-orange-200/50 dark:border-orange-600/50">
                              Fare: Ksh {property.matatuFare}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {property.mamaMbogaDistance && (
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/50 dark:border-white/20 shadow-lg hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-green-500/20 dark:bg-green-600/30 rounded-xl">
                          <FaShoppingCart className="text-green-600 dark:text-green-400 text-2xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Mama Mboga</h3>
                          <p className="text-gray-700 dark:text-gray-300 mt-2">{property.mamaMbogaDistance} away</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {property.internetProviders && property.internetProviders.length > 0 && (
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/50 dark:border-white/20 shadow-lg hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-500/20 dark:bg-blue-600/30 rounded-xl">
                          <FaWifi className="text-blue-600 dark:text-blue-400 text-2xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Internet Providers</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {property.internetProviders.map((isp, idx) => (
                              <span
                                key={idx}
                                className="text-xs font-semibold bg-blue-500/20 dark:bg-blue-600/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-600/50 px-3 py-1 rounded-full"
                              >
                                {isp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
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

            <motion.div
              className="mb-8"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-600 dark:text-blue-400" />
                Location & Nearby Amenities
              </h2>
              {(property.coordinates?.lat &&
                (Math.abs(property.coordinates.lat - (-1.286389)) > 0.0001 ||
                  Math.abs(property.coordinates.lng - 36.817223) > 0.0001)) ? (
                <div className="bg-gradient-to-r from-blue-100/50 to-cyan-100/50 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-xl p-8 rounded-3xl border border-blue-200/50 dark:border-blue-500/30 shadow-xl">
                  <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg font-medium text-center">
                    View the exact pin location of this property on Google Maps.
                  </p>
                  <div className="flex gap-3 flex-col sm:flex-row">
                    <button
                      onClick={() => {
                        // setShowMap(true);
                        // Map functionality to be added
                      }}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <FaMapMarkerAlt /> View on Map
                    </button>
                    <button
                      onClick={() => {
                        document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <FaImages /> Photos
                    </button>
                  </div>
                </div>
              ) : property.location ? (
                <div className="bg-gradient-to-r from-blue-100/50 to-cyan-100/50 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-xl p-8 rounded-3xl border border-blue-200/50 dark:border-blue-500/30 shadow-xl text-center">
                  <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg font-medium">
                    View the approximate location of this property on Google Maps.
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <FaMapMarkerAlt /> View on Google Maps
                  </a>
                </div>
              ) : <div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/30 dark:border-white/20 text-center"><p className="text-gray-500 dark:text-gray-400">Location data is not available for this property.</p></div>}
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
          <section className="max-w-6xl mx-auto mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                More from <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{property.agent.name}</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Explore other premium listings from this verified agent</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {agentProperties.slice(0, 4).map((prop) => (
                <PropertyCard key={prop._id} property={prop} />
              ))}
            </div>
            {agentProperties.length > 4 && (
              <div className="mt-10 text-center">
                <Link
                  to={`/agent/${property.agent._id}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  View All {agentProperties.length} Listings <FaArrowRight />
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedPlace(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl max-w-sm w-full p-8 relative border border-white/30 dark:border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPlace(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition hover:bg-white/10 dark:hover:bg-white/5 w-10 h-10 rounded-full flex items-center justify-center"
              >
                <FaTimes size={20} />
              </button>

              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-white/30 dark:bg-white/20 rounded-xl">
                  <span className="text-3xl">{placeIconMap[selectedPlace.type]?.icon || placeIconMap.default.icon}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlace.name}</h3>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">{placeIconMap[selectedPlace.type]?.label || placeIconMap.default.label}</p>
                </div>
              </div>

              <div className="space-y-4 bg-white/20 dark:bg-white/10 rounded-2xl p-6 border border-white/30 dark:border-white/20">
                <div>
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Proximity</p>
                  <p className="text-gray-900 dark:text-white font-semibold text-lg">{selectedPlace.distance} km away</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Address</p>
                  <p className="text-gray-900 dark:text-white font-semibold">{selectedPlace.vicinity}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertyDetails;