// src/pages/admin/EditServiceProvider.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/axios';
import { 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaWhatsapp, 
  FaEnvelope, 
  FaGlobe, 
  FaImage, 
  FaSave, 
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
  FaSearchPlus, 
  // ✅ New Icons for Packages
  FaBoxOpen,
  FaPlus,
  FaTrash
} from 'react-icons/fa';

const SERVICE_TYPES = [
  'Movers', 
  'Internet', 
  'Cleaning', 
  'Interior Design', 
  'Security', 
  'Plumbing', 
  'Solar', 
  'Pest Control', 
  'Painting', 
  'Gardening',
  'Other'
];

const EditServiceProvider = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Custom Service State
  const [isCustomType, setIsCustomType] = useState(false);
  const [customTypeValue, setCustomTypeValue] = useState('');

  // ✅ Packages State
  const [packages, setPackages] = useState([]);

  const [formData, setFormData] = useState({
    companyName: '',
    serviceType: '',
    location: '',
    serviceAreas: '', 
    phoneNumber: '',
    whatsappNumber: '',
    email: '', 
    website: '',
    description: '', 
    content: '', 
    // ✅ NEW SEO FIELDS
    metaTitle: '',
    metaDescription: '',
    image: null 
  });

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        let providerData;
        try {
             // Try fetching by ID first
             const res = await apiClient.get(`/service-providers/${id}`); 
             providerData = res.data;
        } catch(e) {
             throw new Error("Could not fetch provider.");
        }

        // If successful:
        setFormData({
            companyName: providerData.title || '',
            serviceType: providerData.serviceType || '',
            location: providerData.location || '',
            serviceAreas: providerData.serviceAreas ? providerData.serviceAreas.join(', ') : '',
            phoneNumber: providerData.phoneNumber || '',
            whatsappNumber: providerData.whatsappNumber || '',
            email: providerData.email || '',
            website: providerData.website || '',
            description: providerData.description || '',
            content: providerData.content || '',
            // ✅ POPULATE SEO DATA
            metaTitle: providerData.metaTitle || '',
            metaDescription: providerData.metaDescription || '',
            image: null
        });

        // ✅ POPULATE PACKAGES
        if (providerData.packages && Array.isArray(providerData.packages)) {
           setPackages(providerData.packages);
        } else {
           setPackages([{ name: '', type: 'Standard', description: '', price: '' }]);
        }

        // Handle Custom Type
        if (!SERVICE_TYPES.includes(providerData.serviceType)) {
            setIsCustomType(true);
            setCustomTypeValue(providerData.serviceType);
            setFormData(prev => ({ ...prev, serviceType: 'Other' }));
        }

        setImagePreview(providerData.imageUrl);
        setIsLoading(false);

      } catch (err) {
        // Fallback fetch via list
        try {
            const { data } = await apiClient.get('/service-providers?limit=1000');
            const found = (data.providers || data).find(p => p._id === id);
            if (found) {
                setFormData({
                    companyName: found.title || '',
                    serviceType: found.serviceType || '',
                    location: found.location || '',
                    serviceAreas: found.serviceAreas ? found.serviceAreas.join(', ') : '',
                    phoneNumber: found.phoneNumber || '',
                    whatsappNumber: found.whatsappNumber || '',
                    email: found.email || '',
                    website: found.website || '',
                    description: found.description || '',
                    content: found.content || '',
                    // ✅ POPULATE SEO DATA
                    metaTitle: found.metaTitle || '',
                    metaDescription: found.metaDescription || '',
                    image: null
                });
                
                // ✅ POPULATE PACKAGES (Fallback)
                if (found.packages && Array.isArray(found.packages)) {
                  setPackages(found.packages);
                } else {
                  setPackages([{ name: '', type: 'Standard', description: '', price: '' }]);
                }

                if (!SERVICE_TYPES.includes(found.serviceType)) {
                    setIsCustomType(true);
                    setCustomTypeValue(found.serviceType);
                    setFormData(prev => ({ ...prev, serviceType: 'Other' }));
                }
                setImagePreview(found.imageUrl);
                setIsLoading(false);
                return;
            }
        } catch (e2) {
            console.error(e2);
        }
        setError('Failed to load provider details.');
        setIsLoading(false);
      }
    };
    fetchProvider();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'serviceType') {
      if (value === 'Other') {
        setIsCustomType(true);
        setFormData(prev => ({ ...prev, serviceType: 'Other' }));
      } else {
        setIsCustomType(false);
        setFormData(prev => ({ ...prev, serviceType: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Package Handlers
  const handleAddPackage = () => {
    setPackages([...packages, { name: '', type: 'Standard', description: '', price: '' }]);
  };

  const handleRemovePackage = (index) => {
    const updated = packages.filter((_, i) => i !== index);
    setPackages(updated);
  };

  const handlePackageChange = (index, field, value) => {
    const updated = [...packages];
    updated[index][field] = value;
    setPackages(updated);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      const finalServiceType = isCustomType ? customTypeValue : formData.serviceType;
      
      data.append('title', formData.companyName);
      data.append('serviceType', finalServiceType);
      data.append('location', formData.location);
      data.append('serviceAreas', formData.serviceAreas);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('whatsappNumber', formData.whatsappNumber);
      data.append('email', formData.email);
      data.append('website', formData.website);
      data.append('description', formData.description);
      data.append('content', formData.content);
      
      // ✅ SEND PACKAGES (Filter out empty ones)
      const validPackages = packages.filter(p => p.name && p.price);
      data.append('packages', JSON.stringify(validPackages));

      // ✅ SEND SEO DATA
      data.append('metaTitle', formData.metaTitle);
      data.append('metaDescription', formData.metaDescription);
      
      if (formData.image) {
        data.append('image', formData.image);
      }

      await apiClient.put(`/service-providers/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      setSuccess('Service Provider Updated Successfully!');
      setTimeout(() => navigate('/admin'), 1500); 

    } catch (error) {
      console.error('Error updating provider:', error);
      setError(`Failed to update: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading Provider Details...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaBuilding className="text-blue-600" /> Edit Service Provider
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Update details for {formData.companyName}.
            </p>
          </div>
          <button 
            onClick={() => navigate('/admin')} 
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          
          {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
          {success && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center gap-2"><FaCheckCircle /> {success}</div>}

          {/* Business Identity */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
            Business Identity
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
              <input 
                type="text" 
                name="companyName" 
                required 
                value={formData.companyName}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Category</label>
              <select 
                name="serviceType" 
                required 
                value={formData.serviceType}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {SERVICE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              {isCustomType && (
                <div className="mt-3">
                   <label className="block text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Custom Category Name</label>
                   <input 
                     type="text" 
                     value={customTypeValue}
                     onChange={(e) => setCustomTypeValue(e.target.value)}
                     className="w-full p-3 rounded-lg border border-blue-300 bg-blue-50 dark:bg-gray-700 dark:border-blue-500 dark:text-white focus:ring-2 focus:ring-blue-500"
                     required={isCustomType}
                   />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">HQ Location</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="text" 
                  name="location" 
                  required 
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Areas (Comma Separated)</label>
              <input 
                type="text" 
                name="serviceAreas" 
                value={formData.serviceAreas}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contact Details */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2 mt-8">
            Contact Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="text" 
                  name="phoneNumber" 
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WhatsApp Number</label>
              <div className="relative">
                <FaWhatsapp className="absolute left-3 top-3.5 text-green-500" />
                <input 
                  type="text" 
                  name="whatsappNumber" 
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Real Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website</label>
              <div className="relative">
                <FaGlobe className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="url" 
                  name="website" 
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ✅ NEW: Service Packages Section */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2 mt-8 flex items-center gap-2">
            <FaBoxOpen className="text-orange-500" /> Service Packages
          </h2>
          
          <div className="mb-6 space-y-4">
             {packages.map((pkg, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 relative">
                   <button 
                     type="button" 
                     onClick={() => handleRemovePackage(index)}
                     className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-2"
                     title="Remove Package"
                   >
                     <FaTrash size={14} />
                   </button>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                         <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Package Name</label>
                         <input 
                           type="text" 
                           placeholder="e.g. Studio Move" 
                           value={pkg.name}
                           onChange={(e) => handlePackageChange(index, 'name', e.target.value)}
                           className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                         />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Price (e.g. KES 5,000)</label>
                         <input 
                           type="text" 
                           placeholder="Price" 
                           value={pkg.price}
                           onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                           className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                         />
                      </div>
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Description</label>
                       <textarea 
                         rows="2"
                         placeholder="What's included?"
                         value={pkg.description}
                         onChange={(e) => handlePackageChange(index, 'description', e.target.value)}
                         className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                       />
                   </div>
                </div>
             ))}
             
             <button 
               type="button" 
               onClick={handleAddPackage}
               className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline"
             >
               <FaPlus /> Add Another Package
             </button>
          </div>

          {/* Content */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2 mt-8">
            Profile Content
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Description</label>
            <textarea 
              name="description" 
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Details (HTML Supported)</label>
            <textarea 
              name="content" 
              rows="6"
              value={formData.content}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          {/* ✅ SEO & VISIBILITY SECTION */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2 mt-8 flex items-center gap-2">
            <FaSearchPlus className="text-purple-600" /> SEO & Visibility
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Title (SEO Title)</label>
            <input 
              type="text" 
              name="metaTitle" 
              value={formData.metaTitle}
              onChange={handleChange}
              placeholder="e.g. Best Movers in Kilimani | Swift Movers Ltd"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Overrides the default page title.</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Description (SEO Summary)</label>
            <textarea 
              name="metaDescription" 
              rows="2"
              value={formData.metaDescription}
              onChange={handleChange}
              placeholder="e.g. Affordable and reliable moving services in Nairobi. Call us for a free quote."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">Overrides the default description.</p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Image / Logo</label>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-dashed border-gray-400 flex items-center justify-center group">
                 {imagePreview ? (
                   <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <FaImage className="text-gray-400 text-2xl" />
                 )}
                 <input 
                   type="file" 
                   accept="image/*"
                   onChange={handleImageChange}
                   className="absolute inset-0 opacity-0 cursor-pointer"
                 />
              </div>
              <div className="text-sm text-gray-500">
                <p>Click to upload new logo.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition shadow-lg disabled:opacity-50"
            >
              {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditServiceProvider;