import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ❌ Remove: import axios from 'axios';
import apiClient from "../api/axios"; // ✅ 1. Import our central api client

// ❌ Remove: const API_URL = 'http://localhost:5000/api/properties';

// ✅ InputField component is now defined OUTSIDE AddProperty.
const InputField = ({ label, name, value, onChange, type = 'text', placeholder, min = 0 }) => (
  // ... (rest of InputField code is fine)
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>
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
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
    />
  </div>
);

const initialFormState = {
  // ... (rest of initialFormState is fine)
  title: '',
  description: '',
  location: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  type: 'apartment',
};

const AddProperty = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    // ... (this function is fine)
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    // ... (this function is fine)
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setStatus({ message: 'Please select an image to upload.', type: 'error' });
      return;
    }
    setLoading(true);
    setStatus({ message: '', type: '' });

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
    dataToSend.append('image', imageFile);

    try {
      // ✅ 2. Use apiClient and a relative path
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
    // ... rest of your JSX ...
    // (No changes needed to the JSX)
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          List a New Property
        </h1>
        
        {status.message && (
          <div className={`p-4 mb-6 text-sm rounded-lg ${
            status.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Price (Ksh)" 
              name="price" 
              type="number" 
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 15000000" 
              min={100} 
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type">
                Property Type
              </label>
              <select
                id="type" name="type" value={formData.type} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="townhouse">Townhouse</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Bedrooms" 
              name="bedrooms" 
              type="number" 
              value={formData.bedrooms}
              onChange={handleChange}
              min={0} 
              placeholder="e.g., 3" 
            />
            <InputField 
              label="Bathrooms" 
              name="bathrooms" 
              type="number" 
              value={formData.bathrooms}
              onChange={handleChange}
              min={0} 
              placeholder="e.g., 2" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="image">
              Property Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
             {imageFile && <p className="text-xs text-gray-500 mt-1">Selected: {imageFile.name}</p>}
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white transition ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
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