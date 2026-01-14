// src/pages/DynamicServiceSearch.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { Helmet } from 'react-helmet-async';
import ServiceCard from '../components/services/ServiceCard'; // Ensure you have this component
import SeoInjector from '../components/SeoInjector';
import GlobalSearchBar from '../components/GlobalSearchBar';
import { FaExclamationTriangle, FaSearch, FaClipboardList } from 'react-icons/fa';

const DynamicServiceSearch = () => {
  const { slug } = useParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seo, setSeo] = useState(null);

  // Convert slug to readable search terms
  // e.g. "internet-service-provider-nairobi-cbd" -> "Internet Service Provider Nairobi Cbd"
  const searchTerm = slug.replace(/-/g, ' ');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Custom SEO for this path (AI Supercharged)
        const path = `/services/${slug}`;
        try {
          const seoRes = await apiClient.get(`/seo/generate?path=${encodeURIComponent(path)}`);
          setSeo(seoRes.data);
        } catch (e) {
          console.warn("Service SEO Generation failed, using fallback.");
        }

        // 2. Search for providers matching these keywords
        const { data } = await apiClient.get(`/service-providers?search=${searchTerm}`);
        setProviders(data.providers || data || []);
      } catch (error) {
        console.error("Service Search Error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, searchTerm]);

  // Default SEO if none set in Manager
  const pageTitle = seo?.metaTitle || `${searchTerm} in Kenya | Top Rated Providers`;
  const pageDesc = seo?.metaDescription || `Find the best ${searchTerm}. Compare prices, read reviews, and contact professionals directly on HouseHunt Kenya.`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <SeoInjector seo={seo || { metaTitle: pageTitle, metaDescription: pageDesc }} />

      {/* ✅ P0 ENHANCEMENT: ItemList Schema for Service Provider Results */}
      {providers.length > 0 && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": pageTitle,
              "description": pageDesc,
              "numberOfItems": providers.length,
              "itemListElement": providers.map((provider, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "LocalBusiness",
                  "name": provider.businessName || provider.name,
                  "url": typeof window !== 'undefined' ? `${window.location.origin}/service/${provider._id}` : '',
                  "image": provider.logo || provider.image,
                  "telephone": provider.phone || provider.phoneNumber,
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": provider.location || searchTerm,
                    "addressCountry": "KE"
                  },
                  ...(provider.averageRating && provider.reviewCount ? {
                    "aggregateRating": {
                      "@type": "AggregateRating",
                      "ratingValue": provider.averageRating,
                      "reviewCount": provider.reviewCount
                    }
                  } : {})
                }
              }))
            })}
          </script>
        </Helmet>
      )}

      {/* Hero / Header */}
      <div className="bg-blue-600 text-white py-12 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 capitalize">
          {pageTitle}
        </h1>

        {/* ✅ AI Intro Text (HTML) */}
        <div
          className="text-blue-100 max-w-2xl mx-auto mb-6 prose prose-invert"
          dangerouslySetInnerHTML={{ __html: seo?.introText || pageDesc }}
        />

        {/* ✅ AI Market Insight (HTML) */}
        {seo?.marketInsight && (
          <div className="bg-white/10 p-4 rounded-lg border border-white/20 mb-6 inline-block text-left max-w-2xl">
            <h3 className="text-xs font-bold text-white mb-1 uppercase tracking-wide opacity-80">Market Insight</h3>
            <div
              className="text-white text-sm prose-sm prose-invert"
              dangerouslySetInnerHTML={{ __html: seo.marketInsight }}
            />
          </div>
        )}

        {/* Search Bar for refinement */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              defaultValue={searchTerm}
              readOnly
              className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl"></div>)}
          </div>
        ) : providers.length > 0 ? (
          // ✅ SHOW RESULTS
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {providers.map(provider => (
              <div key={provider._id} className="h-full">
                <ServiceCard service={provider} />
              </div>
            ))}
          </div>
        ) : (
          // ✅ NO RESULTS DASHBOARD (Zero Inventory Protocol)
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <FaExclamationTriangle className="text-5xl text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No providers found for "{searchTerm}"
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              We don't have a verified provider for this specific category yet.
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Looking for this service?</h3>
                <Link to="/contact" className="text-sm text-blue-600 font-bold hover:underline">Request a Professional</Link>
              </div>
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <h3 className="font-bold text-green-800 dark:text-green-300 mb-2">Do you offer this service?</h3>
                <Link to="/admin/add-service-provider" className="text-sm text-green-600 font-bold hover:underline">List Your Business Here</Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DynamicServiceSearch;