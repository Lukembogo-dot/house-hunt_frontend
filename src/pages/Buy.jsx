import React from "react";
import PropertyList from "../components/PropertyList";
import { motion } from 'framer-motion'; // ✅ 1. Import motion

function Buy() {
  return (
    <section className="py-20 px-6 bg-gray-100 dark:bg-gray-950 min-h-screen">
      <div className="max-w-6xl mx-auto text-center">
        {/* ✅ 2. Add animation to hero text */}
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

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700 py-10 px-4">
          <PropertyList defaultFilter={{ listingType: 'sale' }} />
        </div>
      </div>
    </section>
  );
}

export default Buy;