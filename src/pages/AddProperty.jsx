// src/pages/AddProperty.jsx
// --- UPDATED with Payment Logic & Smart Pricing ---

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/axios"; 
import { useAuth } from '../context/AuthContext';
import { FaWhatsapp, FaTiktok, FaInstagram, FaMapMarkerAlt, FaSpinner, FaStar } from 'react-icons/fa';
import { useFeatureFlag } from '../context/FeatureFlagContext';
import MapComponent from '../components/MapComponent';
import SmartPricingWidget from '../components/SmartPricingWidget'; // ✅ 1. IMPORT WIDGET

const MAX_FILE_SIZE_MB = 2; 
const NAIROBI_COORDS = { lat: -1.286389, lng: 36.817223 };

// --- 1. SET THE PRICE FOR FEATURED LISTINGS ---
const FEATURE_PRICE_PER_DAY = 170; // Approx 500 KES / 3 days

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

// --- 2. ADD featuredDays to INITIAL STATE ---
const initialFormState = {
  title: '',
  description: '',
  location: '',
  price: '',
  bedrooms: '',
  type: 'apartment',
  status: 'available', // We'll let the backend change this to 'pending' if featured
  listingType: 'sale',
  isFeatured: false,
  featuredDays: 3, // Default to 3 days
  ownerDetails: {
    name: '',
    whatsapp: '',
    tiktok: '',
    instagram: '',
  },
};
// ------------------------------------------

