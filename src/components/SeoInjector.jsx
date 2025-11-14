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

  // Construct the full canonical URL. Fallback to window location.
  const pageUrl = window.location.href;
  const canonical = seo.canonicalUrl 
    ? (seo.canonicalUrl.startsWith('http') ? seo.canonicalUrl : `https://www.househuntkenya.co.ke${seo.canonicalUrl}`)
    : pageUrl;

  // --- This part is unchanged: Generate Schema for FAQs, etc. ---
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
            "url": window.location.href,
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
      <link rel="canonical" href={canonical} />

      {/* --- Open Graph / Facebook (UPDATED) --- */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={seo.ogTitle || seo.metaTitle} />
      <meta property="og:description" content={seo.ogDescription || seo.metaDescription} />
      {/* <meta property="og:image" content={seo.ogImage || 'default_image_url.png'} /> */}

      {/* --- Twitter (UPDATED) --- */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={pageUrl} />
      <meta property="twitter:title" content={seo.twitterTitle || seo.metaTitle} />
      <meta property="twitter:description" content={seo.twitterDescription || seo.metaDescription} />
      {/* <meta property="twitter:image" content={seo.twitterImage || 'default_image_url.png'} /> */}

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