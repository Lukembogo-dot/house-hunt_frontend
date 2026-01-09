// src/components/SeoInjector.jsx
// (UPDATED: Added Dataset Schema for Generative Engine Optimization)

import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Injects all SEO-related tags into the document head.
 * Receives the 'seo' object from the useSeoData hook.
 */
const SeoInjector = ({ seo, property }) => {
    if (!seo || !seo.metaTitle) {
        return null; // Don't render anything if seo data isn't ready
    }

    // ✅ 1. FIX: Hardcode the production domain. 
    const siteUrl = 'https://www.househuntkenya.co.ke';

    // ✅ 2. FIX: Strict Canonical Logic
    let canonical = '';

    if (seo.canonicalUrl) {
        canonical = seo.canonicalUrl.startsWith('http')
            ? seo.canonicalUrl
            : `${siteUrl}${seo.canonicalUrl}`;
    } else {
        const currentPath = seo.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '');
        const cleanPath = currentPath === '/' ? '' : currentPath;
        canonical = `${siteUrl}${cleanPath}`;
    }

    // --- Schema Generation ---
    const generateSchema = () => {
        const schema = [];

        // 1. FAQ Schema (if FAQs exist OR SERP Q&A exist)
        const allFaqs = [
            ...(seo.faqs || []),
            ...(seo.serpModifications?.qaPairs || [])
        ];

        if (allFaqs.length > 0) {
            schema.push({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": allFaqs.filter(f => f.question && f.answer).map(faq => ({
                    "@type": "Question",
                    "name": faq.question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq.answer
                    }
                }))
            });
        }

        // 2. WebPage Schema
        if (seo.schemaDescription) {
            schema.push({
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": seo.schemaHeadline || seo.metaTitle, // ✅ Use Schema Headline if available
                "headline": seo.schemaHeadline || seo.metaTitle, // ✅ Added Explicit Headline
                "description": seo.schemaDescription,
                "url": canonical,
                // ✅ SERP Feature: Key Takeaways or Snippet (using 'about' or 'text' property is risky for WebPage, using 'mainEntity' if Article? No, keep simple)
                // We'll stick to 'about' for the snippet if present.
                ...(seo.serpModifications?.featuredSnippet ? {
                    "about": {
                        "@type": "Thing",
                        "name": seo.serpModifications.featuredSnippet
                    }
                } : {}),
                // ✅ AUTHOR AUTHORITY (E-E-A-T)
                ...(property?.agent ? {
                    "author": {
                        "@type": "Person",
                        "name": property.agent.name,
                        "url": `${siteUrl}/agent/${property.agent._id}`,
                        "image": property.agent.profilePicture
                    },
                    "creator": {  // Redundant but helpful signal
                        "@type": "Person",
                        "name": property.agent.name
                    }
                } : {})
            });
        }

        // ✅ 3. BREADCRUMB SCHEMA
        if (seo.breadCrumbTitle) {
            schema.push({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": siteUrl
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": seo.breadCrumbTitle,
                        "item": canonical
                    }
                ]
            });
        }

        // ✅ 3. DATASET SCHEMA (For AI/GEO Authority)
        // Automatically detects location from path to create a data citation source
        const currentPath = seo.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '');

        if (currentPath.includes('/search/') || currentPath === '/') {
            let locationName = 'Kenya'; // Default for homepage

            // Extract location from /search/rent/kilimani
            if (currentPath.includes('/search/')) {
                const parts = currentPath.split('/');
                if (parts.length >= 4) {
                    // parts[3] is location (e.g., 'kilimani')
                    locationName = parts[3].charAt(0).toUpperCase() + parts[3].slice(1);
                }
            }

            schema.push({
                "@context": "https://schema.org",
                "@type": "Dataset",
                "name": `Real Estate Market Data for ${locationName}`,
                "description": `Current rental prices, property availability, and market trends in ${locationName}.`,
                "creator": {
                    "@type": "Organization",
                    "name": "HouseHunt Kenya"
                },
                "variableMeasured": ["Average Price", "Number of Listings", "Market Trends"],
                "url": canonical
            });
        }

        // ✅ 4. VIDEO OBJECT SCHEMA (Rich Result for Video)
        if (property && property.video) {
            const videoSchema = {
                "@context": "https://schema.org",
                "@type": "VideoObject",
                "name": seo.videoTitle || `Video Tour of ${property.title}`,
                "description": seo.videoDescription || (property.description ? property.description.substring(0, 160) : `Watch a full tour of ${property.title}.`),
                "thumbnailUrl": seo.videoThumbnail || ((property.images && property.images.length > 0)
                    ? (property.images[0].url || property.images[0])
                    : "https://www.househuntkenya.co.ke/assets/video-placeholder.jpg"),
                "uploadDate": property.createdAt || new Date().toISOString(),
                "contentUrl": property.video,
                "embedUrl": property.video.includes("youtube")
                    ? property.video.replace("watch?v=", "embed/")
                    : property.video,
                "publisher": {
                    "@type": "Organization",
                    "name": "HouseHunt Kenya",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://www.househuntkenya.co.ke/assets/logo.png"
                    }
                }
            };
            schema.push(videoSchema);
            schema.push(videoSchema);
        }

        // ✅ 5. REAL ESTATE LISTING SCHEMA (The "Gold Standard" for Property SEO)
        if (property) {
            const listingSchema = {
                "@context": "https://schema.org",
                "@type": ["RealEstateListing", "Product"], // Dual typing for maximum visibility
                "name": property.title,
                "description": property.description,
                "image": (property.images && property.images.length > 0)
                    ? property.images.map(img => typeof img === 'string' ? img : img.url)
                    : ["https://www.househuntkenya.co.ke/assets/logo.png"],
                "url": canonical,
                "datePosted": property.createdAt,
                "offers": {
                    "@type": "Offer",
                    "price": property.price,
                    "priceCurrency": "KES",
                    "priceSpecification": {
                        "@type": "UnitPriceSpecification",
                        "price": property.price,
                        "priceCurrency": "KES",
                        "unitCode": property.listingType === 'rent' ? "MON" : "C62" // MON=Month, C62=One time
                    },
                    "availability": property.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                    "validFrom": property.createdAt,
                    "url": canonical
                },
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": property.location,
                    "addressCountry": "KE"
                },
                // Specific Real Estate Fields
                ...(property.bedrooms ? { "numberOfRooms": property.bedrooms } : {}),
                ...(property.bedrooms ? { "numberOfBedrooms": property.bedrooms } : {}),
                // Geo Coordinates for Map Pack
                ...(property.coordinates && property.coordinates.lat ? {
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": property.coordinates.lat,
                        "longitude": property.coordinates.lng
                    }
                } : {}),
                // Amenities as text features
                ...(property.amenities && property.amenities.length > 0 ? {
                    "amenityFeature": property.amenities.map(amenity => ({
                        "@type": "LocationFeatureSpecification",
                        "name": amenity,
                        "value": true
                    }))
                } : {})
            };
            schema.push(listingSchema);
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

            {/* ✅ Strict Canonical Link */}
            <link rel="canonical" href={canonical} />

            {/* --- Open Graph / Facebook --- */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={seo.ogTitle || seo.metaTitle} />
            <meta property="og:description" content={seo.ogDescription || seo.metaDescription} />

            {/* --- Twitter --- */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonical} />
            <meta property="twitter:title" content={seo.twitterTitle || seo.metaTitle} />
            <meta property="twitter:description" content={seo.twitterDescription || seo.metaDescription} />

            {/* ✅ AI-Generated RICH Schema (Overrides/Augments Standard Schema) */}
            {seo.richSchema && (
                <script type="application/ld+json">
                    {JSON.stringify(seo.richSchema)}
                </script>
            )}

            {/* Standard Schema Structured Data (Only if Rich Schema is missing to avoid duplicates/conflicts) */}
            {!seo.richSchema && schemaData.map((schema, index) => (
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