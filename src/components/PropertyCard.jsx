// src/components/PropertyCard.jsx
// Glassmorphic design matching TopAgents carousel style
import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/formatPrice";
import OptimizedImage from "./OptimizedImage"; // ⚡ Performance: Lazy loading images
import { getAnimationConfig } from "../utils/deviceDetection"; // ⚡ Performance: Adaptive animations
import {
  FaHeart, FaRegHeart, FaStar, FaCheckCircle,
  FaInfoCircle, FaArrowRight, FaTimes, FaPlayCircle,
  FaHandshake, FaBed, FaMapMarkerAlt, FaBath,
  FaRulerCombined, FaEye
} from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const placeholderImage = "https://placehold.co/400x300/e2e8f0/64748b?text=No+Image";

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
      "availability": property.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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
    ...(property.isFeatured && { "award": "Featured Listing" })
  };
};

function PropertyCard({ property }) {
  const navigate = useNavigate();

  const [isFlipped, setIsFlipped] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const { user, addFavoriteContext, removeFavoriteContext } = useAuth();

  // ⚡ Performance: Get optimal animation settings for device
  const animConfig = getAnimationConfig();

  const safeImageDetails = getSafeImageDetails(property.images, property.title);

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

  // Auto-slider Logic - Always active
  useEffect(() => {
    if (images.length > 1 && !isFlipped) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length, isFlipped]);

  const handleViewDetails = (e) => {
    if (e) e.stopPropagation();
    navigate(`/properties/${property.slug}`);
  };

  const handleFlip = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
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

  const isSoldOrRented = property.status === 'sold' || property.status === 'rented';

  const agentName = property.agent?.name || property.ownerDetails?.name || "Verified Agent";
  const agentImage = property.agent?.profilePicture || "https://ui-avatars.com/api/?name=" + encodeURIComponent(agentName) + "&background=0D8ABC&color=fff";

  const variants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  };

  const generateAltText = (index) => {
    const bedroomText = property.type !== 'land' ? `${property.bedrooms || 0} bedroom ` : '';
    return `${bedroomText}${property.type} for ${property.listingType} in ${property.location}, Kenya - Ksh ${formatPrice(property.price)}${property.listingType === 'rent' ? '/month' : ''} - Image ${index + 1}`;
  };

  const propertySchema = generatePropertyCardSchema(property, images);

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(propertySchema)}
        </script>
      </Helmet>

      <motion.div
        className="relative w-full h-[400px] cursor-pointer group"
        style={{ perspective: '1200px' }}
        itemScope
        itemType={property.listingType === 'rent' ? "https://schema.org/Accommodation" : "https://schema.org/Product"}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setIsFlipped(false);
        }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* SEO Microdata */}
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
          {/* ======================== */}
          {/* FRONT SIDE - GLASSMORPHIC */}
          {/* ======================== */}
          <motion.div
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            {/* Background Image with Overlays */}
            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                {animConfig.shouldAnimate ? (
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: animConfig.duration }}
                    className="w-full h-full"
                  >
                    <OptimizedImage
                      src={images[currentImageIndex]}
                      alt={generateAltText(currentImageIndex)}
                      className={`w-full h-full object-cover ${isSoldOrRented ? 'grayscale' : ''}`}
                      priority={currentImageIndex === 0}
                    />
                  </motion.div>
                ) : (
                  <OptimizedImage
                    key={currentImageIndex}
                    src={images[currentImageIndex]}
                    alt={generateAltText(currentImageIndex)}
                    className={`w-full h-full object-cover ${isSoldOrRented ? 'grayscale' : ''}`}
                    priority={currentImageIndex === 0}
                  />
                )}
              </AnimatePresence>

              {/* Gradient Overlays - Matching TopAgents */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
              {!animConfig.useBackdropBlur && <div className="absolute inset-0 bg-black/20"></div>}
            </div>

            {/* Sold/Rented Overlay */}
            {isSoldOrRented && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 to-gray-900/50 z-20 backdrop-blur-sm flex items-center justify-center">
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
            )}

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col justify-between p-5">

              {/* Top Section - Badges & Actions */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  {/* Badges */}
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-blue-500/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold uppercase shadow-lg border border-white/20">
                      For {property.listingType}
                    </span>
                    {property.isFeatured && property.status === 'available' && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs px-3 py-1.5 rounded-full font-bold uppercase shadow-lg flex items-center gap-1.5">
                        <FaStar size={10} /> Featured
                      </span>
                    )}
                    {/* Visual Availability Badge */}
                    {property.status === 'available' ? (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold uppercase shadow-lg border-2 border-white/30 flex items-center gap-1.5 animate-pulse">
                        <FaCheckCircle size={12} /> Available
                      </span>
                    ) : (
                      <span className="bg-gradient-to-r from-red-500 to-rose-500 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold uppercase shadow-lg border-2 border-white/30 flex items-center gap-1.5">
                        <FaTimes size={12} /> {property.status === 'sold' ? 'Sold' : 'Rented'}
                      </span>
                    )}
                    <span className="bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg border border-white/10 flex items-center gap-1.5">
                      <FaEye size={12} className="text-blue-400" /> {property.views || 0}
                    </span>
                  </div>

                  {/* Favorite Button */}
                  {user && !isSoldOrRented && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={handleFavoriteClick}
                      className="p-2.5 bg-white/10 backdrop-blur-xl rounded-full shadow-lg hover:bg-white/20 transition-all border border-white/20"
                      aria-label={isFavorited ? `Remove ${property.title} from favorites` : `Add ${property.title} to favorites`}
                    >
                      <motion.div animate={{ scale: isFavorited ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                        {isFavorited ? <FaHeart className="text-red-500" size={16} /> : <FaRegHeart className="text-white" size={16} />}
                      </motion.div>
                    </motion.button>
                  )}
                </div>

                {/* Video Indicator */}
                {isVideoPreview && !isSoldOrRented && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-3 py-2 rounded-full border border-white/20"
                  >
                    <FaPlayCircle className="text-white" size={14} />
                    <span className="text-white text-xs font-bold">Video Tour Available</span>
                  </motion.div>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-semibold border border-white/10">
                      {currentImageIndex + 1} / {images.length}
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex gap-1.5">
                      {images.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1.5 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-6' : 'bg-white/40 w-1.5'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Section - Property Info */}
              <div className="space-y-3">
                {/* Property Details Card */}
                <div className={`${animConfig.useBackdropBlur ? 'bg-white/10 backdrop-blur-xl' : 'bg-black/70'} rounded-2xl p-4 border border-white/20 shadow-lg`}>
                  <h2 className="text-white font-bold text-lg line-clamp-2 mb-2 leading-tight" itemProp="name">
                    {property.title}
                  </h2>

                  <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                    <FaMapMarkerAlt size={12} />
                    <span className="line-clamp-1">{property.location}</span>
                  </div>

                  {/* Stats */}
                  {property.type !== 'land' && (
                    <div className="flex items-center gap-3 mb-3 text-white/90 text-xs">
                      <div className="flex items-center gap-1.5">
                        <FaBed size={14} />
                        <span className="font-semibold">
                          {Number(property.bedrooms) === 0 ? "Studio" : `${property.bedrooms} Bed${property.bedrooms !== 1 ? 's' : ''}`}
                        </span>
                      </div>
                      {property.bathrooms && (
                        <div className="flex items-center gap-1.5">
                          <FaBath size={14} />
                          <span className="font-semibold">{property.bathrooms} Bath</span>
                        </div>
                      )}
                      {property.size && (
                        <div className="flex items-center gap-1.5">
                          <FaRulerCombined size={14} />
                          <span className="font-semibold">{property.size}m²</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price - Highlighted on hover */}
                  <motion.div
                    className="flex items-baseline gap-2"
                    animate={animConfig.shouldAnimate ? {
                      scale: isHovering ? 1.1 : 1,
                      y: isHovering ? -5 : 0
                    } : {}}
                    transition={{ duration: animConfig.duration }}
                  >
                    <span className="text-white font-black text-3xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]
                      group-hover:text-yellow-400 transition-colors duration-300">
                      Ksh {formatPrice(property.price)}
                    </span>
                    {property.listingType === 'rent' && (
                      <span className="text-white/70 text-base group-hover:text-yellow-300/80 transition-colors duration-300">/month</span>
                    )}
                  </motion.div>
                  {property.type === 'land' && property.pricePer && property.pricePer !== 'total' && (
                    <span className="text-white/60 text-xs group-hover:text-yellow-300/60 transition-colors duration-300">
                      per {property.pricePer === 'sqm' ? 'Sq Meter' : property.pricePer}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleViewDetails}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    View Details <FaArrowRight size={14} />
                  </button>

                  <button
                    onClick={handleFlip}
                    className={`${animConfig.useBackdropBlur ? 'bg-white/10 backdrop-blur-xl' : 'bg-black/70'} hover:bg-white/20 text-white font-bold py-2 text-sm rounded-xl flex items-center justify-center gap-2 transition-all border border-white/20`}
                  >
                    Meet Agent <FaHandshake size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Hover Depth Effect - Removed purple glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          </motion.div>

          {/* ===================== */}
          {/* BACK SIDE - AGENT INFO */}
          {/* ===================== */}
          <div
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            className="absolute inset-0 w-full h-full rounded-3xl shadow-2xl overflow-hidden
              bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700
              dark:from-blue-900 dark:via-blue-950 dark:to-purple-950"
          >
            {/* Decorative Pattern */}
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

              {/* Agent Info */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-blue-200 flex items-center justify-center gap-2">
                  <FaHandshake /> Your Property Expert
                </h4>

                <motion.div
                  whileHover={animConfig.shouldAnimate ? { scale: 1.05 } : {}}
                  className={`w-24 h-24 mx-auto mb-4 rounded-full p-1 bg-gradient-to-br from-white/30 to-white/10 ${animConfig.useBackdropBlur ? 'backdrop-blur-md' : ''} shadow-2xl`}
                >
                  <OptimizedImage
                    src={agentImage}
                    alt={`${agentName} - Property agent`}
                    className="w-full h-full rounded-full object-cover border-2 border-white/50"
                    priority={false}
                  />
                </motion.div>

                <h3 className="text-2xl font-black mb-2">{agentName}</h3>
                <p className="text-sm text-blue-100 mb-6 italic max-w-xs">
                  {property.agent ? '"Helping you find your dream home"' : '"Direct owner - No agent fees"'}
                </p>

                <div className={`inline-block px-6 py-2.5 rounded-full text-sm font-bold mb-6 ${property.status === 'available'
                  ? 'bg-green-400/20 text-green-100 border-2 border-green-300/30'
                  : 'bg-red-400/20 text-red-100 border-2 border-red-300/30'
                  }`}>
                  {property.status === 'available' ? '✓ Available for Viewing' : `✗ Currently ${property.status}`}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewDetails}
                  className={`w-full py-4 rounded-2xl font-bold text-base shadow-2xl transition-all flex items-center justify-center gap-3 ${isSoldOrRented
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-white text-blue-700 hover:bg-blue-50'
                    }`}
                  aria-label={isSoldOrRented ? `Browse properties similar to ${property.title}` : `View full details for ${property.title}`}
                >
                  {isSoldOrRented ? <>See Similar Properties <FaArrowRight /></> : <>View Full Details <FaArrowRight /></>}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default memo(PropertyCard);