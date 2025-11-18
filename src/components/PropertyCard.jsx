// src/components/PropertyCard.jsx
// (UPDATED - Added Sold/Rented Badges & Safe Handling)

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// --- 1. IMPORT FaStar AND NEW ICONS ---
import { FaHeart, FaRegHeart, FaStar, FaCheckCircle } from "react-icons/fa";
import { motion } from 'framer-motion';

const placeholderImage = "https://placehold.co/400x300/e2e8f0/64748b?text=No+Image";

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


export default function PropertyCard({ property }) {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  const { user, addFavoriteContext, removeFavoriteContext } = useAuth();
  
  // 🚀 FIX: Use the safe utility function to get compatible images
  const safeImageDetails = getSafeImageDetails(property.images, property.title);
  
  // Extract URLs for display
  const images = safeImageDetails.length > 0
    ? safeImageDetails.map(img => img.url)
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
    // ✅ --- SAFE NAVIGATION CHECK ---
    // If it's a sold property, we might not want to open details or handle it differently
    if (property.status === 'sold' || property.status === 'rented') {
       // Optional: Could navigate to a specific sold view or do nothing.
       // For now, we keep the navigation but ensure the PropertyDetails page handles "sold" items gracefully (backend logic handles this).
    }
    navigate(`/properties/${property.slug}`);
  };

  const isFavorited = user && Array.isArray(user.favorites) && user.favorites.includes(property._id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); 
    if (!user) {
      alert("Please log in to save properties.");
      navigate("/login");
      return;
    }

    if (isFavorited) {
      removeFavoriteContext(property._id);
    } else {
      addFavoriteContext(property._id);
    }
  };

  // ✅ --- CHECK FOR SOLD/RENTED STATUS ---
  const isSoldOrRented = property.status === 'sold' || property.status === 'rented';

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl dark:border dark:border-gray-700 dark:hover:border-gray-600 transition-all duration-300 overflow-hidden relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setCurrentImageIndex(0);
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* ✅ --- OVERLAY FOR SOLD PROPERTIES (Optional visual dimming) --- */}
      {isSoldOrRented && (
        <div className="absolute inset-0 bg-gray-900/10 z-10 pointer-events-none" />
      )}

      <div className="relative">
        {/* Only show favorite button if NOT sold/rented */}
        {user && !isSoldOrRented && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 z-20 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition"
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorited ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          </motion.button>
        )}

        <img
          src={images[currentImageIndex]} 
          // 🚀 FIX: Get Alt Text from the safe details object
          alt={safeImageDetails?.[currentImageIndex]?.altText || property.title} 
          className={`w-full h-56 object-cover transition-opacity duration-300 ${isSoldOrRented ? 'grayscale-[50%]' : ''}`}
          loading="lazy"
          onClick={handleViewDetails} 
          style={{ cursor: 'pointer' }} 
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
        
        {property.type !== 'land' && (
          <span className="absolute top-3 left-3 bg-blue-600 dark:bg-blue-700 text-white dark:text-blue-100 text-xs px-3 py-1 rounded-full uppercase font-semibold z-20">
            {property.bedrooms} Beds
          </span>
        )}
        
        <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full uppercase font-semibold z-20">
          {property.listingType}
        </span>
        
        {/* --- 2. NEW "FEATURED" BADGE (Only if Available) --- */}
        {property.isFeatured && property.status === 'available' && (
          <span className="absolute top-3 right-3 z-20 flex items-center bg-yellow-400 text-gray-900 text-xs px-3 py-1 rounded-full uppercase font-semibold">
            <FaStar className="mr-1.5" />
            Featured
          </span>
        )}
        {/* --- END OF NEW BADGE --- */}
        
        {/* ✅ --- NEW SOLD/RENTED BADGE --- */}
        {isSoldOrRented && (
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full uppercase shadow-lg flex items-center gap-2">
            <FaCheckCircle /> {property.status}
          </span>
        )}
        
      </div>
      
      <div className="p-4">
        <h2 
          className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
          onClick={handleViewDetails}
        >
          {property.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">{property.location}</p>

        <p className="text-blue-700 dark:text-blue-400 font-bold text-lg mt-2">
          Ksh {property.price?.toLocaleString()} 
          {property.listingType === 'rent' && <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/month</span>}
        </p>

        <button
          onClick={handleViewDetails}
          className={`mt-3 w-full py-2 rounded-lg transition duration-150 active:scale-[0.98] ${
            isSoldOrRented 
            ? 'bg-gray-400 text-white cursor-not-allowed dark:bg-gray-600' 
            : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
          }`}
        >
          {isSoldOrRented ? 'Archived' : 'View Details'}
        </button>
      </div>
    </motion.div>
  );
}