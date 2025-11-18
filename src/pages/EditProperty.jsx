// src/pages/EditProperty.jsx

import React, { useState, useEffect } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/axios';
import { FaTimes, FaWhatsapp, FaTiktok, FaInstagram, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa'; 
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import MapComponent from '../components/MapComponent'; 
import SmartPricingWidget from '../components/SmartPricingWidget'; // ✅ 1. IMPORT WIDGET

const MAX_FILE_SIZE_MB = 2;
const NAIROBI_COORDS = { lat: -1.286389, lng: 36.817223 }; 

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, min = 0, required = true }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor={name}>
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
    />
  </div>
);

const AltTextInputField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder="Descriptive alt text for SEO"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
    />
  </div>
);


const EditProperty = () => {
  const { user } = useAuth(); 
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    bedrooms: '',
    type: 'apartment',
    status: 'available', 
    listingType: 'sale',
    ownerDetails: {
      name: '',
      whatsapp: '',
      tiktok: '',
      instagram: '',
    },
  });
  
  // 5. --- NEW STATE FOR MAP ---
  const [coordinates, setCoordinates] = useState(null);
  const [mapCenter, setMapCenter] = useState(NAIROBI_COORDS);
  const [isGeocoding, setIsGeocoding] = useState(false);
  // ---------------------------
  
  const [existingImages, setExistingImages] = useState([]); 
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImageAltTexts, setNewImageAltTexts] = useState({});
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id: propertyId } = useParams();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/properties/${propertyId}`);
        setFormData({
          title: data.title,
          description: data.description,
          location: data.location,
          price: data.price,
          bedrooms: data.bedrooms || '', 
          type: data.type,
          status: data.status || 'available', 
          listingType: data.listingType || 'sale',
          ownerDetails: data.ownerDetails || { name: '', whatsapp: '', tiktok: '', instagram: '' },
        });
        
        // 6. --- SET MAP COORDINATES FROM LOADED DATA ---
        if (data.coordinates && data.coordinates.lat) {
          setCoordinates(data.coordinates);
          setMapCenter(data.coordinates);
        } else {
          setCoordinates(NAIROBI_COORDS); // Fallback
        }
        // ---------------------------------------------
        
        let imagesToSet = [];
        if (data.images && data.images.length > 0) {
          imagesToSet = data.images;
        } else if (data.imageUrl) {
          imagesToSet = [{ url: data.imageUrl, altText: `${data.title} image` }]; 
        }
        setExistingImages(imagesToSet);

      } catch (err) {
        setStatus({ message: 'Failed to load property data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      ownerDetails: {
        ...prevData.ownerDetails,
        [name]: value,
      },
    }));
  };
  
  const handleExistingAltTextChange = (index, value) => {
    setExistingImages(prevImages => prevImages.map((img, i) => 
      i === index ? { ...img, altText: value } : img
    ));
  };
  
  const handleNewAltTextChange = (index, value) => {
    setNewImageAltTexts(prev => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleFileChange = (e) => {
    // ... (file handling logic is unchanged) ...
    const newlySelectedFiles = Array.from(e.target.files);
    const combinedNewFiles = [...newImageFiles, ...newlySelectedFiles];
    if (combinedNewFiles.length > 5) {
      setStatus({ 
        message: `Error: You can only add a maximum of 5 NEW images total. You have selected ${combinedNewFiles.length} files.`, 
        type: 'error' 
      });
      e.target.value = null; 
      return;
    }
    const oversizedFiles = combinedNewFiles.filter(file => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setStatus({ 
        message: `Error: Some files exceed the ${MAX_FILE_SIZE_MB}MB limit.`, 
        type: 'error' 
      });
      e.target.value = null;
      return;
    }
    setNewImageFiles(combinedNewFiles);
    const initialAltTexts = {};
    const existingCount = newImageFiles.length; 
    newlySelectedFiles.forEach((_, index) => {
      const combinedIndex = existingCount + index;
      initialAltTexts[combinedIndex] = `${formData.title} new image ${combinedIndex + 1}`.trim();
    });
    setNewImageAltTexts(prev => ({ ...prev, ...initialAltTexts }));
    setStatus({ message: '', type: '' });
    e.target.value = null;
  };

  const handleRemoveExistingImage = (imageUrlToRemove) => {
    setExistingImages(existingImages.filter(img => img.url !== imageUrlToRemove));
  };
  
  // 7. --- NEW: Handle clicks on the map ---
  const handleMapClick = async (e) => {
    const clickedCoords = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setCoordinates(clickedCoords); // Update marker position
    setIsGeocoding(true); // Show loading spinner
    
    try {
      // Call our new backend route
      const { data } = await apiClient.get(`/maps/reverse-geocode?lat=${clickedCoords.lat}&lng=${clickedCoords.lng}`);
      // Update the location text field
      setFormData(prev => ({ ...prev, location: data.address }));
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      setStatus({ message: 'Could not find address for that location.', type: 'error' });
    } finally {
      setIsGeocoding(false);
    }
  };
  
  // 8. --- NEW: Geocode the typed address ---
  const handleGeocodeAddress = async () => {
    if (!formData.location) {
      setStatus({ message: 'Please enter a location to find on map.', type: 'error' });
      return;
    }
    setIsGeocoding(true);
    try {
      const { data } = await apiClient.get(`/maps/geocode?address=${formData.location}`);
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setCoordinates({ lat, lng });
        setMapCenter({ lat, lng }); // Re-center the map
      } else {
        setStatus({ message: 'Could not find coordinates for that address.', type: 'error' });
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      setStatus({ message: 'Failed to geocode address.', type: 'error' });
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ message: '', type: '' });

    const dataToSend = new FormData();
    // Append all top-level form data
    Object.keys(formData).forEach(key => {
      if (key !== 'ownerDetails') {
        dataToSend.append(key, formData[key]);
      }
    });

    // 9. --- APPEND COORDINATES TO FORM DATA ---
    if (coordinates) {
      dataToSend.append('coordinates[lat]', coordinates.lat);
      dataToSend.append('coordinates[lng]', coordinates.lng);
    }
    // -----------------------------------------

    if (user && user.role === 'admin') {
      dataToSend.append('ownerDetails[name]', formData.ownerDetails.name);
      dataToSend.append('ownerDetails[whatsapp]', formData.ownerDetails.whatsapp);
      dataToSend.append('ownerDetails[tiktok]', formData.ownerDetails.tiktok);
      dataToSend.append('ownerDetails[instagram]', formData.ownerDetails.instagram);
    }
    
    const validExistingImages = existingImages.filter(img => img.url);
    dataToSend.append('existingImages', JSON.stringify(validExistingImages));
    
    const newImageAltTextsArray = [];
    if (newImageFiles && newImageFiles.length > 0) {
      for (let i = 0; i < newImageFiles.length; i++) {
        dataToSend.append('images', newImageFiles[i]);
        newImageAltTextsArray.push(newImageAltTexts[i] || '');
      }
      dataToSend.append('newImageAltTexts', JSON.stringify(newImageAltTextsArray));
    }


    try {
      const response = await apiClient.put(`/properties/${propertyId}`, dataToSend, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStatus({ message: `Success! Property "${response.data.title}" updated. Redirecting...`, type: 'success' });
      
      setTimeout(() => {
        navigate(`/properties/${response.data.slug}`);
      }, 2000);

    } catch (error) {
      console.error("Error updating property:", error.response?.data || error.message);
      setStatus({ 
        message: `Failed to update property: ${error.response?.data?.message || 'Check console.'}`, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        key={propertyId} 
        className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:border dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
          Edit Property
        </h1>
        
        {status.message && (
          <div key={status.message} className={`p-4 mb-6 text-sm rounded-lg ${
            status.type === 'success' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
          }`} role="alert">
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField label="Property Title" name="title" value={formData.title} onChange={handleChange} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="listingType">
                Listing For
              </label>
              <select
                id="listingType" name="listingType" value={formData.listingType} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="type">
                Property Type
              </label>
              <select
                id="type" name="type" value={formData.type} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="airbnb">Airbnb</option>
                <option value="land">Land</option>
              </select>
            </div>
          </div>
          
          {/* 10. --- NEW MAP & LOCATION SECTION --- */}
          <div className="space-y-6 pt-6 border-t dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <InputField 
                  label="Location (Type or click map)" 
                  name="location" 
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Nairobi, Kilimani" 
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 invisible">
                  Find on Map
                </label>
                <button
                  type="button"
                  onClick={handleGeocodeAddress}
                  disabled={isGeocoding}
                  className="w-full h-11 flex items-center justify-center space-x-2 bg-gray-600 text-white py-2.5 rounded-lg hover:bg-gray-700 transition-all duration-150 disabled:opacity-50"
                >
                  {isGeocoding ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaMapMarkerAlt />
                  )}
                  <span>Find on Map</span>
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click on the map to set a precise location. The marker will appear at the clicked spot.
            </p>
            
            <div className="h-80 w-full rounded-lg overflow-hidden border dark:border-gray-700">
              {/* Only render map if we have valid coordinates */}
              {coordinates && (
                <MapComponent
                  coordinates={mapCenter}
                  places={[]} // We don't need to show nearby places
                  onMapClick={handleMapClick}
                  markerPosition={coordinates} // This will show the single marker
                  isDraggable={true}
                  onMarkerDragEnd={handleMapClick} // Re-use the click handler for drag
                />
              )}
            </div>
          </div>
          {/* ------------------------------- */}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows="4" value={formData.description} onChange={handleChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Price (Ksh)" 
              name="price" 
              type="number" 
              value={formData.price}
              onChange={handleChange}
              placeholder={formData.listingType === 'rent' ? 'e.g., 50000' : 'e.g., 15000000'}
              min={100} 
            />
            
            {formData.type !== 'land' && (
              <InputField 
                label="Bedrooms" 
                name="bedrooms" 
                type="number" 
                value={formData.bedrooms}
                onChange={handleChange}
                min={0} 
                placeholder="e.g., 3"
                required={false} // Bedrooms not strictly required
              />
            )}
          </div>

          {/* ✅ 11. ADDED SMART PRICING WIDGET HERE */}
          <SmartPricingWidget 
            location={formData.location}
            type={formData.type}
            bedrooms={formData.bedrooms}
            currentPrice={formData.price}
          />
          {/* ---------------------------------- */}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="status">
              Property Status
            </label>
            <select
              id="status" name="status" value={formData.status} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="available">Available</option>
              <option value="full">Full/Rented</option>
            </select>
          </div>
          
          {/* --- Existing Images --- */}
          {existingImages.length > 0 && (
            <div className="space-y-4 pt-4 border-t dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Existing Images (Alt Text)</h3>
              {existingImages.map((img, index) => (
                <div key={img.url} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <div className="md:col-span-1 relative">
                    <img 
                        src={img.url} 
                        alt={img.altText || "Existing property image"} 
                        className="w-full h-24 object-cover rounded-lg"
                    />
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button" 
                        onClick={() => handleRemoveExistingImage(img.url)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none shadow-md transition"
                        aria-label="Remove image"
                    >
                        <FaTimes size={12} />
                    </motion.button>
                  </div>
                  <div className="md:col-span-4">
                    <AltTextInputField
                      label={`Alt Text (Image ${index + 1})`}
                      value={img.altText || ''}
                      onChange={(e) => handleExistingAltTextChange(index, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* --- Add New Images --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="new-images">
              Add New Images (Select up to 5 total)
            </label>
            <input
              type="file"
              id="new-images"
              name="new-images"
              onChange={handleFileChange}
              multiple
              className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
            />
            {newImageFiles.length > 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selected: {newImageFiles.length} new files (Max {MAX_FILE_SIZE_MB}MB each)</p>}
          </div>
          
          {/* --- Alt Text for New Images --- */}
          {newImageFiles.length > 0 && (
            <div className="space-y-4 pt-4 border-t dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">New Image Alt Text</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Provide alt text for new images.
              </p>
              {newImageFiles.map((file, index) => (
                <AltTextInputField
                  key={index}
                  label={`Alt Text for New Image ${index + 1} (${file.name})`}
                  value={newImageAltTexts[index] || ''}
                  onChange={(e) => handleNewAltTextChange(index, e.target.value)}
                />
              ))}
            </div>
          )}
          
          {/* --- Owner & Social Media Details (ADMIN ONLY) --- */}
          {user && user.role === 'admin' && (
            <div className="space-y-6 pt-6 border-t dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Owner & Social Media Details
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                (Admin Only) Add/Edit details for properties where the agent is not on the platform.
              </p>
              
              <InputField 
                label="Owner/Agent Name" 
                name="name" 
                value={formData.ownerDetails.name}
                onChange={handleOwnerChange}
                placeholder="e.g., Jane Doe"
                required={false}
              />
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="whatsapp">
                  Owner WhatsApp
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaWhatsapp className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="whatsapp"
                  name="whatsapp"
                  placeholder="e.g., 254712345678"
                  value={formData.ownerDetails.whatsapp}
                  onChange={handleOwnerChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="tiktok">
                  Owner TikTok Handle
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaTiktok className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="tiktok"
                  name="tiktok"
                  placeholder="e.g., @janedoe"
                  value={formData.ownerDetails.tiktok}
                  onChange={handleOwnerChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="instagram">
                  Owner Instagram Handle
                </label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaInstagram className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  placeholder="e.g., @janedoe"
                  value={formData.ownerDetails.instagram}
                  onChange={handleOwnerChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>

            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || isGeocoding}
              className={`w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-lg font-medium text-white transition-all duration-150 active:scale-[0.98] ${
                (loading || isGeocoding) 
                ? 'bg-blue-400 dark:bg-blue-800 dark:text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500'
              }`}
            >
              {loading ? 'Updating...' : (isGeocoding ? 'Locating...' : 'Save Changes')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProperty;