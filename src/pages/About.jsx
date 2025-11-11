// About.jsx (UPDATED)

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// ✅ NEW IMPORTS
import useSeoData from "../hooks/useSeoData";
import SeoInjector from "../components/SeoInjector";
import { useFeatureFlag } from "../context/FeatureFlagContext.jsx"; // <-- 1. IMPORT THE HOOK


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
  // ✅ 1. Use the new SEO hook
  const seo = useSeoData(
    '/about', // The unique path identifier
    'About HouseHunt Kenya - Our Mission and Vision', // Default Title
    'Learn about HouseHunt Kenya: our mission to simplify property ownership, our vision for a transparent marketplace, and our core values of integrity and customer satisfaction.' // Default Description
  );
  
  // 2. CHECK FOR THE NEW FEATURE FLAG
  const isAgentCtaEnabled = useFeatureFlag('agent-landing-page-cta');

  return (
    <>
      {/* ✅ 2. Inject SEO Tags */}
      <SeoInjector seo={seo} />
      
      <section className="bg-gray-50 dark:bg-gray-950 min-h-screen py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          
          {/* ✅ Animate Title */}
          <motion.h2 
            className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6"
            initial="hidden"
            animate="visible"
            variants={fadeInSlideUp}
          >
            About HouseHunt Kenya
          </motion.h2>
          
          {/* ✅ Animate Subtitle */}
          <motion.p 
            className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeInSlideUp}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          >
            HouseHunt Kenya is your trusted real estate partner dedicated to helping you find your dream home 
            — whether you’re buying, renting, or investing. We combine innovation, transparency, and local 
            expertise to make property hunting simple and enjoyable.
          </motion.p>

          {/* ✅ Animate Image */}
          <motion.div 
            className="rounded-2xl overflow-hidden shadow-lg mb-12"
            initial="hidden"
            whileInView="visible" // Animates when it scrolls into view
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInSlideUp}
          >
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
              alt="About HouseHunt Kenya"
              className="w-full h-[400px] object-cover"
            />
          </motion.div>

          {/* Mission, Vision, Values */}
          <div className="grid md:grid-cols-3 gap-8 text-left">
            
            {/* ✅ Animate Card 1 */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:border dark:border-gray-700 hover:shadow-lg transition"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeInSlideUp}
            >
              <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-3">Our Mission</h3>
              <p className="text-gray-600 dark:text-gray-300">
                To simplify property discovery and ownership through technology, ensuring every client 
                finds a place they can proudly call home.
              </p>
            </motion.div>

            {/* ✅ Animate Card 2 */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:border dark:border-gray-700 hover:shadow-lg transition"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeInSlideUp}
              transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            >
              <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-3">Our Vision</h3>
              <p className="text-gray-600 dark:text-gray-300">
                To become Kenya’s most trusted digital property marketplace by offering 
                affordable, transparent, and seamless real estate experiences.
              </p>
            </motion.div>

            {/* ✅ Animate Card 3 */}
            <motion.div 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md dark:border dark:border-gray-700 hover:shadow-lg transition"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeInSlideUp}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            >
              <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-3">Our Values</h3>
              <ul className="text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-2">
                <li>Integrity and transparency</li>
                <li>Customer satisfaction</li>
                <li>Innovation and technology</li>
                <li>Community and sustainability</li>
              </ul>
            </motion.div>
          </div>

          {/* --- 3. ADD THIS NEW SECTION (IT'S WRAPPED IN THE FLAG) --- */}
          {isAgentCtaEnabled && (
            <motion.div
              className="mt-20 py-16 px-8 bg-blue-600 dark:bg-blue-800 rounded-2xl shadow-xl text-white"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeInSlideUp}
            >
              <h4 className="text-3xl font-extrabold mb-4">Are You an Agent or Property Manager?</h4>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
                Learn how HouseHunt Kenya is built specifically for real estate firms to grow their business, connect with clients, and boost sales—all for free.
              </p>
              <Link
                to="/for-agents"
                className="bg-white text-blue-700 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all duration-150 active:scale-95"
              >
                Learn More for Agents
              </Link>
            </motion.div>
          )}
          {/* --- END OF NEW SECTION --- */}


          {/* ✅ Animate Call to Action */}
          <motion.div 
            className="mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeInSlideUp}
          >
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Join Thousands of Happy Home Seekers</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Whether you’re looking to rent, buy, or sell, HouseHunt Kenya is here to guide you every step of the way.
            </p>
            <Link
              to="/"
              // ✅ Add click animation
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-all duration-150 active:scale-95"
            >
              Explore Properties
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}