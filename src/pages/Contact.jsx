// src/pages/Contact.jsx
// (UPDATED: Links for Email and WhatsApp with pre-filled message)

import React, { useState } from "react"; 
import { motion } from "framer-motion";
import useSeoData from "../hooks/useSeoData";
import SeoInjector from "../components/SeoInjector";
import apiClient from "../api/axios"; 

const Contact = () => {
  const seo = useSeoData(
    '/contact', 
    'Contact HouseHunt Kenya - Sales, Support & Inquiries', 
    'Get in touch with the HouseHunt Kenya team for sales inquiries, technical support, or partnership opportunities. We respond promptly.'
  );

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
      <SeoInjector seo={seo} />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-6 py-16">
        
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
            
            {/* Success/Error Messages */}
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

          {/* Contact Info (Clickable Links) */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-center md:text-left">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Email</h3>
              <a 
                href="mailto:support@househuntkenya.co.ke" 
                className="text-blue-600 dark:text-blue-400 hover:underline transition"
              >
                support@househuntkenya.co.ke
              </a>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Phone / WhatsApp</h3>
              {/* ✅ Pre-filled message link */}
              <a 
                href="https://wa.me/254776929021?text=I%20wanted%20to%20enquire%20about" 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline transition"
              >
                +254 776 929 021
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Contact;