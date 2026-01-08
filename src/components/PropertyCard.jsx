// src/components/PropertyCard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/formatPrice";
import {
  FaHeart, FaRegHeart, FaStar, FaCheckCircle,
  FaInfoCircle, FaArrowRight, FaTimes, FaPlayCircle,
  FaHandshake, FaBed, FaMapMarkerAlt
} from "react-icons/fa";
import { motion } from 'framer-motion';

const placeholderImage = "https://placehold.co/400x300/e2e8f0/64748b?text=No+Image";

// ✅ UTILITY FUNCTION FOR BACKWARD COMPATIBILITY
const getSafeImageDetails = (imagesArray, propertyTitle) => {
  if (!Array.isArray(imagesArray) || imagesArray.length === 0) {
    return [];
  }

  return imagesArray.map((img, index) => {
    if (typeof img === 'string') {
      return { url: img, altText: `${propertyTitle} image ${index + 1}` };
    }
    return { url: img.url, altText: img.altText || `${propertyTitle} image ${index + 1}` };
  });
};

// ✅ HELPER: Get Thumbnail from Video URL
const getVideoThumbnail = (url) => {
  if (!url) return null;
  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  // Cloudinary (Replace extension with .jpg)
  if (url.includes('cloudinary')) {
    return url.replace(/\.[^/.]+$/, ".jpg");
  }
  return null;
};

