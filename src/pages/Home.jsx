import React from 'react';
import Navbar from "../components/Navbar";
import PropertyList from "../components/PropertyList";
import { Helmet } from 'react-helmet-async';
import useSeoData from "../hooks/useSeoData";
import SeoInjector from "../components/SeoInjector";

export default function Home() {
  const seo = useSeoData(
    '/',
    'HouseHunt Kenya - Find Your Dream Home | Buy & Rent Properties in Kenya',
    'Search the best properties for sale and rent in Kenya. HouseHunt Kenya connects you with verified listings for houses, apartments, and land.'
  );

  return (
    <div>
      <SeoInjector seo={seo} />
      <Helmet>
        {/* Organization Schema for Knowledge Panel */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "HouseHunt Kenya",
            "url": "https://househuntkenya.com",
            "logo": "https://househuntkenya.com/logo.png",
            "description": "Kenya's premier digital property marketplace.",
            "sameAs": [
              "https://facebook.com/househuntkenya",
              "https://twitter.com/househuntkenya",
              "https://instagram.com/househuntkenya"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+254-776-929-021",
              "contactType": "customer service",
              "areaServed": "KE",
              "availableLanguage": ["English", "Swahili"]
            }
          })}
        </script>

        {/* WebSite Schema for Sitelinks Search Box */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "HouseHunt Kenya",
            "url": "https://househuntkenya.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://househuntkenya.com/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      <Navbar />
      <header className="bg-blue-50 text-center py-20">
        <h1 className="text-4xl font-bold text-blue-700">
          Find Your Dream Home
        </h1>
        <p className="text-gray-600 mt-3">
          Explore thousands of properties for sale and rent in Kenya.
        </p>
      </header>
      <PropertyList />
    </div>
  );
}