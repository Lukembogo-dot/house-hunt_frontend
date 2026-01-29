// src/pages/AdminAddService.jsx
// --- UPDATED with WebP conversion ---

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/axios';
import {
  FaSpinner, FaSave, FaPlus, FaTrash, FaImage, FaLink
} from 'react-icons/fa';

// 1. LAZY IMPORT CKEDITOR (OPTIMIZED)
import LazyCKEditor from '../components/LazyCKEditor';

import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'framer-motion';

// --- Input Components (Unchanged) ---
const InputField = ({ label, name, value, onChange, placeholder, required = true }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor={name}>
      {label}
    </label>
    <input
      type="text"
      id={name}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
    />
  </div>
);

const TextareaField = ({ label, name, value, onChange, placeholder, rows = 3, required = true }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor={name}>
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
    />
  </div>
);
// ------------------------------------

// 2. --- CKEDITOR 5 CUSTOM UPLOAD ADAPTER ---
// This class connects CKEditor's image upload button to our backend API
class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  // Starts the upload process
  upload() {
    return this.loader.file.then(file => new Promise((resolve, reject) => {
      const data = new FormData();
      data.append('image', file);

      apiClient.post('/services/upload-content-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      })
        .then(response => {
          if (response.data.imageUrl) {
            // CKEditor expects this exact format: { default: "image_url" }
            resolve({
              default: response.data.imageUrl
            });
          } else {
            reject('Image URL not returned from server.');
          }
        })
        .catch(error => {
          reject(error.response?.data?.message || 'Image upload failed.');
        });
    }));
  }

  // Aborts the upload process
  abort() {
    // This is optional, but good practice if you have a way to cancel requests
  }
}

// This function attaches the adapter to the editor
function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}
// ---------------------------------------------

// --- HELPER TO GET CROPPED IMAGE (UPDATED) ---
function getCroppedImg(image, crop, canvas) {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    // ▼▼▼ THIS IS THE FIX ▼▼▼
    // Convert the canvas to a 'image/webp' blob with 90% quality
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      blob.name = 'cropped-image.webp'; // Set the file name
      resolve(blob);
    }, 'image/webp', 0.9); // 0.9 = 90% quality
    // ▲▲▲ END OF FIX ▲▲▲
  });
}
// ---------------------------------------

const initialFormState = {
  title: '',
  serviceType: '',
  location: '',
  imageUrl: '',
  metaTitle: '',
  metaDescription: '',
};

