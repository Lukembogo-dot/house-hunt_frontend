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
      />

      {/* ✨ QUICK CATEGORY FILTERS */}
      <section className="py-12 px-6 bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950" />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-10 left-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="inline-block px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Browse by Category
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              What Type of Rental?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {propertyTypes.map((type, index) => (
              <motion.button
                key={type.type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => setSelectedType(selectedType === type.type ? null : type.type)}
                className={`relative group p-8 rounded-2xl border-2 transition-all ${selectedType === type.type
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300'
                  }`}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${type.color} rounded-2xl flex items-center justify-center text-white text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <type.icon />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{type.label}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Find {type.label.toLowerCase()} for rent across Kenya
                </p>
                <FaArrowRight className="absolute top-8 right-8 text-gray-300 dark:text-gray-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ✨ TRUST INDICATORS */}
      <section className="py-8 px-6 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-8 text-white">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-2xl text-yellow-400" />
            <span className="font-bold">Verified Listings</span>
          </div>
          <div className="w-px h-8 bg-white/30 hidden md:block" />
          <div className="flex items-center gap-3">
            <FaWallet className="text-2xl text-green-400" />
            <span className="font-bold">Budget Friendly</span>
          </div>
          <div className="w-px h-8 bg-white/30 hidden md:block" />
          <div className="flex items-center gap-3">
            <FaSearch className="text-2xl text-pink-400" />
            <span className="font-bold">Property Scouts Available</span>
          </div>
        </div>
      </section>

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

      {/* ✨ SCOUT CTA - Enhanced */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600" />

        {/* Animated background elements */}
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-10 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-10 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block text-5xl mb-6"
            >
              🏠
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Can't Find Your Dream Rental?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Let our dedicated property scouts find the perfect home for you. Tell us what you need and we'll do the hunting!
            </p>
            <Link
              to="/wanted/post"
              className="inline-flex items-center gap-3 bg-white text-purple-600 font-bold py-4 px-10 rounded-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-lg"
            >
              <FaSearch />
              Let Our Scouts Find It For You
            </Link>
            <p className="text-white/60 text-sm mt-4">Free service • No obligations • Quick responses</p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Rent;