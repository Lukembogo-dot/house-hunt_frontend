// src/components/property/PropertyLocalServices.jsx

import React, { useEffect, useState } from 'react';
import apiClient from '../../api/axios';
import ServiceCard from '../services/ServiceCard';
import { FaTruck, FaMapMarkerAlt } from 'react-icons/fa';

const PropertyLocalServices = ({ location }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      if (!location) return;
      
      try {
        setLoading(true);
        // 1. Clean the location (e.g. "Kilimani, Nairobi" -> "Kilimani") to get broader matches
        const cleanLocation = location.split(',')[0].trim();
        
        // 2. Fetch services strictly for this location
        const { data } = await apiClient.get(`/service-providers?location=${cleanLocation}&limit=4`);
        
        const providers = data.providers || data || [];
        setServices(providers);
      } catch (error) {
        console.error("Failed to load local services", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [location]);

  // Don't render anything if no services are found
  if (!loading && services.length === 0) return null;

  return (
    <div className="mb-12 pt-8 border-t dark:border-gray-700">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <FaTruck className="text-orange-500" /> 
        Verified Services in {location?.split(',')[0]}
      </h3>
      
      {loading ? (
         <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {services.map(service => (
            <div key={service._id} className="w-full h-96">
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      )}
      
      {!loading && services.length > 0 && (
        <div className="mt-6 text-center">
           <a href="/services" className="text-blue-600 hover:underline font-semibold">
              View all service providers in {location?.split(',')[0]} →
           </a>
        </div>
      )}
    </div>
  );
};

export default PropertyLocalServices;