export default function PropertyCard({ property }) {
  const navigate = useNavigate();

  // --- 3D FLIP STATE ---
  const [isFlipped, setIsFlipped] = useState(false);

  // --- SLIDER STATE ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const { user, addFavoriteContext, removeFavoriteContext } = useAuth();

  const safeImageDetails = getSafeImageDetails(property.images, property.title);

  // ✅ LOGIC: Determine Image Source (Images > Video Thumbnail > Placeholder)
  let images = [];
  let isVideoPreview = false;

  if (safeImageDetails.length > 0) {
    images = safeImageDetails.map(img => img.url);
  } else if (property.video) {
    const videoThumb = getVideoThumbnail(property.video);
    if (videoThumb) {
      images = [videoThumb];
      isVideoPreview = true;
    }
  }

  // Final Fallback
  if (images.length === 0) {
    images = [property.imageUrl || placeholderImage];
  }

  // Slider Logic
  useEffect(() => {
    if (isHovering && images.length > 1 && !isFlipped) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isHovering, images.length, isFlipped]);

  const handleViewDetails = (e) => {
    if (e) e.stopPropagation();
    navigate(`/properties/${property.slug}`);
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

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

  const isSoldOrRented = property.status === 'sold' || property.status === 'rented';

  // --- Agent/Owner Logic for Back Side ---
  const agentName = property.agent?.name || property.ownerDetails?.name || "Verified Agent";
  const agentImage = property.agent?.profilePicture || "https://ui-avatars.com/api/?name=" + encodeURIComponent(agentName) + "&background=0D8ABC&color=fff";

  // --- 3D Variants ---
  const variants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  };

  return (
    <motion.div
      className="relative w-full h-[450px] cursor-pointer group perspective-1000"
      style={{ perspective: '1000px' }} // Inline failsafe
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setCurrentImageIndex(0);
        setIsFlipped(false); // Reset flip on mouse leave
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="w-full h-full relative transition-all"
        style={{ transformStyle: 'preserve-3d' }}
        variants={variants}
        initial="front"
        animate={isFlipped ? "back" : "front"}
        transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.8 }}
      >
        {/* ============================== */}
        {/* FRONT SIDE              */}
        {/* ============================== */}
        <div
          style={{ backfaceVisibility: 'hidden' }}
          className="absolute inset-0 w-full h-full 
            bg-white/90 backdrop-blur-md border border-white/40 
            dark:bg-gray-800/90 dark:border-gray-700/50 
            rounded-2xl shadow-xl overflow-hidden flex flex-col"
          onClick={handleFlip}
        >
          {/* Sold Overlay on Front */}
          {isSoldOrRented && (
            <div className="absolute inset-0 bg-gray-900/40 z-10 pointer-events-none backdrop-grayscale" />
          )}

          {/* Image Section */}
          <div className="relative h-64 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {/* Badges */}
            {user && !isSoldOrRented && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleFavoriteClick}
                className="absolute top-3 right-3 z-20 p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition shadow-sm"
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorited ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
              </motion.button>
            )}

            <img
              src={images[currentImageIndex]}
              alt={safeImageDetails?.[currentImageIndex]?.altText || property.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${isSoldOrRented ? 'grayscale' : ''}`}
              loading="lazy"
            />

            {/* ✅ VIDEO INDICATOR OVERLAY */}
            {isVideoPreview && !isSoldOrRented && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                <div className="bg-black/50 backdrop-blur-sm p-3 rounded-full text-white animate-pulse">
                  <FaPlayCircle size={30} />
                </div>
              </div>
            )}

            {/* Slider Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5 z-20">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full shadow-sm ${index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/60'}`}
                  ></div>
                ))}
              </div>
            )}

            {/* Listing Type Badge */}
            <span className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full uppercase font-bold shadow-md z-20">
              For {property.listingType}
            </span>

            {/* Beds Badge */}
            {property.type !== 'land' && (
              <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-semibold z-20 border border-white/20">
                {Number(property.bedrooms) === 0 ? "Bedsitter" : `${property.bedrooms} Bed${property.bedrooms !== 1 ? 's' : ''}`}
              </span>
            )}

            {/* Featured Badge */}
            {property.isFeatured && property.status === 'available' && (
              <span className="absolute bottom-3 right-3 z-20 flex items-center bg-yellow-400/90 text-gray-900 text-xs px-3 py-1 rounded-full uppercase font-bold shadow-md backdrop-blur-sm">
                <FaStar className="mr-1.5" /> Featured
              </span>
            )}

            {/* Video Badge (Top Center) */}
            {isVideoPreview && (
              <span className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white text-[10px] px-2 py-0.5 rounded-md uppercase font-bold shadow-md z-20 backdrop-blur-md flex items-center gap-1">
                <FaPlayCircle size={10} /> Video Tour
              </span>
            )}

            {/* Status Center Badge */}
            {isSoldOrRented && (
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full uppercase shadow-xl flex items-center gap-2 border-2 border-white">
                <FaCheckCircle /> Currently {property.status}
              </span>
            )}
          </div>

          {/* Details Section */}
          <div className="p-5 flex flex-col flex-grow justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1 leading-tight">
                {property.title}
              </h2>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-xs mb-3">
                <FaMapMarkerAlt className="text-blue-500" />
                <span className="line-clamp-1">{property.location}</span>
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Asking Price:</span>
                <p className="text-blue-700 dark:text-blue-400 font-extrabold text-lg">
                  Ksh {formatPrice(property.price)}
                  {property.listingType === 'rent' && <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/mo</span>}
                  {property.type === 'land' && property.pricePer && property.pricePer !== 'total' && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                      / {property.pricePer === 'sqm' ? 'Sq Meter' : property.pricePer.charAt(0).toUpperCase() + property.pricePer.slice(1)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Conversational Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="italic flex items-center gap-1">
                <FaHandshake className="text-blue-400" />
                {property.status === 'available' ? "Ready for viewing" : "Off the market"}
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:underline">
                Flip to Meet Host <FaInfoCircle />
              </span>
            </div>
          </div>
        </div>

        {/* ============================== */}
        {/* BACK SIDE              */}
        {/* ============================== */}
        <div
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className="absolute inset-0 w-full h-full rounded-2xl shadow-xl overflow-hidden flex flex-col
            /* Light Mode: White Glass */
            bg-white/90 backdrop-blur-xl border border-white/60
            /* Dark Mode: Deep Blue/Gray Glass */
            dark:bg-slate-950 dark:border-gray-700/50"
        >
          {/* Background Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src={images[0]}
              alt="Background"
              className="w-full h-full object-cover opacity-20 blur-2xl scale-150"
            />
            <div className="absolute inset-0 bg-white/80 dark:bg-gradient-to-b dark:from-gray-900/95 dark:to-blue-950/95" />
          </div>

          {/* Back Content */}
          <div className="relative z-10 flex flex-col h-full p-6 items-center justify-center text-center text-gray-900 dark:text-white">

            <button
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
              className="absolute top-4 right-4 p-2 rounded-full transition backdrop-blur-md
                hover:bg-gray-200 text-gray-500
                dark:hover:bg-white/10 dark:text-white/80"
              title="Close"
            >
              <FaTimes />
            </button>

            {/* Host Section */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-3 text-blue-600 dark:text-blue-300 opacity-80 flex items-center justify-center gap-2">
                <FaHandshake /> Meet Your Host
              </h4>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full p-1 mb-3 shadow-md border bg-white dark:bg-white/10 border-gray-200 dark:border-white/20 backdrop-blur-md group-hover:scale-105 transition-transform">
                  <img
                    src={agentImage}
                    alt={agentName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold leading-tight">{agentName}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                  "{property.agent ? 'I represent a verified agency.' : 'I am the private owner of this unit.'}"
                </span>
              </div>
            </div>

            {/* Narrative Status */}
            <div className={`mb-6 px-5 py-2 rounded-xl text-xs font-bold border backdrop-blur-md ${property.status === 'available'
              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30'
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30'
              }`}>
              {property.status === 'available'
                ? "Good news! This home is available."
                : `Sorry, this home is ${property.status}.`}
            </div>

            {/* Main CTA */}
            <button
              onClick={handleViewDetails}
              className={`w-full py-3.5 flex items-center justify-center gap-2 rounded-xl font-bold shadow-lg transition transform hover:scale-105 text-sm backdrop-blur-md
                ${isSoldOrRented
                  ? 'bg-gray-400 text-white cursor-not-allowed dark:bg-gray-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-blue-900 dark:hover:bg-gray-100'
                }`}
            >
              {isSoldOrRented ? 'Browse Similar Homes' : 'Take a Closer Look'} <FaArrowRight />
            </button>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}