// src/components/home/HeroImageSlider.jsx
// Premium hero section with auto-rotating background images and parallax effects

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FaRocket, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// High-quality Kenyan real estate images
const heroImages = [
    {
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80',
        alt: 'Modern luxury apartment exterior',
        title: 'Find Your Dream Home',
        subtitle: 'Discover premium properties across Kenya'
    },
    {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80',
        alt: 'Luxury home interior living room',
        title: 'Luxury Living Awaits',
        subtitle: 'Explore beautifully designed interiors'
    },
    {
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80',
        alt: 'Modern family-friendly home with garden',
        title: 'Perfect for Families',
        subtitle: 'Spacious homes with room to grow'
    },
    {
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80',
        alt: 'Beautiful land and countryside',
        title: 'Prime Land Opportunities',
        subtitle: 'Invest in your future with premium plots'
    },
    {
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2000&q=80',
        alt: 'Modern apartment interior design',
        title: 'Urban Lifestyle',
        subtitle: 'Contemporary apartments in prime locations'
    }
];

const HeroImageSlider = ({ children, showText = true, autoPlayInterval = 6000 }) => {
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
        <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
            {/* Background Images with Cross-fade */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                    className="absolute inset-0"
                    style={{ scale: heroScale }}
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${currentImage.url})` }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/20" />

            {/* Animated Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, 20, 0],
                        y: [0, 40, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"
                />
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

                {/* Dynamic Title */}
                {showText && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-4xl"
                        >
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 drop-shadow-2xl">
                                {currentImage.title}
                            </h1>
                            <p className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto font-light">
                                {currentImage.subtitle}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* Children (Search bar, etc.) */}
                {children}
            </motion.div>

            {/* Navigation Arrows */}
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

            {/* Slide Indicators */}
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
};

export default HeroImageSlider;
