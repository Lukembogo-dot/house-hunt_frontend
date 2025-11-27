// src/pages/About.jsx

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useSeoData from "../hooks/useSeoData";
import SeoInjector from "../components/SeoInjector";
import { useFeatureFlag } from "../context/FeatureFlagContext.jsx";

// Define a re-usable animation variant
const fadeInSlideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default function About() {
  const seo = useSeoData(
    '/about', 
    'About HouseHunt Kenya - Our Mission and Vision', 
    'Learn about HouseHunt Kenya: our mission to simplify property ownership, our vision for a transparent marketplace, and our core values of integrity and customer satisfaction.'
  );
  
  const isAgentCtaEnabled = useFeatureFlag('agent-landing-page-cta');
  const isPlatformCtaEnabled = useFeatureFlag('platform-overview-cta');

  return (
    <>
      <SeoInjector seo={seo} />
      
      {/* ✅ UPDATED: Clean, Continuous Section with Reduced Spacing */}
      <section className="bg-gray-50 dark:bg-gray-950 min-h-screen pt-32 pb-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* ✅ HERO: Text Only, Animated, No Background Image */}
          <div className="mb-10">
            <motion.h1 
              className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight"
              initial="hidden"
              animate="visible"
              variants={fadeInSlideUp}
            >
              About HouseHunt Kenya
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
              initial="hidden"
              animate="visible"
              variants={fadeInSlideUp}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            >
              Your trusted real estate partner dedicated to helping you find your dream home. 
              We combine innovation, transparency, and local expertise to make property hunting simple.
            </motion.p>
          </div>

          {/* (Removed the large <img> block here for a cleaner look) */}

          {/* ✅ VALUES GRID: Closer to Hero for continuous flow */}
          <div className="grid md:grid-cols-3 gap-6 text-left mb-12">
            
            <motion.div 
              className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInSlideUp}
            >
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">Our Mission</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                To simplify property discovery and ownership through technology, ensuring every client 
                finds a place they can proudly call home.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInSlideUp}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">Our Vision</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                To become Kenya’s most trusted digital property marketplace by offering 
                affordable, transparent, and seamless real estate experiences.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInSlideUp}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">Our Values</h3>
              <ul className="text-gray-600 dark:text-gray-400 text-sm list-disc pl-4 space-y-1">
                <li>Integrity and transparency</li>
                <li>Customer satisfaction</li>
                <li>Innovation and technology</li>
                <li>Community and sustainability</li>
              </ul>
            </motion.div>
          </div>

          {/* --- FEATURE CTA SECTIONS (Reduced Margins: mt-10 instead of mt-20) --- */}
          
          {isPlatformCtaEnabled && (
            <motion.div
              className="mt-10 py-12 px-8 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm text-gray-900 dark:text-white"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInSlideUp}
            >
              <h4 className="text-2xl font-extrabold mb-3">Our Revolutionary Platform</h4>
              <p className="text-base text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-6">
                Learn why we built HouseHunt Kenya and how our free model changes the game.
              </p>
              <Link
                to="/our-platform"
                className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-95"
              >
                Discover Our "Why"
              </Link>
            </motion.div>
          )}

          {isAgentCtaEnabled && (
            <motion.div
              className="mt-10 py-12 px-8 bg-blue-600 dark:bg-blue-900 rounded-2xl shadow-lg text-white"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInSlideUp}
            >
              <h4 className="text-2xl font-extrabold mb-3">Are You an Agent?</h4>
              <p className="text-base text-blue-100 max-w-2xl mx-auto mb-6">
                Grow your business, connect with clients, and boost sales—all for free.
              </p>
              <Link
                to="/for-agents"
                className="bg-white text-blue-700 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition-all duration-150 active:scale-95"
              >
                Learn More
              </Link>
            </motion.div>
          )}

          {/* ✅ Final Call to Action (Reduced spacing) */}
          <motion.div 
            className="mt-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeInSlideUp}
          >
            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Ready to find your home?</h4>
            <Link
              to="/"
              className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-all duration-150 active:scale-95"
            >
              Explore Properties
            </Link>
          </motion.div>

        </div>
      </section>
    </>
  );
}