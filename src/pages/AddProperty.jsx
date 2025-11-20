// src/pages/AddProperty.jsx
// (FIXED: Full File - Search, Shadow Accounts, & Detail Editing)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/axios"; 
import { useAuth } from '../context/AuthContext';
import { 
  FaWhatsapp, FaTiktok, FaInstagram, FaMapMarkerAlt, 
  FaSpinner, FaStar, FaUserCheck, FaSearch, FaExclamationCircle, FaUser
} from 'react-icons/fa';
import { useFeatureFlag } from '../context/FeatureFlagContext';
import MapComponent from '../components/MapComponent';
import SmartPricingWidget from '../components/SmartPricingWidget'; 

const MAX_FILE_SIZE_MB = 2; 
const NAIROBI_COORDS = { lat: -1.286389, lng: 36.817223 };
const FEATURE_PRICE_PER_DAY = 170; 

// Reusable Input Field Component
const InputField = ({ label, name, value, onChange, type = 'text', placeholder, min = 0, required = true, icon = null }) => (
  <div className="relative mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor={name}>
      {label}
    </label>
    {icon && (
      <div className="absolute inset-y-0 left-0 pl-3 pt-8 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
    )}
    <input
      type={type}
      id={name}
      name={name}
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
  type: 'apartment',
  status: 'available', 
  listingType: 'sale',
  isFeatured: false,
  featuredDays: 3, 
  agentId: '', // Stores the ID if we select an existing agent
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
  
  // Search State
  const [existingAgents, setExistingAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const isFeaturedListingEnabled = useFeatureFlag('agent-featured-listing');
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

    // Fetch Agents for Admin Search
    const fetchAgents = async () => {
      if (user && user.role === 'admin') {
        try {
          // This endpoint returns BOTH real agents and shadow accounts
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
    if (type === 'checkbox') processedValue = checked;
    else if (name === 'featuredDays') processedValue = Number(value);
    
    setFormData(prevData => ({
      ...prevData,
      [name]: processedValue,
    }));
  };
  
  // ✅ Handle Owner Details Input & Search Logic (UPDATED)
  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      ownerDetails: {
        ...prevData.ownerDetails,
        [name]: value,
      },
      // If changing the NAME, reset the ID to prevent mismatch.
      agentId: name === 'name' ? '' : prevData.agentId 
    }));

    // Filter Agents Logic
    if (name === 'name' && user.role === 'admin') {
      if (value && value.length > 0) {
        const searchTerm = value.toLowerCase();
        
        const matches = existingAgents.filter(agent => {
          const agentName = agent.name ? agent.name.toLowerCase() : '';
          const company = agent.companyName ? agent.companyName.toLowerCase() : ''; // ✅ Add Company Search
          const agentPhone = agent.whatsappNumber ? agent.whatsappNumber : '';
          
          // Search Match Condition: Name OR Company OR Phone
          return agentName.includes(searchTerm) || 
                 company.includes(searchTerm) || 
                 agentPhone.includes(searchTerm);
        });
        
        setFilteredAgents(matches);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }
  };

  // ✅ Select Agent from Dropdown
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
    
    if (combinedFiles.length > 5) {
      setStatus({ message: `Error: You can only upload a maximum of 5 images total.`, type: 'error' });
      e.target.value = null; 
      return;
    }
    
    const oversizedFiles = combinedFiles.filter(file => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setStatus({ message: `Error: Some files exceed the ${MAX_FILE_SIZE_MB}MB limit.`, type: 'error' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      setStatus({ message: 'Please select at least one image to upload.', type: 'error' });
      return;
    }
    setLoading(true);
    setStatus({ message: '', type: '' });

    const dataToSend = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'ownerDetails') {
        if (user && user.role === 'admin' && formData.ownerDetails.name) {
          dataToSend.append('ownerDetails[name]', formData.ownerDetails.name);
          dataToSend.append('ownerDetails[whatsapp]', formData.ownerDetails.whatsapp);
          dataToSend.append('ownerDetails[tiktok]', formData.ownerDetails.tiktok);
          dataToSend.append('ownerDetails[instagram]', formData.ownerDetails.instagram);
        }
      } else {
        dataToSend.append(key, formData[key]);
      }
    });

    // Include agentId if selected/found
    if (formData.agentId) {
        dataToSend.append('agentId', formData.agentId);
    }
    
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
      const response = await apiClient.post("/properties", dataToSend, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
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
          <div className={`p-4 mb-6 text-sm rounded-lg flex items-center gap-2 ${
            status.type === 'success' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
          }`} role="alert">
            {status.type === 'error' && <FaExclamationCircle />}
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
          
          {/* Map Section */}
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

          <SmartPricingWidget 
            location={formData.location}
            type={formData.type}
            bedrooms={formData.bedrooms}
            currentPrice={formData.price}
          />
          
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

          {imageFiles.length > 0 && (
            <div className="space-y-4 pt-4 border-t dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Image SEO Alt Text</h3>
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

          {/* --- ✅ UPDATED: Owner & Social Media Details with FIXED SEARCH UI --- */}
          {user && user.role === 'admin' && (
            <div className="space-y-6 pt-6 border-t dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaUserCheck className="text-blue-500" /> Owner & Social Media Details
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                (Admin Only) Search by Agent Name, <strong>Company Name</strong>, or Phone Number.
              </p>
              
              {/* Search Container */}
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
                
                {/* Suggestions Dropdown */}
                {showSuggestions && filteredAgents.length > 0 && (
                  <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                    {filteredAgents.map((agent) => (
                      <div 
                        key={agent._id}
                        onMouseDown={(e) => { e.preventDefault(); selectShadowAgent(agent); }}
                        className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition border-b dark:border-gray-700 last:border-0 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar / Initials Logic */}
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
                            
                            {/* ✅ SHOW COMPANY NAME IF EXISTS */}
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

                        {/* Status Badge */}
                        <div className="flex flex-col items-end gap-1">
                           {!agent.isAccountClaimed ? (
                             <span className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-full font-semibold">
                               Shadow
                             </span>
                           ) : (
                             <span className="text-xs bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                               <FaUserCheck size={10} /> Verified
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
              
              <InputField 
                label="Owner WhatsApp"
                name="whatsapp"
                value={formData.ownerDetails.whatsapp}
                onChange={handleOwnerChange}
                placeholder="e.g., 254712345678"
                required={false}
                icon={<FaWhatsapp />}
              />

              <InputField 
                label="Owner TikTok Handle"
                name="tiktok"
                value={formData.ownerDetails.tiktok}
                onChange={handleOwnerChange}
                placeholder="e.g., @janedoe"
                required={false}
                icon={<FaTiktok />}
              />

              <InputField 
                label="Owner Instagram Handle"
                name="instagram"
                value={formData.ownerDetails.instagram}
                onChange={handleOwnerChange}
                placeholder="e.g., @janedoe"
                required={false}
                icon={<FaInstagram />}
              />

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