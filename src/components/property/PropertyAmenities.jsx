// src/components/property/PropertyAmenities.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaWifi, FaCar, FaVideo, FaTint, FaSwimmingPool, FaDumbbell, 
  FaArrowUp, FaBolt, FaShieldAlt, FaTree, FaUserShield, 
  FaWheelchair, FaNetworkWired, FaPaw, FaCheck, FaHome, FaWind, FaLayerGroup
} from 'react-icons/fa';

// Icon Mapping
const iconMap = {
  "Wifi": <FaWifi />,
  "Parking": <FaCar />,
  "CCTV": <FaVideo />,
  "Borehole": <FaTint />,
  "Swimming Pool": <FaSwimmingPool />,
  "Gym": <FaDumbbell />,
  "Elevator": <FaArrowUp />,
  "Backup Generator": <FaBolt />,
  "Fenced": <FaShieldAlt />,
  "Garden": <FaTree />,
  "Staff Quarters": <FaHome />,
  "Security Guard": <FaUserShield />,
  "Balcony": <FaWind />,
  "Wheelchair Access": <FaWheelchair />,
  "Fiber Internet": <FaNetworkWired />,
  "Pet Friendly": <FaPaw />
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const PropertyAmenities = ({ amenities }) => {
  if (!amenities || amenities.length === 0) return null;

  return (
    <motion.div 
      className="mb-8" 
      variants={sectionVariants} 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true, amount: 0.2 }}
    >
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
        <FaLayerGroup className="mr-2 text-blue-600 dark:text-blue-400" /> 
        Amenities & Features
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {amenities.map((amenity, index) => (
          <div 
            key={index} 
            className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <span className="text-blue-500 dark:text-blue-400 mr-3 text-lg">
              {iconMap[amenity] || <FaCheck />} {/* Use specific icon or default check */}
            </span>
            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              {amenity}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PropertyAmenities;