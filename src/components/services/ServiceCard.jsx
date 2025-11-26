// src/components/services/ServiceCard.jsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext'; 

// --- Inline SVG Icons ---
const IconStar = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
const IconMapPin = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconInfo = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconClose = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconPhone = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
  </svg>
);
const IconWhatsapp = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const ServiceCard = ({ service }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { user } = useAuth(); 
  const navigate = useNavigate();

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleContactClick = (e, type) => {
    e.stopPropagation(); 
    if (!user) {
        e.preventDefault(); 
        alert("Please log in or sign up to access provider contact details.");
        navigate('/login', { state: { from: window.location.pathname } });
        return;
    }
  };

  const variants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  };

  const displayImage = service.imageUrl || "https://placehold.co/800x400/e2e8f0/64748b?text=Company+Logo";
  const rating = service.averageRating || 0;
  const reviews = service.numReviews || 0;

  return (
    <div 
      className="relative w-full h-96 cursor-pointer group" 
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
        {/* === FRONT SIDE (Advanced Glassmorphism) === */}
        <div 
          style={{ backfaceVisibility: 'hidden' }}
          className="absolute inset-0 w-full h-full 
            /* Light Mode: Transparent Glass */
            bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl
            
            /* Dark Mode: Deep Blue/Gray Glass with Reflections */
            dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-blue-900/80
            dark:backdrop-blur-2xl dark:border-white/10 dark:shadow-2xl dark:shadow-blue-900/20
            
            rounded-2xl overflow-hidden"
          onClick={handleFlip}
        >
          {/* Image Section - Slightly darker/lighter based on theme for contrast */}
          <div className="h-48 w-full overflow-hidden bg-white/20 dark:bg-black/20 relative border-b border-white/30 dark:border-white/5">
            <img 
              src={displayImage} 
              alt={service.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            {/* Tag: Gradient Glass */}
            <div className="absolute top-3 right-3 
              bg-blue-600/80 text-white backdrop-blur-md
              px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-white/20 uppercase tracking-wider">
              {service.serviceType || 'Service'}
            </div>
          </div>

          <div className="p-5 flex flex-col h-[calc(100%-12rem)] justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 drop-shadow-sm">
                {service.title}
              </h3>
              <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm mb-2 font-medium">
                <IconMapPin className="w-4 h-4 mr-1 text-red-500 drop-shadow-sm" /> 
                {service.location || 'Nairobi'}
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <IconStar key={i} className={`w-4 h-4 drop-shadow-sm ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                ))}
                <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">({reviews} reviews)</span>
              </div>
            </div>
            
            <div className="w-full mt-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all
              bg-blue-50/60 text-blue-700 border border-blue-200/50
              dark:bg-white/5 dark:text-blue-300 dark:border-white/10 
              group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent">
               View Contacts & Details <IconInfo className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* === BACK SIDE (Matched Glassmorphism) === */}
        <div 
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className="absolute inset-0 w-full h-full rounded-2xl shadow-xl overflow-hidden flex flex-col
            /* Light: Clear Glass */
            bg-white/60 backdrop-blur-xl border border-white/60
            /* Dark: Deep Blue/Gray Glass */
            dark:bg-slate-950/80 dark:backdrop-blur-3xl dark:border-white/10"
        >
          {/* Dynamic Background Image with Adaptive Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none">
             <img 
               src={displayImage} 
               alt="Background" 
               className="w-full h-full object-cover opacity-40 blur-2xl scale-150"
             />
             {/* Adaptive Overlay for Text Readability */}
             <div className="absolute inset-0 
               bg-white/70 /* Light Mode Overlay */
               dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-blue-950/95 /* Dark Mode Overlay */
             " /> 
          </div>

          {/* Content Container */}
          <div className="relative z-10 flex flex-col h-full p-6 text-gray-900 dark:text-white">
            
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
              className="absolute top-4 right-4 p-2 rounded-full transition backdrop-blur-md
                bg-white/30 hover:bg-white/60 text-gray-600
                dark:bg-white/10 dark:hover:bg-white/20 dark:text-white/80"
            >
              <IconClose className="w-5 h-5" />
            </button>

            {/* Identity Section */}
            <div className="flex flex-col items-center mb-4 shrink-0">
               <div className="w-16 h-16 rounded-full p-1 mb-2 shadow-lg overflow-hidden border backdrop-blur-md
                 bg-white/40 border-white/50
                 dark:bg-white/10 dark:border-white/20">
                 <img src={displayImage} alt={service.title} className="w-full h-full rounded-full object-cover" />
               </div>
               <h3 className="text-lg font-bold text-center leading-tight line-clamp-2 drop-shadow-sm">
                 {service.title}
               </h3>
               <h4 className="text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full backdrop-blur-sm
                 text-blue-700 bg-blue-100/50 border border-blue-200/50
                 dark:text-blue-200 dark:bg-blue-500/20 dark:border-blue-500/30">
                 {service.serviceType}
               </h4>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col justify-center gap-3">
               <div className="p-3 rounded-xl border shadow-sm backdrop-blur-md
                 bg-white/40 border-white/50 text-gray-700
                 dark:bg-white/5 dark:border-white/10 dark:text-gray-300">
                 <p className="text-xs italic line-clamp-2 text-center">
                   "{service.reviews && service.reviews.length > 0 
                      ? service.reviews[service.reviews.length - 1].comment 
                      : "Top-rated service provider. Verified by HouseHunt."}"
                 </p>
               </div>

               <div className="grid grid-cols-2 gap-2">
                  {/* Call Button */}
                  {service.phoneNumber ? (
                    <a 
                      href={`tel:${service.phoneNumber}`} 
                      onClick={(e) => handleContactClick(e, 'call')}
                      className="flex items-center justify-center gap-2 p-2 rounded-lg transition text-xs font-bold border cursor-pointer backdrop-blur-md shadow-sm
                        bg-blue-50/80 text-blue-700 border-blue-200/50 hover:bg-blue-100
                        dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-blue-600"
                    >
                       <IconPhone className="w-3 h-3" /> Call
                    </a>
                  ) : <div />}
                  
                  {/* WhatsApp Button */}
                  {service.whatsappNumber ? (
                    <a 
                      href={`https://wa.me/${service.whatsappNumber.replace('+', '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      onClick={(e) => handleContactClick(e, 'whatsapp')}
                      className="flex items-center justify-center gap-2 p-2 rounded-lg transition text-xs font-bold border cursor-pointer backdrop-blur-md shadow-sm
                        bg-green-50/80 text-green-700 border-green-200/50 hover:bg-green-100
                        dark:bg-white/10 dark:text-white dark:border-white/10 dark:hover:bg-green-600"
                    >
                       <IconWhatsapp className="w-3 h-3" /> WhatsApp
                    </a>
                  ) : <div />}
               </div>
            </div>

            {/* CTA Button */}
            <Link 
               to={`/services/${service.slug}`}
               onClick={(e) => e.stopPropagation()}
               className="mt-auto w-full py-3 font-bold rounded-xl shadow-lg transition transform hover:scale-[1.02] text-center text-sm backdrop-blur-md
                 bg-blue-600 text-white hover:bg-blue-700
                 dark:bg-white/10 dark:text-white dark:border-white/20 dark:hover:bg-white/20"
            >
              Read Full Profile
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ServiceCard;