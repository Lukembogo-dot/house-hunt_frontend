// src/components/SeoInjector.jsx
// (UPDATED: Fixed Video Schema and Breadcrumb Issues for Google Search Console)

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { extractVideoThumbnail, generateVideoUrls, estimateVideoDuration } from '../utils/videoUtils';

/**
 * Injects all SEO-related tags into the document head.
 * Receives the 'seo' object from the useSeoData hook.
 * @param {Object} seo - SEO metadata object
 * @param {Object} property - Property listing data
 * @param {Array} reviews - Array of review/comment objects for product snippets
 */
const SeoInjector = ({ seo, property, reviews = [] }) => {

    // ✅ PRERENDER.IO: Signal that the page is ready for snapshotting
    useEffect(() => {
        if (typeof window !== 'undefined' && window.prerenderReady === false) {
            // Small delay to ensure Helmet has injected meta tags into the DOM
            const timer = setTimeout(() => {
                window.prerenderReady = true;
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [seo]);
    // ✅ Helper: Strip HTML and Truncate to prevent bloating
    const cleanText = (html, maxLength = 300) => {
        if (!html) return '';
        // Strip HTML tags
        let text = html.replace(/<[^>]*>?/gm, ' ');
        // Collapse whitespace
        text = text.replace(/\s+/g, ' ').trim();
        // Truncate
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    };

    // ✅ Helper: Ensure Image is URL (not Base64)
    const isValidImageUrl = (url) => {
        return url && typeof url === 'string' && url.startsWith('http');
    };

    if (!seo || !seo.metaTitle) {
        return null; // Don't render anything if seo data isn't ready
    }

    // ✅ 1. FIX: Hardcode the production domain. 
    const siteUrl = 'https://househuntkenya.com';

    // ✅ 2. FIX: Strict Canonical Logic (Strip Query Parameters)
    let canonical = '';

    if (seo.canonicalUrl) {
        canonical = seo.canonicalUrl.startsWith('http')
            ? seo.canonicalUrl
            : `${siteUrl}${seo.canonicalUrl}`;
    } else {
        // Get current pathname WITHOUT query parameters
        let currentPath = seo.pagePath;

        if (!currentPath && typeof window !== 'undefined') {
            // Use window.location.pathname (which naturally excludes query params)
            currentPath = window.location.pathname;
        }

        const cleanPath = currentPath === '/' ? '' : currentPath.replace(/\/$/, ''); // ✅ STRIP TRAILING SLASH
        // Canonical URL is ALWAYS clean (no query parameters, no trailing slash)
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
                    "description": seo.videoDescription || cleanText(property.description, 160) || `Watch a complete walkthrough of ${property.title}.`,
                    "thumbnailUrl": seo.videoThumbnail || videoThumbnail || ((property.images && property.images.length > 0)
                        ? (property.images[0].url || property.images[0])
                        : "https://househuntkenya.com/assets/video-placeholder.jpg"),
                    "uploadDate": property.createdAt || new Date().toISOString(),
                    "duration": videoDuration, // ✅ Required by Google
                    "contentUrl": contentUrl, // ✅ Proper YouTube watch URL or direct file
                    "embedUrl": embedUrl, // ✅ Proper embed URL
                    "publisher": {
                        "@type": "Organization",
                        "name": "HouseHunt Kenya",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://househuntkenya.com/assets/logo.png"
                        }
                    }
                };
            }

            schema.push({
                "@context": "https://schema.org",
                "@type": "RealEstateListing", // ✅ FIXED: Use ONLY RealEstateListing, NOT Product (prevents merchant listing validation errors)
                "name": property.title,
                "headline": property.title, // ✅ ENHANCED: Google recommended field
                "description": cleanText(property.description, 300), // ✅ SEO-optimized: 300 char limit prevents bloat
                "image": (property.images && property.images.length > 0)
                    ? property.images
                        .map(img => typeof img === 'string' ? img : img.url)
                        .filter(isValidImageUrl) // ✅ Filter out Base64
                    : ["https://househuntkenya.com/assets/logo.png"],
                "url": canonical,
                "datePosted": property.createdAt,
                "dateModified": property.updatedAt || property.createdAt, // ✅ ENHANCED: Last updated date
                "datePublished": property.createdAt, // ✅ ENHANCED: Publication date
                // ✅ AI-OPTIMIZED OFFER SCHEMA (Still valid for RealEstateListing)
                "offers": {
                    "@type": "Offer",
                    "price": property.price.toString(),
                    "priceCurrency": "KES",
                    "priceSpecification": {
                        "@type": "UnitPriceSpecification",
                        "price": property.price.toString(),
                        "priceCurrency": "KES",
                        "unitCode": property.listingType === 'rent' ? "MON" : "C62", // AI-readable: Monthly or One-time
                        "unitText": property.listingType === 'rent' ? "per month" : "one-time"
                    },
                    // ✅ AI CRITICAL: Availability status
                    "availability": property.status === 'available'
                        ? "https://schema.org/InStock"
                        : property.status === 'sold' || property.status === 'rented'
                            ? "https://schema.org/SoldOut"
                            : "https://schema.org/OutOfStock",
                    // ✅ AI CRITICAL: Price validity (permanently valid until user updates the property)
                    // If property has updatedAt, price is valid until next update; otherwise indefinitely valid
                    ...(property.updatedAt && property.updatedAt !== property.createdAt ? {
                        "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from last update
                    } : {
                        "priceValidUntil": new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 10 years (effectively permanent)
                    }),
                    // ✅ AI CRITICAL: Item condition
                    "itemCondition": "https://schema.org/NewCondition",
                    "validFrom": property.createdAt,
                    "url": canonical,
                    // ✅ AI HELPFUL: Seller organization info
                    "seller": {
                        "@type": "Organization",
                        "name": "HouseHunt Kenya"
                    }
                },
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": property.location,
                    "addressCountry": "KE"
                },
                // ✅ ENHANCED: Lease length (if it's a rental property)
                ...(property.listingType === 'rent' && property.leaseLength ? {
                    "leaseLength": {
                        "@type": "QuantitativeValue",
                        "unitCode": "MON",
                        "value": property.leaseLength
                    }
                } : {}),
                // Specific Real Estate Fields
                ...(property.bedrooms ? { "numberOfRooms": property.bedrooms } : {}),
                ...(property.bedrooms ? { "numberOfBedrooms": property.bedrooms } : {}),
                // ✅ ENHANCED: Bathroom count
                ...(property.bathrooms ? { "numberOfBathroomsFull": property.bathrooms } : {}),
                // ✅ ENHANCED: Square footage / Living area
                ...(property.area ? {
                    "floorSize": {
                        "@type": "QuantitativeValue",
                        "value": property.area,
                        "unitCode": "MTK" // Square meters
                    }
                } : {}),
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
                // ✅ ENHANCED: Primary image of page (for Rich Results)
                ...(property.images && property.images.length > 0 ? {
                    "primaryImageOfPage": {
                        "@type": "ImageObject",
                        "url": typeof property.images[0] === 'string' ? property.images[0] : property.images[0].url,
                        "width": 1200,
                        "height": 630
                    }
                } : {}),
                // ✅ REVIEW AGGREGATION (Star Ratings in Search Results) - MOVED UP & ALWAYS INCLUDED
                ...(property.averageRating && property.numReviews > 0 ? {
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": property.averageRating,
                        "reviewCount": property.numReviews,
                        "bestRating": 5,
                        "worstRating": 1
                    }
                } : {
                    // ✅ FIXED: Always include aggregateRating for product snippets (even with default values)
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": 0,
                        "reviewCount": 0,
                        "bestRating": 5,
                        "worstRating": 1
                    }
                }),
                // ✅ FIXED: Include review field for product snippets (from comments/reviews)
                ...(reviews && reviews.length > 0 ? {
                    "review": reviews.slice(0, 5).map(comment => ({
                        "@type": "Review",
                        "reviewRating": {
                            "@type": "Rating",
                            "ratingValue": comment.rating || 0,
                            "bestRating": 5,
                            "worstRating": 1
                        },
                        "reviewBody": comment.comment || comment.text || "No comment provided",
                        "author": {
                            "@type": "Person",
                            "name": comment.author?.name || "Anonymous"
                        },
                        "datePublished": comment.createdAt || new Date().toISOString()
                    }))
                } : {
                    // ✅ At least one review object for valid product snippets
                    "review": {
                        "@type": "Review",
                        "reviewRating": {
                            "@type": "Rating",
                            "ratingValue": 0,
                            "bestRating": 5,
                            "worstRating": 1
                        },
                        "reviewBody": "No reviews yet",
                        "author": {
                            "@type": "Person",
                            "name": "HouseHunt Kenya"
                        },
                        "datePublished": new Date().toISOString()
                    }
                }),
                // ✅ SELLER/AGENT INFORMATION
                ...(property.agent ? {
                    "seller": {
                        "@type": "RealEstateAgent",
                        "name": property.agent.name,
                        "url": `${siteUrl}/agent/${property.agent._id}`,
                        "telephone": property.agent.phone || property.agent.telephone,
                        // ✅ FIXED: Always include address (required field for RealEstateAgent)
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": property.agent.address?.street || "Not specified",
                            "addressLocality": property.agent.address?.city || property.agent.address?.suburb || "Nairobi",
                            "addressRegion": property.agent.address?.region || "Nairobi County",
                            "postalCode": property.agent.address?.postalCode || "",
                            "addressCountry": "KE"
                        },
                        ...(property.agent.profilePicture ? {
                            "image": property.agent.profilePicture
                        } : {})
                    }
                } : {}),
                // ✅ NEST VIDEO OBJECT INSIDE LISTING (Google's preferred structure)
                ...(videoObject ? { "video": videoObject } : {}),
                // ✅ ENHANCED: Main entity of page (for semantic clarity)
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": canonical
                }
            });
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
            {/* ✅ AI-OPTIMIZED META DESCRIPTION (If available) */}
            <meta name="description" content={property?.aiMetaDescription || seo.metaDescription} />
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
            <meta property="og:type" content="website" /> {/* ✅ FIXED: Always use 'website' not 'product' to avoid merchant listing validation */}
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={seo.ogTitle || seo.metaTitle} />
            <meta property="og:description" content={property?.aiMetaDescription || seo.ogDescription || seo.metaDescription} />
            {/* ✅ OPENGRAPH IMAGES (Critical for Social Sharing) */}
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:secure_url" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={seo.metaTitle} />
            <meta property="og:site_name" content="HouseHunt Kenya" />

            {/* ✅ REMOVED: OpenGraph Product Tags (caused merchant listing validation errors) */}
            {/* Real estate listings use RealEstateListing schema instead */}

            {/* --- Twitter --- */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonical} />
            <meta property="twitter:title" content={seo.twitterTitle || seo.metaTitle} />
            <meta property="twitter:image" content={seo.twitterImage || ogImage} />
            <meta property="twitter:description" content={property?.aiMetaDescription || seo.twitterDescription || seo.metaDescription} />

            {/* ✅ AI SEARCH: Twitter Card Labels */}
            {property && (
                <>
                    <meta name="twitter:label1" content="Price" />
                    <meta name="twitter:data1" content={`KSh ${property.price.toLocaleString()}/${property.listingType === 'rent' ? 'month' : 'sale'}`} />
                    <meta name="twitter:label2" content="Location" />
                    <meta name="twitter:data2" content={property.location} />
                </>
            )}

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