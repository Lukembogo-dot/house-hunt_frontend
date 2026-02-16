// src/components/GlobalSchemaInjector.jsx
// (FIXED)

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/axios';

const GlobalSchemaInjector = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        // ▼▼▼ THIS IS THE FIX ▼▼▼
        const { data } = await apiClient.get('/settings');
        // ▲▲▲ END OF FIX ▲▲▲
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch global settings for schema:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalSettings();
  }, []);

  // Don't render anything if settings are not loaded or incomplete
  if (loading || !settings || !settings.businessName) {
    return null;
  }

  // --- Build the Social Media 'sameAs' array ---
  const sameAsUrls = [];
  if (settings.facebookUrl) sameAsUrls.push(settings.facebookUrl);
  if (settings.twitterUrl) sameAsUrls.push(settings.twitterUrl);
  if (settings.linkedinUrl) sameAsUrls.push(settings.linkedinUrl);
  if (settings.instagramUrl) sameAsUrls.push(settings.instagramUrl);

  // --- Build the LocalBusiness Schema ---
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent', // This is more specific than LocalBusiness
    'name': settings.businessName,
    'url': 'https://househuntkenya.com', // Your homepage URL
    'logo': settings.logoUrl,
    'telephone': settings.phoneNumber,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': settings.address.streetAddress,
      'addressLocality': settings.address.addressLocality,
      'addressRegion': settings.address.addressRegion,
      'postalCode': settings.address.postalCode,
      'addressCountry': settings.address.addressCountry,
    },
    'sameAs': sameAsUrls, // Array of your social media profiles
  };

  return (
    <Helmet>
      {/* This script injects your main business data on every page,
        telling Google who you are.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
    </Helmet>
  );
};

export default GlobalSchemaInjector;