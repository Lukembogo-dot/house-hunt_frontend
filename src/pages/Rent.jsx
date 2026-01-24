// src/pages/Rent.jsx
// Enhanced Rent page with hero slider and professional design

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaHome, FaBuilding, FaDoorOpen, FaSearch, FaArrowRight, FaShieldAlt, FaHandshake, FaWallet } from 'react-icons/fa';
import PropertyList from "../components/PropertyList";
import { TrendingHeroSlider } from "../components/home";
import useSeoData from "../hooks/useSeoData";
import SeoInjector from "../components/SeoInjector";
import { Helmet } from 'react-helmet-async';

// Rental property type categories
const propertyTypes = [
  { icon: FaBuilding, label: 'Apartments', type: 'apartment', color: 'from-blue-500 to-cyan-500' },
  { icon: FaHome, label: 'Houses', type: 'house', color: 'from-purple-500 to-pink-500' },
  { icon: FaDoorOpen, label: 'Bedsitters', type: 'bedsitter', color: 'from-green-500 to-emerald-500' },
];

// Why Rent features
const whyRentFeatures = [
  {
    icon: FaShieldAlt,
    title: 'Verified Listings',
    desc: 'Every property is screened for authenticity so you can rent with confidence.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FaWallet,
    title: 'Affordable Options',
    desc: 'Wide range of budget-friendly homes across major towns and cities.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: FaHandshake,
    title: 'Expert Support',
    desc: 'Our team guides you from search to signing your lease.',
    color: 'from-purple-500 to-pink-500'
  }
];

const Rent = () => {
  const seo = useSeoData(
    '/rent',
    'Affordable Rental Homes & Apartments in Kenya | HouseHunt',
    'Browse thousands of verified listings for rental properties across Nairobi, Mombasa, and other major Kenyan towns. Find your next apartment or house for rent today.'
  );

  const [trendingIds, setTrendingIds] = useState([]);
  const [selectedType, setSelectedType] = useState(null);

  return (
    <>
      <SeoInjector seo={seo} />

      {/* RENT PAGE SPECIFIC SCHEMA */}
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

      {/* AI/CRAWLER SUMMARY: Hidden from users */}
      <article className="sr-only" aria-hidden="true">
        <h1>Rent Verified Properties in Kenya</h1>
        <p>
          Looking for a house to rent? HouseHunt Kenya offers the widest selection of **apartments**, **bedsits**, and **family homes** in Nairobi, Kiambu, and Mombasa.
        </p>
      </article>

      {/* ✨ HERO SLIDER - Trending Rentals */}
      <TrendingHeroSlider
        listingType="rent"
        onLoad={(ids) => setTrendingIds(ids)}
        autoPlayInterval={5000}
        showBanner={false}
      />


      {/* ✨ EXPLORE MORE SECTION */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -left-40 w-80 h-80 border border-dashed border-gray-200 dark:border-gray-800 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-20 -right-20 w-64 h-64 border border-dashed border-gray-200 dark:border-gray-800 rounded-full"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              Explore Rentals
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              More Properties For Rent
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover your perfect home from our curated collection of verified rentals
            </p>
          </motion.div>

          {/* Property List Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 py-10 px-6 md:px-10"
          >
            <PropertyList
              defaultFilter={{
                listingType: 'rent',
                ...(selectedType && { type: selectedType })
              }}
              excludedIds={trendingIds}
              showTitle={false}
              limit={12}
            />
          </motion.div>
        </div>
      </section>

      {/* ✨ WHY RENT WITH US - Enhanced */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              The Smarter Way to Rent
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We make it easier to find verified, affordable homes in Kenya
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyRentFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg`}>
                  <feature.icon />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



    </>
  );
};

export default Rent;