const AddProperty = () => {
  const [formData, setFormData] = useState(initialFormState);
  
  const [coordinates, setCoordinates] = useState(NAIROBI_COORDS);
  const [mapCenter, setMapCenter] = useState(NAIROBI_COORDS);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  const [imageFiles, setImageFiles] = useState([]); 
  const [imageAltTexts, setImageAltTexts] = useState({}); 
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isFeaturedListingEnabled = useFeatureFlag('agent-featured-listing');
  
  // --- 3. CALCULATE DYNAMIC PRICE ---
  const calculatedPrice = formData.featuredDays * FEATURE_PRICE_PER_DAY;
  
  useEffect(() => {
    const getInitialLocation = async () => {
      try {
        const { data } = await apiClient.get(`/maps/geocode?address=Nairobi, Kenya`);
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          setMapCenter({ lat, lng });
          setCoordinates({ lat, lng });
        }
      } catch (error) {
        console.error("Failed to geocode Nairobi:", error);
      }
    };
    getInitialLocation();
  }, []);

  // --- 4. UPDATE handleChange TO SUPPORT CHECKBOXES & NUMBERS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    if (type === 'checkbox') {
      processedValue = checked;
    } else if (name === 'featuredDays') {
      processedValue = Number(value);
    }
    
    setFormData(prevData => ({
      ...prevData,
      [name]: processedValue,
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

  const handleAltTextChange = (index, value) => {
    setImageAltTexts(prev => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleFileChange = (e) => {
    const newlySelectedFiles = Array.from(e.target.files);
    const combinedFiles = [...imageFiles, ...newlySelectedFiles];
    if (combinedFiles.length > 5) {
      setStatus({ 
        message: `Error: You can only upload a maximum of 5 images total. You have selected ${combinedFiles.length} files.`, 
        type: 'error' 
      });
      e.target.value = null; 
      return;
    }
    const oversizedFiles = combinedFiles.filter(file => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setStatus({ 
        message: `Error: Some files exceed the ${MAX_FILE_SIZE_MB}MB limit. Please re-select.`, 
        type: 'error' 
      });
      e.target.value = null; 
      return;
    }
    setImageFiles(combinedFiles);
    const initialAltTexts = {};
    const existingCount = imageFiles.length; 
    newlySelectedFiles.forEach((file, index) => {
      const combinedIndex = existingCount + index;
      initialAltTexts[combinedIndex] = `${formData.title} image ${combinedIndex + 1}`.trim();
    });
    setImageAltTexts(prev => ({ ...prev, ...initialAltTexts }));
    setStatus({ message: '', type: '' });
    e.target.value = null; 
  };
  
  const handleMapClick = async (e) => {
    const clickedCoords = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setCoordinates(clickedCoords);
    setIsGeocoding(true);
    
    try {
      const { data } = await apiClient.get(`/maps/reverse-geocode?lat=${clickedCoords.lat}&lng=${clickedCoords.lng}`);
      setFormData(prev => ({ ...prev, location: data.address }));
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      setStatus({ message: 'Could not find address for that location.', type: 'error' });
    } finally {
      setIsGeocoding(false);
    }
  };
  
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
        setMapCenter({ lat, lng });
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

  // --- 5. UPDATED handleSubmit WITH PAYMENT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      setStatus({ message: 'Please select at least one image to upload.', type: 'error' });
      return;
    }
    setLoading(true);
    setStatus({ message: '', type: '' });

    const dataToSend = new FormData();
    
    // Append all form data
    Object.keys(formData).forEach(key => {
      if (key === 'ownerDetails') {
        // Handle nested object
        if (user && user.role === 'admin' && formData.ownerDetails.name) {
          dataToSend.append('ownerDetails[name]', formData.ownerDetails.name);
          dataToSend.append('ownerDetails[whatsapp]', formData.ownerDetails.whatsapp);
          dataToSend.append('ownerDetails[tiktok]', formData.ownerDetails.tiktok);
          dataToSend.append('ownerDetails[instagram]', formData.ownerDetails.instagram);
        }
      } else {
        // Append all other fields
        dataToSend.append(key, formData[key]);
      }
    });
    
    if (coordinates) {
      dataToSend.append('coordinates[lat]', coordinates.lat);
      dataToSend.append('coordinates[lng]', coordinates.lng);
    }
    
    const altTextsArray = [];
    for (let i = 0; i < imageFiles.length; i++) {
      dataToSend.append('images', imageFiles[i]);
      altTextsArray.push(imageAltTexts[i] || ''); 
    }
    dataToSend.append('imageAltTexts', JSON.stringify(altTextsArray)); 

    try {
      // --- This first API call is now to create the property AND the payment order ---
      const response = await apiClient.post("/properties", dataToSend, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // --- NEW PAYMENT REDIRECT LOGIC ---
      if (formData.isFeatured && response.data.paymentRedirectUrl) {
        // If "isFeatured" was checked AND we got a payment URL back...
        setStatus({ message: 'Property saved! Redirecting to payment...', type: 'success' });
        
        // Redirect to Pesapal checkout
        window.location.href = response.data.paymentRedirectUrl;

      } else {
        // This is a standard (non-featured) listing
        setStatus({ message: `Success! Property "${response.data.title}" added. Redirecting...`, type: 'success' });
        setTimeout(() => {
          navigate(`/properties/${response.data.slug}`);
        }, 2000);
      }
      // --- END OF NEW LOGIC ---

    } catch (error) {
      console.error("Error creating property:", error.response?.data || error.message);
      setStatus({ 
        message: `Failed to add property: ${error.response?.data?.message || 'Check console for details.'}`, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:border dark:border-gray-700">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
          List a New Property
        </h1>
        
        {status.message && (
          <div className={`p-4 mb-6 text-sm rounded-lg ${
            status.type === 'success' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
          }`} role="alert">
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- Main Property Details --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Property Title" 
              name="title" 
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Spacious 3-Bedroom Apartment" 
            />
            <InputField 
              label="Price (Ksh)" 
              name="price" 
              type="number" 
              value={formData.price}
              onChange={handleChange}
              placeholder={formData.listingType === 'rent' ? 'e.g., 50000' : 'e.g., 15000000'}
              min={100} 
            />
          </div>

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
              <MapComponent
                coordinates={mapCenter}
                places={[]} // We don't need to show nearby places
                onMapClick={handleMapClick}
                markerPosition={coordinates} // This will show the single marker
                isDraggable={true}
                onMarkerDragEnd={handleMapClick} // Re-use the click handler for drag
              />
            </div>
          </div>
          {/* ------------------------------- */}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              placeholder="A detailed description of the property..."
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formData.type !== 'land' && (
              <InputField 
                label="Bedrooms" 
                name="bedrooms" 
                type="number" 
                value={formData.bedrooms}
                onChange={handleChange}
                min={0} 
                placeholder="e.g., 3"
                required={false} // Bedrooms are not strictly required
              />
            )}
            
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
          </div>

          {/* ✅ 11. ADDED SMART PRICING WIDGET HERE */}
          <SmartPricingWidget 
            location={formData.location}
            type={formData.type}
            bedrooms={formData.bedrooms}
            currentPrice={formData.price}
          />
          {/* ---------------------------------- */}
          
          {/* --- Image Upload --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="image">
              Property Images (Select up to 5)
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              required={imageFiles.length === 0}
              multiple
              className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
            />
             {imageFiles.length > 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selected: {imageFiles.length} files (Max {MAX_FILE_SIZE_MB}MB each)</p>}
          </div>

          {/* --- Image Alt Text --- */}
          {imageFiles.length > 0 && (
            <div className="space-y-4 pt-4 border-t dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Image SEO Alt Text</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Provide descriptive alt text for each image to improve SEO and accessibility.
              </p>
              {imageFiles.map((file, index) => (
                <InputField
                  key={index}
                  label={`Alt Text for Image ${index + 1} (${file.name})`}
                  name={`alt-text-${index}`}
                  value={imageAltTexts[index] || ''}
                  onChange={(e) => handleAltTextChange(index, e.target.value)}
                  placeholder={`e.g., Interior view of ${formData.title}`}
                  required={false}
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
                (Admin Only) Add these details for properties where the agent is not on the platform.
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

          {/* --- 6. UPDATED "FEATURE LISTING" SECTION --- */}
          {isFeaturedListingEnabled && (
            <div className="space-y-4 pt-6 border-t dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Boost Your Listing (Optional)
              </h2>
              <div className="relative flex items-start bg-blue-50 dark:bg-blue-900/30 border border-blue-500/30 p-4 rounded-lg">
                <div className="flex-shrink-0">
                  <FaStar className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1">
                  <label htmlFor="isFeatured" className="block text-lg font-bold text-gray-900 dark:text-white">
                    Feature this Listing
                  </label>
                  <p id="isFeatured-description" className="text-gray-700 dark:text-gray-300">
                    Your listing will be highlighted and shown on the homepage.
                  </p>
                  
                  {/* --- NEW: DURATION DROPDOWN (appears when checked) --- */}
                  {formData.isFeatured && (
                    <div className="mt-4">
                      <label htmlFor="featuredDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Duration
                      </label>
                      <select
                        id="featuredDays"
                        name="featuredDays"
                        value={formData.featuredDays}
                        onChange={handleChange}
                        className="mt-1 block w-full md:w-1/2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm p-2"
                      >
                        <option value={3}>3 Days</option>
                        <option value={7}>7 Days</option>
                        <option value={14}>14 Days</option>
                      </select>
                    </div>
                  )}

                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                    Total Price: Ksh {calculatedPrice}
                  </p>
                </div>
                <div className="flex items-center h-5">
                  <input
                    id="isFeatured"
                    name="isFeatured"
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
          {/* --- END OF NEW SECTION --- */}
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || isGeocoding}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white transition ${
                (loading || isGeocoding) 
                  ? 'bg-blue-400 dark:bg-blue-800 dark:text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500'
              }`}
            >
              {loading ? 'Submitting...' : (isGeocoding ? 'Locating...' : 'Submit Listing')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;