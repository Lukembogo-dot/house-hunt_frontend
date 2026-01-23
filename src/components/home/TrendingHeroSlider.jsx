// src/components/home/TrendingHeroSlider.jsx
// Full-screen trending properties slider for Buy/Rent pages

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaFire, FaEye, FaUser, FaLandmark } from 'react-icons/fa';
import apiClient from '../../api/axios';

// ✅ PERFORMANCE: Memoized component to prevent unnecessary re-renders
const TrendingHeroSlider = memo(({ listingType = 'sale', onLoad, autoPlayInterval = 5000 }) => {
    const [properties, setProperties] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // ✅ FIX: Use ref for onLoad to prevent infinite loop
    const onLoadRef = useRef(onLoad);
    onLoadRef.current = onLoad;

    // ✅ Track if already fetched to prevent duplicate calls
    const hasFetched = useRef(false);

    // Fetch trending properties - ONLY on mount or listingType change
    useEffect(() => {
        // Prevent duplicate fetches
        if (hasFetched.current) return;

        const fetchTrending = async () => {
            try {
                setLoading(true);
                const { data } = await apiClient.get('/properties/trending');

                let filtered = data;
                if (listingType) {
                    filtered = data.filter(p =>
                        p.listingType && p.listingType.toLowerCase() === listingType.toLowerCase()
                    );
                }

                const limited = filtered.slice(0, 5); // Show top 5 in slider
                setProperties(limited);
                hasFetched.current = true;

                // ✅ Use ref to call onLoad without causing re-render loop
                if (onLoadRef.current) {
                    onLoadRef.current(limited.map(p => p._id));
                }
            } catch (err) {
                console.error("Failed to fetch trending:", err);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, [listingType]); // ✅ Removed onLoad from dependencies

    // Auto-advance slides
    useEffect(() => {
        if (!isAutoPlaying || properties.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % properties.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [isAutoPlaying, properties.length, autoPlayInterval]);

    const goToSlide = useCallback((index) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    }, []);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + properties.length) % properties.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    }, [properties.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % properties.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    }, [properties.length]);

    if (loading) {
        return (
            <div className="h-[70vh] bg-gray-900 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (properties.length === 0) return null;

    const currentProperty = properties[currentIndex];
    const mainImage = currentProperty?.images?.[0]?.url || currentProperty?.images?.[0] || '/placeholder.jpg';

    return (
        <section className="relative h-[75vh] md:h-[80vh] overflow-hidden bg-gray-900">
            {/* Background Images with Simple Crossfade - NO SCALE to prevent glitching */}
            {properties.map((prop, index) => {
                const imgUrl = prop.images?.[0]?.url || prop.images?.[0] || '/placeholder.jpg';
                return (
                    <div
                        key={prop._id}
                        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        style={{ backgroundImage: `url(${imgUrl})` }}
                    />
                );
            })}

            {/* Gradient Overlays - GPU Accelerated */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 will-change-auto" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent will-change-auto" />

            {/* ✅ PERFORMANCE: Simplified floating elements with CSS animations instead of JS */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute bottom-40 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-slower" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-6 md:px-12 lg:px-20">
                {/* Trending Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-6"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-sm rounded-full shadow-lg">
                        <FaFire className="animate-pulse" />
                        Trending {listingType === 'rent' ? 'Rentals' : 'Properties'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/20">
                        <FaEye className="text-blue-400" />
                        {currentProperty?.views || 0} views
                    </span>
                </motion.div>

                {/* Property Info Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl"
                    >
                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight drop-shadow-2xl">
                            {currentProperty?.title}
                        </h1>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-gray-300 mb-6">
                            <FaMapMarkerAlt className="text-blue-400" />
                            <span className="text-lg">{currentProperty?.location}</span>
                        </div>

                        {/* Features Grid - Conditional based on property type */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            {/* Show bedrooms for non-land properties */}
                            {currentProperty?.type?.toLowerCase() !== 'land' && currentProperty?.bedrooms && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                                    <FaBed className="text-blue-400" />
                                    <span className="text-white font-medium">{currentProperty.bedrooms} Beds</span>
                                </div>
                            )}
                            {currentProperty?.type?.toLowerCase() !== 'land' && currentProperty?.bathrooms && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                                    <FaBath className="text-green-400" />
                                    <span className="text-white font-medium">{currentProperty.bathrooms} Baths</span>
                                </div>
                            )}
                            {/* Show size for land properties */}
                            {currentProperty?.type?.toLowerCase() === 'land' && currentProperty?.size && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                                    <FaLandmark className="text-yellow-400" />
                                    <span className="text-white font-medium">{currentProperty.size}</span>
                                </div>
                            )}
                            {/* Show size for other properties if available */}
                            {currentProperty?.type?.toLowerCase() !== 'land' && currentProperty?.size && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                                    <FaRulerCombined className="text-purple-400" />
                                    <span className="text-white font-medium">{currentProperty.size}</span>
                                </div>
                            )}
                        </div>

                        {/* Listed By */}
                        {(currentProperty?.agent || currentProperty?.user) && (
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-lg border border-white/20">
                                    <FaUser className="text-orange-400" />
                                    <span className="text-white/80 text-sm">Listed by:</span>
                                    <span className="text-white font-semibold">
                                        {currentProperty?.agent?.name || currentProperty?.user?.name || 'HouseHunt Agent'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Price and CTA */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 rounded-xl shadow-xl">
                                <span className="text-white/80 text-sm">Price</span>
                                <p className="text-2xl md:text-3xl font-black text-white">
                                    Ksh {currentProperty?.price?.toLocaleString()}
                                    {listingType === 'rent' && <span className="text-lg font-normal">/mo</span>}
                                </p>
                            </div>

                            <Link
                                to={`/properties/${currentProperty?.slug}`}
                                className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-all hover:shadow-xl hover:-translate-y-0.5 text-lg"
                            >
                                View Property
                                <FaChevronRight />
                            </Link>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrevious}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20"
            >
                <FaChevronLeft className="text-xl" />
            </button>
            <button
                onClick={goToNext}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20"
            >
                <FaChevronRight className="text-xl" />
            </button>

            {/* Thumbnail Navigation */}
            <div className="absolute bottom-8 right-8 z-20 hidden lg:flex items-center gap-3">
                {properties.map((prop, index) => {
                    const thumbImg = prop.images?.[0]?.url || prop.images?.[0] || '/placeholder.jpg';
                    return (
                        <button
                            key={prop._id}
                            onClick={() => goToSlide(index)}
                            className={`relative w-20 h-14 rounded-lg overflow-hidden transition-all ${index === currentIndex
                                ? 'ring-2 ring-white scale-110'
                                : 'opacity-60 hover:opacity-100'
                                }`}
                        >
                            <img src={thumbImg} alt="" className="w-full h-full object-cover" />
                            {index === currentIndex && (
                                <div className="absolute inset-0 bg-blue-500/30" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Mobile Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex lg:hidden items-center gap-2">
                {properties.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all rounded-full ${index === currentIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50'
                            }`}
                    />
                ))}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <motion.div
                    key={currentIndex}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
            </div>
        </section>
    );
});

export default TrendingHeroSlider;
