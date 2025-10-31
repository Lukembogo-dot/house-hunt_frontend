// src/pages/Rent.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import PropertyCard from "../components/PropertyCard";
import SearchBar from "../components/SearchBar";
import { motion } from "framer-motion";

const Rent = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/properties?status=rent"
      );
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error("❌ Error fetching rentals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      {/* HERO SECTION */}
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-full shadow-xl px-6 py-3 mt-2 max-w-2xl mx-auto border border-gray-200"
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

      {/* RENTAL LISTINGS */}
      <section className="py-16 px-6 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12"
          >
            Available Rentals
          </motion.h2>

          {loading ? (
            <div className="flex justify-center items-center min-h-[40vh]">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : properties.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-lg">No rental properties found.</p>
              <p className="text-sm">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* WHY RENT WITH US SECTION */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-semibold text-gray-800 mb-6">
            Why Rent With Us
          </h3>
          <p className="text-gray-600 max-w-3xl mx-auto mb-10">
            We make it easier to find verified, affordable homes for rent in
            Kenya. Whether you’re looking for a city apartment or a countryside
            retreat, we connect you to trusted landlords and secure listings.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-xl shadow-md hover:shadow-lg transition">
              <h4 className="text-xl font-bold text-blue-600 mb-3">
                Verified Listings
              </h4>
              <p className="text-gray-600">
                Every property is screened for authenticity so you can rent with
                confidence and avoid scams.
              </p>
            </div>

            <div className="p-6 border rounded-xl shadow-md hover:shadow-lg transition">
              <h4 className="text-xl font-bold text-blue-600 mb-3">
                Affordable Options
              </h4>
              <p className="text-gray-600">
                We list a wide range of affordable houses and apartments across
                major towns and cities.
              </p>
            </div>

            <div className="p-6 border rounded-xl shadow-md hover:shadow-lg transition">
              <h4 className="text-xl font-bold text-blue-600 mb-3">
                Expert Support
              </h4>
              <p className="text-gray-600">
                Our team is here to help you through every step of your rental
                journey — from search to signing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-blue-600 text-white py-16 text-center">
        <h3 className="text-3xl font-semibold mb-4">
          Can’t Find Your Dream Home?
        </h3>
        <p className="text-gray-200 mb-8">
          Let us help you discover more rental options tailored to your needs.
        </p>
        <a
          href="/contact"
          className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold shadow hover:bg-gray-100 transition"
        >
          Contact Us Today
        </a>
      </section>
    </div>
  );
};

export default Rent;
