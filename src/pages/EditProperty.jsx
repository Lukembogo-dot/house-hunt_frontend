import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/axios'; // Use your central API client

// Re-usable InputField component
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

const EditProperty = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    type: 'apartment',
  });
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id: propertyId } = useParams(); // Get the property ID from the URL

  // 1. Fetch the existing property data
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
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          type: data.type,
        });
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

  // 2. Handle the SUBMIT (PUT request)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ message: '', type: '' });

    try {
      const response = await apiClient.put(`/properties/${propertyId}`, formData, {
        withCredentials: true,
      });

      setStatus({ message: `Success! Property "${response.data.title}" updated. Redirecting...`, type: 'success' });
      
      setTimeout(() => {
        navigate('/admin/dashboard'); // Redirect to dashboard
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
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:border dark:border-gray-700">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
          Edit Property
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
          <InputField label="Property Title" name="title" value={formData.title} onChange={handleChange} />
          <InputField label="Location" name="location" value={formData.location} onChange={handleChange} />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows="4" value={formData.description} onChange={handleChange} required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Price (Ksh)" name="price" type="number" value={formData.price} onChange={handleChange} min={100} />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="type">Property Type</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="townhouse">Townhouse</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Bedrooms" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} min={0} />
            <InputField label="Bathrooms" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} min={0} />
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">Note: Image updating is not supported in this form. To change the image, you must delete and recreate the property.</p>

          <div className="pt-4">
            <button type="submit" disabled={loading}
              className={`w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-lg font-medium text-white transition ${
                loading ? 'bg-blue-400 dark:bg-blue-800 dark:text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500'
              }`}
            >
              {loading ? 'Updating...' : 'Update Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;