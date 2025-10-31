// src/components/PropertyCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function PropertyCard({ property }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/properties/${property._id}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={`http://localhost:5000${property.imageUrl || "/uploads/default.jpg"}`}
          alt={property.title}
          className="w-full h-56 object-cover"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full uppercase font-semibold">
          {property.bedrooms} Beds • {property.bathrooms} Baths
        </span>
      </div>

      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
          {property.title}
        </h2>
        <p className="text-gray-600 text-sm line-clamp-1">{property.location}</p>

        <p className="text-blue-700 font-bold text-lg mt-2">
          Ksh {property.price?.toLocaleString()}
        </p>

        <button
          onClick={handleViewDetails}
          className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          View Details
        </button>
      </div>
    </div>
  );
}