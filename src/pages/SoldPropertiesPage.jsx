import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // ✅ 1. IMPORT HELMET FOR SEO
import apiClient from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import { FaCheckCircle, FaCity, FaArrowLeft, FaSearch, FaRegSadTear } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SoldPropertiesPage = () => {
  const { status, location } = useParams(); // e.g. status="sold", location="kilimani"
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/properties/archive/${status}/${location}`);
        setProperties(data);
      } catch (error) {
        console.error("Error fetching archive:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (status && location) {
      fetchArchive();
    }
  }, [status, location]);

  // Formatting helpers
  const formattedLocation = location ? location.charAt(0).toUpperCase() + location.slice(1) : '';
  const formattedStatus = status === 'sold' ? 'Sold' : 'Rented';
  const activeAction = status === 'sold' ? 'Buy' : 'Rent';
  const activeLink = `/search/${status === 'sold' ? 'sale' : 'rent'}/${location}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* ✅ 2. DYNAMIC SEO META TAGS */}
      <Helmet>
        <title>{`${formattedStatus} Properties in ${formattedLocation} | Market Data - HouseHunt Kenya`}</title>
        <meta 
          name="description" 
          content={`Browse archive of recently ${formattedStatus.toLowerCase()} properties in ${formattedLocation}. View historical prices and market trends. Missed out? Find active listings here.`} 
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.househuntkenya.co.ke/${status}/${location}`} />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4"
          >
            <FaCheckCircle size={32} />
          </motion.div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Properties Just {formattedStatus} in <span className="text-blue-600 dark:text-blue-400">{formattedLocation}</span>
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Browse our archive of recently {formattedStatus.toLowerCase()} homes. 
            These properties are no longer available, but they provide great insight into the {formattedLocation} market.
          </p>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {properties.map((prop, index) => (
              <motion.div 
                key={prop._id} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                {/* Overlay Badge */}
                <div className="absolute top-4 right-4 z-20 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wide">
                  {formattedStatus}
                </div>
                
                {/* Visual indicator that it is inactive */}
                <div className="filter grayscale hover:grayscale-0 transition duration-500 opacity-90 hover:opacity-100">
                  <PropertyCard property={prop} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-2xl mx-auto">
            <FaCity className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No {formattedStatus} Data Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              We haven't archived any {formattedStatus.toLowerCase()} properties in {formattedLocation} recently.
            </p>
            <Link 
              to={status === 'sold' ? '/buy' : '/rent'} 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <FaArrowLeft size={14} /> View Available Properties
            </Link>
          </div>
        )}

        {/* ✅ 3. CONVERSION SECTION (CTA) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl relative overflow-hidden"
        >
          {/* Decorative circle */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white"></div>
          </div>

          <div className="relative z-10">
            <FaRegSadTear className="text-5xl mx-auto mb-4 text-blue-200" />
            <h2 className="text-3xl font-bold mb-4">Missed out on these properties?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Don't worry! We have many more active listings in <strong>{formattedLocation}</strong> waiting for you.
              Check out what's available right now.
            </p>
            
            <Link 
              to={activeLink}
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <FaSearch /> View Active Listings in {formattedLocation}
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default SoldPropertiesPage;