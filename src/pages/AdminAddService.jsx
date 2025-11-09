// src/pages/AdminAddService.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/axios';
import { FaSpinner, FaSave, FaPlus, FaTrash, FaImage, FaLink, FaBold, FaListUl, FaListOl, FaTimes } from 'react-icons/fa';

// 1. IMPORT TIPTAP
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

// 2. IMPORT REACT-IMAGE-CROP
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

// --- Tiptap Toolbar (Unchanged) ---
const TiptapToolbar = ({ editor }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-t-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="H1">
        H1
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="H2">
        H2
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="H3">
        H3
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Bold">
        <FaBold />
      </button>
      <button type="button" onClick={setLink} className={`p-2 rounded ${editor.isActive('link') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Link">
        <FaLink />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Bullet List">
        <FaListUl />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`} title="Ordered List">
        <FaListOl />
      </button>
    </div>
  );
};
// ------------------------------------

// 3. --- HELPER TO GET CROPPED IMAGE ---
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
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      blob.name = 'cropped-image.jpeg';
      resolve(blob);
    }, 'image/jpeg', 0.95); // 95% quality JPEG
  });
}
// ---------------------------------------

const initialFormState = {
  title: '',
  serviceType: '',
  location: '',
  imageUrl: '', // For URL input
  metaTitle: '',
  metaDescription: '',
};

const AdminAddService = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [content, setContent] = useState('');
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);
  const [imageUpload, setImageUpload] = useState(null); // Will store the CROPPED blob
  const [imageUploadPreview, setImageUploadPreview] = useState('');
  const [imageInputMode, setImageInputMode] = useState('url');
  
  // 4. --- NEW STATE FOR CROP MODAL ---
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(''); // Original image for cropper
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspect, setAspect] = useState(16 / 9); // 16:9 aspect ratio
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  // ----------------------------------

  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } }), Link.configure({ openOnClick: false })],
    content: content,
    onUpdate: ({ editor }) => { setContent(editor.getHTML()); },
  });

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
          setContent(dbContent);
          if (editor) editor.commands.setContent(dbContent);
          
          setFaqs(data.faqs && data.faqs.length > 0 ? data.faqs : [{ question: '', answer: '' }]);
        } catch (err) {
          setStatus({ message: 'Failed to load service data.', type: 'error' });
        } finally {
          setLoading(false);
        }
      };
      fetchService();
    }
  }, [id, isEditMode, editor]);

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

  // 5. --- UPDATED IMAGE FILE HANDLER ---
  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCrop(undefined); // Reset crop
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result.toString() || '');
        setCropModalOpen(true); // OPEN THE MODAL
      });
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, imageUrl: '' })); // Clear URL field
    }
  };
  
  // 6. --- NEW CROP HANDLERS ---
  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        width,
        height
      ),
      width,
      height
    );
    setCrop(newCrop);
    imgRef.current = e.currentTarget; // Save reference to image element
  }

  const handleCropSave = async () => {
    if (completedCrop && previewCanvasRef.current && imgRef.current) {
      try {
        const croppedBlob = await getCroppedImg(
          imgRef.current,
          completedCrop,
          previewCanvasRef.current
        );
        setImageUpload(croppedBlob); // This is the file we will upload
        setImageUploadPreview(URL.createObjectURL(croppedBlob)); // This creates a local preview URL
        setCropModalOpen(false);
      } catch (e) {
        console.error('Error cropping image:', e);
        setStatus({ message: 'Failed to crop image. Please try again.', type: 'error' });
      }
    }
  };
  // -----------------------------

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
    
    // 7. --- APPEND THE CROPPED IMAGE BLOB ---
    if (imageUpload) {
      dataToSend.append('image', imageUpload, 'cropped-image.jpeg');
    }
    // --------------------------------------

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

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:border dark:border-gray-700">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
            {isEditMode ? 'Edit Service Post' : 'Add New Service Post'}
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

            {/* --- FEATURED IMAGE SECTION (Updated) --- */}
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
                    Upload Image File (Max 2MB)
                  </label>
                  <input
                    type="file"
                    id="imageUpload"
                    name="imageUpload"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageFileChange} // Use new handler
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
                  />
                </div>
              )}
              
              {/* Show preview for URL or Upload */}
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
            
            {/* --- TIPTAP EDITOR --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content (Blog Post)
              </label>
              <div className="bg-white text-gray-900 rounded-lg border border-gray-300 dark:border-gray-600">
                <TiptapToolbar editor={editor} />
                <EditorContent 
                  editor={editor} 
                  className="prose prose-lg max-w-none p-4 min-h-[200px] text-black"
                />
              </div>
            </div>

            {/* --- FAQ SECTION --- */}
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

            {/* --- SEO Details --- */}
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
                className={`w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-lg shadow-sm text-lg font-medium text-white transition-all duration-150 active:scale-[0.98] ${
                  loading 
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
      
      {/* 8. --- NEW: CROP MODAL --- */}
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
              
              {/* This canvas is hidden but used to draw the cropped image */}
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