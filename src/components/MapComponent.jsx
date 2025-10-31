import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

const MapComponent = ({ coordinates }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    // This safely loads the API key from your frontend .env file
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Check if coordinates are valid before setting the center
  const center = coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number'
    ? { lat: coordinates.lat, lng: coordinates.lng }
    : { lat: -1.2921, lng: 36.8219 }; // Default to Nairobi, Kenya if coordinates are invalid

  // Show a loading message while the map script is loading
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-[400px] bg-gray-200 rounded-lg">Loading Map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
    >
      {/* Only show the marker if the property has valid coordinates */}
      {coordinates && coordinates.lat && <Marker position={center} />}
    </GoogleMap>
  );
};

export default MapComponent;