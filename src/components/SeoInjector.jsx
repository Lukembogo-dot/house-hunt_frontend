// src/components/SeoInjector.jsx
// (UPDATED)

import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Injects all SEO-related tags into the document head.
 * Receives the 'seo' object from the useSeoData hook.
 */
const SeoInjector = ({ seo }) => {
  if (!seo || !seo.metaTitle) {
    return null; // Don't render anything if seo data isn't ready
  }

  // ✅ 1. FIX: Hardcode the production domain. 
  // This prevents "http" or "non-www" versions from being set as canonical.
  const siteUrl = 'https://www.househuntkenya.co.ke';
  
  // ✅ 2. FIX: Strict Canonical Logic
  // If DB has a custom canonical, use it.
  // If not, construct it manually using the production domain + the page path.
  // We avoid window.location.href to prevent copying "bad" URLs.
  let canonical = '';
  
  if (seo.canonicalUrl) {
      // If the admin entered a full URL (https://...), use it. 
      // If they entered a relative path (/about), append it to siteUrl.
      canonical = seo.canonicalUrl.startsWith('http') 
          ? seo.canonicalUrl 
          : `${siteUrl}${seo.canonicalUrl}`;
  } else {
      // Fallback: Build the URL using the pagePath from the DB (or current window path)
      const currentPath = seo.pagePath || window.location.pathname;
      // Ensure homepage '/' doesn't result in double slash
      const cleanPath = currentPath === '/' ? '' : currentPath;
      canonical = `${siteUrl}${cleanPath}`;
  }

  // --- Schema Generation (Unchanged) ---
  const generateSchema = () => {
    const schema = [];

    // 1. FAQ Schema (if FAQs exist)
    if (seo.faqs && seo.faqs.length > 0) {
        schema.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": seo.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        });
    }

    // 2. Add description/keyword-based WebPage schema if available
    if (seo.schemaDescription) {
        schema.push({
            "@context": "https://schema.org",
            "@type": "WebPage", 
            "name": seo.metaTitle,
            "description": seo.schemaDescription,
            "url": canonical, // Use the strict canonical here too
        });
    }
    
    return schema;
  };

  const schemaData = generateSchema();

  return (
    <Helmet>
      {/* --- Primary Meta Tags --- */}
      <title>{seo.metaTitle}</title>
      <meta name="description" content={seo.metaDescription} />
      <meta name="author" content="HouseHunt Kenya" />
      
      {/* --- ADDED FOCUS KEYWORD & CANONICAL --- */}
      {seo.focusKeyword && <meta name="keywords" content={seo.focusKeyword} />}
      
      {/* ✅ THE CRITICAL FIX: This tag now strictly points to https://www.househuntkenya.co.ke */}
      <link rel="canonical" href={canonical} />

      {/* --- Open Graph / Facebook (UPDATED) --- */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} /> {/* Use strict canonical here */}
      <meta property="og:title" content={seo.ogTitle || seo.metaTitle} />
      <meta property="og:description" content={seo.ogDescription || seo.metaDescription} />

      {/* --- Twitter (UPDATED) --- */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical} /> {/* Use strict canonical here */}
      <meta property="twitter:title" content={seo.twitterTitle || seo.metaTitle} />
      <meta property="twitter:description" content={seo.twitterDescription || seo.metaDescription} />

      {/* Schema Structured Data (Unchanged) */}
      {schemaData.map((schema, index) => (
          <script 
              key={index}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
      ))}
    </Helmet>
  );
};

export default SeoInjector;