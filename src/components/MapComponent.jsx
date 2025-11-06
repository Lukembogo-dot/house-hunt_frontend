import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { motion } from 'framer-motion'; // ✅ Import motion

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

const MapComponent = ({ coordinates }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const center = coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number'
    ? { lat: coordinates.lat, lng: coordinates.lng }
    : { lat: -1.2921, lng: 36.8219 }; // Default to Nairobi

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg dark:text-gray-300">
        Loading Map...
      </div>
    );
  }

  return (
    // ✅ Added motion
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
      >
        {coordinates && coordinates.lat && <Marker position={center} />}
      </GoogleMap>
    </motion.div>
  );
};

export default MapComponent;