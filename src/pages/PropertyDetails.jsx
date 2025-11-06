import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import { FaStar, FaWhatsapp, FaHeart, FaRegHeart } from "react-icons/fa";
import MapComponent from "../components/MapComponent";
import { useAuth } from "../context/AuthContext"; 
import PropertyCard from "../components/PropertyCard";

const placeholderImage = "https://placehold.co/1000x600/e2e8f0/64748b?text=No+Image+Available";

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
  
  // ✅ FIX: Check if favorites is an array before using .includes()
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
      
  const allImages = (property.images && property.images.length > 0)
    ? property.images
    : (property.imageUrl ? [property.imageUrl] : [placeholderImage]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2">
           <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
              {property.title}
            </h1>
            {user && (
              <button
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
              </button>
            )}
          </div>
          
          <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-4">
            Ksh {property.price?.toLocaleString()}
            {property.listingType === 'rent' && <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month</span>}
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{property.location}</p>

          <div className="mb-6">
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
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Description</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{property.description}</p>
          </div>
           <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Location Map</h2>
            {property.coordinates && property.coordinates.lat ? (
              <MapComponent coordinates={property.coordinates} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Map data is not available for this property.</p>
            )}
          </div>
          <div className="mb-8">
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
                      className={`cursor-pointer ${
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
                  className={`bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition ${
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
          </div>
        </div>

        {/* Sidebar */}
        <div>
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
              {property.type !== 'land' && (
                <li>Bedrooms: {property.bedrooms}</li>
              )}
              <li>Type: <span className="capitalize">{property.type || "N/A"}</span></li>
              <li>Location: {property.location}</li>
              <li>Price: Ksh {property.price?.toLocaleString()} {property.listingType === 'rent' && '/month'}</li>
            </ul>

            {property.agent && (
              <div className="mt-6 border-t dark:border-gray-700 pt-6">
                <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Listed By</h3>
                <Link 
                  to={`/agent/${property.agent._id}`} 
                  className="flex items-center space-x-3 group"
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
                    className="mt-4 w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 transition"
                  >
                    <FaWhatsapp size={20} />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* "More from this Agent" Section */}
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
  );
};

export default PropertyDetails;