// src/components/SeoInjector.jsx
// (UPDATED: Fixed Video Schema and Breadcrumb Issues for Google Search Console)

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { extractVideoThumbnail, generateVideoUrls, estimateVideoDuration } from '../utils/videoUtils';

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

        // ✅ 0. ORGANIZATION SCHEMA (Global - E-E-A-T Authority)
        const organizationSchema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "HouseHunt Kenya",
            "alternateName": "HouseHunt",
            "url": siteUrl,
            "logo": `${siteUrl}/assets/logo.png`,
            "description": "Kenya's leading real estate platform for finding rental and sale properties",
            "foundingDate": "2024",
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "areaServed": "KE",
                "availableLanguage": ["English", "Swahili"]
            },
            "sameAs": [
                "https://www.facebook.com/househuntkenya",
                "https://twitter.com/househuntkenya",
                "https://www.instagram.com/househuntkenya",
                "https://www.linkedin.com/company/househuntkenya"
            ],
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Nairobi",
                "addressCountry": "KE"
            }
        };
        schema.push(organizationSchema);

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

        // ✅ 3. BREADCRUMB SCHEMA - REMOVED
        // ⚠️ Breadcrumb schema is now exclusively handled by Breadcrumbs.jsx component
        // This prevents duplicate breadcrumb schemas which confuse Google's crawler

        // ✅ 4. DATASET SCHEMA (For AI/GEO Authority)
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

        // ✅ 4.5 LOCAL BUSINESS SCHEMA (For Homepage & About Pages)
        if (!property && (seo.pagePath === '/' || seo.pagePath === '/about' || seo.pagePath === '/contact')) {
            const localBusinessSchema = {
                "@context": "https://schema.org",
                "@type": "RealEstateAgent",
                "name": "HouseHunt Kenya",
                "image": `${siteUrl}/assets/office.jpg`,
                "description": "Kenya's leading real estate platform for finding rental and sale properties across Nairobi and beyond",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Nairobi CBD",
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
                "url": siteUrl,
                "telephone": "+254-700-000000",
                "priceRange": "$$",
                "openingHoursSpecification": [
                    {
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        "opens": "09:00",
                        "closes": "18:00"
                    },
                    {
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": "Saturday",
                        "opens": "10:00",
                        "closes": "16:00"
                    }
                ],
                "sameAs": [
                    "https://www.facebook.com/househuntkenya",
                    "https://twitter.com/househuntkenya",
                    "https://www.instagram.com/househuntkenya"
                ]
            };
            schema.push(localBusinessSchema);
        }

        // ✅ 4.6 HOWTO SCHEMA (For Guide Pages & FAQs)
        if (seo.howToSteps && seo.howToSteps.length > 0) {
            const howToSchema = {
                "@context": "https://schema.org",
                "@type": "HowTo",
                "name": seo.metaTitle,
                "description": seo.metaDescription,
                "image": seo.ogImage || `${siteUrl}/assets/og-default.png`,
                "totalTime": seo.howToTotalTime || "PT15M",
                "step": seo.howToSteps.map((step, index) => ({
                    "@type": "HowToStep",
                    "position": index + 1,
                    "name": step.name,
                    "text": step.text,
                    "url": `${canonical}#step-${index + 1}`
                }))
            };
            schema.push(howToSchema);
        }

        // ✅ 4.7 EVENT SCHEMA (For Property Viewings)
        if (seo.eventData) {
            const eventSchema = {
                "@context": "https://schema.org",
                "@type": "Event",
                "name": seo.eventData.name || `Property Viewing: ${seo.metaTitle}`,
                "startDate": seo.eventData.startDate,
                "endDate": seo.eventData.endDate,
                "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                "eventStatus": "https://schema.org/EventScheduled",
                "location": {
                    "@type": "Place",
                    "name": seo.eventData.locationName || "Property Location",
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": seo.eventData.city || "Nairobi",
                        "addressCountry": "KE"
                    }
                },
                "image": seo.ogImage || `${siteUrl}/assets/og-default.png`,
                "description": seo.eventData.description || seo.metaDescription,
                "organizer": {
                    "@type": "Organization",
                    "name": "HouseHunt Kenya",
                    "url": siteUrl
                }
            };
            schema.push(eventSchema);
        }

        // ✅ 4.8 ARTICLE/BLOG SCHEMA (For Service Posts & Blog Content)
        if (seo.articleType) {
            const articleSchema = {
                "@context": "https://schema.org",
                "@type": seo.articleType === 'news' ? "NewsArticle" : "BlogPosting",
                "headline": seo.metaTitle,
                "image": seo.ogImage || `${siteUrl}/assets/og-default.png`,
                "datePublished": seo.datePublished || new Date().toISOString(),
                "dateModified": seo.dateModified || new Date().toISOString(),
                "author": {
                    "@type": "Organization",
                    "name": "HouseHunt Kenya"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "HouseHunt Kenya",
                    "logo": {
                        "@type": "ImageObject",
                        "url": `${siteUrl}/assets/logo.png`
                    }
                },
                "description": seo.metaDescription,
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": canonical
                }
            };
            schema.push(articleSchema);
        }

        // ✅ 5. REAL ESTATE LISTING SCHEMA (The "Gold Standard" for Property SEO)
        // ✅ VIDEO NESTED INSIDE REAL ESTATE LISTING (as per Google's requirements)
        if (property) {
            // Extract video metadata if video exists
            let videoObject = null;
            if (property.video) {
                const { contentUrl, embedUrl } = generateVideoUrls(property.video);
                const videoThumbnail = extractVideoThumbnail(property.video);
                const videoDuration = estimateVideoDuration(property.video);

                videoObject = {
                    "@type": "VideoObject",
                    "name": seo.videoTitle || `Virtual Tour of ${property.title}`,
                    "description": seo.videoDescription || (property.description ? property.description.substring(0, 160) : `Watch a complete walkthrough of ${property.title}.`),
                    "thumbnailUrl": seo.videoThumbnail || videoThumbnail || ((property.images && property.images.length > 0)
                        ? (property.images[0].url || property.images[0])
                        : "https://www.househuntkenya.co.ke/assets/video-placeholder.jpg"),
                    "uploadDate": property.createdAt || new Date().toISOString(),
                    "duration": videoDuration, // ✅ Required by Google
                    "contentUrl": contentUrl, // ✅ Proper YouTube watch URL or direct file
                    "embedUrl": embedUrl, // ✅ Proper embed URL
                    "publisher": {
                        "@type": "Organization",
                        "name": "HouseHunt Kenya",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://www.househuntkenya.co.ke/assets/logo.png"
                        }
                    }
                };
            }

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
                } : {}),
                // ✅ REVIEW AGGREGATION (Star Ratings in Search Results)
                ...(property.averageRating && property.numReviews > 0 ? {
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": property.averageRating,
                        "reviewCount": property.numReviews,
                        "bestRating": 5,
                        "worstRating": 1
                    }
                } : {}),
                // ✅ SELLER/AGENT INFORMATION
                ...(property.agent ? {
                    "seller": {
                        "@type": "RealEstateAgent",
                        "name": property.agent.name,
                        "url": `${siteUrl}/agent/${property.agent._id}`
                    }
                } : {}),
                // ✅ NEST VIDEO OBJECT INSIDE LISTING (Google's preferred structure)
                ...(videoObject ? { "video": videoObject } : {})
            };
            schema.push(listingSchema);
        }

        return schema;
    };

    const schemaData = generateSchema();

    // ✅ Determine OpenGraph Image
    const ogImage = seo.ogImage ||
        (property?.images && property.images.length > 0
            ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0].url)
            : `${siteUrl}/assets/og-default.png`);

    return (
        <Helmet>
            {/* ✅ SECURITY HEADERS */}
            <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
            <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
            <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

            {/* --- Primary Meta Tags --- */}
            <title>{seo.metaTitle}</title>
            <meta name="description" content={seo.metaDescription} />
            <meta name="author" content="HouseHunt Kenya" />
            <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

            {/* --- Mobile Optimization --- */}
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
            <meta name="format-detection" content="telephone=yes" />
            <meta name="theme-color" content="#3B82F6" />

            {/* --- ADDED FOCUS KEYWORD & CANONICAL --- */}
            {seo.focusKeyword && <meta name="keywords" content={seo.focusKeyword} />}

            {/* ✅ Strict Canonical Link */}
            <link rel="canonical" href={canonical} />

            {/* --- Open Graph / Facebook --- */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={seo.ogTitle || seo.metaTitle} />
            <meta property="og:description" content={seo.ogDescription || seo.metaDescription} />
            {/* ✅ OPENGRAPH IMAGES (Critical for Social Sharing) */}
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:secure_url" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={seo.metaTitle} />
            <meta property="og:site_name" content="HouseHunt Kenya" />

            {/* --- Twitter --- */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonical} />
            <meta property="twitter:title" content={seo.twitterTitle || seo.metaTitle} />
            <meta property="twitter:image" content={seo.twitterImage || ogImage} />
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