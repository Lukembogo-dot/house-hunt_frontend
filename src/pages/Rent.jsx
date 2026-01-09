// src/pages/Rent.jsx
import React, { useState } from "react";
import PropertyList from "../components/PropertyList";
import TrendingProperties from "../components/TrendingProperties"; // ✅ Import Trending
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useSeoData from "../hooks/useSeoData";
import SeoInjector from "../components/SeoInjector";
import { Helmet } from 'react-helmet-async';

// Define a re-usable animation for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: "easeOut"
    }
  })
};

const Rent = () => {
  const seo = useSeoData(
    '/rent',
    'Affordable Rental Homes & Apartments in Kenya | HouseHunt',
    'Browse thousands of verified listings for rental properties across Nairobi, Mombasa, and other major Kenyan towns. Find your next apartment or house for rent today.'
  );

  // ✅ State to track IDs shown in Trending to avoid duplicates
  const [trendingIds, setTrendingIds] = useState([]);

  return (
    <>
      <SeoInjector seo={seo} />

      {/* ✅ RENT PAGE SPECIFIC SCHEMA */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Properties for Rent in Kenya",
            "description": "Browse thousands of verified rental listings including apartments, bungalows, and bedsitters.",
            "url": "https://www.househuntkenya.co.ke/rent",
            "about": {
              "@type": "Thing",
              "name": "Rental Properties",
              "description": "Residential and commercial properties available for lease."
            },
            "audience": [
              { "@type": "Audience", "audienceType": "Tenants" },
              { "@type": "Audience", "audienceType": "Property Agents" }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-inter">

        {/* ✅ AI/CRAWLER SUMMARY: Hidden from users */}
        <article className="sr-only" aria-hidden="true">
          <h1>Rent Verified Properties in Kenya</h1>
          <p>
            Looking for a house to rent? HouseHunt Kenya offers the widest selection of **apartments**, **bedsits**, and **family homes** in Nairobi, Kiambu, and Mombasa.
            Our verified listings ensure you find a home that fits your budget.
          </p>
          <section>
            <h2>List Your Property</h2>
            <p>
              Are you a **landlord**, **property manager**, or **real estate agent**?
              <strong>List your rental property with us for free</strong> to reach thousands of tenants.
              We provide the best tools to manage inquiries and fill vacancies quickly.
            </p>
          </section>
        </article>

        {/* HERO / TITLE SECTION */}
        <section className="pt-20 pb-10 px-6 text-center">
          <motion.h1
            className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Properties for Rent in Kenya
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Find your next home from our verified list of apartments, bungalows, and shared spaces.
          </motion.p>
        </section>

        {/* ✅ 1. TRENDING RENTALS (Top 12) */}
        <div className="mb-10">
          <TrendingProperties
            listingType="rent"
            onLoad={(ids) => setTrendingIds(ids)}
          />
        </div>

        {/* DIVIDER */}
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-4 mb-8">
          <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
          <span className="text-gray-500 dark:text-gray-400 font-bold uppercase text-sm tracking-widest">
            Explore All Rentals
          </span>
          <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
        </div>

        {/* ✅ 2. EXPLORE MORE LISTINGS (Excludes Trending) */}
        <section className="pb-16 px-6 bg-gray-100 dark:bg-gray-900 pt-10">
          <div className="max-w-6xl mx-auto">
            <PropertyList
              defaultFilter={{ listingType: 'rent' }}
              excludedIds={trendingIds} // Prevents duplicates
              showTitle={false}
            />
          </div>
        </section>

        {/* Why Rent With Us */}
        <section className="bg-white dark:bg-gray-800 py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h3 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
              Why Rent With Us
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
              We make it easier to find verified, affordable homes for rent in
              Kenya. Whether you’re looking for a city apartment or a countryside
              retreat, we connect you to trusted landlords and secure listings.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                className="p-6 border dark:border-gray-700 rounded-xl shadow-md dark:shadow-none hover:shadow-lg transition"
                custom={1}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                  Verified Listings
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Every property is screened for authenticity so you can rent with
                  confidence and avoid scams.
                </p>
              </motion.div>
              <motion.div
                className="p-6 border dark:border-gray-700 rounded-xl shadow-md dark:shadow-none hover:shadow-lg transition"
                custom={2}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                  Affordable Options
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  We list a wide range of affordable houses and apartments across
                  major towns and cities.
                </p>
              </motion.div>
              <motion.div
                className="p-6 border dark:border-gray-700 rounded-xl shadow-md dark:shadow-none hover:shadow-lg transition"
                custom={3}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                  Expert Support
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Our team is here to help you through every step of your rental
                  journey — from search to signing.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white py-16 text-center">
          <h3 className="text-3xl font-semibold mb-4">
            Can’t Find Your Dream Home?
          </h3>
          <p className="text-gray-200 mb-8">
            Let us help you discover more rental options tailored to your needs.
          </p>
          <Link
            to="/contact"
            className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold shadow hover:bg-gray-100 transition-all duration-150 active:scale-95"
          >
            Contact Us Today
          </Link>
        </section>
      </div>
    </>
  );
};

export default Rent;