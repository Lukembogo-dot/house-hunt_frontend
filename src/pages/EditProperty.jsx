import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/axios';
import { FaTimes } from 'react-icons/fa'; // Icon for delete button

// (InputField component is unchanged)
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
  
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState(null);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id: propertyId } = useParams();

  // Fetch the existing property data on load
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
        
        // ✅ FIX: Make it backward-compatible
        // Check for the new 'images' array first, then fall back to the old 'imageUrl'
        let imagesToSet = [];
        if (data.images && data.images.length > 0) {
          imagesToSet = data.images;
        } else if (data.imageUrl) {
          // If it's an old property, put the single 'imageUrl' into the array
          imagesToSet = [data.imageUrl]; 
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

  const handleFileChange = (e) => {
    setNewImageFiles(e.target.files);
  };

  const handleRemoveExistingImage = (imageUrlToRemove) => {
    setExistingImages(existingImages.filter(img => img !== imageUrlToRemove));
  };

  // Handle the form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ message: '', type: '' });

    const dataToSend = new FormData();
    
    // Append all text fields
    Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
    
    // ✅ FIX: Append the list of existing images to keep
    // Send each URL as a separate item in the array
    if (existingImages.length > 0) {
      existingImages.forEach(url => {
        dataToSend.append('existingImages', url);
      });
    } else {
      // Send an empty value if all images are removed
      dataToSend.append('existingImages', '');
    }

    // Append all *new* files
    if (newImageFiles) {
      for (let i = 0; i < newImageFiles.length; i++) {
        dataToSend.append('images', newImageFiles[i]); // 'images' must match route
      }
    }

    try {
      const response = await apiClient.put(`/properties/${propertyId}`, dataToSend, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
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
          {/* ... (Text input fields are unchanged) ... */}
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
          
          {/* Image Management Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Manage Property Images
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {existingImages.map((imageUrl) => (
                <div key={imageUrl} className="relative group">
                  <img src={imageUrl} alt="Property" className="w-full h-24 object-cover rounded-lg"/>
                  <button
                    type="button" // Prevents form submission
                    onClick={() => handleRemoveExistingImage(imageUrl)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
            </div>
            {existingImages.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No images currently uploaded.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="new-images">
              Add New Images (Up to 5)
            </label>
            <input
              type="file"
              id="new-images"
              name="new-images"
              onChange={handleFileChange}
              multiple
              className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
            />
            {newImageFiles && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selected: {newImageFiles.length} new files</p>}
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-lg font-medium text-white transition ${
                loading ? 'bg-blue-400 dark:bg-blue-800 dark:text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500'
              }`}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;