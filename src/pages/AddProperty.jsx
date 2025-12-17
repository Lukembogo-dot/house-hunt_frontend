// src/pages/AddProperty.jsx
// (UPDATED: Fixed 500 Error by removing manual Content-Type & fixing Coordinate sending)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/axios";
import { useAuth } from '../context/AuthContext';
import {
  FaWhatsapp, FaTiktok, FaInstagram, FaMapMarkerAlt,
  FaSpinner, FaStar, FaUserCheck, FaSearch, FaExclamationCircle, FaUser,
  FaCheckSquare, FaSquare, FaPlus, FaTimes,
  FaBus, FaWifi, FaShoppingBasket, FaVideo, FaGem, FaCloudUploadAlt, FaLock
} from 'react-icons/fa';
import { useFeatureFlag } from '../context/FeatureFlagContext';
import MapComponent from '../components/MapComponent';
import SmartPricingWidget from '../components/SmartPricingWidget';

const MAX_FILE_SIZE_MB = 5;
const NAIROBI_COORDS = { lat: -1.286389, lng: 36.817223 };
const FEATURE_PRICE_PER_DAY = 170;

// Standard Amenities
const AMENITIES_LIST = [
  "Wifi", "Parking", "CCTV", "Borehole", "Swimming Pool", "Gym",
  "Elevator", "Backup Generator", "Fenced", "Garden", "Staff Quarters",
  "Security Guard", "Balcony", "Wheelchair Access", "Fiber Internet", "Pet Friendly"
];

