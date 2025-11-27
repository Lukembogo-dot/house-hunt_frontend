// src/pages/Buy.jsx
import React, { useState } from "react";
import PropertyList from "../components/PropertyList";
import TrendingProperties from "../components/TrendingProperties"; // ✅ Import Trending
import { motion } from 'framer-motion'; 
import useSeoData from "../hooks/useSeoData";
import SeoInjector from "../components/SeoInjector";

function Buy() {
  const seo = useSeoData(
    '/buy', 
    'Buy Houses & Land in Kenya - Listings | HouseHunt', 
    'Search the largest selection of properties for sale including houses, apartments, and land across Kenya. Find your next investment or home.' 
  );

  // ✅ State to track IDs shown in Trending to avoid duplicates
  const [trendingIds, setTrendingIds] = useState([]);

  return (
    <>
      <SeoInjector seo={seo} />
      
      <section className="py-20 px-6 bg-gray-100 dark:bg-gray-950 min-h-screen">
        <div className="max-w-7xl mx-auto text-center">
          
          <motion.h2 
            className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Buy Properties in Kenya
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover your perfect home to buy across Kenya — from budget-friendly starter homes to luxurious estates.
          </motion.p>

          {/* ✅ 1. TRENDING SECTION (Top 12 Sales) */}
          <div className="mb-16">
             <TrendingProperties 
               listingType="sale" 
               onLoad={(ids) => setTrendingIds(ids)} 
             />
          </div>

          {/* divider */}
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
            <span className="text-gray-500 dark:text-gray-400 font-bold uppercase text-sm tracking-widest">
              Explore More
            </span>
            <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
          </div>

          {/* ✅ 2. EXPLORE MORE (Excludes Trending IDs) */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 py-10 px-4">
            <PropertyList 
              defaultFilter={{ listingType: 'sale' }} 
              excludedIds={trendingIds} // Prevents duplicates
              showTitle={false}
            />
          </div>

        </div>
      </section>
    </>
  );
}

export default Buy;