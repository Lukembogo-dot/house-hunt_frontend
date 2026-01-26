// src/components/property/PropertyImageCarousel.jsx
// Full-screen image carousel for property details (hero slider style)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChevronLeft, FaChevronRight, FaMapMarkerAlt, 
  FaBed, FaBath, FaRulerCombined, FaTag, FaHeart, FaRegHeart, FaEye
} from 'react-icons/fa';

// Helper function to extract video thumbnail
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

const PropertyImageCarousel = ({ property, user, isFavorited, onFavoriteClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayInterval = useRef(5000);

  // Get safe image array with video thumbnail fallback
  const images = React.useMemo(() => {
    let imageArray = [];
    
    // First, add property images if available
    if (property?.images && Array.isArray(property.images)) {
      imageArray = property.images.map((img, index) => {
        if (typeof img === 'string') return img;
        if (img.url) return img.url;
        return null;
      }).filter(Boolean);
    }

    // If no images but has video, add video thumbnail
    if (imageArray.length === 0 && property?.video) {
      const videoThumb = getVideoThumbnail(property.video);
      if (videoThumb) {
        imageArray = [videoThumb];
      }
    }

    return imageArray;
  }, [property?.images, property?.video]);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval.current);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, [images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-[400px] md:h-[450px] bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold">No images available</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <section className="relative w-full overflow-hidden bg-black group h-[400px] md:h-[450px]">
      {/* Image Container with Full Image Display */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 via-black to-gray-900">
        {/* Background blur effect */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            {images.map((img, index) => (
              index === currentIndex && (
                <motion.div
                  key={`${property._id}-bg-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(40px)',
                    opacity: 0.4
                  }}
                />
              )
            ))}
          </AnimatePresence>
        </div>

        {/* Main Image - Full Quality Display */}
        <AnimatePresence mode="wait">
          {images.map((img, index) => (
            index === currentIndex && (
              <motion.img
                key={`${property._id}-main-${index}`}
                src={img}
                alt={`${property.title} - Image ${index + 1}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full h-full object-contain max-h-full"
                loading="lazy"
              />
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-20 pointer-events-none" />

      {/* Property Info Overlay - Bottom Left */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-30"
      >
        <div className="max-w-3xl">
          {/* Price Badge with Blur Background */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mb-6 inline-flex items-center gap-2 bg-black/40 backdrop-blur-md px-5 py-2 rounded-full border border-white/20"
          >
            <div className="flex items-baseline gap-1">
              <span className="text-yellow-400 font-black text-2xl md:text-3xl">
                Ksh {property.price?.toLocaleString()}
              </span>
              {property.listingType === 'rent' && (
                <span className="text-yellow-400 text-sm md:text-base font-semibold">/month</span>
              )}
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-white/90 text-lg md:text-xl font-semibold">
              <FaMapMarkerAlt className="flex-shrink-0 text-red-400" />
              <span>{property.location}</span>
            </div>
          </motion.div>

          {/* Quick Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex flex-wrap gap-4"
          >
            {/* Property Type Badge and View Count */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-semibold border border-white/30">
                <FaTag className="text-purple-300" />
                <span className="capitalize">{property.type || 'Property'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-semibold border border-white/30">
                <FaEye className="text-yellow-400" size={14} />
                <span>{property.views || 0} views</span>
              </div>
            </div>

            {property.bedrooms && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-semibold border border-white/30">
                <FaBed className="text-blue-300" />
                <span>{property.bedrooms} Beds</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-semibold border border-white/30">
                <FaBath className="text-cyan-300" />
                <span>{property.bathrooms} Baths</span>
              </div>
            )}
            {property.squareFeet && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-semibold border border-white/30">
                <FaRulerCombined className="text-green-300" />
                <span>{property.squareFeet} sqft</span>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      {/* Removed - users can navigate via thumbnails and auto-play */}

      {/* Favorite Button - Top Right */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onFavoriteClick}
        className="absolute top-6 md:top-8 right-6 md:right-8 z-40 p-3 md:p-4 bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20 rounded-full text-white hover:bg-white/40 dark:hover:bg-white/20 transition-all shadow-xl"
      >
        {isFavorited ? (
          <FaHeart className="text-2xl text-red-400" />
        ) : (
          <FaRegHeart className="text-2xl" />
        )}
      </motion.button>

      {/* Title and Image Counter - Top Left with Details */}
      <div className="absolute top-6 md:top-8 left-6 md:left-10 z-40 flex flex-col gap-3 max-w-md">
        {/* Property Title */}
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-lg line-clamp-2"
        >
          {property.title}
        </motion.h1>
        {/* Image Counter */}
        <div className="w-fit px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/20 rounded-full text-white text-sm md:text-base font-semibold">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Carousel - Bottom Center */}
      {images.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-3"
        >
          {images.map((img, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToSlide(index)}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-blue-400 ring-2 ring-blue-400/50 shadow-lg'
                  : 'border-white/30 hover:border-white/50 opacity-75 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-blue-500/20" />
              )}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Keyboard Navigation Hint */}
      <div className="absolute bottom-20 md:bottom-32 right-6 md:right-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-xs text-white/70 text-right">
          <p>← → to navigate</p>
        </div>
      </div>
    </section>
  );
};

export default PropertyImageCarousel;
