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
  FaTiktok,      // 1. IMPORT TIKTOK ICON
  FaInstagram    // 2. IMPORT INSTAGRAM ICON
} from "react-icons/fa"; 
import MapComponent from "../components/MapComponent";
import { useAuth } from "../context/AuthContext"; 
import PropertyCard from "../components/PropertyCard";
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Helmet } from 'react-helmet-async';


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
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d.toFixed(1); // Return distance rounded to 1 decimal place
}

// 🚀 UTILITY FUNCTION FOR BACKWARD COMPATIBILITY
const getSafeImageDetails = (imagesArray, propertyTitle) => {
    if (!Array.isArray(imagesArray) || imagesArray.length === 0) {
        return [];
    }

    return imagesArray.map((img, index) => {
        if (typeof img === 'string') {
            // Old format (just URL string)
            return {
                url: img,
                altText: `${propertyTitle} image ${index + 1}`
            };
        }
        // New format (object {url, altText})
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

// 🚀 --- SEO INJECTOR COMPONENT ---
const PropertySeoInjector = ({ seo, property }) => {
    
    // Use the safe utility function here
    const safeImages = getSafeImageDetails(property.images, property.title);

    const generatePropertySchema = () => {
        const schema = [];
        
        // 1. FAQ Schema (if FAQs exist)
        if (seo.faqs && seo.faqs.length > 0) {
            schema.push({
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
            });
        }
        
        // 2. Real Estate Listing Schema (essential for SEO)
        if (property && property.coordinates?.lat) {
            
            // Get the URL of the first image
            const firstImageUrl = safeImages.length > 0 ? safeImages[0].url : placeholderImage;

            schema.push({
                "@context": "https://schema.org",
                "@type": property.listingType === 'sale' ? "HouseForSale" : "RentalListing",
                "name": seo.metaTitle || property.title,
                "description": seo.metaDescription || property.description?.substring(0, 160),
                "url": window.location.href,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": property.location,
                    "addressRegion": "Kenya",
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": property.coordinates.lat,
                    "longitude": property.coordinates.lng
                },
                "numberOfBedrooms": property.bedrooms,
                "offers": {
                    "@type": "Offer",
                    "price": property.price,
                    "priceCurrency": "KES",
                    "availability": property.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                    "seller": {
                      "@type": "RealEstateAgent",
                      // --- UPDATED FOR SOFT DELETE & OWNER DETAILS ---
                      // Check if agent exists, then owner, then fallback.
                      "name": property.agent?.name || property.ownerDetails?.name || 'HouseHunt Kenya',
                    }
                },
                "image": firstImageUrl,
                "datePosted": property.createdAt,
            });
        }
        
        return schema;
    };

    const schemaData = generatePropertySchema();

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{seo.metaTitle}</title>
            <meta name="description" content={seo.metaDescription} />
            <meta name="author" content="HouseHunt Kenya" />

            {/* Open Graph / Social Media Tags */}
            <meta property="og:title" content={seo.metaTitle} />
            <meta property="og:description" content={seo.metaDescription} />
            <meta property="og:url" content={window.location.href} />
            <meta property="og:type" content="article" />
            {/* Fallback to the first image URL */}
            <meta property="og:image" content={
                safeImages.length > 0 ? safeImages[0].url : placeholderImage
            } /> 

            {/* Schema Structured Data */}
            {schemaData.map((schema, index) => (
                <script 
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
        </Helmet>
    );
};
// ----------------------------------------


const PropertyDetails = () => {
  // ✅ --- CHANGE 1: Get 'slug' from URL instead of 'id' ---
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

  // ✅ --- 1. ADD NEW STATE FOR LOCAL SERVICES ---
  const [localServices, setLocalServices] = useState([]);

  // ✅ NEW STATE: SEO Data
  const [seo, setSeo] = useState({
      metaTitle: 'Loading Property Details...',
      metaDescription: 'Loading...',
      faqs: [],
      schemaDescription: '',
  });

  // ✅ --- 1. ADD HANDLER TO LOG LEADS (FOR ANALYTICS) ---
  const handleLogLead = () => {
    // Ensure property and _id exist before firing
    if (!property || !property._id) return; 

    // Fire-and-forget: We don't care about the response.
    // This runs in the background.
    apiClient.post(`/properties/${property._id}/log-lead`)
      .catch(err => console.error("Error logging lead:", err)); // Log for debugging
  };
  // ----------------------------------------------------

  // Derived state for backward-compatible image access
  const safeImageDetails = property ? getSafeImageDetails(property.images, property.title) : [];
  const allImageUrls = safeImageDetails.map(img => img.url);


  // ✅ --- CHANGE 2: Restructure data fetching ---
  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      setAgentProperties([]); 
      
      // STEP 1: Fetch property by SLUG
      const propertyRes = await apiClient.get(`/properties/slug/${slug}`); 
      const propData = propertyRes.data;
      const propertyId = propData._id; // Get the _id from the fetched data
      setProperty(propData);
      
      // FIX 1: Set Active Image using the safe list
      const imagesList = getSafeImageDetails(propData.images, propData.title);
      const urlsList = imagesList.map(img => img.url);
      setActiveImage(urlsList[0] || placeholderImage);
      // -------------------------------------------------------------------

      // STEP 2: Now that we have the propertyId, fetch associated data
      
      // Fetch agent properties
      // --- UPDATED FOR SOFT DELETE ---
      // Only fetch if the agent exists (is not null)
      if (propData.agent && propData.agent._id) {
        const agentRes = await apiClient.get(`/properties/by-agent/${propData.agent._id}`); 
        setAgentProperties(agentRes.data.filter(p => p._id !== propertyId)); // Use propertyId
      }

      // Fetch reviews
      const reviewsRes = await apiClient.get(`/reviews/${propertyId}`); // Use propertyId
      setComments(reviewsRes.data || []);
      
      // 🚀 --- SEO FETCH LOGIC FOR DYNAMIC PAGE ---
      const encodedPath = encodeURIComponent(`/properties/${slug}`); // Use slug
      const seoRes = await apiClient.get(`/seo/${encodedPath}`);
      
      // Create fallbacks using property data
      const defaultTitle = propData.title || 'Property Listing';
      const defaultDescription = propData.description 
        ? propData.description.substring(0, 160) + '...'
        : 'View the full details and contact the agent for this property.';
        
      setSeo({
          // Use fetched SEO data, otherwise fall back to defaults
          metaTitle: seoRes.data.metaTitle || defaultTitle,
          metaDescription: seoRes.data.metaDescription || defaultDescription,
          faqs: seoRes.data.faqs || [],
          schemaDescription: seoRes.data.schemaDescription || '',
      });
      // ----------------------------------------
      
      // ✅ --- 2. FETCH LOCAL SERVICES BASED ON PROPERTY LOCATION ---
      if (propData.location) {
        try {
          // Extract the primary location (e.g., "Kilimani" from "Kilimani, Nairobi")
          const primaryLocation = propData.location.split(',')[0].trim();
          const servicesRes = await apiClient.get(`/services/location/${primaryLocation}`);
          setLocalServices(servicesRes.data);
        } catch (err) {
          console.warn('No local services found for this location.', err);
        }
      }
      // ----------------------------------------------------

    } catch (error) {
      console.error("❌ Error fetching property data:", error);
      // Fallback SEO title on hard error
      setSeo(prev => ({ ...prev, metaTitle: 'Property Not Found | HouseHunt' }));
    } finally {
      setLoading(false);
    }
  };

  // ✅ --- CHANGE 3: Update useEffect dependency ---
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

  // ✅ --- CHANGE 4: Use property._id for review submit ---
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText || rating === 0 || !property) return;
    try {
      setSubmitting(true);
      await apiClient.post( 
        `/reviews/${property._id}`, // Use property._id
        { comment: reviewText, rating },
        { withCredentials: true }
      );
      // --- UPDATED FOR SOFT DELETE ---
      // We must re-fetch all data, as our new comment
      // now needs to populate the `user` field from the backend.
      fetchPropertyData();
      // -----------------------------
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
  
  // ✅ --- CHANGE 5: Use property?._id for favorite check ---
  const isFavorited = user && Array.isArray(user.favorites) && user.favorites.includes(property?._id);

  const handleFavoriteClick = () => {
    if (!user || !property) {
      alert("Please log in to save properties.");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    // ✅ --- CHANGE 6: Use property._id for favorite context ---
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
    handleLogLead(); // ✅ --- 2. ADD LEAD LOG ---
    setShowScheduleModal(true);
  };

  // ✅ --- CHANGE 7: Use property._id for starting chat ---
  const handleStartChat = async () => {
    if (!user || !property) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    handleLogLead(); // ✅ --- 3. ADD LEAD LOG ---
    setIsStartingChat(true);
    try {
      const { data } = await apiClient.post('/chat/conversations', { 
        propertyId: property._id // Use property._id
      });
      navigate(`/chat/${data._id}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert('Could not start chat. Please try again.');
    } finally {
      setIsStartingChat(false);
    }
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
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + currentUrl)}`, '_blank');
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
      
  const isAgentOwner = user && property.agent && user._id === property.agent._id;

  return (
    <>
      {/* 🚀 INJECT DYNAMIC SEO AND SCHEMA */}
      <PropertySeoInjector seo={seo} property={property} /> 

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
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

            {/* ✅ --- 3. ADD THE NEW NEIGHBOURHOOD WATCH SECTION --- */}
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
            {/* --- END OF NEW SECTION --- */}

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
                         {/* --- 2. UPDATED FOR DELETED USER --- */}
                         {/* If review.user exists, show their name. If it's null, show 'Deleted User'. */}
                         <p className="font-bold mr-2 dark:text-gray-100">
                           {review.user ? review.user.name : "Deleted User"}
                         </p>
                         {/* ------------------------------------ */}
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
              
              {/* --- 3. UPDATED FOR DELETED AGENT --- */}
              {/* These buttons will only show if the agent is NOT the owner, 
                  the property is available, AND the agent exists (is not null). */}
              {!isAgentOwner && property.status === 'available' && property.agent && (
                <div className="mt-6 flex flex-col space-y-3">
                  <button
                    onClick={handleScheduleClick}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-[0.98]"
                  >
                    <FaCalendarAlt />
                    <span>Schedule a Viewing</span>
                  </button>
                  <button
                    onClick={handleStartChat}
                    disabled={isStartingChat}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-2.5 rounded-lg hover:bg-gray-700 transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                  >
                    <FaCommentDots />
                    <span>{isStartingChat ? 'Starting...' : 'Chat with Agent'}</span>
                  </button>
                </div>
              )}
              {/* ------------------------------------ */}

              {/* --- 3. UPDATED "LISTED BY" CARD --- */}
              <div className="mt-6 border-t dark:border-gray-700 pt-6">
                <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Listed By</h3>
                
                {/* Case 1: Agent EXISTS (On-platform) */}
                {property.agent ? (
                  <Link 
                    to={`/agent/${property.agent._id}`} 
                    className="flex items-center space-x-3 group transition-transform duration-150 active:scale-[0.99]"
                  >
                    <img 
                      src={property.agent.profilePicture} 
                      alt={property.agent.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 font-semibold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {property.agent.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{property.agent.email}</p>
                    </div>
                  </Link>
                  
                /* Case 2: OwnerDetails EXIST (Off-platform) */
                ) : property.ownerDetails && property.ownerDetails.name ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <FaUserSlash className="text-gray-500 dark:text-gray-400" size={24} />
                    </div>
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 font-semibold text-lg">
                        {property.ownerDetails.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Property Owner/Agent</p>
                      {/* Social Media Links */}
                      <div className="flex items-center space-x-3">
                        {property.ownerDetails.whatsapp && (
                          <a
                            href={`https://wa.me/${property.ownerDetails.whatsapp.replace(/\+/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-500 hover:text-green-600 transition"
                            aria-label="Chat on WhatsApp"
                            onClick={handleLogLead} 
                          >
                            <FaWhatsapp size={20} />
                          </a>
                        )}
                        {property.ownerDetails.instagram && (
                          <a
                            href={`https://instagram.com/${property.ownerDetails.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-500 hover:text-pink-600 transition"
                            aria-label="View on Instagram"
                            onClick={handleLogLead} 
                          >
                            <FaInstagram size={20} />
                          </a>
                        )}
                        {property.ownerDetails.tiktok && (
                          <a
                            href={`https://tiktok.com/${property.ownerDetails.tiktok.startsWith('@') ? '' : '@'}${property.ownerDetails.tiktok.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
                            aria-label="View on TikTok"
                            onClick={handleLogLead} 
                          >
                            <FaTiktok size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                /* Case 3: NO Agent and NO OwnerDetails (Fallback) */
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
              {/* --- END OF "LISTED BY" CARD UPDATE --- */}


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

        {/* --- UPDATED FOR DELETED AGENT --- */}
        {/* Only show "More from" if the agent exists */}
        {agentProperties.length > 0 && property.agent && (
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
        {/* ✅ --- CHANGE 8: Pass property._id to the modal --- */}
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
                  </p> {/* ✅ --- THIS IS THE FIX --- */}
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