const AdminAddService = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [content, setContent] = useState(''); // CKEditor will use this state
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUploadPreview, setImageUploadPreview] = useState('');
  const [imageInputMode, setImageInputMode] = useState('url');

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspect, setAspect] = useState(16 / 9);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // --- useEffect (Unchanged) ---
  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      const fetchService = async () => {
        try {
          const { data } = await apiClient.get(`/services/${id}`);
          const fetchedData = {
            title: data.title || '',
            serviceType: data.serviceType || '',
            location: data.location || '',
            imageUrl: data.imageUrl || '',
            metaTitle: data.metaTitle || '',
            metaDescription: data.metaDescription || '',
          };
          setFormData(fetchedData);

          const dbContent = data.content || '';
          setContent(dbContent); // Set state, CKEditor will read this

          setFaqs(data.faqs && data.faqs.length > 0 ? data.faqs : [{ question: '', answer: '' }]);
        } catch (err) {
          setStatus({ message: 'Failed to load service data.', type: 'error' });
        } finally {
          setLoading(false);
        }
      };
      fetchService();
    }
  }, [id, isEditMode]);


  // --- All handlers from handleChange to handleCropSave (Unchanged) ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (index) => {
    const newFaqs = faqs.filter((_, i) => i !== index);
    setFaqs(newFaqs);
  };

  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result.toString() || '');
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90, }, aspect, width, height),
      width,
      height
    );
    setCrop(newCrop);
    imgRef.current = e.currentTarget;
  }

  const handleCropSave = async () => {
    if (completedCrop && previewCanvasRef.current && imgRef.current) {
      try {
        const croppedBlob = await getCroppedImg(
          imgRef.current,
          completedCrop,
          previewCanvasRef.current
        );
        setImageUpload(croppedBlob);
        setImageUploadPreview(URL.createObjectURL(croppedBlob));
        setCropModalOpen(false);
      } catch (e) {
        console.error('Error cropping image:', e);
        setStatus({ message: 'Failed to crop image. Please try again.', type: 'error' });
      }
    }
  };

  // --- handleSubmit (UPDATED) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ message: '', type: '' });

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      dataToSend.append(key, formData[key]);
    });

    dataToSend.append('content', content);
    dataToSend.append('faqs', JSON.stringify(faqs.filter(f => f.question && f.answer)));

    if (imageUpload) {
      // ▼▼▼ THIS IS THE FIX ▼▼▼
      // Send the file as 'cropped-image.webp'
      dataToSend.append('image', imageUpload, 'cropped-image.webp');
      // ▲▲▲ END OF FIX ▲▲▲
    }

    try {
      if (isEditMode) {
        await apiClient.put(`/services/${id}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        setStatus({ message: 'Service post updated successfully!', type: 'success' });
      } else {
        await apiClient.post('/services', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        setStatus({ message: 'Service post created successfully!', type: 'success' });
      }

      setTimeout(() => navigate('/admin/dashboard'), 2000);

    } catch (err) {
      setStatus({ message: err.response?.data?.message || 'An error occurred.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 3. --- CKEDITOR CONFIGURATION (Unchanged) ---
  const editorConfig = {
    extraPlugins: [MyCustomUploadAdapterPlugin],
    removePlugins: ['CKBox', 'CKFinder', 'EasyImage']
  };
  // ---------------------------------

  return (
    <>
      {/* --- HIDDEN FILE INPUT (REMOVED) --- */}

      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:border dark:border-gray-700">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
            {isEditMode ? 'Edit Service Post' : 'Add New Service Post'}
          </h1>

          {status.message && (
            <div className={`p-4 mb-6 text-sm rounded-lg ${status.type === 'success'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
              }`} role="alert">
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <InputField
              label="Post Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Best Plumbers in Kilimani"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Service Type"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                placeholder="e.g., Plumbing, Electrician, Internet"
              />
              <InputField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Kilimani"
              />
            </div>

            {/* --- FEATURED IMAGE SECTION (UPDATED) --- */}
            <div className="space-y-2 pt-6 border-t dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Featured Image</h2>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-4 py-2 rounded-md ${imageInputMode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                >
                  <FaLink className="inline mr-2" /> Use URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`px-4 py-2 rounded-md ${imageInputMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                >
                  <FaImage className="inline mr-2" /> Upload
                </button>
              </div>

              {imageInputMode === 'url' ? (
                <InputField
                  label="Image URL"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://... (link to an image)"
                  required={!imageUpload}
                />
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="imageUpload">
                    Upload Image File
                  </label>
                  <input
                    type="file"
                    id="imageUpload"
                    name="imageUpload"
                    // ▼▼▼ THIS IS THE FIX ▼▼▼
                    // Allow more image types
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    // ▲▲▲ END OF FIX ▲▲▲
                    onChange={handleImageFileChange}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
                  />
                </div>
              )}

              {(formData.imageUrl || imageUploadPreview) && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image Preview:</p>
                  <img
                    src={imageUploadPreview || formData.imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border dark:border-gray-700"
                  />
                </div>
              )}
            </div>

            {/* 4. --- NEW CKEDITOR COMPONENT --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content (Blog Post)
              </label>
              {/* This class handles dark mode for CKEditor */}
              <div className="ck-editor-container dark:text-gray-900">
                <LazyCKEditor
                  data={content}
                  onChange={setContent}
                  placeholder="Write your blog post content here..."
                />
              </div>
            </div>
            {/* ---------------------------------- */}


            {/* --- FAQ SECTION (Unchanged) --- */}
            <div className="space-y-4 pt-6 border-t dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                FAQ Schema Builder
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add FAQs to generate an automatic schema for Google.
              </p>

              {faqs.map((faq, index) => (
                <div key={index} className="p-4 border dark:border-gray-700 rounded-lg space-y-4 relative">
                  <InputField
                    label={`Question ${index + 1}`}
                    name={`faq-q-${index}`}
                    value={faq.question}
                    onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                    placeholder="e.g., What is the best internet provider?"
                    required={false}
                  />
                  <TextareaField
                    label={`Answer ${index + 1}`}
                    name={`faq-a-${index}`}
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                    placeholder="The best provider is..."
                    required={false}
                  />
                  {faqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-1.5 leading-none shadow-md"
                    >
                      <FaTrash size={12} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addFaq}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
              >
                <FaPlus />
                <span>Add FAQ</span>
              </button>
            </div>

            {/* --- SEO Details (Unchanged) --- */}
            <div className="space-y-6 pt-6 border-t dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                SEO Details
              </h2>
              <InputField
                label="Meta Title"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                placeholder="SEO-friendly title (max 60 chars)"
                required={false}
              />
              <TextareaField
                label="Meta Description"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                placeholder="SEO description for Google (max 160 chars)"
                rows={3}
                required={false}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-lg shadow-sm text-lg font-medium text-white transition-all duration-150 active:scale-[0.98] ${loading
                    ? 'bg-blue-400 dark:bg-blue-800 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500'
                  }`}
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                <span>{isEditMode ? 'Update Post' : 'Create Post'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- CROP MODAL (Unchanged) --- */}
      <AnimatePresence>
        {cropModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 relative"
            >
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Crop Your Image
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Select a 16:9 (widescreen) area for your featured image.
              </p>

              <div className="max-h-[60vh] overflow-y-auto">
                {imgSrc && (
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                    minWidth={200}
                  >
                    <img
                      ref={imgRef}
                      alt="Crop me"
                      src={imgSrc}
                      onLoad={onImageLoad}
                      className="w-full"
                    />
                  </ReactCrop>
                )}
              </div>

              <canvas ref={previewCanvasRef} className="hidden" />

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setCropModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropSave}
                  className="w-32 flex items-center justify-center bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition"
                >
                  Save Crop
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminAddService;