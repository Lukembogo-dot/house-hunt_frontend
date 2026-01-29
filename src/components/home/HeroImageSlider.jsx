// src/components/home/HeroImageSlider.jsx
// Premium hero section with auto-rotating background images and parallax effects

import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FaRocket, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import heroBg1 from '../../assets/images/hero-bg-1.png';
import heroBgScouts from '../../assets/images/hero-bg-scouts.png';
import heroBgAgents from '../../assets/images/hero-bg-agents.png';

// High-quality Kenyan real estate images
const heroImages = [
    {
        url: heroBg1,
        alt: 'Modern luxury apartment exterior',
        title: 'Land, Apartments & Rentals in Kenya',
        subtitle: 'Verified and trusted properties across Kenya'
    },
    {
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2560&q=95',
        alt: 'Beautiful land and countryside',
        title: 'Prime Land Opportunities',
        subtitle: 'Invest in your future with premium plots'
    },
    {
        url: heroBgAgents,
        alt: 'Real estate office with agents',
        title: 'For Real Estate Firms',
        subtitle: 'Maximum online visibility and instant connection with serious buyers'
    }
];

// ✅ PERFORMANCE: Memoized component
const HeroImageSlider = memo(({ children, showText = true, autoPlayInterval = 10000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);
    const textY = useTransform(scrollY, [0, 200], [0, 50]);

    // Auto-advance slides
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroImages.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [isAutoPlaying, autoPlayInterval]);

    const goToSlide = useCallback((index) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        // Resume auto-play after 10 seconds
        setTimeout(() => setIsAutoPlaying(true), 10000);
    }, []);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    }, []);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % heroImages.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    }, []);

    const currentImage = heroImages[currentIndex];

    return (
        <section className="relative h-[70vh] md:h-[80vh] bg-gray-900 group">
            {/* ✅ BACKGROUND CLIPPING CONTAINER */}
            {/* This ensures images don't spill out, but allows search dropdown (in children) to overflow visible */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Background Images */}
                {heroImages.map((image, index) => (
                    <img
                        key={index}
                        src={image.url}
                        alt={image.alt}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchpriority={index === 0 ? "high" : "auto"}
                    />
                ))}

                {/* Gradient Overlays - Reduced opacity for better image clarity */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/50 will-change-auto" />

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl animate-float-slow" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-2xl animate-float-slower" />
                    <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-float-fastest" />
                </div>
            </div>

            {/* Content Container */}
            <motion.div
                style={{ opacity: heroOpacity, y: textY }}
                className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md text-white font-bold text-xs uppercase tracking-widest mb-6 border border-white/20 shadow-xl"
                >
                    <FaRocket className="text-yellow-400" />
                    <span>The Next Gen Real Estate Tech</span>
                </motion.div>

                {/* Dynamic Title - Fixed Height Container to prevent layout shift */}
                <div className="min-h-[160px] md:min-h-[200px] flex flex-col justify-center items-center w-full">
                    {showText && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="max-w-4xl"
                            >
                                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 drop-shadow-2xl leading-none">
                                    {currentImage.title}
                                </h2>
                                <p className="text-xl md:text-3xl lg:text-4xl text-gray-200 mb-0 max-w-2xl mx-auto font-light">
                                    {currentImage.subtitle}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                {/* Children (Search bar, etc.) */}
                {children}
            </motion.div>

            {/* Navigation Arrows */}
            {heroImages.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 border border-white/20 group"
                        aria-label="Previous slide"
                    >
                        <FaChevronLeft className="text-xl group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 border border-white/20 group"
                        aria-label="Next slide"
                    >
                        <FaChevronRight className="text-xl group-hover:scale-110 transition-transform" />
                    </button>
                </>
            )}

            {/* Slide Indicators */}
            {heroImages.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                    {heroImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`transition-all duration-300 rounded-full ${index === currentIndex
                                ? 'w-8 h-3 bg-white'
                                : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Progress Bar */}
            {heroImages.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <motion.div
                        key={currentIndex}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                </div>
            )}
        </section>
    );
});

export default HeroImageSlider;
