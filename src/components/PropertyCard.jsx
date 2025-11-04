// src/components/PropertyCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/axios"; // Import base URL

export default function PropertyCard({ property }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/properties/${property._id}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl dark:border dark:border-gray-700 dark:hover:border-gray-600 transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={`${API_BASE_URL}${property.imageUrl || "/uploads/default.jpg"}`} // Use live URL
          alt={property.title}
          className="w-full h-56 object-cover"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-blue-600 dark:bg-blue-700 text-white dark:text-blue-100 text-xs px-3 py-1 rounded-full uppercase font-semibold">
          {property.bedrooms} Beds • {property.bathrooms} Baths
        </span>
      </div>

      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
          {property.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">{property.location}</p>

        <p className="text-blue-700 dark:text-blue-400 font-bold text-lg mt-2">
          Ksh {property.price?.toLocaleString()}
        </p>

        <button
          onClick={handleViewDetails}
          className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          View Details
        </button>
      </div>
    </div>
  );
}