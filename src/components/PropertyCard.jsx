// src/components/PropertyCard.jsx
// Ultra-modern, professional design with enhanced UX
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/formatPrice";
import {
  FaHeart, FaRegHeart, FaStar, FaCheckCircle,
  FaInfoCircle, FaArrowRight, FaTimes, FaPlayCircle,
  FaHandshake, FaBed, FaMapMarkerAlt, FaBath,
  FaRulerCombined, FaEye, FaShareAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

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
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  if (url.includes('cloudinary')) {
    return url.replace(/\.[^/.]+$/, ".jpg");
  }
  return null;
};

// ✅ Generate Property-Specific Schema
const generatePropertyCardSchema = (property, images) => {
  const baseUrl = 'https://www.househuntkenya.co.ke';
  const propertyUrl = `${baseUrl}/properties/${property.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": property.listingType === 'rent' ? "Accommodation" : "Product",
    "@id": propertyUrl,
    "name": property.title,
    "description": `${property.bedrooms || 0} bedroom ${property.type} for ${property.listingType} in ${property.location}, Kenya`,
    "url": propertyUrl,
    "image": images.length > 0 ? images : [placeholderImage],
    "offers": {
      "@type": "Offer",
      "price": property.price.toString(),
      "priceCurrency": "KES",
      "availability": property.status === 'available'
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "url": propertyUrl,
      "seller": {
        "@type": property.agent ? "RealEstateAgent" : "Person",
        "name": property.agent?.name || property.ownerDetails?.name || "Property Owner"
      },
      ...(property.listingType === 'rent' && {
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": property.price.toString(),
          "priceCurrency": "KES",
          "unitCode": "MON",
          "unitText": "per month"
        }
      })
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.location,
      "addressRegion": property.location.split(',')[0],
      "addressCountry": "KE"
    },
    ...(property.bedrooms && property.type !== 'land' && {
      "numberOfRooms": property.bedrooms,
      "numberOfBedrooms": property.bedrooms
    }),
    ...(property.coordinates?.lat && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": property.coordinates.lat,
        "longitude": property.coordinates.lng
      }
    }),
    ...(property.amenities?.length > 0 && {
      "amenityFeature": property.amenities.map(amenity => ({
        "@type": "LocationFeatureSpecification",
        "name": amenity,
        "value": true
      }))
    }),
    ...(property.video && {
      "video": {
        "@type": "VideoObject",
        "name": `Virtual Tour of ${property.title}`,
        "thumbnailUrl": getVideoThumbnail(property.video),
        "contentUrl": property.video,
        "uploadDate": property.createdAt || new Date().toISOString()
      }
    }),
    ...(property.isFeatured && {
      "award": "Featured Listing"
    })
  };
};

export default function PropertyCard({ property }) {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const { user, addFavoriteContext, removeFavoriteContext } = useAuth();

  const safeImageDetails = getSafeImageDetails(property.images, property.title);

  // ✅ Image Source Logic
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

  if (images.length === 0) {
    images = [property.imageUrl || placeholderImage];
  }

  // Auto-slider Logic
  useEffect(() => {
    if (isHovering && images.length > 1 && !isFlipped) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 2000);
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

  // --- Agent/Owner Logic ---
  const agentName = property.agent?.name || property.ownerDetails?.name || "Verified Agent";
  const agentImage = property.agent?.profilePicture || "https://ui-avatars.com/api/?name=" + encodeURIComponent(agentName) + "&background=0D8ABC&color=fff";

  // --- 3D Variants ---
  const variants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  };

  // ✅ SEO: Enhanced alt text
  const generateAltText = (index) => {
    const bedroomText = property.type !== 'land'
      ? `${property.bedrooms || 0} bedroom `
      : '';
    return `${bedroomText}${property.type} for ${property.listingType} in ${property.location}, Kenya - Ksh ${formatPrice(property.price)}${property.listingType === 'rent' ? '/month' : ''} - Image ${index + 1}`;
  };

  const propertySchema = generatePropertyCardSchema(property, images);

  return (
    <>
      {/* ✅ SEO Schema Injection */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(propertySchema)}
        </script>
      </Helmet>

      <motion.div
        className="relative w-full h-full cursor-pointer group"
        style={{ perspective: '1200px' }}
        itemScope
        itemType={property.listingType === 'rent'
          ? "https://schema.org/Accommodation"
          : "https://schema.org/Product"}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setCurrentImageIndex(0);
          setIsFlipped(false);
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* ✅ SEO: Hidden Microdata */}
        <meta itemProp="name" content={property.title} />
        <meta itemProp="description" content={`${property.bedrooms || 0} bedroom ${property.type} for ${property.listingType} in ${property.location}`} />
        <link itemProp="url" href={`https://www.househuntkenya.co.ke/properties/${property.slug}`} />

        <div itemProp="offers" itemScope itemType="https://schema.org/Offer" className="sr-only">
          <meta itemProp="price" content={property.price.toString()} />
          <meta itemProp="priceCurrency" content="KES" />
          <meta itemProp="availability" content={property.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
        </div>

        <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress" className="sr-only">
          <meta itemProp="addressLocality" content={property.location} />
          <meta itemProp="addressCountry" content="KE" />
        </div>

        <motion.div
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d' }}
          variants={variants}
          initial="front"
          animate={isFlipped ? "back" : "front"}
          transition={{ type: "spring", stiffness: 280, damping: 22, mass: 0.8 }}
        >
          {/* ============================== */}
          {/* FRONT SIDE - MODERN DESIGN     */}
          {/* ============================== */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className="relative w-full h-full min-h-[480px] 
              bg-white dark:bg-gray-900
              rounded-3xl shadow-2xl overflow-hidden flex flex-col
              border border-gray-100 dark:border-gray-800
              hover:shadow-3xl transition-shadow duration-300"
            onClick={handleFlip}
          >
            {/* Sold/Rented Overlay */}
            {isSoldOrRented && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 to-gray-900/40 z-20 backdrop-blur-[2px]">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-2xl shadow-2xl border-2 border-white/20"
                  >
                    <div className="flex items-center gap-3">
                      <FaCheckCircle size={24} />
                      <div>
                        <p className="font-black text-lg uppercase tracking-wide">
                          {property.status === 'sold' ? 'SOLD' : 'RENTED'}
                        </p>
                        <p className="text-xs text-white/80 font-medium">No longer available</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Image Gallery Section */}
            <div className="relative h-[280px] w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              {/* Action Buttons - Top Bar */}
              <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between">
                {/* Left: Listing Type Badge */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex gap-2"
                >
                  <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-4 py-2 rounded-full uppercase font-bold shadow-lg backdrop-blur-md border border-white/20">
                    For {property.listingType}
                  </span>
                  {property.isFeatured && property.status === 'available' && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs px-4 py-2 rounded-full uppercase font-bold shadow-lg flex items-center gap-1.5">
                      <FaStar size={12} /> Featured
                    </span>
                  )}
                </motion.div>

                {/* Right: Favorite Button */}
                {user && !isSoldOrRented && (
                  <motion.button
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={handleFavoriteClick}
                    className="p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
                    aria-label={isFavorited
                      ? `Remove ${property.title} from favorites`
                      : `Add ${property.title} to favorites`}
                  >
                    <motion.div
                      animate={{ scale: isFavorited ? [1, 1.3, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isFavorited ? (
                        <FaHeart className="text-red-500" size={18} />
                      ) : (
                        <FaRegHeart className="text-gray-700 dark:text-gray-300" size={18} />
                      )}
                    </motion.div>
                  </motion.button>
                )}
              </div>

              {/* Main Image */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={generateAltText(currentImageIndex)}
                  className={`w-full h-full object-cover ${isSoldOrRented ? 'grayscale' : ''}`}
                  loading="lazy"
                  itemProp="image"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>

              {/* Video Indicator */}
              {isVideoPreview && !isSoldOrRented && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="bg-white/20 backdrop-blur-md p-5 rounded-full border-4 border-white/40"
                  >
                    <FaPlayCircle className="text-white" size={40} />
                  </motion.div>
                </motion.div>
              )}

              {/* Image Counter & Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 z-30">
                  {/* Image Counter */}
                  <div className="flex justify-center mb-2">
                    <div className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-semibold">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </div>

                  {/* Navigation Dots */}
                  <div className="flex justify-center gap-1.5">
                    {images.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`h-1.5 rounded-full transition-all ${index === currentImageIndex
                          ? 'bg-white w-8'
                          : 'bg-white/50 w-1.5'
                          }`}
                        layoutId={`dot-${index}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Gradient Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>

            {/* Property Details Section */}
            <div className="flex-grow p-6 flex flex-col justify-between bg-white dark:bg-gray-900">
              <div>
                {/* Title with Frosted Background */}
                <div className="relative -mx-6 -mt-6 mb-4 p-4 px-6 
                  bg-gradient-to-br from-blue-50/80 via-white/60 to-purple-50/80 
                  dark:from-blue-950/40 dark:via-gray-900/60 dark:to-purple-950/40 
                  backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50
                  shadow-sm">
                  <h2
                    className="text-lg font-black text-gray-900 dark:text-white leading-tight tracking-tight"
                    itemProp="name"
                  >
                    {property.title}
                  </h2>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                  <FaMapMarkerAlt className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={14} />
                  <span className="text-sm font-medium line-clamp-1">{property.location}</span>
                </div>

                {/* Property Stats */}
                {property.type !== 'land' && (
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <FaBed className="text-blue-600 dark:text-blue-400" size={16} />
                      <span className="font-semibold">
                        {Number(property.bedrooms) === 0 ? "Studio" : `${property.bedrooms} Bed${property.bedrooms !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                    {property.bathrooms && (
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <FaBath className="text-blue-600 dark:text-blue-400" size={16} />
                        <span className="font-semibold">{property.bathrooms} Bath</span>
                      </div>
                    )}
                    {property.size && (
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <FaRulerCombined className="text-blue-600 dark:text-blue-400" size={16} />
                        <span className="font-semibold">{property.size}m²</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                      Ksh {formatPrice(property.price)}
                    </span>
                    {property.listingType === 'rent' && (
                      <span className="text-base text-gray-500 dark:text-gray-400 font-medium">/month</span>
                    )}
                  </div>
                  {property.type === 'land' && property.pricePer && property.pricePer !== 'total' && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      per {property.pricePer === 'sqm' ? 'Sq Meter' : property.pricePer}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                <motion.span
                  whileHover={{ x: 5 }}
                  className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 cursor-pointer"
                >
                  Meet the Agent <FaHandshake />
                </motion.span>

                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <FaEye size={12} />
                  <span className="font-medium">Click to flip</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================== */}
          {/* BACK SIDE - AGENT INFO         */}
          {/* ============================== */}
          <div
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            className="absolute inset-0 w-full h-full rounded-3xl shadow-2xl overflow-hidden
              bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700
              dark:from-blue-900 dark:via-blue-950 dark:to-purple-950"
          >
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '40px 40px'
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full p-8 items-center justify-center text-white">
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition"
                aria-label="Close agent information"
              >
                <FaTimes size={18} />
              </motion.button>

              {/* Agent Section */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-blue-200 flex items-center justify-center gap-2">
                  <FaHandshake /> Your Property Expert
                </h4>

                {/* Agent Avatar */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-24 h-24 mx-auto mb-4 rounded-full p-1 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md shadow-2xl"
                >
                  <img
                    src={agentImage}
                    alt={`${agentName} - Property agent`}
                    className="w-full h-full rounded-full object-cover border-2 border-white/50"
                  />
                </motion.div>

                <h3 className="text-2xl font-black mb-2">{agentName}</h3>
                <p className="text-sm text-blue-100 mb-6 italic max-w-xs">
                  {property.agent ? '"Helping you find your dream home"' : '"Direct owner - No agent fees"'}
                </p>

                {/* Status Badge */}
                <div className={`inline-block px-6 py-2.5 rounded-full text-sm font-bold mb-6 ${property.status === 'available'
                  ? 'bg-green-400/20 text-green-100 border-2 border-green-300/30'
                  : 'bg-red-400/20 text-red-100 border-2 border-red-300/30'
                  }`}>
                  {property.status === 'available'
                    ? '✓ Available for Viewing'
                    : `✗ Currently ${property.status}`}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewDetails}
                  className={`w-full py-4 rounded-2xl font-bold text-base shadow-2xl transition-all flex items-center justify-center gap-3 ${isSoldOrRented
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-white text-blue-700 hover:bg-blue-50'
                    }`}
                  aria-label={isSoldOrRented
                    ? `Browse properties similar to ${property.title}`
                    : `View full details for ${property.title}`}
                >
                  {isSoldOrRented ? (
                    <>See Similar Properties <FaArrowRight /></>
                  ) : (
                    <>View Full Details <FaArrowRight /></>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}