import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import MapComponent from "../components/MapComponent"; // ✅ 1. Import the map component

const PropertyDetails = () => {
  const { id } = useParams();
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
      const propertyRes = await axios.get(`http://localhost:5000/api/properties/${id}`);
      setProperty(propertyRes.data);
      const reviewsRes = await axios.get(`http://localhost:5000/api/reviews/${id}`);
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
      await axios.post(
        `http://localhost:5000/api/reviews/${id}`,
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center mt-20 text-gray-500">
        <p>Property not found.</p>
      </div>
    );
  }

  const avgRating =
    comments.length > 0
      ? (comments.reduce((acc, c) => acc + (c.rating || 0), 0) / comments.length).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{property.title}</h1>
          <p className="text-xl text-blue-600 font-semibold mb-4">
            Ksh {property.price?.toLocaleString()}
          </p>
          <p className="text-gray-600 mb-4">{property.location}</p>

          <div className="mb-6">
            {property.imageUrl && (
              <img
                src={`http://localhost:5000${property.imageUrl}`}
                alt="Main"
                className="rounded-lg w-full h-96 object-cover mb-4"
              />
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed">{property.description}</p>
          </div>

          {/* ✅ 2. Add the Map Section here */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Location Map</h2>
            {property.coordinates && property.coordinates.lat ? (
              <MapComponent coordinates={property.coordinates} />
            ) : (
              <p className="text-gray-500">Map data is not available for this property.</p>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Reviews ({comments.length}) ⭐ {avgRating}
            </h2>

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
                className="w-full px-4 py-3 border rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
              <button
                type="submit"
                disabled={submitting}
                className={`bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition ${
                  submitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>

            {comments.length > 0 ? (
              <ul className="space-y-4">
                {comments.map((review) => (
                  <li key={review._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center mb-2">
                       <p className="font-bold mr-2">{review.user?.name || "Anonymous"}</p>
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
                    <p>{review.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No reviews yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-3">Property Details</h3>
            <ul className="text-gray-700">
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