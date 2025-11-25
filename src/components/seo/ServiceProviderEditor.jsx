// src/components/seo/ServiceProviderEditor.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import { 
  FaBuilding, FaMapMarkerAlt, FaPhone, FaWhatsapp, 
  FaEnvelope, FaGlobe, FaImage, FaSave, FaSpinner, 
  FaCheckCircle, FaSearchPlus 
} from 'react-icons/fa';

const SERVICE_TYPES = [
  'Movers', 'Internet', 'Cleaning', 'Interior Design', 'Security', 
  'Plumbing', 'Solar', 'Pest Control', 'Painting', 'Gardening', 'Other'
];

const ServiceProviderEditor = ({ providerId, onSaveComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Custom Category State
  const [isCustomType, setIsCustomType] = useState(false);
  const [customTypeValue, setCustomTypeValue] = useState('');

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
    metaTitle: '',
    metaDescription: '',
    image: null 
  });

  // 1. Fetch Provider Data whenever the selected providerId changes
  useEffect(() => {
    if (!providerId) return;

    const fetchProvider = async () => {
      setIsLoading(true);
      setError('');
      setSuccess('');
      try {
        const { data } = await apiClient.get(`/service-providers/${providerId}`);
        
        setFormData({
            companyName: data.title || '',
            serviceType: data.serviceType || '',
            location: data.location || '',
            serviceAreas: data.serviceAreas ? data.serviceAreas.join(', ') : '',
            phoneNumber: data.phoneNumber || '',
            whatsappNumber: data.whatsappNumber || '',
            email: data.email || '',
            website: data.website || '',
            description: data.description || '',
            content: data.content || '',
            metaTitle: data.metaTitle || '',
            metaDescription: data.metaDescription || '',
            image: null
        });

        // Handle Custom Service Types (if 'Other' or not in list)
        if (data.serviceType && !SERVICE_TYPES.includes(data.serviceType)) {
            setIsCustomType(true);
            setCustomTypeValue(data.serviceType);
            setFormData(prev => ({ ...prev, serviceType: 'Other' }));
        } else {
            setIsCustomType(false);
            setCustomTypeValue('');
        }

        setImagePreview(data.imageUrl);
      } catch (err) {
        console.error(err);
        setError('Failed to load provider details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvider();
  }, [providerId]);

  // 2. Handle Input Changes
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 3. Submit Updates to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      const finalServiceType = isCustomType ? customTypeValue : formData.serviceType;
      
      // Append all fields
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
      
      // Crucial SEO Fields
      data.append('metaTitle', formData.metaTitle);
      data.append('metaDescription', formData.metaDescription);
      
      if (formData.image) {
        data.append('image', formData.image);
      }

      // Send PUT Request
      await apiClient.put(`/service-providers/${providerId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      setSuccess('Provider updated successfully!');
      
      // Notify parent component to refresh the list if needed
      if (onSaveComplete) onSaveComplete();

    } catch (error) {
      setError(`Failed to update: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="p-12 text-center text-gray-500">
      <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-blue-500" />
      Loading Provider Data...
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
      
      {/* Notifications */}
      {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center gap-2"><FaCheckCircle /> {success}</div>}

      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaBuilding className="text-blue-600" /> Editing: {formData.companyName}
          </h2>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold">
             Provider Mode
          </span>
      </div>

      {/* Business Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
          <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Category</label>
          <select name="serviceType" required value={formData.serviceType} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500">
            {SERVICE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          {isCustomType && (
            <input type="text" placeholder="Enter custom type" value={customTypeValue} onChange={(e) => setCustomTypeValue(e.target.value)} className="mt-2 w-full p-3 rounded-lg border border-blue-300 bg-blue-50 dark:bg-gray-700 dark:text-white" required={isCustomType} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">HQ Location</label>
            <div className="relative"><FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400" /><input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" /></div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Areas</label>
            <input type="text" placeholder="e.g. Kilimani, Lavington" name="serviceAreas" value={formData.serviceAreas} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
            <div className="relative"><FaPhone className="absolute left-3 top-3.5 text-gray-400" /><input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" /></div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WhatsApp</label>
            <div className="relative"><FaWhatsapp className="absolute left-3 top-3.5 text-green-500" /><input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" /></div>
        </div>
      </div>

      {/* Descriptions */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Description (Card Summary)</label>
        <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Bio / Content (HTML Supported)</label>
        <textarea name="content" rows="6" value={formData.content} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* SEO Section */}
      <div className="mb-6 border-t border-gray-200 dark:border-gray-700 pt-6 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
         <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FaSearchPlus className="text-purple-600" /> SEO & Visibility
         </h3>
         <div className="grid grid-cols-1 gap-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Title</label>
               <input type="text" name="metaTitle" placeholder="Overrides Company Name in Search Results" value={formData.metaTitle} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Description</label>
               <textarea name="metaDescription" rows="2" placeholder="Overrides Short Description in Search Results" value={formData.metaDescription} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500" />
            </div>
         </div>
      </div>

      {/* Image Upload */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Image / Logo</label>
        <div className="flex items-center gap-4">
           <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-dashed border-gray-400 flex items-center justify-center">
             {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <FaImage className="text-gray-400 text-2xl" />}
           </div>
           <div>
               <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-gray-500 mb-1" />
               <p className="text-xs text-gray-400">JPG, PNG or WEBP. Max 2MB.</p>
           </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition shadow-lg disabled:opacity-50">
          {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />} Save Provider Changes
        </button>
      </div>
    </form>
  );
};

export default ServiceProviderEditor;