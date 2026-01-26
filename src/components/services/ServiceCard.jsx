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
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleContactClick = (e, type) => {
    e.stopPropagation();
    if (!user) {
      e.preventDefault();
      alert("Please log in or sign up to access provider contact details.");
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
  };

  const displayImage = service.imageUrl || "https://placehold.co/800x400/e2e8f0/64748b?text=Company+Logo";
  const rating = service.averageRating || 0;
  const reviews = service.numReviews || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative w-full min-h-[24rem] h-auto flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 group"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={displayImage}
          alt="Background"
          className="w-full h-full object-cover opacity-40 blur-2xl scale-150"
        />
        {/* Adaptive Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black/80"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col flex-grow p-6 text-white">

        {/* Identity Section */}
        <div className="flex flex-col items-center mb-4 shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/30 shadow-lg mb-2">
            <img src={displayImage} alt={service.title} className="w-full h-full object-cover" />
          </div>
          <h3 className="text-white font-bold text-center leading-tight line-clamp-2 text-lg">
            {service.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <IconStar className="text-yellow-400 text-xs" />
              <span className="text-yellow-300 text-xs font-bold">
                {(rating || 0).toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-blue-500/20 text-blue-300">
              {service.serviceType}
            </span>
          </div>
        </div>

        {/* Stats */}
        {/* Stats */}
        <div className="mb-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20 text-center">
            <div className="text-blue-300 font-black text-2xl flex items-center justify-center">
              <IconStar className="text-yellow-400 w-5 h-5" />
            </div>
            <div className="text-white text-xs font-bold uppercase tracking-wider">
              Verified
            </div>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="flex flex-col gap-2 mb-4">
          {service.phoneNumber && (
            <a
              href={`tel:${service.phoneNumber}`}
              onClick={(e) => handleContactClick(e, 'call')}
              className="flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold border transition backdrop-blur-md shadow-sm
                bg-blue-600/80 text-white border-blue-400/50 hover:bg-blue-700"
            >
              <IconPhone className="w-3 h-3" /> Call Now
            </a>
          )}

          {service.whatsappNumber && (
            <a
              href={`https://wa.me/${service.whatsappNumber.replace('+', '')}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => handleContactClick(e, 'whatsapp')}
              className="flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold border transition backdrop-blur-md shadow-sm
                bg-green-600/80 text-white border-green-400/50 hover:bg-green-700"
            >
              <IconWhatsapp className="w-3 h-3" /> Message on WhatsApp
            </a>
          )}
        </div>

        {/* CTA Button */}
        <Link
          to={`/services/${service.slug}`}
          className="mt-auto w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          View Full Profile
        </Link>
      </div>
    </motion.div>
  );
};

export default ServiceCard;