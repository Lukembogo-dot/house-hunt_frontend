import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { motion } from 'framer-motion';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

// ✅ --- ADDED NEW ICONS ---
const icons = {
  property: {
    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  },
  school: {
    url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  },
  hospital: {
    url: "https://maps.google.com/mapfiles/ms/icons/hospitals.png",
  },
  supermarket: {
    url: "https://maps.google.com/mapfiles/ms/icons/shopping.png",
  },
  restaurant: {
    url: "https://maps.google.com/mapfiles/ms/icons/restaurant.png",
  },
  shopping_mall: {
    url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png2",
  },
  police: {
    url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png3",
  },
  lodging: {
    url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png4", // Hotels
  },
  park: {
    url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png5",
  },
  tourist_attraction: {
    url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png6",
  },
  default: {
    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  }
};
// -------------------------

const MapComponent = ({ coordinates, places = [] }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [selectedPlace, setSelectedPlace] = useState(null); 

  const center = coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number'
    ? { lat: coordinates.lat, lng: coordinates.lng }
    : { lat: -1.2921, lng: 36.8219 }; 

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg dark:text-gray-300">
        Loading Map...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onClick={() => setSelectedPlace(null)} 
      >
        {coordinates && coordinates.lat && (
          <Marker 
            position={center} 
            icon={icons.property} 
            title="Property Location"
            zIndex={10}
          />
        )}

        {/* This logic is dynamic and needs no changes */}
        {places.map(place => (
          <Marker
            key={place.id}
            position={place.location}
            icon={icons[place.type] || icons.default}
            title={place.name}
            onClick={() => setSelectedPlace(place)} 
          />
        ))}

        {selectedPlace && (
          <InfoWindow
            position={selectedPlace.location}
            onCloseClick={() => setSelectedPlace(null)} 
          >
            <div className="p-1 max-w-xs">
              <h4 className="font-semibold text-gray-800 text-sm">{selectedPlace.name}</h4>
              <p className="text-gray-600 text-xs">{selectedPlace.vicinity}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </motion.div>
  );
};

export default MapComponent;