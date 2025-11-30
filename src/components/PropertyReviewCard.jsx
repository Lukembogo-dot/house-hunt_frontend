import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaQuoteLeft, FaHome, FaTimes, FaShieldAlt } from 'react-icons/fa';

const PropertyReviewCard = ({ review }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const variants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  };

  // Safely access nested properties
  const property = review.property || {};
  const displayImage = property.images && property.images.length > 0 
    ? property.images[0].url 
    : "https://placehold.co/600x400/e2e8f0/64748b?text=Property";
  
  const rating = review.rating || 0;

  return (
    <div 
      className="relative w-full h-80 cursor-pointer group" 
      style={{ perspective: '1000px' }} 
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="w-full h-full relative transition-all" 
        style={{ transformStyle: 'preserve-3d' }} 
        variants={variants}
        initial="front"
        animate={isFlipped ? "back" : "front"}
        transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.8 }}
      >
        {/* === FRONT SIDE === */}
        <div 
          style={{ backfaceVisibility: 'hidden' }}
          className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
          onClick={handleFlip}
        >
          {/* Image Section */}
          <div className="h-48 w-full relative">
            <img 
              src={displayImage} 
              alt={property.title || "Property"} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <div className="text-white w-full">
                <h3 className="font-bold text-lg truncate">{property.title || 'Unknown Property'}</h3>
                <p className="text-xs flex items-center opacity-90">
                  <FaMapMarkerAlt className="mr-1" /> {property.location || 'Nairobi'}
                </p>
              </div>
            </div>
            
            {/* Rating Badge */}
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
              <FaStar className="text-yellow-500 text-xs" />
              <span className="text-xs font-bold text-gray-800 dark:text-white">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Bottom Teaser */}
          <div className="p-4 flex flex-col justify-between h-[calc(100%-12rem)]">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                 <FaShieldAlt size={14} />
               </div>
               <div>
                 <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Verified Tenant</p>
                 <p className="text-[10px] text-gray-500 dark:text-gray-400">Anonymous Review</p>
               </div>
            </div>
            
            <button className="w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
              Tap to Read Review
            </button>
          </div>
        </div>

        {/* === BACK SIDE === */}
        <div 
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-2xl shadow-xl overflow-hidden p-6 flex flex-col"
        >
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/40 transition"
          >
            <FaTimes size={14} />
          </button>

          <div className="mb-4">
            <FaQuoteLeft className="text-3xl text-white/30 mb-2" />
            <p className="text-sm italic leading-relaxed line-clamp-6 opacity-95">
              "{review.comment}"
            </p>
          </div>

          <div className="mt-auto pt-4 border-t border-white/20">
            <div className="flex items-center justify-between mb-3">
               <span className="text-xs font-bold text-blue-100">Overall Rating</span>
               <div className="flex text-yellow-400 text-xs">
                 {[...Array(5)].map((_, i) => (
                   <FaStar key={i} className={i < Math.round(rating) ? 'opacity-100' : 'opacity-30'} />
                 ))}
               </div>
            </div>
            
            {property.slug && (
              <Link 
                to={`/properties/${property.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-2 w-full py-2 bg-white text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50 transition shadow-md"
              >
                <FaHome /> View Property
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyReviewCard;