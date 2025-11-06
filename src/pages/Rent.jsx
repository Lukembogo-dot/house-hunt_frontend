// src/pages/Rent.jsx
import React from "react";
import PropertyList from "../components/PropertyList";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// ✅ 1. Define a re-usable animation for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ // 'i' is the custom index
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      delay: i * 0.1, // Stagger animation
      ease: "easeOut" 
    }
  })
};

const Rent = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-inter">
      {/* ... (Hero section is unchanged, already animated) ... */}
      <section /* ... */ >
        {/* ... */}
      </section>

      {/* RENTAL LISTINGS */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <PropertyList defaultFilter={{ listingType: 'rent' }} />
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
            {/* ✅ 2. Add scroll-in animations to the 3 cards */}
            <motion.div 
              className="p-6 border dark:border-gray-700 rounded-xl shadow-md dark:shadow-none hover:shadow-lg transition"
              custom={1} // Stagger index 1
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
              custom={2} // Stagger index 2
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
              custom={3} // Stagger index 3
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
          // ✅ 3. Add click animation
          className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold shadow hover:bg-gray-100 transition-all duration-150 active:scale-95"
        >
          Contact Us Today
        </Link>
      </section>
    </div>
  );
};

export default Rent;