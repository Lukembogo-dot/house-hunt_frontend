// src/pages/Contact.jsx
// (UPDATED: Links for Email and WhatsApp with pre-filled message)

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import useSeoData from "../hooks/useSeoData";
import SeoInjector from "../components/SeoInjector";
import apiClient from "../api/axios";

const Contact = () => {
  const seo = useSeoData(
    '/contact',
    'Contact HouseHunt Kenya - Property Inquiries, Support & Sales | Bedsitters, Apartments, Land',
    'Contact HouseHunt Kenya for property inquiries about bedsitters for rent, apartments for rent, 1 bedroom apartments, land for sale, and properties in Kenya. Get instant support via WhatsApp, email, or contact form. 24/7 customer service available.'
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Enhanced SEO Meta Tags */}
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Contact HouseHunt Kenya - Property Inquiries, Support & Sales | Bedsitters, Apartments, Land</title>
        <meta name="description" content="Contact HouseHunt Kenya for property inquiries about bedsitters for rent, apartments for rent, 1 bedroom apartments, land for sale, and properties in Kenya. Get instant support via WhatsApp, email, or contact form. 24/7 customer service available." />
        <meta name="keywords" content="contact HouseHunt Kenya, property inquiries Kenya, bedsitters for rent Kenya, apartments for rent Kenya, 1 bedroom apartments for rent Kenya, land for sale Kenya, properties for sale Kenya, HouseHunt support, WhatsApp property help Kenya, real estate customer service Kenya, property platform contact, house hunting help Kenya" />
        <meta name="headline" content="Contact HouseHunt Kenya - Get Property Help Now" />
        <meta name="focus_keywords" content="contact HouseHunt Kenya, property inquiries, bedsitters for rent, apartments for rent, land for sale, customer support, WhatsApp" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="HouseHunt Kenya" />
        <meta property="og:title" content="Contact HouseHunt Kenya - Property Inquiries & Support" />
        <meta property="og:description" content="Need help finding bedsitters for rent, apartments, 1 bedroom units, or land for sale in Kenya? Contact HouseHunt Kenya via WhatsApp, email, or form. Get instant property support now!" />
        <meta property="og:url" content="https://househuntkenya.com/contact" />
        <meta property="og:image" content="https://househuntkenya.com/og-contact-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_KE" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@househuntkenya" />
        <meta name="twitter:creator" content="@househuntkenya" />
        <meta name="twitter:title" content="Contact HouseHunt Kenya - Property Help & Support" />
        <meta name="twitter:description" content="Contact us for bedsitters, apartments, land for sale. WhatsApp support available 24/7. Get help with your property search in Kenya now!" />
        <meta name="twitter:image" content="https://househuntkenya.com/twitter-contact-image.jpg" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://househuntkenya.com/contact" />

        {/* ContactPage Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact HouseHunt Kenya",
            "headline": "Contact HouseHunt Kenya - Property Inquiries, Support & Sales",
            "description": "Contact HouseHunt Kenya for inquiries about bedsitters for rent, apartments for rent, 1 bedroom apartments, land for sale, and all properties in Kenya. Multiple contact channels: WhatsApp, email, and contact form with 24/7 support.",
            "keywords": ["contact HouseHunt Kenya", "property inquiries", "bedsitters for rent", "apartments for rent", "land for sale", "customer support", "WhatsApp help"],
            "url": "https://househuntkenya.com/contact",
            "isPartOf": {
              "@type": "WebSite",
              "name": "HouseHunt Kenya",
              "url": "https://househuntkenya.com"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://househuntkenya.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Contact Us",
                  "item": "https://househuntkenya.com/contact"
                }
              ]
            },
            "mainEntity": {
              "@type": "Organization",
              "name": "HouseHunt Kenya",
              "url": "https://househuntkenya.com",
              "logo": "https://househuntkenya.com/logo.png",
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+254-776-929-021",
                  "contactType": "customer service",
                  "areaServed": "KE",
                  "availableLanguage": ["en", "sw"],
                  "contactOption": "TollFree",
                  "email": "support@househuntkenya.co.ke"
                },
                {
                  "@type": "ContactPoint",
                  "telephone": "+254-776-929-021",
                  "contactType": "sales",
                  "areaServed": "KE",
                  "availableLanguage": ["en", "sw"]
                },
                {
                  "@type": "ContactPoint",
                  "telephone": "+254-776-929-021",
                  "contactType": "technical support",
                  "areaServed": "KE",
                  "availableLanguage": ["en", "sw"]
                }
              ],
              "sameAs": [
                "https://facebook.com/househuntkenya",
                "https://twitter.com/househuntkenya",
                "https://instagram.com/househuntkenya"
              ]
            }
          })}
        </script>

        {/* FAQPage Schema for Contact Queries */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How can I contact HouseHunt Kenya?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can contact HouseHunt Kenya through multiple channels: (1) WhatsApp at +254 776 929 021 for instant messaging, (2) Email at support@househuntkenya.co.ke, (3) Contact form on our website. We offer 24/7 customer support for all property inquiries including bedsitters for rent, apartments for rent, 1 bedroom apartments, and land for sale across Kenya."
                }
              },
              {
                "@type": "Question",
                "name": "What types of property inquiries can I make to HouseHunt Kenya?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can contact us about any property-related inquiries including: bedsitters for rent in Kenya, apartments for rent (studios, 1 bedroom, 2 bedroom, 3+ bedroom), land for sale, houses for sale, commercial properties, property management services, listing your properties, technical support, partnership opportunities, and general property search assistance. Our team is ready to help with all your real estate needs."
                }
              },
              {
                "@type": "Question",
                "name": "How quickly does HouseHunt Kenya respond to inquiries?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "HouseHunt Kenya responds to inquiries promptly. WhatsApp messages typically get responses within minutes during business hours. Email inquiries are answered within 24 hours. Contact form submissions receive responses within 24-48 hours. For urgent property inquiries about bedsitters, apartments, or land for sale, we recommend using WhatsApp for the fastest response."
                }
              },
              {
                "@type": "Question",
                "name": "Can I get help finding bedsitters for rent through HouseHunt Kenya contact?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Contact HouseHunt Kenya via WhatsApp, email, or contact form with your bedsitter requirements (location, budget, amenities). Our property scouts will personally match you with available bedsitters for rent across Kenya, including options from our offline directory. We can help you find furnished or unfurnished bedsitters in Nairobi, Mombasa, Kisumu, and other major cities."
                }
              },
              {
                "@type": "Question",
                "name": "Does HouseHunt Kenya offer support in languages other than English?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, HouseHunt Kenya offers customer support in both English and Kiswahili. Our team can assist you with property inquiries, questions about bedsitters for rent, apartments, land for sale, and all platform features in either language. Simply indicate your preferred language when contacting us."
                }
              },
              {
                "@type": "Question",
                "name": "Can I contact HouseHunt Kenya for partnership opportunities?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! HouseHunt Kenya welcomes partnership inquiries from property developers, real estate agents, service providers, and technology partners. Contact us via email at support@househuntkenya.co.ke with 'Partnership Inquiry' in the subject line, or send us a detailed message through the contact form. Our business development team will respond within 48 hours."
                }
              }
            ]
          })}
        </script>

        {/* LocalBusiness Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "HouseHunt Kenya",
            "image": "https://househuntkenya.com/logo.png",
            "description": "Kenya's leading property platform for bedsitters for rent, apartments for rent, land for sale, and all real estate needs. Contact us for instant support.",
            "@id": "https://househuntkenya.com",
            "url": "https://househuntkenya.com",
            "telephone": "+254-776-929-021",
            "email": "support@househuntkenya.co.ke",
            "priceRange": "Free - KES 20,000",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Nairobi",
              "addressRegion": "Nairobi County",
              "postalCode": "00100",
              "addressCountry": "KE"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": -1.286389,
              "longitude": 36.817223
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              "opens": "00:00",
              "closes": "23:59"
            },
            "sameAs": [
              "https://facebook.com/househuntkenya",
              "https://twitter.com/househuntkenya",
              "https://instagram.com/househuntkenya"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+254-776-929-021",
              "contactType": "customer service",
              "email": "support@househuntkenya.co.ke",
              "areaServed": "KE",
              "availableLanguage": ["English", "Swahili"],
              "hoursAvailable": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "00:00",
                "closes": "23:59"
              }
            },
            "areaServed": {
              "@type": "Country",
              "name": "Kenya"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "247",
              "bestRating": "5",
              "worstRating": "1"
            }
          })}
        </script>
      </Helmet>

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

            {/* Phone (Optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="+254 7..."
                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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

          {/* FAQ Section */}
          <motion.div
            className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-10">
              Common questions about contacting HouseHunt Kenya
            </p>

            <div className="space-y-4">
              {[
                {
                  question: "How can I contact HouseHunt Kenya?",
                  answer: "You can contact HouseHunt Kenya through multiple channels: (1) WhatsApp at +254 776 929 021 for instant messaging, (2) Email at support@househuntkenya.co.ke, (3) Contact form on our website. We offer 24/7 customer support for all property inquiries including bedsitters for rent, apartments for rent, 1 bedroom apartments, and land for sale across Kenya."
                },
                {
                  question: "What types of property inquiries can I make to HouseHunt Kenya?",
                  answer: "You can contact us about any property-related inquiries including: bedsitters for rent in Kenya, apartments for rent (studios, 1 bedroom, 2 bedroom, 3+ bedroom), land for sale, houses for sale, commercial properties, property management services, listing your properties, technical support, partnership opportunities, and general property search assistance. Our team is ready to help with all your real estate needs."
                },
                {
                  question: "How quickly does HouseHunt Kenya respond to inquiries?",
                  answer: "HouseHunt Kenya responds to inquiries promptly. WhatsApp messages typically get responses within minutes during business hours. Email inquiries are answered within 24 hours. Contact form submissions receive responses within 24-48 hours. For urgent property inquiries about bedsitters, apartments, or land for sale, we recommend using WhatsApp for the fastest response."
                },
                {
                  question: "Can I get help finding bedsitters for rent through HouseHunt Kenya contact?",
                  answer: "Yes! Contact HouseHunt Kenya via WhatsApp, email, or contact form with your bedsitter requirements (location, budget, amenities). Our property scouts will personally match you with available bedsitters for rent across Kenya, including options from our offline directory. We can help you find furnished or unfurnished bedsitters in Nairobi, Mombasa, Kisumu, and other major cities."
                },
                {
                  question: "Does HouseHunt Kenya offer support in languages other than English?",
                  answer: "Yes, HouseHunt Kenya offers customer support in both English and Kiswahili. Our team can assist you with property inquiries, questions about bedsitters for rent, apartments, land for sale, and all platform features in either language. Simply indicate your preferred language when contacting us."
                },
                {
                  question: "Can I contact HouseHunt Kenya for partnership opportunities?",
                  answer: "Yes! HouseHunt Kenya welcomes partnership inquiries from property developers, real estate agents, service providers, and technology partners. Contact us via email at support@househuntkenya.co.ke with 'Partnership Inquiry' in the subject line, or send us a detailed message through the contact form. Our business development team will respond within 48 hours."
                }
              ].map((faq, index) => (
                <details
                  key={index}
                  className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg group"
                >
                  <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-800 dark:text-gray-100 text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <span className="text-lg">{faq.question}</span>
                    <svg
                      className="w-5 h-5 text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform duration-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Contact;