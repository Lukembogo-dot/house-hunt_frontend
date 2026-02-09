import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

const WhatsAppButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Auto-show the popup after a delay
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!hasInteracted) {
                setIsVisible(true);
            }
        }, 3000); // Show after 3 seconds

        return () => clearTimeout(timer);
    }, [hasInteracted]);

    const handleClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsVisible(false);
        setHasInteracted(true);
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 flex items-center justify-end pointer-events-none">
            <div className="relative flex items-center pointer-events-auto">
                {/* Engagement Popup */}
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 10, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="absolute right-16 mr-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-3 rounded-2xl rounded-tr-none shadow-xl border border-gray-100 dark:border-gray-700 w-64 max-w-[calc(100vw-6rem)] origin-right"
                        >
                            <div className="absolute top-0 -right-2 w-4 h-4 bg-white dark:bg-gray-800 transform rotate-45 border-t border-r border-gray-100 dark:border-gray-700"></div>

                            <div className="relative z-10 flex flex-col gap-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                        Need help finding a home? 🏡
                                    </h4>
                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 -mt-1 -mr-2 p-1"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                    Tell us what you're looking for, and we'll find it for you!
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* WhatsApp Button */}
                <motion.a
                    href="https://wa.me/254776929021?text=Hi%2C%20I%27m%20looking%20for%20a%20property.%20Can%20you%20help%20me%20find%20one%3F"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95, rotate: 5 }}
                    className="w-14 h-14 bg-[#25D366] text-white rounded-full shadow-xl shadow-green-600/30 hover:bg-[#20b85c] transition-all duration-200 flex items-center justify-center group will-change-transform relative z-20"
                    title="Chat on WhatsApp"
                    onClick={() => {
                        setIsVisible(false);
                        setHasInteracted(true);
                    }}
                >
                    <FaWhatsapp className="text-3xl" />

                    {/* Notification Badge if popup is hidden but not interacted? Optional. */}
                    {!isVisible && !hasInteracted && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
                    )}
                </motion.a>
            </div>
        </div>
    );
};

export default WhatsAppButton;
