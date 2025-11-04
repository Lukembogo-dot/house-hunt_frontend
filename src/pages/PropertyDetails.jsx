import React, { useEffect, useState } from "react";
// ✅ FIX 1: Import 'Link' from react-router-dom
import { useParams, Link } from "react-router-dom"; 
import apiClient, { API_BASE_URL } from "../api/axios"; // API_BASE_URL is no longer needed here for images
import { FaStar } from "react-icons/fa";
import MapComponent from "../components/MapComponent";
import { useAuth } from "../context/AuthContext"; 

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

  // Fetch property and its reviews
  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      const propertyRes = await apiClient.get(`/properties/${id}`);
      setProperty(propertyRes.data);
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

  // Submit review/comment
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

          <div className="mb-6">
            {property.imageUrl && (
              <img
                // ✅ FIX 2: Use property.imageUrl directly. Cloudinary provides a full URL.
                src={property.imageUrl} 
                alt="Main"
                className="rounded-lg w-full h-96 object-cover mb-4"
              />
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