import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const placeholderImage = "https://placehold.co/400x300/e2e8f0/64748b?text=No+Image";

export default function PropertyCard({ property }) {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const images = (property.images && property.images.length > 0)
    ? property.images
    : (property.imageUrl ? [property.imageUrl] : [placeholderImage]);

  useEffect(() => {
    if (isHovering && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 1000); 
      return () => clearInterval(interval);
    }
  }, [isHovering, images.length]);

  const handleViewDetails = () => {
    navigate(`/properties/${property._id}`);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl dark:border dark:border-gray-700 dark:hover:border-gray-600 transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setCurrentImageIndex(0);
      }}
    >
      <div className="relative">
        <img
          src={images[currentImageIndex]} 
          alt={property.title}
          className="w-full h-56 object-cover transition-opacity duration-300"
          loading="lazy"
        />
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
              ></div>
            ))}
          </div>
        )}
        
        {/* ✅ FIX: Top-left badge for Beds (conditional) */}
        {property.type !== 'land' && (
          <span className="absolute top-3 left-3 bg-blue-600 dark:bg-blue-700 text-white dark:text-blue-100 text-xs px-3 py-1 rounded-full uppercase font-semibold">
            {property.bedrooms} Beds
          </span>
        )}
        
        {/* ✅ MODIFIED: Top-right badge for Listing Type */}
        <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full uppercase font-semibold">
          {property.listingType}
        </span>
      </div>
      
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
          {property.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">{property.location}</p>

        <p className="text-blue-700 dark:text-blue-400 font-bold text-lg mt-2">
          Ksh {property.price?.toLocaleString()} 
          {/* Add '/month' for rentals */}
          {property.listingType === 'rent' && <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month</span>}
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