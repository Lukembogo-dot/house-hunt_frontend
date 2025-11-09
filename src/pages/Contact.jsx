// Contact.jsx (UPDATED)

import React, { useState } from "react"; // ✅ Import useState
import { motion } from "framer-motion";
import useSeoData from "../hooks/useSeoData";
import SeoInjector from "../components/SeoInjector";
import apiClient from "../api/axios"; // ✅ 1. Import apiClient

const Contact = () => {
  // ✅ 1. Use the new SEO hook
  const seo = useSeoData(
    '/contact', // The unique path identifier
    'Contact HouseHunt Kenya - Sales, Support & Inquiries', // Default Title
    'Get in touch with the HouseHunt Kenya team for sales inquiries, technical support, or partnership opportunities. We respond promptly.' // Default Description
  );

  // ✅ 2. Add state for the form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { name, email, message } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // ✅ 3. Submit to the new backend route
      await apiClient.post('/contact', formData);
      setSuccess('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      {/* ✅ 2. Inject SEO Tags */}
      <SeoInjector seo={seo} />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-6 py-16">
        
        {/* ✅ Animate the form card */}
        <motion.div 
          className="max-w-4xl w-full bg-white dark:bg-gray-800 shadow-lg dark:border dark:border-gray-700 rounded-2xl p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
            Get in Touch
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-10">
            Have questions, feedback, or partnership inquiries? Fill out the form below and our team will get back to you promptly.
          </p>

          {/* ✅ 4. Update form tag and add controlled inputs */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
              <textarea
                id="message"
                name="message"
                value={message}
                onChange={handleChange}
                rows="5"
                placeholder="Write your message here..."
                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                required
              ></textarea>
            </div>
            
            {/* ✅ 5. Add Success/Error Messages */}
            {success && <p className="text-green-600 dark:text-green-400 text-center">{success}</p>}
            {error && <p className="text-red-600 dark:text-red-400 text-center">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-all duration-150 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          {/* Contact Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-center md:text-left">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Email</h3>
              {/* ✅ 6. Corrected Email */}
              <p className="text-gray-600 dark:text-gray-300">support@househuntkenya.co.ke</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Phone / WhatsApp</h3>
              {/* ✅ 7. Corrected Phone */}
              <p className="text-gray-600 dark:text-gray-300">+254 776 929 021</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Contact;