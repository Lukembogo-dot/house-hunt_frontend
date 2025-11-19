// src/pages/PropertyDetails.jsx
// (UPDATED - Prioritize Owner/Shadow Agent Display)

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import apiClient from "../api/axios";
import { 
  FaStar, FaWhatsapp, FaHeart, FaRegHeart, 
  FaSchool, FaHospital, FaShoppingCart, FaUtensils,
  FaShoppingBag, FaShieldAlt, FaHotel, FaTree, FaLandmark, FaTimes,
  FaCalendarAlt,
  FaCommentDots,
  FaFacebookF, FaTwitter, FaLinkedinIn, FaCopy,
  FaUserSlash,
  FaTiktok,      
  FaInstagram,
  FaUserCircle    
} from "react-icons/fa"; 
import MapComponent from "../components/MapComponent";
import { useAuth } from "../context/AuthContext"; 
import PropertyCard from "../components/PropertyCard";
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import useSeoData from "../hooks/useSeoData"; 
import Breadcrumbs from "../components/Breadcrumbs";
import PropertyFaqSection from "../components/PropertyFaqSection";


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
    if (!Array.isArray(imagesArray) || imagesArray.length === 0) {
        return [];
    }

    return imagesArray.map((img, index) => {
        if (typeof img === 'string') {
            return {
                url: img,
                altText: `${propertyTitle} image ${index + 1}`
            };
        }
        return {
            url: img.url,
            altText: img.altText || `${propertyTitle} image ${index + 1}`
        };
    });
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
    
    if (!scheduledDate) {
      setError('Please select a date and time.');
      return;
    }
    
    if (new Date(scheduledDate) < new Date()) {
      setError('You cannot schedule a viewing in the past.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post(`/viewings/${propertyId}`, {
        scheduledDate,
        message
      });
      setSuccess('Viewing request sent successfully! The agent will contact you to confirm.');
      setScheduledDate('');
      setMessage('');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          disabled={submitting}
        >
          <FaTimes size={20} />
        </button>
        
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Schedule a Viewing
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-1">
          For: {propertyTitle}
        </p>

        {success ? (
          <div className="text-center p-4">
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Preferred Date & Time
              </label>
              <input
                type="datetime-local"
                id="scheduledDate"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message (Optional)
              </label>
              <textarea
                id="message"
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Any questions or specific requests for the agent?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending..." : "Send Request"}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

const PropertySeoInjector = ({ seo, property }) => {
    
    const safeImages = getSafeImageDetails(property.images, property.title);
    const firstImageUrl = safeImages.length > 0 ? safeImages[0].url : placeholderImage;
    
    const pageUrl = window.location.href;
    const canonical = seo.canonicalUrl 
      ? (seo.canonicalUrl.startsWith('http') ? seo.canonicalUrl : `https://www.househuntkenya.co.ke${seo.canonicalUrl}`)
      : pageUrl;

    const generatePropertySchema = () => {
        const listingSchema = {
            "@context": "https://schema.org",
            "@type": property.listingType === 'sale' ? "HouseForSale" : "RentalListing",
            "name": seo.metaTitle || property.title,
            "description": seo.metaDescription || property.description?.substring(0, 160),
            "url": pageUrl,
            "image": firstImageUrl,
            "datePosted": property.createdAt,
            "offers": {
                "@type": "Offer",
                "price": property.price,
                "priceCurrency": "KES",
                "availability": property.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "seller": {
                  "@type": "RealEstateAgent",
                  "name": property.ownerDetails?.name || property.agent?.name || 'HouseHunt Kenya',
                }
            },
            ...(property.bedrooms && { "numberOfBedrooms": property.bedrooms }),
            ...(property.bathrooms && { "numberOfBathroomsTotal": property.bathrooms }),
            ...(property.size && { "floorSize": { "@type": "QuantitativeValue", "value": property.size, "unitCode": "SQF" } }), 
            ...(property.coordinates?.lat && {
              "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": property.coordinates.lat,
                  "longitude": property.coordinates.lng
              }
            }),
            ...(property.location && {
              "address": {
                  "@type": "PostalAddress",
                  "addressLocality": property.location.split(',')[0].trim(), 
                  "addressRegion": "Nairobi", 
                  "addressCountry": "KE"
              }
            }),
            "mainEntity": undefined,
        };

        if (seo.faqs && seo.faqs.length > 0) {
            listingSchema.mainEntity = {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": seo.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            };
        } else {
            delete listingSchema.mainEntity; 
        }
        
        return listingSchema;
    };

    const schemaData = generatePropertySchema();

    return (
        <Helmet>
            <title>{seo.metaTitle}</title>
            <meta name="description" content={seo.metaDescription} />
            {seo.focusKeyword && <meta name="keywords" content={seo.focusKeyword} />}
            <link rel="canonical" href={canonical} />

            <meta property="og:title" content={seo.ogTitle || seo.metaTitle} />
            <meta property="og:description" content={seo.ogDescription || seo.metaDescription} />
            <meta property="og:url" content={pageUrl} />
            <meta property="og:type" content="article" />
            <meta property="og:image" content={firstImageUrl} /> 

            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={pageUrl} />
            <meta property="twitter:title" content={seo.twitterTitle || seo.metaTitle} />
            <meta property="twitter:description" content={seo.twitterDescription || seo.metaDescription} />
            <meta property="twitter:image" content={firstImageUrl} /> 

            <script 
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />
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
  const { seo, loading: seoLoading } = useSeoData(
    pagePath,
    'Property Listing | HouseHunt Kenya', 
    'View details for this property listing on HouseHunt Kenya.' 
  );

  const handleLogLead = () => {
    if (!property || !property._id) return; 
    apiClient.post(`/properties/${property._id}/log-lead`)
      .catch(err => console.error("Error logging lead:", err));
  };
  
  const safeImageDetails = property ? getSafeImageDetails(property.images, property.title) : [];
  const allImageUrls = safeImageDetails.map(img => img.url);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      setAgentProperties([]); 
      
      const propertyRes = await apiClient.get(`/properties/slug/${slug}`); 
      const propData = propertyRes.data;
      const propertyId = propData._id;
      setProperty(propData);
      
      const imagesList = getSafeImageDetails(propData.images, propData.title);
      const urlsList = imagesList.map(img => img.url);
      setActiveImage(urlsList[0] || placeholderImage);

      if (propData.agent && propData.agent._id) {
        const agentRes = await apiClient.get(`/properties/by-agent/${propData.agent._id}`); 
        setAgentProperties(agentRes.data.filter(p => p._id !== propertyId));
      }

      const reviewsRes = await apiClient.get(`/reviews/${propertyId}`);
      setComments(reviewsRes.data || []);
      
      if (propData.location) {
        try {
          const primaryLocation = propData.location.split(',')[0].trim();
          const servicesRes = await apiClient.get(`/services/location/${primaryLocation}`);
          setLocalServices(servicesRes.data);
        } catch (err) {
          console.warn('No local services found for this location.', err);
        }
      }

    } catch (error) {
      console.error("❌ Error fetching property data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyData();
  }, [slug]); 

  useEffect(() => {
    if (property && property.coordinates?.lat) {
      const fetchNearbyPlaces = async () => {
        try {
          setLoadingPlaces(true);
          const { lat, lng } = property.coordinates;
          const { data } = await apiClient.get(`/maps/nearby?lat=${lat}&lng=${lng}`); 
          
          const sortedData = data.sort((a, b) => 
            a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
          );

          setNearbyPlaces(sortedData);
        } catch (error) {
          console.error("Failed to fetch nearby places:", error);
        } finally {
          setLoadingPlaces(false);
        }
      };
      fetchNearbyPlaces();
    } else if (property) {
      setLoadingPlaces(false);
    }
  }, [property]); 

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText || rating === 0 || !property) return;
    try {
      setSubmitting(true);
      await apiClient.post( 
        `/reviews/${property._id}`,
        { comment: reviewText, rating },
        { withCredentials: true }
      );
      fetchPropertyData();
      setReviewText("");
      setRating(0);
      setHoverRating(0);
    } catch (error) {
      console.error("❌ Error submitting review:", error);
      alert(error.response?.data?.message || "Failed to submit review. Are you logged in?");
    } finally {
      setSubmitting(false);
    }
  };
  
  const isFavorited = user && Array.isArray(user.favorites) && user.favorites.includes(property?._id);

  const handleFavoriteClick = () => {
    if (!user || !property) {
      alert("Please log in to save properties.");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (isFavorited) {
      removeFavoriteContext(property._id);
    } else {
      addFavoriteContext(property._id);
    }
  };


  const totalPages = Math.ceil(nearbyPlaces.length / itemsPerPage);
  const currentAmenities = nearbyPlaces.slice(
    (amenitiesPage - 1) * itemsPerPage,
    amenitiesPage * itemsPerPage
  );

  const handleAmenityClick = (place) => {
    const distance = getDistance(
      property.coordinates.lat,
      property.coordinates.lng,
      place.location.lat,
      place.location.lng
    );
    setSelectedPlace({ ...place, distance });
  };
  
  
  const handleScheduleClick = () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } }); 
      return;
    }
    handleLogLead();
    setShowScheduleModal(true);
  };

  const handleStartChat = async () => {
    if (!user || !property) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    handleLogLead();
    setIsStartingChat(true);
    try {
      const { data } = await apiClient.post('/chat/conversations', { 
        propertyId: property._id
      });
      navigate(`/chat/${data._id}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert('Could not start chat. Please try again.');
    } finally {
      setIsStartingChat(false);
    }
  };

  const generateWhatsAppMessage = (agentName) => {
    const greeting = agentName ? `Hello ${agentName},` : "Hello,";
    const title = property?.title || "this property";
    const location = property?.location || "Nairobi";
    const price = property?.price ? ` listed for Ksh ${property.price.toLocaleString()}` : "";
    const link = window.location.href;

    return encodeURIComponent(
      `${greeting} I am interested in *${title}* located in *${location}*${price}. Is it still available? \n\nLink: ${link}`
    );
  };

  const currentUrl = window.location.href;
  const shareTitle = `Check out this amazing property on HouseHunt Kenya: ${property?.title || 'Property Listing'}`;

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const message = `Check out this property: ${property?.title} \n${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };
  
  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareTitle)}`, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy link.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!property) {
    return (
      <div className="text-center mt-20 text-gray-500 dark:text-gray-400">
        <p>Property not found.</p>
      </div>
    );
  }
  
  const avgRating =
    comments.length > 0
      ? (comments.reduce((acc, c) => acc + (c.rating || 0), 0) / comments.length).toFixed(1)
      : 0;
      
  // ✅ DETERMINE WHICH AGENT TO DISPLAY
  // Priority: Shadow Agent (ownerDetails) > Registered Agent (property.agent)
  const hasShadowAgent = property.ownerDetails && property.ownerDetails.name;
  const displayAgent = hasShadowAgent ? property.ownerDetails : property.agent;
  
  // If it's a shadow agent, use their specific social links. 
  // If it's a registered agent, use their profile fields.
  const agentName = hasShadowAgent ? displayAgent.name : displayAgent?.name;
  const agentWhatsapp = hasShadowAgent ? displayAgent.whatsapp : displayAgent?.whatsappNumber;
  // Shadow agent doesn't have a profile pic, use placeholder
  const agentImage = hasShadowAgent ? null : displayAgent?.profilePicture;
  
  // Shadow Socials
  const shadowTiktok = hasShadowAgent ? displayAgent.tiktok : null;
  const shadowInstagram = hasShadowAgent ? displayAgent.instagram : null;

  const isAgentOwner = user && property.agent && user._id === property.agent._id;

  return (
    <>
      <PropertySeoInjector seo={seo} property={property} /> 

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          
          <div className="md:col-span-3">
            <Breadcrumbs />
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                {property.title}
              </h1>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleFavoriteClick}
                className="flex items-center space-x-2 px-4 py-2 border rounded-lg transition dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isFavorited ? (
                  <>
                    <FaHeart className="text-red-500" />
                    <span className="dark:text-gray-200">Saved</span>
                  </>
                ) : (
                  <>
                    <FaRegHeart className="text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-200">Save Property</span>
                  </>
                )}
              </motion.button>
            </div>
            
            <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-4">
              Ksh {property.price?.toLocaleString()}
              {property.listingType === 'rent' && <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month</span>}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{property.location}</p>

            <motion.div 
              className="mb-6"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <img
                src={activeImage}
                alt={safeImageDetails?.[0]?.altText || property.title}
                className="rounded-lg w-full h-96 object-cover mb-4"
              />
              {allImageUrls.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {allImageUrls.map((imgUrl, index) => (
                    <img
                      key={imgUrl}
                      src={imgUrl}
                      alt={safeImageDetails?.[index]?.altText || `Thumbnail ${index + 1}`} 
                      onClick={() => setActiveImage(imgUrl)}
                      className={`rounded-lg w-full h-20 object-cover cursor-pointer transition ${
                        activeImage === imgUrl 
                          ? 'ring-2 ring-blue-500' 
                          : 'opacity-70 hover:opacity-100'
                      } active:scale-95`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
            
            <motion.div 
              className="mb-8"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Description</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{property.description}</p>
            </motion.div>
            
             <motion.div 
              className="mb-8"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
             >
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Location & Nearby Amenities</h2>
              {property.coordinates && property.coordinates.lat ? (
                <MapComponent 
                  coordinates={property.coordinates} 
                  places={nearbyPlaces}
                />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Map data is not available for this property.</p>
              )}
            </motion.div>

            <motion.div 
              className="mb-8"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                  What's Nearby
                </h2>
                {nearbyPlaces.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Page {amenitiesPage} of {totalPages}
                  </span>
                )}
              </div>

              {loadingPlaces ? (
                <p className="text-gray-500 dark:text-gray-400">Loading nearby amenities...</p>
              ) : nearbyPlaces.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentAmenities.map(place => (
                      <button
                        key={place.id}
                        onClick={() => handleAmenityClick(place)}
                        className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left"
                      >
                        <span className="flex-shrink-0">
                          {placeIconMap[place.type]?.icon || placeIconMap.default.icon}
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{place.name}</span>
                      </button>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <button
                        onClick={() => setAmenitiesPage(p => p - 1)}
                        disabled={amenitiesPage === 1}
                        className="px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setAmenitiesPage(p => p + 1)}
                        disabled={amenitiesPage === totalPages}
                        className="px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No popular amenities found within 1.5km.</p>
              )}
            </motion.div>

            {localServices.length > 0 && (
              <motion.div 
                className="mb-8"
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
              >
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  Neighbourhood Watch
                </h2>
                <div className="space-y-4">
                  {localServices.map(service => (
                    <Link 
                      key={service._id}
                      to={`/services/${service.slug}`} 
                      className="block group bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                          {service.title}
                        </h3>
                        <span className="text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full flex-shrink-0">
                          {service.serviceType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaStar className="text-yellow-400" size={16} />
                        <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                          {service.averageRating.toFixed(1)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          ({service.numReviews} review{service.numReviews !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            <PropertyFaqSection location={property.location.split(',')[0]} />

            <motion.div 
              className="mb-8"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
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
                      <div className="flex items-center mb-2">
                         <p className="font-bold mr-2 dark:text-gray-100">
                           {review.user ? review.user.name : "Deleted User"}
                         </p>
                         <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                size={16}
                                className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                              />
                            ))}
                         </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md dark:border dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">Property Details</h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                    property.status === 'available' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {property.status}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Listing:</span>
                  <span className="font-semibold capitalize">
                    {property.listingType}
                  </span>
                </li>
                {property.createdAt && (
                  <li className="flex justify-between">
                    <span>Listed:</span>
                    <span className="font-semibold">
                      {formatDistanceToNow(new Date(property.createdAt), { addSuffix: true })}
                    </span>
                  </li>
                )}
                
                {property.type !== 'land' && (
                  <li>Bedrooms: {property.bedrooms}</li>
                )}
                <li>Type: <span className="capitalize">{property.type || "N/A"}</span></li>
                <li>Location: {property.location}</li>
                <li>Price: Ksh {property.price?.toLocaleString()} {property.listingType === 'rent' && '/month'}</li>
              </ul>
              
              {/* ✅ CONDITIONAL SIDEBAR BUTTONS */}
              {!isAgentOwner && property.status === 'available' && (
                <div className="mt-6 flex flex-col space-y-3">
                  {/* SIDEBAR: WHATSAPP AGENT BUTTON */}
                  {agentWhatsapp && (
                    <a
                      href={`https://wa.me/${agentWhatsapp.replace(/\+/g, '')}?text=${generateWhatsAppMessage(agentName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleLogLead} 
                      className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 transition-all duration-150 active:scale-[0.98]"
                    >
                      <FaWhatsapp size={20} />
                      <span>WhatsApp Agent</span>
                    </a>
                  )}

                  <button
                    onClick={handleScheduleClick}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-[0.98]"
                  >
                    <FaCalendarAlt />
                    <span>Schedule a Viewing</span>
                  </button>
                  
                  {!hasShadowAgent && (
                    <button
                        onClick={handleStartChat}
                        disabled={isStartingChat}
                        className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-2.5 rounded-lg hover:bg-gray-700 transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                    >
                        <FaCommentDots />
                        <span>{isStartingChat ? 'Starting...' : 'Chat with Agent'}</span>
                    </button>
                  )}
                </div>
              )}

              <div className="mt-6 border-t dark:border-gray-700 pt-6">
                <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Listed By</h3>
                
                {/* ✅ ✅ ✅ UPDATED "LISTED BY" SECTION TO SHOW SHADOW AGENT ✅ ✅ ✅ */}
                {displayAgent ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 group">
                        {agentImage ? (
                            <Link to={`/agent/${displayAgent._id}`}>
                                <img 
                                    src={agentImage} 
                                    alt={agentName}
                                    className="w-16 h-16 rounded-full object-cover transition hover:opacity-90"
                                />
                            </Link>
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <FaUserCircle className="text-gray-500 dark:text-gray-400" size={40} />
                            </div>
                        )}
                        
                        <div>
                            <p className="text-gray-800 dark:text-gray-200 font-semibold text-lg">
                                {hasShadowAgent ? agentName : (
                                    <Link to={`/agent/${displayAgent._id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                                        {agentName}
                                    </Link>
                                )}
                            </p>
                            
                            {/* Show Socials for Shadow Agent */}
                            {hasShadowAgent ? (
                                <div className="flex items-center space-x-2 mt-1">
                                    {agentWhatsapp && (
                                        <a
                                            href={`https://wa.me/${agentWhatsapp.replace(/\+/g, '')}?text=${generateWhatsAppMessage(agentName)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-500 hover:text-green-600 transition"
                                            onClick={handleLogLead}
                                        >
                                            <FaWhatsapp size={18} />
                                        </a>
                                    )}
                                    {shadowTiktok && (
                                        <a
                                            href={`https://tiktok.com/${shadowTiktok.startsWith('@') ? '' : '@'}${shadowTiktok.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition"
                                            onClick={handleLogLead}
                                        >
                                            <FaTiktok size={16} />
                                        </a>
                                    )}
                                    {shadowInstagram && (
                                        <a
                                            href={`https://instagram.com/${shadowInstagram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-pink-500 hover:text-pink-600 transition"
                                            onClick={handleLogLead}
                                        >
                                            <FaInstagram size={18} />
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Registered Agent</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Quick Whatsapp Button on Right */}
                    {agentWhatsapp && (
                        <a
                            href={`https://wa.me/${agentWhatsapp.replace(/\+/g, '')}?text=${generateWhatsAppMessage(agentName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition shadow-sm"
                            aria-label="Chat on WhatsApp"
                            onClick={handleLogLead}
                        >
                            <FaWhatsapp size={20} />
                        </a>
                    )}
                  </div>
                  
                ) : (
                  <div className="flex items-center space-x-3 opacity-60">
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <FaUserSlash className="text-gray-500 dark:text-gray-400" size={24} />
                    </div>
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                        Agent Not Available
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">This agent's account has been removed.</p>
                    </div>
                  </div>
                )}
              </div>


              <div className="mt-6 border-t dark:border-gray-700 pt-6">
                <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Share This Property</h3>
                <div className="flex flex-wrap gap-3 justify-start">
                  <button 
                    onClick={shareOnFacebook} 
                    className="flex-1 min-w-[50px] flex justify-center items-center p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md"
                    aria-label="Share on Facebook"
                  >
                    <FaFacebookF size={20} />
                  </button>
                  <button 
                    onClick={shareOnTwitter} 
                    className="flex-1 min-w-[50px] flex justify-center items-center p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-md"
                    aria-label="Share on Twitter"
                  >
                    <FaTwitter size={20} />
                  </button>
                  <button 
                    onClick={shareOnWhatsApp} 
                    className="flex-1 min-w-[50px] flex justify-center items-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
                    aria-label="Share on WhatsApp"
                  >
                    <FaWhatsapp size={20} />
                  </button>
                  <button 
                    onClick={shareOnLinkedIn} 
                    className="flex-1 min-w-[50px] flex justify-center items-center p-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors shadow-md"
                    aria-label="Share on LinkedIn"
                  >
                    <FaLinkedinIn size={20} />
                  </button>
                  <button 
                    onClick={copyToClipboard} 
                    className="flex-1 min-w-[50px] flex justify-center items-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
                    aria-label="Copy link to clipboard"
                  >
                    <FaCopy size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Show Agent Properties if it's a registered agent */}
        {!hasShadowAgent && agentProperties.length > 0 && property.agent && (
          <section className="max-w-6xl mx-auto mt-16">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
              More from {property.agent.name}
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {agentProperties.map((prop) => (
                <PropertyCard key={prop._id} property={prop} />
              ))}
            </div>
          </section>
        )}
      </div>

      <AnimatePresence>
        <ScheduleModal
          show={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          propertyId={property?._id}
          propertyTitle={property.title}
        />
      </AnimatePresence>
      
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedPlace(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPlace(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <FaTimes size={20} />
              </button>
              
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">
                  {placeIconMap[selectedPlace.type]?.icon || placeIconMap.default.icon}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {selectedPlace.name}
                  </h3>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {placeIconMap[selectedPlace.type]?.label || placeIconMap.default.label}
                  </p> 
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Proximity:</span> {selectedPlace.distance} km away
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Address:</span> {selectedPlace.vicinity}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertyDetails;