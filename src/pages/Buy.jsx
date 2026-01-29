// src/pages/Buy.jsx
// Enhanced Buy page with hero slider and professional design

import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHome, FaLandmark, FaBuilding, FaSearch, FaArrowRight, FaShieldAlt, FaHandshake } from 'react-icons/fa';
import PropertyList from "../components/PropertyList";
import { TrendingHeroSlider } from "../components/home";
import useSeoData from "../hooks/useSeoData";
import SeoInjector from "../components/SeoInjector";
import { Helmet } from 'react-helmet-async';

// Property type categories removed

function Buy() {
  const seo = useSeoData(
    '/buy',
    'Buy Houses & Land in Kenya - Listings | HouseHunt',
    'Search the largest selection of properties for sale including houses, apartments, and land across Kenya. Find your next investment or home.'
  );

  const [trendingIds, setTrendingIds] = useState([]);

  return (
    <>
      <SeoInjector seo={seo} />

      {/* BUY PAGE SPECIFIC SCHEMA */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Properties for Sale in Kenya",
            "description": "Find premier land, houses, and apartments for sale across Nairobi and Kenya.",
            "url": "https://www.househuntkenya.co.ke/buy",
            "about": {
              "@type": "Thing",
              "name": "Real Estate for Sale",
              "description": "Commercial and residential properties available for purchase."
            },
            "audience": [
              { "@type": "Audience", "audienceType": "Home Buyers" },
              { "@type": "Audience", "audienceType": "Land Investors" },
              { "@type": "Audience", "audienceType": "Real Estate Agents" }
            ]
          })}
        </script>
      </Helmet>

      {/* AI/CRAWLER SUMMARY: Hidden from users */}
      <article className="sr-only">
        <h1>Buy Land and Houses in Kenya</h1>
        <p>
          **HouseHunt Kenya** is the premier platform for buying and selling real estate.
          We offer verified listings for **land for sale**, **houses for sale**, and **luxury apartments**.
        </p>
      </article>

      {/* ✨ HERO SLIDER - Trending Properties */}
      <TrendingHeroSlider
        listingType="sale"
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
            className="absolute -top-40 -right-40 w-80 h-80 border border-dashed border-gray-200 dark:border-gray-800 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-20 -left-20 w-64 h-64 border border-dashed border-gray-200 dark:border-gray-800 rounded-full"
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
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Explore Properties
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              More Properties For Sale
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover your perfect investment opportunity from our curated collection
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
                listingType: 'sale'
              }}
              excludedIds={trendingIds}
              showTitle={false}
              limit={12}
            />
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Can't find what you're looking for?
            </p>
            <Link
              to="/wanted/post"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5"
            >
              <FaSearch />
              Let Our Scouts Find It For You
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default Buy;