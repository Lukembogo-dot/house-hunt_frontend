import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import { 
  FaStar, FaWhatsapp, FaHeart, FaRegHeart, 
  FaSchool, FaHospital, FaShoppingCart, FaUtensils,
  FaShoppingBag, FaShieldAlt, FaHotel, FaTree, FaLandmark, FaTimes,
  FaCalendarAlt,
  FaCommentDots // ✅ 1. Import new icon
} from "react-icons/fa"; 
import MapComponent from "../components/MapComponent";
import { useAuth } from "../context/AuthContext"; 
import PropertyCard from "../components/PropertyCard";
import { motion, AnimatePresence } from 'framer-motion';

// ... (sectionVariants, placeIconMap, placeholderImage, getDistance are unchanged) ...
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

// ... (ScheduleModal component is unchanged) ...
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


const PropertyDetails = () => {
  const { id } = useParams();
  const { user, addFavoriteContext, removeFavoriteContext } = useAuth(); 
  const navigate = useNavigate(); 
  
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

  // ✅ 2. Add new state for chat button
  const [isStartingChat, setIsStartingChat] = useState(false);

  // ... (fetchPropertyData, useEffect, handleReviewSubmit, etc. are all unchanged) ...
  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      setAgentProperties([]); 
      const propertyRes = await apiClient.get(`/properties/${id}`);
      setProperty(propertyRes.data);
      
      let imagesToSet = [];
      if (propertyRes.data.images && propertyRes.data.images.length > 0) {
        imagesToSet = propertyRes.data.images;
      } else if (propertyRes.data.imageUrl) {
        imagesToSet = [propertyRes.data.imageUrl];
      }
      setActiveImage(imagesToSet[0] || placeholderImage);

      if (propertyRes.data.agent?._id) {
        const agentRes = await apiClient.get(`/properties/by-agent/${propertyRes.data.agent._id}`);
        setAgentProperties(agentRes.data.filter(p => p._id !== id));
      }

      const reviewsRes = await apiClient.get(`/reviews/${id}`);
      setComments(reviewsRes.data || []);
    } catch (error) {
      console.error("❌ Error fetching property data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyData();
  }, [id]); 

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
    if (!reviewText || rating === 0) return;
    try {
      setSubmitting(true);
      await apiClient.post(
        `/reviews/${id}`,
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
  
  const isFavorited = user && Array.isArray(user.favorites) && user.favorites.includes(id);

  const handleFavoriteClick = () => {
    if (!user) {
      alert("Please log in to save properties.");
      navigate("/login");
      return;
    }
    if (isFavorited) {
      removeFavoriteContext(id);
    } else {
      addFavoriteContext(id);
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

  // ✅ 3. Add new handler for starting a chat
  const handleStartChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsStartingChat(true);
    try {
      const { data } = await apiClient.post('/chat/conversations', { 
        propertyId: id 
      });
      // On success, navigate to the new chat page with the conversation ID
      navigate(`/chat/${data._id}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert('Could not start chat. Please try again.');
    } finally {
      setIsStartingChat(false);
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
  
  // ... (avgRating, allImages declarations are unchanged) ...
  const avgRating =
    comments.length > 0
      ? (comments.reduce((acc, c) => acc + (c.rating || 0), 0) / comments.length).toFixed(1)
      : 0;
      
  const allImages = (property.images && property.images.length > 0)
    ? property.images
    : (property.imageUrl ? [property.imageUrl] : [placeholderImage]);

  const isAgentOwner = user && user._id === property.agent?._id;

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
             {/* ... (Property title, price, location, images, description, map... all unchanged) ... */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                {property.title}
              </h1>
              {user && (
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
              )}
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
                alt="Main"
                className="rounded-lg w-full h-96 object-cover mb-4"
              />
              {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {allImages.map((imgUrl, index) => (
                    <img
                      key={index}
                      src={imgUrl}
                      alt={`Thumbnail ${index + 1}`}
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

            {/* ... (Reviews section is unchanged) ... */}
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
                         <p className="font-bold mr-2 dark:text-gray-100">{review.user?.name || "Anonymous"}</p>
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
              {/* ... (Property Details list is unchanged) ... */}
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
                {property.type !== 'land' && (
                  <li>Bedrooms: {property.bedrooms}</li>
                )}
                <li>Type: <span className="capitalize">{property.type || "N/A"}</span></li>
                <li>Location: {property.location}</li>
                <li>Price: Ksh {property.price?.toLocaleString()} {property.listingType === 'rent' && '/month'}</li>
              </ul>
              
              {/* ✅ 4. UPDATED Button Section */}
              {user && !isAgentOwner && property.status === 'available' && (
                <div className="mt-6 flex flex-col space-y-3">
                  <button
                    onClick={() => setShowScheduleModal(true)}
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

              {/* ... (Agent details box is unchanged) ... */}
              {property.agent && (
                <div className="mt-6 border-t dark:border-gray-700 pt-6">
                  <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Listed By</h3>
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
                  {property.agent.whatsappNumber && (
                    <a
                      href={`https://wa.me/${property.agent.whatsappNumber.replace(/\+/g, '')}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 transition-all duration-150 active:scale-[0.98]"
                    >
                      <FaWhatsapp size={20} />
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ... ("More from this Agent" section is unchanged) ... */}
        {agentProperties.length > 0 && (
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

      {/* ... (Modals: ScheduleModal, AnimatePresence, etc. - unchanged) ... */}
      <AnimatePresence>
        <ScheduleModal
          show={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          propertyId={id}
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
            onClick={() => setSelectedPlace(null)} // Click background to close
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6 relative"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal
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