const ISP_LIST = ["Safaricom Home Fibre", "Zuku", "JTL Faiba", "Starlink", "Liquid Home", "Telkom"];

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, min = 0, required = true, icon = null, list = null }) => (
  <div className="relative mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor={name}>
      {label}
    </label>
    {icon && (
      <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
    )}
    <input
      type={type}
      id={name}
      name={name}
      list={list}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      required={required}
      autoComplete="off"
      className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${icon ? 'pl-10 pr-4' : 'px-4'}`}
    />
  </div>
);

const initialFormState = {
  title: '',
  description: '',
  location: '',
  price: '',
  bedrooms: '',
  landSize: '',
  pricePer: 'total', // ✅ Default to generic price 
  priceFrequency: 'month',
  amenities: [],
  video: '',
  matatuRoute: '',
  matatuFare: '',
  mamaMbogaDistance: '',
  internetReady: false,
  internetProviders: [],
  type: 'apartment',
  status: 'available',
  listingType: 'sale',
  isFeatured: false,
  featuredDays: 3,
  agentId: '',
  ownerDetails: {
    name: '',
    whatsapp: '',
    tiktok: '',
    instagram: '',
  },
};

const AddProperty = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [coordinates, setCoordinates] = useState(NAIROBI_COORDS);
  const [mapCenter, setMapCenter] = useState(NAIROBI_COORDS);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageAltTexts, setImageAltTexts] = useState({});
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const [videoFile, setVideoFile] = useState(null);
  const [customAmenityInput, setCustomAmenityInput] = useState('');

  const [existingAgents, setExistingAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ Dynamic Limits: Admin/Subscribed = 10 images + Video. Others = 5 images + No Video.
  const isPremium = user?.role === 'admin' || user?.isLeadSubscribed;
  const MAX_IMAGES = isPremium ? 10 : 5;

  const isFeaturedListingEnabled = useFeatureFlag('agent-featured-listing');
  const calculatedPrice = formData.featuredDays * FEATURE_PRICE_PER_DAY;

  const [essentialOptions, setEssentialOptions] = useState({
    matatuRoutes: [],
    mamaMbogaDistances: [],
    internetProviders: ["Safaricom Home Fibre", "Zuku", "JTL Faiba"] // Fallback
  });

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

    // ✅ FETCH AUTOCOMPLETE OPTIONS
    const fetchOptions = async () => {
      try {
        const { data } = await apiClient.get('/properties/essentials-options');
        setEssentialOptions(data);
      } catch (error) {
        console.error("Failed to fetch essentials options", error);
      }
    };
    fetchOptions();

    const fetchAgents = async () => {
      if (user && user.role === 'admin') {
        try {
          const { data } = await apiClient.get('/users/all-agents', { withCredentials: true });
          setExistingAgents(data || []);
        } catch (err) {
          console.error("Failed to fetch agents:", err);
        }
      }
    };
    fetchAgents();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;
    if (type === 'checkbox' && name === 'isFeatured') processedValue = checked;
    else if (type === 'checkbox' && name === 'internetReady') processedValue = checked;
    else if (name === 'featuredDays') processedValue = Number(value);

    setFormData(prevData => ({
      ...prevData,
      [name]: processedValue,
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => {
      const current = prev.amenities || [];
      if (current.includes(amenity)) {
        return { ...prev, amenities: current.filter(a => a !== amenity) };
      } else {
        return { ...prev, amenities: [...current, amenity] };
      }
    });
  };

  const handleISPToggle = (isp) => {
    setFormData(prev => {
      const current = prev.internetProviders || [];
      if (current.includes(isp)) {
        return { ...prev, internetProviders: current.filter(p => p !== isp) };
      } else {
        return { ...prev, internetProviders: [...current, isp] };
      }
    });
  };

  const handleAddCustomAmenity = (e) => {
    e.preventDefault();
    const trimmed = customAmenityInput.trim();
    if (!trimmed) return;

    if (!formData.amenities.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, trimmed]
      }));
    }
    setCustomAmenityInput('');
  };

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      ownerDetails: {
        ...prevData.ownerDetails,
        [name]: value,
      },
      agentId: name === 'name' ? '' : prevData.agentId
    }));

    if (name === 'name' && user.role === 'admin') {
      if (value && value.length > 0) {
        const searchTerm = value.toLowerCase();
        const matches = existingAgents.filter(agent => {
          const agentName = agent.name ? agent.name.toLowerCase() : '';
          const company = agent.companyName ? agent.companyName.toLowerCase() : '';
          const agentPhone = agent.whatsappNumber ? agent.whatsappNumber : '';
          return agentName.includes(searchTerm) || company.includes(searchTerm) || agentPhone.includes(searchTerm);
        });
        setFilteredAgents(matches);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }
  };

  const selectShadowAgent = (agent) => {
    setFormData(prev => ({
      ...prev,
      agentId: agent._id,
      ownerDetails: {
        name: agent.name,
        whatsapp: agent.whatsappNumber || '',
        tiktok: agent.tiktokHandle || '',
        instagram: agent.instagramHandle || '',
      }
    }));
    setShowSuggestions(false);
  };

  const handleAltTextChange = (index, value) => {
    setImageAltTexts(prev => ({ ...prev, [index]: value }));
  };

  const handleFileChange = (e) => {
    const newlySelectedFiles = Array.from(e.target.files);
    const combinedFiles = [...imageFiles, ...newlySelectedFiles];

    // ✅ Enforce Dynamic Image Limit (5 for Normal, 10 for Premium)
    if (combinedFiles.length > MAX_IMAGES) {
      setStatus({
        message: `Limit exceeded. You can upload ${MAX_IMAGES} images on your plan. ${!isPremium ? 'Upgrade to Premium for 10 images.' : ''}`,
        type: 'error'
      });
      // Scroll to top to ensure they see the error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      e.target.value = null;
      return;
    }

    const oversizedFiles = combinedFiles.filter(file => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setStatus({ message: `Error: Some files exceed ${MAX_FILE_SIZE_MB}MB.`, type: 'error' });
      e.target.value = null;
      return;
    }

    setImageFiles(combinedFiles);

    const initialAltTexts = {};
    const existingCount = imageFiles.length;
    newlySelectedFiles.forEach((_, index) => {
      const combinedIndex = existingCount + index;
      initialAltTexts[combinedIndex] = `${formData.title} image ${combinedIndex + 1}`.trim();
    });
    setImageAltTexts(prev => ({ ...prev, ...initialAltTexts }));

    setStatus({ message: '', type: '' });
    e.target.value = null;
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setStatus({ message: 'Video too large. Max 50MB allowed.', type: 'error' });
      e.target.value = null;
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = function () {
      window.URL.revokeObjectURL(video.src);
      if (video.duration > 120) {
        setStatus({ message: 'Video too long. Max duration is 2 minutes.', type: 'error' });
        setVideoFile(null);
      } else {
        setVideoFile(file);
        setStatus({ message: '', type: '' });
      }
    }
    video.src = URL.createObjectURL(file);
  };

  // ✅ NEW: Handler to intercept clicks on Premium features for unsubscribed users
  const handlePremiumInteraction = () => {
    setStatus({
      message: 'Video Tours are a Premium feature. Subscribe to unlock video uploads and attract 3x more leads!',
      type: 'error'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMapClick = async (e) => {
    const clickedCoords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setCoordinates(clickedCoords);
    setIsGeocoding(true);
    try {
      const { data } = await apiClient.get(`/maps/reverse-geocode?lat=${clickedCoords.lat}&lng=${clickedCoords.lng}`);
      setFormData(prev => ({ ...prev, location: data.address }));
    } catch (error) {
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
      setStatus({ message: 'Failed to geocode address.', type: 'error' });
    } finally {
      setIsGeocoding(false);
    }
  };

  // ✅ NEW: AI Description Polisher
  const [isPolishing, setIsPolishing] = useState(false);

  const handlePolish = async () => {
    if (!formData.description || formData.description.length < 10) {
      setStatus({ message: 'Write a rough description first (min 10 chars)!', type: 'error' });
      return;
    }
    setIsPolishing(true);
    try {
      const { data } = await apiClient.post('/ai/polish', { description: formData.description });
      setFormData(prev => ({ ...prev, description: data.polished }));
      setStatus({ message: '✨ Description Polished!', type: 'success' });
    } catch (error) {
      setStatus({ message: 'AI Polisher failed. Please try again.', type: 'error' });
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ UPDATED VALIDATION: Require either Image OR Video
    if (imageFiles.length === 0 && !videoFile && !formData.video) {
      setStatus({ message: 'Please add at least one image OR a video tour to submit.', type: 'error' });
      return;
    }

    setLoading(true);
    setStatus({ message: '', type: '' });

    const dataToSend = new FormData();

    Object.keys(formData).forEach(key => {
      if (key === 'video') return;
      else if (key === 'ownerDetails') {
        if (user && user.role === 'admin' && formData.ownerDetails.name) {
          dataToSend.append('ownerDetails[name]', formData.ownerDetails.name);
          dataToSend.append('ownerDetails[whatsapp]', formData.ownerDetails.whatsapp);
          dataToSend.append('ownerDetails[tiktok]', formData.ownerDetails.tiktok);
          dataToSend.append('ownerDetails[instagram]', formData.ownerDetails.instagram);
        }
      }
      else if (key === 'amenities') {
        dataToSend.append('amenities', JSON.stringify(formData.amenities));
      }
      else if (key === 'internetProviders') {
        dataToSend.append('internetProviders', JSON.stringify(formData.internetProviders));
      }
      else {
        dataToSend.append(key, formData[key]);
      }
    });

    if (videoFile) {
      dataToSend.append('video', videoFile);
    } else if (formData.video) {
      dataToSend.append('video', formData.video);
    }

    if (formData.agentId) {
      dataToSend.append('agentId', formData.agentId);
    }

    // ✅ FIX 2.1: Send coordinates as a JSON string to ensure proper backend parsing
    if (coordinates) {
      dataToSend.append('coordinates', JSON.stringify(coordinates));
    }

    const altTextsArray = [];
    for (let i = 0; i < imageFiles.length; i++) {
      dataToSend.append('images', imageFiles[i]);
      altTextsArray.push(imageAltTexts[i] || '');
    }
    dataToSend.append('imageAltTexts', JSON.stringify(altTextsArray));

    try {
      // ✅ FIX 1: REMOVE 'Content-Type': 'multipart/form-data'. 
      // Axios MUST generate this automatically to include the boundary.
      const response = await apiClient.post("/properties", dataToSend, {
        withCredentials: true,
        // headers: { 'Content-Type': 'multipart/form-data' }, <--- REMOVED THIS LINE
      });

      if (formData.isFeatured && response.data.paymentRedirectUrl) {
        setStatus({ message: 'Property saved! Redirecting to payment...', type: 'success' });
        window.location.href = response.data.paymentRedirectUrl;
      } else {
        setStatus({ message: `Success! Property "${response.data.title}" added. Redirecting...`, type: 'success' });
        setTimeout(() => {
          navigate(`/properties/${response.data.slug}`);
        }, 2000);
      }

    } catch (error) {
      console.error("Error creating property:", error);
      const errMsg = error.response?.data?.message || error.message || 'Unknown error';
      setStatus({
        message: `Failed to add property: ${errMsg}`,
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
          <div className={`p-4 mb-6 text-sm rounded-lg flex items-center gap-2 animate-pulse ${status.type === 'success'
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 border border-red-200'
            }`} role="alert">
            {status.type === 'error' && <FaExclamationCircle />}
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Property Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Spacious 3-Bedroom Apartment"
            />

            <div className="flex gap-2">
              <div className="flex-1">
                <InputField
                  label="Price (Ksh)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder={formData.listingType === 'rent' ? 'e.g., 50000' : 'e.g., 15M'}
                  min={100}
                />
              </div>
              {(formData.type === 'airbnb' || formData.listingType === 'rent') && (
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                  <select
                    name="priceFrequency"
                    value={formData.priceFrequency}
                    onChange={handleChange}
                    className="w-full py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="month">/ Month</option>
                    <option value="night">/ Night</option>
                    <option value="week">/ Week</option>
                    <option value="year">/ Year</option>
                  </select>
                </div>
              )}
            </div>

            {/* ✅ AI PRICING WIDGET */}
            <SmartPricingWidget
              location={formData.location}
              type={formData.type}
              bedrooms={formData.bedrooms}
              currentPrice={formData.price}
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
                <button
                  type="button"
                  onClick={handleGeocodeAddress}
                  disabled={isGeocoding}
                  className="mt-6 w-full h-11 flex items-center justify-center space-x-2 bg-gray-600 text-white py-2.5 rounded-lg hover:bg-gray-700 transition-all duration-150 disabled:opacity-50"
                >
                  {isGeocoding ? <FaSpinner className="animate-spin" /> : <FaMapMarkerAlt />}
                  <span>Find on Map</span>
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click on the map to set a precise location.
            </p>

            <div className="h-80 w-full rounded-lg overflow-hidden border dark:border-gray-700">
              <MapComponent
                coordinates={mapCenter}
                places={[]}
                onMapClick={handleMapClick}
                markerPosition={coordinates}
                isDraggable={true}
                onMarkerDragEnd={handleMapClick}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="description">
                Description
              </label>
              <button
                type="button"
                onClick={handlePolish}
                disabled={isPolishing}
                className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full hover:scale-105 transition"
              >
                {isPolishing ? <FaSpinner className="animate-spin" /> : <FaGem />}
                ✨ Polish with AI
              </button>
            </div>
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
            {formData.type === 'land' ? (
              <div className="flex gap-2">
                <div className="flex-1">
                  <InputField
                    label="Land Size"
                    name="landSize"
                    type="text"
                    value={formData.landSize}
                    onChange={handleChange}
                    placeholder="e.g., 50x100, 1 Acre"
                    required={true}
                  />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price Per</label>
                  <select
                    name="pricePer"
                    value={formData.pricePer}
                    onChange={handleChange}
                    className="w-full py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="total">Total Price</option>
                    <option value="acre">Per Acre</option>
                    <option value="plot">Per Plot</option>
                    <option value="sqm">Per Sq Meter</option>
                  </select>
                </div>
              </div>
            ) : (
              <InputField
                label="Bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
                min={0}
                placeholder="e.g., 3"
                required={false}
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

          <div className="space-y-4 pt-6 border-t dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Amenities & Features
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITIES_LIST.map(amenity => (
                <div key={amenity}
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition select-none
                       ${formData.amenities.includes(amenity)
                      ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                    }`}
                >
                  <div className={`mr-3 text-lg ${formData.amenities.includes(amenity) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                    {formData.amenities.includes(amenity) ? <FaCheckSquare /> : <FaSquare />}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{amenity}</span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Add Custom Feature (e.g., Jacuzzi, Solar Heating)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAmenityInput}
                  onChange={(e) => setCustomAmenityInput(e.target.value)}
                  placeholder="Type and click Add"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomAmenity(e)}
                />
                <button
                  type="button"
                  onClick={handleAddCustomAmenity}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-1"
                >
                  <FaPlus size={12} /> Add
                </button>
              </div>

              {formData.amenities.filter(a => !AMENITIES_LIST.includes(a)).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.amenities.filter(a => !AMENITIES_LIST.includes(a)).map((custom, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm">
                      {custom}
                      <FaTimes
                        className="cursor-pointer hover:text-red-500 transition"
                        onClick={() => handleAmenityToggle(custom)}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaBus /> Living Essentials <span className="text-sm font-normal text-gray-500">(Optional)</span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Help tenants calculate their real monthly costs.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <InputField
                  label="Nearest Matatu Route/Stage"
                  name="matatuRoute"
                  value={formData.matatuRoute}
                  onChange={handleChange}
                  placeholder="e.g., Route 105 or Super Metro Stage"
                  required={false}
                  icon={<FaBus />}
                  list="matatuRoutesList"
                />
                <datalist id="matatuRoutesList">
                  {essentialOptions.matatuRoutes.map((opt, i) => <option key={i} value={opt} />)}
                </datalist>
              </div>

              <InputField
                label="Approx. Fare to CBD (Ksh)"
                name="matatuFare"
                type="number"
                value={formData.matatuFare}
                onChange={handleChange}
                placeholder="e.g., 80"
                required={false}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <InputField
                  label="Distance to Market (Mama Mboga)"
                  name="mamaMbogaDistance"
                  value={formData.mamaMbogaDistance}
                  onChange={handleChange}
                  placeholder="e.g., 5 min walk"
                  required={false}
                  icon={<FaShoppingBasket />}
                  list="mamaMbogaList"
                />
                <datalist id="mamaMbogaList">
                  {essentialOptions.mamaMbogaDistances.map((opt, i) => <option key={i} value={opt} />)}
                </datalist>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FaWifi /> Internet Ready?
                  </label>
                  <input
                    type="checkbox"
                    name="internetReady"
                    checked={formData.internetReady}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 rounded"
                  />
                </div>

                {formData.internetReady && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Select available providers:</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {essentialOptions.internetProviders.map(isp => (
                        <span
                          key={isp}
                          onClick={() => handleISPToggle(isp)}
                          className={`text-xs px-3 py-1 rounded-full border cursor-pointer select-none transition ${formData.internetProviders.includes(isp)
                            ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-100'
                            : 'bg-white text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                        >
                          {formData.internetProviders.includes(isp) ? '✓ ' : '+ '} {isp}
                        </span>
                      ))}
                    </div>

                    {/* Custom ISP Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add other provider..."
                        className="text-xs px-2 py-1 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-600 flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (e.target.value.trim()) {
                              handleISPToggle(e.target.value.trim());
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <SmartPricingWidget
            location={formData.location}
            type={formData.type}
            bedrooms={formData.bedrooms}
            currentPrice={formData.price}
          />

          {/* ✅ UPDATED: PREMIUM VIDEO TOUR SECTION */}
          {/* Now visible to all, but clickable only for premium users */}
          <div className="space-y-4 pt-6 border-t dark:border-gray-700 relative">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaGem className="text-purple-500" /> Premium Video Tour
            </h2>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-6 rounded-lg relative overflow-hidden">

              {/* ✅ LOCK OVERLAY FOR UNSUBSCRIBED USERS */}
              {!isPremium && (
                <div
                  onClick={handlePremiumInteraction}
                  className="absolute inset-0 z-10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition-all group"
                >
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-2xl border border-purple-200 flex flex-col items-center transform group-hover:scale-105 transition-transform duration-200">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mb-2">
                      <FaLock className="text-purple-600 dark:text-purple-300 text-xl" />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">Premium Feature</span>
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">Click to Unlock</span>
                  </div>
                </div>
              )}

              {/* Actual Input Section (Now Always Rendered but blocked by overlay if not premium) */}
              <div className={!isPremium ? "filter blur-[1px] opacity-60 pointer-events-none select-none" : ""}>
                <div className="space-y-4">
                  {/* Option 1: File Upload */}
                  <div>
                    {/* ✅ FIXED: Removed 'block' class which conflicted with 'flex' */}
                    <label className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                      <FaCloudUploadAlt /> Upload Video File (Max 2 mins)
                    </label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleVideoFileChange}
                      className="w-full text-sm text-purple-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                    />
                    {videoFile && <p className="text-xs text-green-600 mt-1 font-bold">Video selected: {videoFile.name}</p>}
                  </div>

                  <div className="text-center text-xs text-gray-400 font-bold">- OR -</div>

                  {/* Option 2: URL Link */}
                  <InputField
                    label="Paste YouTube/Vimeo Link"
                    name="video"
                    value={formData.video}
                    onChange={handleChange}
                    placeholder="https://youtu.be/..."
                    required={false}
                    icon={<FaVideo />}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="image">
                Property Images (Max {MAX_IMAGES})
              </label>
              {/* Visual indicator of the limit */}
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${isPremium ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                Limit: {MAX_IMAGES} Images
              </span>
            </div>

            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              required={false} // ✅ UPDATED: Removed required constraint (images optional if video exists)
              multiple
              className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
            />

            <div className="flex justify-between mt-1 items-start">
              <p className={`text-xs ${imageFiles.length > MAX_IMAGES ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                Selected: {imageFiles.length} / {MAX_IMAGES}
              </p>
              {!isPremium && (
                <div className="flex flex-col items-end">
                  <p className="text-xs text-gray-400">Standard Plan Limit: 5</p>
                  <button type="button" onClick={handlePremiumInteraction} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mt-1">
                    <FaGem size={10} /> Upgrade for 10 Images
                  </button>
                </div>
              )}
            </div>
          </div>

          {imageFiles.length > 0 && (
            <div className="space-y-4 pt-4 border-t dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Image SEO Alt Text</h3>
              {imageFiles.slice(0, MAX_IMAGES).map((file, index) => (
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

          {user && user.role === 'admin' && (
            <div className="space-y-6 pt-6 border-t dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaUserCheck className="text-blue-500" /> Owner & Social Media Details
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                (Admin Only) Search by Agent Name, <strong>Company Name</strong>, or Phone Number.
              </p>

              <div className="relative z-50 mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="search-agent">
                  Owner/Agent Name (Searchable)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaSearch />
                  </div>
                  <input
                    type="text"
                    id="search-agent"
                    name="name"
                    value={formData.ownerDetails.name}
                    onChange={handleOwnerChange}
                    onFocus={() => formData.ownerDetails.name && setShowSuggestions(true)}
                    placeholder="e.g., Jane Doe or Agency Name"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    autoComplete="off"
                  />
                </div>

                {showSuggestions && filteredAgents.length > 0 && (
                  <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                    {filteredAgents.map((agent) => (
                      <div
                        key={agent._id}
                        onMouseDown={(e) => { e.preventDefault(); selectShadowAgent(agent); }}
                        className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition border-b dark:border-gray-700 last:border-0 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                            {agent.profilePicture && !agent.profilePicture.includes('placehold.co') ? (
                              <img src={agent.profilePicture} alt={agent.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <FaUser />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                              {agent.name}
                            </p>
                            {agent.companyName && (
                              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                {agent.companyName}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {agent.whatsappNumber || 'No WhatsApp'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {!agent.isAccountClaimed ? (
                            <span className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-full font-semibold">
                              Shadow
                            </span>
                          ) : (
                            <span className="text-xs bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                              <FaCheckSquare size={10} /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.agentId && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center gap-2 animate-fade-in">
                    <FaUserCheck /> Linked to Profile: <strong>{formData.ownerDetails.name}</strong>
                  </div>
                )}
              </div>

              <InputField label="Owner WhatsApp" name="whatsapp" value={formData.ownerDetails.whatsapp} onChange={handleOwnerChange} placeholder="e.g., 254712345678" required={false} icon={<FaWhatsapp />} />
              <InputField label="Owner TikTok Handle" name="tiktok" value={formData.ownerDetails.tiktok} onChange={handleOwnerChange} placeholder="e.g., @janedoe" required={false} icon={<FaTiktok />} />
              <InputField label="Owner Instagram Handle" name="instagram" value={formData.ownerDetails.instagram} onChange={handleOwnerChange} placeholder="e.g., @janedoe" required={false} icon={<FaInstagram />} />
            </div>
          )}

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

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || isGeocoding}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white transition ${(loading || isGeocoding)
                ? 'bg-blue-400 dark:bg-blue-800 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500'
                }`}
            >
              {loading ? 'Submitting...' : (isGeocoding ? 'Locating...' : 'Submit Listing')}
            </button>
          </div>
        </form>
      </div >
    </div >
  );
};

export default AddProperty;