// src/pages/PropertyDetails.jsx
// (UPDATED: Fixed Sidebar visibility issue by removing viewport-based animation)

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import apiClient from "../api/axios";
import {
  FaStar, FaTimes, FaRegHeart, FaHeart,
  FaSchool, FaHospital, FaShoppingCart, FaUtensils,
  FaShoppingBag, FaShieldAlt, FaHotel, FaTree, FaLandmark,
  FaGem, FaPlay, FaMapMarkerAlt
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

const VideoPlayerSection = ({ videoUrl }) => {
  if (!videoUrl) return null;

  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isVimeo = videoUrl.includes('vimeo.com');

  return (
    <div className="mb-10 group">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaPlay className="text-red-600 text-lg" /> Virtual Tour
        </h2>
        <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs px-2 py-0.5 rounded-full font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1">
          <FaGem size={10} /> Premium
        </span>
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

const PropertySeoInjector = ({ seo, property }) => {
  if (!property) return null;

  const safeImages = getSafeImageDetails(property.images, property.title);
  const schemaImages = safeImages.slice(0, 3).map(img => img.url);
  const firstImageUrl = safeImages.length > 0 ? safeImages[0].url : placeholderImage;

  const pageUrl = window.location.href;
  const canonical = seo.canonicalUrl
    ? (seo.canonicalUrl.startsWith('http') ? seo.canonicalUrl : `https://www.househuntkenya.co.ke${seo.canonicalUrl}`)
    : pageUrl;

  const getSchemaType = (type) => {
    const mapping = {
      'apartment': 'Apartment',
      'house': 'House',
      'airbnb': 'VacationRental',
      'land': 'Landform',
    };
    return mapping[type] || 'Product';
  };

  const getAgentSchema = () => {
    if (property.ownerDetails && property.ownerDetails.name) {
      return {
        "@type": "RealEstateAgent",
        "name": property.ownerDetails.name,
        "telephone": property.ownerDetails.whatsapp || property.ownerDetails.email || undefined
      };
    }
    if (property.agent && property.agent.name) {
      return {
        "@type": "RealEstateAgent",
        "name": property.agent.name,
        "image": property.agent.profilePicture || undefined,
        "telephone": property.agent.phoneNumber || property.agent.whatsappNumber || undefined
      };
    }
    return { "@type": "Organization", "name": "HouseHunt Kenya" };
  };

  const generatePropertySchema = () => {
    const schemaType = getSchemaType(property.type);
    const schema = {
      "@context": "https://schema.org",
      "@type": schemaType,
      "name": seo.metaTitle || property.title,
      "description": seo.metaDescription || property.description?.substring(0, 160),
      "url": pageUrl,
      "image": schemaImages,
      "identifier": property._id,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": property.location.split(',')[0].trim(),
        "addressLocality": "Nairobi",
        "addressCountry": "KE"
      },
      ...(property.coordinates?.lat && {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": property.coordinates.lat,
          "longitude": property.coordinates.lng
        }
      }),
      ...(property.bedrooms && { "numberOfBedrooms": property.bedrooms }),
      ...(property.features && property.features.length > 0 && {
        "amenityFeature": property.features.map(feature => ({
          "@type": "LocationFeatureSpecification",
          "name": feature,
          "value": "true"
        }))
      }),
      "offers": {
        "@type": "Offer",
        "price": property.price,
        "priceCurrency": "KES",
        "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        "availability": property.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/Sold",
        "url": pageUrl,
        "seller": getAgentSchema()
      }
    };
    return schema;
  };

  const schemaData = generatePropertySchema();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.househuntkenya.co.ke" },
      { "@type": "ListItem", "position": 2, "name": property.listingType === 'rent' ? "For Rent" : "For Sale", "item": `https://www.househuntkenya.co.ke/search/${property.listingType}/nairobi` },
      { "@type": "ListItem", "position": 3, "name": property.title, "item": pageUrl }
    ]
  };

  return (
    <Helmet>
      <title>{seo.metaTitle}</title>
      <meta name="description" content={seo.metaDescription} />
      {seo.focusKeyword && <meta name="keywords" content={seo.focusKeyword} />}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={seo.ogTitle || seo.metaTitle} />
      <meta property="og:description" content={seo.ogDescription || seo.metaDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content="product" />
      <meta property="og:image" content={firstImageUrl} />
      <meta property="og:price:amount" content={property.price} />
      <meta property="og:price:currency" content="KES" />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={pageUrl} />
      <meta property="twitter:title" content={seo.twitterTitle || seo.metaTitle} />
      <meta property="twitter:description" content={seo.twitterDescription || seo.metaDescription} />
      <meta property="twitter:image" content={firstImageUrl} />
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
};

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

      const imagesList = getSafeImageDetails(propData.images, propData.title);
      const urlsList = imagesList.map(img => img.url);

      // LOGIC: Only set image if actual images exist. No fallback to video thumbnail here.
      if (urlsList.length > 0) {
        setActiveImage(urlsList[0]);
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

  if (loading) return <div className="flex justify-center items-center min-h-screen dark:bg-gray-950"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!property) return <div className="text-center mt-20 text-gray-500 dark:text-gray-400"><p>Property not found.</p></div>;

  const avgRating = comments.length > 0 ? (comments.reduce((acc, c) => acc + (c.rating || 0), 0) / comments.length).toFixed(1) : 0;
  const isAgentOwner = user && property.agent && user._id === property.agent._id;

  return (
    <>
      <PropertySeoInjector seo={seo} property={property} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="md:col-span-3"><Breadcrumbs /></div>

          {/* Main Content */}
          <div className="md:col-span-2">
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
              <VideoPlayerSection videoUrl={property.video} />
            </motion.div>

            <motion.div className="mb-8" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 border-b dark:border-gray-800 pb-2">Description</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            </motion.div>

            <motion.div className="mb-8" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <LivingEssentialsWidget property={property} />
            </motion.div>

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
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${property.coordinates.lat},${property.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <FaMapMarkerAlt /> View on Google Maps
                  </a>
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

            <motion.div className="mb-8" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">What's Nearby</h2>
                {nearbyPlaces.length > 0 && <span className="text-sm text-gray-500 dark:text-gray-400">Page {amenitiesPage} of {totalPages}</span>}
              </div>
              {loadingPlaces ? <p className="text-gray-500 dark:text-gray-400">Loading nearby amenities...</p> : nearbyPlaces.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentAmenities.map(place => (
                      <button key={place.id} onClick={() => handleAmenityClick(place)} className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left">
                        <span className="flex-shrink-0">{placeIconMap[place.type]?.icon || placeIconMap.default.icon}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{place.name}</span>
                      </button>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <button onClick={() => setAmenitiesPage(p => p - 1)} disabled={amenitiesPage === 1} className="px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">Previous</button>
                      <button onClick={() => setAmenitiesPage(p => p + 1)} disabled={amenitiesPage === totalPages} className="px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">Next</button>
                    </div>
                  )}
                </>
              ) : <p className="text-gray-500 dark:text-gray-400">No popular amenities found within 1.5km.</p>}
            </motion.div>

            {/* ✅ ADDED: Property Local Services / Neighborhood Watch */}
            <motion.div className="mb-8" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <PropertyLocalServices location={property.location} />
            </motion.div>

            <PropertyFaqSection location={property.location.split(',')[0]} />

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

        {(!property.ownerDetails || !property.ownerDetails.name) && agentProperties.length > 0 && property.agent && (
          <section className="max-w-6xl mx-auto mt-16">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">More from {property.agent.name}</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {agentProperties.map((prop) => (<PropertyCard key={prop._id} property={prop} />))}
            </div>
          </section>
        )
        }
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