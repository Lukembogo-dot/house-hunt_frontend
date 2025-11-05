import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/axios"; 

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, min = 0 }) => (
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
      required
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
    />
  </div>
);

const initialFormState = {
  title: '',
  description: '',
  location: '',
  price: '',
  bedrooms: '',
  // bathrooms: '', // ✅ REMOVED
  type: 'apartment',
  status: 'available',
  listingType: 'sale', // ✅ ADDED
};

const AddProperty = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [imageFiles, setImageFiles] = useState(null); 
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setImageFiles(e.target.files); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFiles || imageFiles.length === 0) {
      setStatus({ message: 'Please select at least one image to upload.', type: 'error' });
      return;
    }
    setLoading(true);
    setStatus({ message: '', type: '' });

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
    
    for (let i = 0; i < imageFiles.length; i++) {
      dataToSend.append('images', imageFiles[i]);
    }

    try {
      const response = await apiClient.post("/properties", dataToSend, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus({ message: `Success! Property "${response.data.title}" added. Redirecting...`, type: 'success' });
      setTimeout(() => {
        navigate(`/properties/${response.data._id}`);
      }, 2000);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Property Title" 
              name="title" 
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Spacious 3-Bedroom Apartment" 
            />
            <InputField 
              label="Location (City/Neighborhood)" 
              name="location" 
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Nairobi, Kilimani" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ✅ NEW: Listing Type */}
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
            
            {/* ✅ UPDATED: Property Type */}
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
            <InputField 
              label="Price (Ksh)" 
              name="price" 
              type="number" 
              value={formData.price}
              onChange={handleChange}
              placeholder={formData.listingType === 'rent' ? 'e.g., 50000' : 'e.g., 15000000'}
              min={100} 
            />

            {/* ✅ CONDITION: Only show Bedrooms if not 'land' */}
            {formData.type !== 'land' && (
              <InputField 
                label="Bedrooms" 
                name="bedrooms" 
                type="number" 
                value={formData.bedrooms}
                onChange={handleChange}
                min={0} 
                placeholder="e.g., 3" 
              />
            )}
            
            {/* ✅ REMOVED: Bathrooms InputField */}
          </div>
          
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="image">
              Property Images (Select up to 5)
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              required
              multiple
              className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
            />
             {imageFiles && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selected: {imageFiles.length} files</p>}
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white transition ${
                loading 
                  ? 'bg-blue-400 dark:bg-blue-800 dark:text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;