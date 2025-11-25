// src/pages/admin/AddServiceProvider.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaSearch,
  FaUserCheck,
  FaUser,
  FaCheckSquare,
  FaSearchPlus, 
  // ✅ New Icons for Packages
  FaBoxOpen,
  FaPlus,
  FaTrash,
  FaTrashAlt // ✅ Added for removing area groups
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

const AddServiceProvider = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Custom Service State
  const [isCustomType, setIsCustomType] = useState(false);
  const [customTypeValue, setCustomTypeValue] = useState('');

  // Shadow Account Search State
  const [existingAgents, setExistingAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkedUser, setLinkedUser] = useState(null);

  // ✅ Service Areas State (Grouped)
  const [areaGroups, setAreaGroups] = useState([
    { county: '', subLocations: '' }
  ]);

  // ✅ Packages State
  const [packages, setPackages] = useState([
    { name: '', type: 'Standard', description: '', price: '' }
  ]);

  const [formData, setFormData] = useState({
    companyName: '',
    serviceType: '',
    location: '',
    // serviceAreas removed from simple state, handled by areaGroups
    phoneNumber: '',
    whatsappNumber: '',
    email: '', 
    website: '',
    description: '', 
    content: '', 
    // ✅ NEW SEO FIELDS
    metaTitle: '',
    metaDescription: '',
    imageAltText: '', // ✅ ADDED: State for Image Alt Text
    image: null
  });

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data } = await apiClient.get('/users/all-agents', { withCredentials: true });
        setExistingAgents(data || []);
      } catch (err) {
        console.error("Failed to fetch agents for linking:", err);
      }
    };
    fetchAgents();
  }, []);

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

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 1) {
      const matches = existingAgents.filter(agent => {
        const name = agent.name?.toLowerCase() || '';
        const phone = agent.whatsappNumber || '';
        const email = agent.email?.toLowerCase() || '';
        return name.includes(query.toLowerCase()) || phone.includes(query) || email.includes(query.toLowerCase());
      });
      setFilteredAgents(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectShadowProfile = (agent) => {
    setLinkedUser(agent);
    setSearchQuery(agent.name);
    setShowSuggestions(false);

    setFormData(prev => ({
      ...prev,
      companyName: agent.companyName || agent.name, 
      phoneNumber: agent.phoneNumber || '',
      whatsappNumber: agent.whatsappNumber || '',
      email: agent.email || '',
    }));
  };

  // ✅ Service Area Handlers
  const handleAddCounty = () => {
    setAreaGroups([...areaGroups, { county: '', subLocations: '' }]);
  };

  const handleRemoveCounty = (index) => {
    const updated = areaGroups.filter((_, i) => i !== index);
    setAreaGroups(updated);
  };

  const handleAreaChange = (index, field, value) => {
    const updated = [...areaGroups];
    updated[index][field] = value;
    setAreaGroups(updated);
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
    setIsLoading(true);

    try {
      const data = new FormData();
      
      const finalServiceType = isCustomType ? customTypeValue : formData.serviceType;
      
      data.append('companyName', formData.companyName);
      data.append('serviceType', finalServiceType); 
      data.append('location', formData.location);
      
      // ✅ PREPARE SERVICE AREAS (Structured)
      const formattedAreas = areaGroups
        .filter(g => g.county.trim() !== '') // Remove empty counties
        .map(g => ({
          county: g.county.trim(),
          // Split string to array
          subLocations: g.subLocations.split(',').map(s => s.trim()).filter(s => s !== '')
        }));
      
      if (formattedAreas.length > 0) {
        data.append('serviceAreas', JSON.stringify(formattedAreas));
      }

      data.append('phoneNumber', formData.phoneNumber);
      data.append('whatsappNumber', formData.whatsappNumber);
      data.append('email', formData.email);
      data.append('website', formData.website);
      data.append('description', formData.description);
      data.append('content', formData.content);
      
      // ✅ SEND PACKAGES (Filter out empty ones)
      const validPackages = packages.filter(p => p.name && p.price);
      if (validPackages.length > 0) {
        data.append('packages', JSON.stringify(validPackages));
      }

      // ✅ SEND SEO DATA
      data.append('metaTitle', formData.metaTitle || formData.companyName); 
      data.append('metaDescription', formData.metaDescription || formData.description); 
      
      if (formData.image) {
        data.append('image', formData.image);
      }
      // ✅ SEND IMAGE ALT TEXT
      data.append('imageAltText', formData.imageAltText);

      await apiClient.post('/service-providers', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      alert('Service Provider & SEO Data Created Successfully!');
      navigate('/admin');

    } catch (error) {
      console.error('Error creating provider:', error);
      alert(`Failed to create provider: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaBuilding className="text-blue-600" /> Onboard Service Provider
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Add a company. Shadow account and SEO data will be generated automatically.
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
          
          {/* Link Existing Profile */}
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
             <h2 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
               <FaUserCheck /> Link to Existing Profile (Optional)
             </h2>
             <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
               Search for an existing Agent or Shadow Account to autofill details.
             </p>
             
             <div className="relative">
                <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by Name, Phone or Email..."
                  className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                {showSuggestions && filteredAgents.length > 0 && (
                  <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                    {filteredAgents.map((agent) => (
                      <div 
                        key={agent._id}
                        onMouseDown={(e) => { e.preventDefault(); selectShadowProfile(agent); }}
                        className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition border-b dark:border-gray-700 last:border-0 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                             {agent.profilePicture ? (
                               <img src={agent.profilePicture} alt={agent.name} className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-gray-500"><FaUser /></div>
                             )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{agent.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{agent.email || agent.whatsappNumber}</p>
                          </div>
                        </div>
                        {!agent.isAccountClaimed && (
                           <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Shadow</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
             </div>
             {linkedUser && (
                <div className="mt-2 text-sm text-green-600 font-semibold flex items-center gap-1">
                   <FaCheckSquare /> Linked to: {linkedUser.name}
                </div>
             )}
          </div>

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
                placeholder="e.g., Swift Movers Ltd"
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
                <option value="">Select Category</option>
                {SERVICE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {isCustomType && (
                <div className="mt-3 animate-fade-in">
                   <label className="block text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Enter Custom Category Name</label>
                   <input 
                     type="text" 
                     value={customTypeValue}
                     onChange={(e) => setCustomTypeValue(e.target.value)}
                     placeholder="e.g. Fumigation Services"
                     className="w-full p-3 rounded-lg border border-blue-300 bg-blue-50 dark:bg-gray-700 dark:border-blue-500 dark:text-white focus:ring-2 focus:ring-blue-500"
                     required={isCustomType}
                   />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-6">
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
                  placeholder="e.g., Kilimani, Nairobi"
                  className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* ✅ NEW SERVICE AREAS UI */}
            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Service Areas (Grouped by County)</label>
                
                {areaGroups.map((group, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 mb-3 items-start">
                    <div className="w-full md:w-1/3">
                      <input 
                        type="text" 
                        placeholder="County (e.g. Nairobi)" 
                        value={group.county}
                        onChange={(e) => handleAreaChange(index, 'county', e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-full md:w-2/3 relative">
                      <input 
                        type="text" 
                        placeholder="Locations (comma separated: Kilimani, Westlands...)" 
                        value={group.subLocations}
                        onChange={(e) => handleAreaChange(index, 'subLocations', e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                      {areaGroups.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => handleRemoveCounty(index)}
                          className="absolute right-[-30px] top-3.5 text-red-500 hover:text-red-700"
                          title="Remove County Group"
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  onClick={handleAddCounty}
                  className="text-sm text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 mt-2 hover:underline"
                >
                  <FaPlus /> Add Another County
                </button>
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
                  required 
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g., 0712345678"
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
                  required 
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="e.g., +254712345678"
                  className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Real Email (Optional)</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="provider@gmail.com"
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
                  placeholder="https://..."
                  className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ✅ NEW: Service Packages Section */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2 mt-8 flex items-center gap-2">
            <FaBoxOpen className="text-orange-500" /> Service Packages (Optional)
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
              required 
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="A brief summary for search results card..."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Details (HTML Supported)</label>
            <textarea 
              name="content" 
              required 
              rows="6"
              value={formData.content}
              onChange={handleChange}
              placeholder="Full business bio, pricing details, etc..."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          {/* SEO & VISIBILITY SECTION */}
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
            <p className="text-xs text-gray-500 mt-1">If empty, we'll use the Company Name.</p>
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
            <p className="text-xs text-gray-500 mt-1">If empty, we'll use the Short Description.</p>
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
                <p>Click to upload logo.</p>
                <p>JPG, PNG or WEBP. Max 2MB.</p>
              </div>
            </div>
            
            {/* ✅ ADDED: Image Alt Text Input */}
            <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Image Alt Text (SEO Description)</label>
                <input 
                  type="text" 
                  name="imageAltText" 
                  value={formData.imageAltText}
                  onChange={handleChange}
                  placeholder="e.g. Swift Movers company logo with blue truck"
                  className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition shadow-lg disabled:opacity-50"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Create Service Provider
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddServiceProvider;