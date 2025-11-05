// src/pages/Rent.jsx
import React from "react";
import PropertyList from "../components/PropertyList";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Rent = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-inter">
      {/* ... (Hero section is unchanged) ... */}
      <section
        className="relative bg-cover bg-center h-[60vh] flex flex-col items-center justify-center text-center text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600607687480-6d1a01d1a1b1?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 px-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg"
          >
            Find Homes for Rent in Kenya
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed"
          >
            Browse affordable and verified rental properties across Kenya — from
            modern apartments to spacious family homes.
          </motion.p>
        </div>
      </section>

      {/* RENTAL LISTINGS */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {/* ✅ FIX: Pass the 'rent' filter */}
          <PropertyList defaultFilter={{ listingType: 'rent' }} />
        </div>
      </section>

      {/* ... (Why Rent With Us and CTA sections are unchanged) ... */}
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
            <div className="p-6 border dark:border-gray-700 rounded-xl shadow-md dark:shadow-none hover:shadow-lg transition">
              <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                Verified Listings
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Every property is screened for authenticity so you can rent with
                confidence and avoid scams.
              </p>
            </div>
            <div className="p-6 border dark:border-gray-700 rounded-xl shadow-md dark:shadow-none hover:shadow-lg transition">
              <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                Affordable Options
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                We list a wide range of affordable houses and apartments across
                major towns and cities.
              </p>
            </div>
            <div className="p-6 border dark:border-gray-700 rounded-xl shadow-md dark:shadow-none hover:shadow-lg transition">
              <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                Expert Support
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Our team is here to help you through every step of your rental
                journey — from search to signing.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-blue-600 text-white py-16 text-center">
        <h3 className="text-3xl font-semibold mb-4">
          Can’t Find Your Dream Home?
        </h3>
        <p className="text-gray-200 mb-8">
          Let us help you discover more rental options tailored to your needs.
        </p>
        <Link
          to="/contact"
          className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold shadow hover:bg-gray-100 transition"
        >
          Contact Us Today
        </Link>
      </section>
    </div>
  );
};

export default Rent;