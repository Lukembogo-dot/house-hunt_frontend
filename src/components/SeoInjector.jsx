// src/components/SeoInjector.jsx

import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Renders the meta tags and schema structured data into the document head 
 * for static pages like /about or /contact.
 * @param {object} seo - SEO data object from useSeoData hook.
 */
const SeoInjector = ({ seo }) => {
    // Generate JSON-LD Structured Data
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
            {/* Standard Meta Tags */}
            <title>{seo.metaTitle}</title>
            <meta name="description" content={seo.metaDescription} />
            <meta name="author" content="HouseHunt Kenya" />

            {/* Open Graph / Social Media Tags */}
            <meta property="og:title" content={seo.metaTitle} />
            <meta property="og:description" content={seo.metaDescription} />
            <meta property="og:url" content={window.location.href} />
            <meta property="og:type" content="website" />

            {/* Schema Structured Data */}
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