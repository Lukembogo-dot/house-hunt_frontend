import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; 
import apiClient from "../api/axios";
import { FaStar } from "react-icons/fa";
import MapComponent from "../components/MapComponent";
import { useAuth } from "../context/AuthContext"; 

const placeholderImage = "https://placehold.co/1000x600/e2e8f0/64748b?text=No+Image+Available";

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth(); 
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  // ✅ 1. State to track the active main image
  const [activeImage, setActiveImage] = useState(null);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      const propertyRes = await apiClient.get(`/properties/${id}`);
      setProperty(propertyRes.data);
      
      // ✅ 2. Set the active image when data is fetched
      if (propertyRes.data.images && propertyRes.data.images.length > 0) {
        setActiveImage(propertyRes.data.images[0]);
      } else if (propertyRes.data.imageUrl) {
        setActiveImage(propertyRes.data.imageUrl); // Fallback for old properties
      } else {
        setActiveImage(placeholderImage);
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

  // (handleReviewSubmit, loading/no-property checks are unchanged)
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
      
  // ✅ 3. Get the list of all images (new format or old)
  const allImages = (property.images && property.images.length > 0)
    ? property.images
    : (property.imageUrl ? [property.imageUrl] : [placeholderImage]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">{property.title}</h1>
          <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-4">
            Ksh {property.price?.toLocaleString()}
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{property.location}</p>

          {/* ✅ 4. Main Image + Grid Layout */}
          <div className="mb-6">
            <img
              src={activeImage} // Show the active image
              alt="Main"
              className="rounded-lg w-full h-96 object-cover mb-4"
            />
            {/* Render the grid only if there's more than 1 image */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl}
                    alt={`Thumbnail ${index + 1}`}
                    onClick={() => setActiveImage(imgUrl)} // Set as active on click
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

          {/* (Rest of the component is unchanged) */}
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
              <li>Bedrooms: {property.bedrooms}</li>
              <li>Bathrooms: {property.bathrooms}</li>
              <li>Type: {property.type || "N/A"}</li>
              <li>Location: {property.location}</li>
              <li>Price: Ksh {property.price?.toLocaleString()}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;