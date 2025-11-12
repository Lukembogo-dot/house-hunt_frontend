// pages/OurPlatform.jsx
// FINAL FIX (Corrected </p> tag)

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUsers, FaBuilding, FaSearch, FaCheckCircle, FaThumbsUp, FaKey } from 'react-icons/fa';
import useSeoData from '../hooks/useSeoData';
import SeoInjector from '../components/SeoInjector';

// --- Re-usable Animations ---

// Animation for "bouncy" cards
const bouncyCard = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: (i) => ({ // 'i' is the custom delay index
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 100,
    }
  })
};

// Animation for "slide-in" text
const slideIn = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// --- Page Component ---

const OurPlatform = () => {
  // 1. Setup SEO
  const seo = useSeoData(
    '/our-platform', // Unique path for the SEO dashboard
    'Our Platform: The Revolution of Kenyan Real Estate',
    'Learn why HouseHunt Kenya is a revolution: a free, powerful, and transparent hub for property managers, real estate firms, and home seekers.'
  );

  return (
    <>
      {/* 2. Inject SEO */}
      <SeoInjector seo={seo} />
      <div className="bg-white dark:bg-gray-900 overflow-x-hidden">

        {/* --- Hero Section --- */}
        <div className="relative bg-blue-600 dark:bg-blue-800 text-white py-24 md:py-32 px-6 text-center">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <motion.div 
            className="relative z-10 max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={bouncyCard}
            custom={0}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
              The Kenyan Property Puzzle
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              We're not just another listings website. We are a free, powerful, and transparent hub designed to fix the broken real estate market for everyone.
            </p>
            <Link
              to="/for-agents"
              className="px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
            >
              List Your Properties for Free
            </Link>
          </motion.div>
        </div>

        {/* --- The Problem Section --- */}
        <section className="py-20 px-6 bg-gray-100 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={slideIn}
            >
              The "Old Way" Is Broken
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Card 1: The Seeker's Struggle */}
              <motion.div
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700"
                custom={1} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={bouncyCard}
              >
                <FaSearch className="text-4xl text-red-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">The Seeker's Struggle</h3>
                <ul className="text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-2">
                  <li>"Ghost" listings that are already sold/rented.</li>
                  <li>Inaccurate photos and information.</li>
                  <li>Wasting time contacting unresponsive agents.</li>
                  <li>A deep lack of a central, trusted source.</li>
                </ul>
              </motion.div>
              {/* Card 2: The Professional's Dilemma */}
              <motion.div
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700"
                custom={2} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={bouncyCard}
              >
                <FaBuilding className="text-4xl text-red-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">The Professional's Dilemma</h3>
                <ul className="text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-2">
                  <li>Paying high subscription fees (a "visibility tax").</li>
                  <li>Competing with low-quality, unverified listings.</li>
                  <li>Fragmented marketing efforts with low ROI.</li>
                  <li>Struggling to gain meaningful online visibility.</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- The Solution Section --- */}
        <section className="py-20 px-6 bg-blue-50 dark:bg-blue-900/50">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={slideIn}
            >
              Our Solution: A Virtuous Cycle
            </motion.h2>
            <div className="flex flex-col md:flex-row justify-center gap-8">
              {/* Step 1 */}
              <motion.div
                className="flex-1 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700"
                custom={0} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={bouncyCard}
              >
                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-3">01. Agents List for Free</div>
                <p className="text-gray-600 dark:text-gray-300">We empower all professional firms to list their *entire* portfolio for free. This creates the most comprehensive database.</p>
              </motion.div>
              {/* Step 2 */}
              <motion.div
                className="flex-1 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700"
                custom={1} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={bouncyCard}
              >
                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-3">02. Seekers Get Quality</div>
                <p className="text-gray-600 dark:text-gray-300">Seekers flock to HouseHunt for the largest, most accurate, and up-to-date source of verified properties.</p>
              </motion.div>
              {/* Step 3 */}
              <motion.div
                className="flex-1 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700"
                custom={2} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={bouncyCard}
              >
                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-3">03. Agents Get Free Leads</div>
                <p className="text-gray-600 dark:text-gray-300">This high-intent traffic of seekers delivers what agents *actually* want: qualified leads, not high invoices.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- Features for Professionals Section --- */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={slideIn}
            >
              For <span className="text-blue-600">Real Estate Firms & Property Managers</span>
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg" custom={0} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={bouncyCard}>
                <FaCheckCircle className="text-4xl text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">The Power of Free</h3>
                <p className="text-gray-600 dark:text-gray-300">Zero listing fees. Zero subscription fees. Zero commissions. Upload unlimited listings and de-risk your marketing.</p>
              </motion.div>
              <motion.div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg" custom={1} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={bouncyCard}>
                <FaBuilding className="text-4xl text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Property Management Hub</h3>
                <p className="text-gray-600 dark:text-gray-300">We highlight your firm, not just your listings. Attract new landlords and showcase your management services.</p>
              </motion.div>
              <motion.div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg" custom={2} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={bouncyCard}>
                <FaUsers className="text-4xl text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">True Online Visibility</h3>
                <p className="text-gray-600 dark:text-gray-300">Your listings benefit from our platform's "collective SEO power," getting seen by a massive audience on Google.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- Features for Home Seekers Section --- */}
        <section className="py-20 px-6 bg-gray-100 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={slideIn}
            >
              For <span className="text-blue-600">Home Seekers</span>
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg" custom={0} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={bouncyCard}>
                <FaKey className="text-4xl text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Comprehensive Database</h3>
                <p className="text-gray-600 dark:text-gray-300">Find the largest collection of professionally marketed properties in Kenya, all in one place.</p>
              </motion.div>
              <motion.div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg" custom={1} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={bouncyCard}>
                <FaThumbsUp className="text-4xl text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">A Platform Built on Trust</h3>
                <p className="text-gray-600 dark:text-gray-300">We filter out the noise by focusing on verified professionals, reducing fraud and "ghost" listings.</p>
              </motion.div>
              <motion.div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg" custom={2} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={bouncyCard}>
                <FaSearch className="text-4xl text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Discover a Partner</h3>
                <p className="text-gray-600 dark:text-gray-300">Don't just find a property; find a great property manager. We help you choose your service provider.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- Final CTA Section --- */}
        <section className="py-24 px-6 bg-blue-600 dark:bg-blue-800 text-white text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={bouncyCard}
          >
            <h2 className="text-4xl font-extrabold mb-6">Join the New Neighbourhood</h2>
            {/* ▼▼▼ THIS IS THE FIX ▼▼▼ */}
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              The old way is over. Join the community of top-tier firms and confident seekers building the future of real estate in Kenya.
            </p> 
            {/* ▲▲▲ THIS WAS </V>, NOW IT'S </p> ▲▲▲ */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
              >
                Start Listing for Free
              </Link>
              <Link
                to="/"
                className="px-10 py-4 bg-blue-700 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-900 border border-blue-400 transition-all duration-200 active:scale-95"
              >
                Start Searching for Homes
              </Link>
            </div>
          </motion.div>
        </section>

      </div>
    </>
  );
};

export default OurPlatform;