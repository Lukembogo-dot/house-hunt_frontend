// src/pages/PropertyVideoWatch.jsx
// Dedicated video watch page for Google video indexing compliance
// This page's main purpose is to show users a video, making it a "watch page" for Google

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaPlay, FaHome, FaArrowLeft, FaMapMarkerAlt, FaBed, FaExpand, FaShareAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import apiClient from '../api/axios';
import { extractVideoThumbnail, generateVideoUrls, estimateVideoDuration, getVideoPlatform } from '../utils/videoUtils';

const PropertyVideoWatch = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const siteUrl = 'https://www.househuntkenya.co.ke';

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(`/properties/slug/${slug}`);

                // Redirect to property page if no video exists
                if (!res.data.video) {
                    navigate(`/properties/${slug}`, { replace: true });
                    return;
                }

                setProperty(res.data);
            } catch (err) {
                console.error('Error fetching property:', err);
                setError('Property not found');
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [slug, navigate]);

    // ✅ ENHANCED: Generate UNIQUE video SEO data (different from main property page)
    // Uses video-specific language to avoid duplicate meta titles/descriptions
    const getVideoSeoData = () => {
        if (!property?.video) return null;

        const { contentUrl, embedUrl } = generateVideoUrls(property.video);
        const thumbnailUrl = extractVideoThumbnail(property.video) ||
            (property.images?.[0]?.url || property.images?.[0]) ||
            `${siteUrl}/assets/video-placeholder.jpg`;
        const duration = estimateVideoDuration(property.video);
        const platform = getVideoPlatform(property.video);

        // ✅ UNIQUE TITLE FORMAT (different from property page title)
        // Property page: "Beautiful 2BR Apartment in Kilimani | HouseHunt Kenya"
        // Video page: "▶ Watch: 2 Bedroom Kilimani Tour - Virtual Walkthrough"
        const typeLabel = property.type ? property.type.charAt(0).toUpperCase() + property.type.slice(1) : 'Property';
        const bedroomText = property.bedrooms ? `${property.bedrooms} Bedroom ` : '';
        const locationShort = property.location?.split(',')[0] || property.location;

        const uniqueVideoTitle = `▶ Watch: ${bedroomText}${locationShort} ${typeLabel} Tour - Virtual Walkthrough`;

        // ✅ UNIQUE DESCRIPTION FORMAT (video-focused, different from property page)
        // Emphasizes video action words and viewing experience
        const priceText = property.price ? `Ksh ${property.price.toLocaleString()}${property.listingType === 'rent' ? '/mo' : ''}` : '';
        const amenitiesText = property.amenities?.slice(0, 3).join(', ') || '';

        const uniqueVideoDescription = [
            `🎬 Take a virtual walkthrough of this ${bedroomText.toLowerCase().trim()} ${typeLabel.toLowerCase()} in ${property.location}.`,
            priceText ? `Listed at ${priceText}.` : '',
            amenitiesText ? `Features: ${amenitiesText}.` : '',
            `See every room, layout, and finish before scheduling your in-person visit.`,
            `Watch the full property tour video now.`
        ].filter(Boolean).join(' ');

        // ✅ BREADCRUMB TITLE (short, unique)
        const breadcrumbTitle = `Video Tour: ${bedroomText}${locationShort} ${typeLabel}`;

        return {
            contentUrl,
            embedUrl,
            thumbnailUrl,
            duration,
            platform,
            title: uniqueVideoTitle,
            description: uniqueVideoDescription,
            breadcrumbTitle,
            // Additional video-specific keywords for SEO
            keywords: [
                `${locationShort} property tour`,
                `${typeLabel.toLowerCase()} video walkthrough`,
                `Kenya virtual tour`,
                `${bedroomText}${typeLabel.toLowerCase()} video`,
                property.location
            ].join(', ')
        };
    };

    const videoData = property ? getVideoSeoData() : null;

    // ✅ ENHANCED: Generate VideoObject Schema with more properties
    const generateVideoSchema = () => {
        if (!videoData) return null;

        return {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": videoData.title,
            "description": videoData.description,
            "thumbnailUrl": videoData.thumbnailUrl,
            "uploadDate": property.createdAt || new Date().toISOString(),
            "duration": videoData.duration,
            "contentUrl": videoData.contentUrl,
            "embedUrl": videoData.embedUrl,
            // ✅ NEW: Language and accessibility
            "inLanguage": "en",
            "isAccessibleForFree": true,
            // ✅ NEW: Video category/genre
            "genre": "Real Estate",
            // ✅ NEW: Region targeting
            "regionsAllowed": ["KE", "UG", "TZ", "RW"],
            // ✅ NEW: Interaction statistics placeholder
            "interactionStatistic": {
                "@type": "InteractionCounter",
                "interactionType": { "@type": "WatchAction" },
                "userInteractionCount": property.views || 0
            },
            // Publisher with full details
            "publisher": {
                "@type": "Organization",
                "name": "HouseHunt Kenya",
                "url": siteUrl,
                "logo": {
                    "@type": "ImageObject",
                    "url": `${siteUrl}/assets/logo.png`,
                    "width": 200,
                    "height": 60
                }
            },
            // ✅ CRITICAL: Associate video with the property listing
            "about": {
                "@type": "RealEstateListing",
                "name": property.title,
                "url": `${siteUrl}/properties/${property.slug}`,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": property.location,
                    "addressCountry": "KE"
                },
                ...(property.price ? {
                    "offers": {
                        "@type": "Offer",
                        "price": property.price,
                        "priceCurrency": "KES"
                    }
                } : {})
            },
            // ✅ Potential action for engagement
            "potentialAction": {
                "@type": "WatchAction",
                "target": `${siteUrl}/properties/${property.slug}/video`
            }
        };
    };

    // ✅ ENHANCED: Generate BreadcrumbList Schema with dynamic title
    const generateBreadcrumbSchema = () => {
        const listingTypeLabel = property?.listingType === 'sale' ? 'For Sale' : 'For Rent';

        return {
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
                    "name": `Properties ${listingTypeLabel}`,
                    "item": `${siteUrl}/search/${property?.listingType || 'rent'}`
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": property?.title || 'Property Details',
                    "item": `${siteUrl}/properties/${slug}`
                },
                {
                    "@type": "ListItem",
                    "position": 4,
                    "name": videoData?.breadcrumbTitle || "Video Tour",
                    "item": `${siteUrl}/properties/${slug}/video`
                }
            ]
        };
    };

    // Render video player based on platform
    const renderVideoPlayer = () => {
        if (!property?.video) return null;

        const isYouTube = property.video.includes('youtube.com') || property.video.includes('youtu.be');
        const isVimeo = property.video.includes('vimeo.com');

        return (
            <div className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    {isYouTube ? (
                        <iframe
                            src={property.video.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/') + '?autoplay=1&rel=0'}
                            className="absolute top-0 left-0 w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                            title={videoData?.title || 'Property Video Tour'}
                        />
                    ) : isVimeo ? (
                        <iframe
                            src={property.video.replace('vimeo.com/', 'player.vimeo.com/video/') + '?autoplay=1'}
                            className="absolute top-0 left-0 w-full h-full"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title={videoData?.title || 'Property Video Tour'}
                        />
                    ) : (
                        <video
                            src={property.video}
                            controls
                            autoPlay
                            controlsList="nodownload"
                            className="absolute top-0 left-0 w-full h-full object-contain"
                            poster={videoData?.thumbnailUrl}
                        />
                    )}
                </div>
            </div>
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading video tour...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !property) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
                <Helmet>
                    <title>Video Not Found | HouseHunt Kenya</title>
                    <meta name="robots" content="noindex, nofollow" />
                </Helmet>
                <div className="text-center max-w-md">
                    <FaPlay className="text-6xl text-gray-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Video Not Available</h1>
                    <p className="text-gray-400 mb-6">This property video tour is not available.</p>
                    <Link
                        to="/search/rent/all/all"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        <FaHome /> Browse Properties
                    </Link>
                </div>
            </div>
        );
    }

    const videoSchema = generateVideoSchema();
    const breadcrumbSchema = generateBreadcrumbSchema();
    const pageTitle = `${videoData?.title} | HouseHunt Kenya`;
    const pageDescription = videoData?.description;
    const canonical = `${siteUrl}/properties/${slug}/video`;

    return (
        <>
            {/* ✅ ENHANCED: SEO META TAGS - Critical for Video Indexing */}
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                {/* ✅ NEW: Keywords meta tag for video-specific SEO */}
                {videoData?.keywords && <meta name="keywords" content={videoData.keywords} />}
                <meta name="robots" content="index, follow, max-video-preview:-1, max-image-preview:large" />
                <link rel="canonical" href={canonical} />

                {/* ✅ ENHANCED: OpenGraph for Social Sharing */}
                <meta property="og:type" content="video.other" />
                <meta property="og:title" content={videoData?.title} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:url" content={canonical} />
                <meta property="og:image" content={videoData?.thumbnailUrl} />
                <meta property="og:image:alt" content={`Thumbnail for ${videoData?.title}`} />
                <meta property="og:video" content={videoData?.contentUrl} />
                <meta property="og:video:secure_url" content={videoData?.contentUrl} />
                <meta property="og:video:type" content="text/html" />
                <meta property="og:video:width" content="1280" />
                <meta property="og:video:height" content="720" />
                {/* ✅ NEW: Video duration in OpenGraph format */}
                <meta property="video:duration" content="180" />
                <meta property="og:locale" content="en_KE" />
                <meta property="og:site_name" content="HouseHunt Kenya" />

                {/* ✅ ENHANCED: Twitter Card for Video */}
                <meta name="twitter:card" content="player" />
                <meta name="twitter:site" content="@househuntkenya" />
                <meta name="twitter:title" content={videoData?.title} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={videoData?.thumbnailUrl} />
                <meta name="twitter:player" content={videoData?.embedUrl} />
                <meta name="twitter:player:width" content="1280" />
                <meta name="twitter:player:height" content="720" />

                {/* ✅ VideoObject Schema - Standalone (Watch Page Requirement) */}
                <script type="application/ld+json">
                    {JSON.stringify(videoSchema)}
                </script>

                {/* Breadcrumb Schema */}
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>

            {/* ✅ WATCH PAGE LAYOUT - Video is the PRIMARY focus */}
            <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
                {/* Minimal Header with Back Navigation */}
                <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                        <Link
                            to={`/properties/${slug}`}
                            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition"
                        >
                            <FaArrowLeft />
                            <span className="hidden sm:inline">Back to Property</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: videoData?.title,
                                            url: canonical
                                        });
                                    } else {
                                        navigator.clipboard.writeText(canonical);
                                        alert('Link copied!');
                                    }
                                }}
                                className="p-2 text-gray-400 hover:text-white transition"
                                aria-label="Share video"
                            >
                                <FaShareAlt />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Video Section - THE PRIMARY CONTENT */}
                <main className="max-w-6xl mx-auto px-4 py-6">
                    {/* Video Player - Takes up most of the viewport */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6"
                    >
                        {renderVideoPlayer()}
                    </motion.div>

                    {/* Minimal Video Info - Supporting content only */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-900/50 rounded-xl p-6 border border-gray-800"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            {/* Video Title and Basic Info */}
                            <div className="flex-1">
                                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                    <FaPlay className="text-red-500" />
                                    {videoData?.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                                    <span className="flex items-center gap-1.5">
                                        <FaMapMarkerAlt className="text-blue-400" />
                                        {property.location}
                                    </span>
                                    {property.bedrooms && (
                                        <span className="flex items-center gap-1.5">
                                            <FaBed className="text-green-400" />
                                            {property.bedrooms} Bedroom{property.bedrooms > 1 ? 's' : ''}
                                        </span>
                                    )}
                                    <span className="text-blue-400 font-semibold">
                                        Ksh {property.price?.toLocaleString()}
                                        {property.listingType === 'rent' && '/mo'}
                                    </span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <Link
                                to={`/properties/${slug}`}
                                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl whitespace-nowrap"
                            >
                                <FaHome />
                                View Full Details
                            </Link>
                        </div>

                        {/* Brief Description */}
                        {property.description && (
                            <p className="mt-4 text-gray-400 line-clamp-3 leading-relaxed">
                                {property.description.substring(0, 300)}
                                {property.description.length > 300 && '...'}
                            </p>
                        )}
                    </motion.div>

                    {/* SEO-friendly hidden content for crawlers */}
                    <article className="sr-only" aria-hidden="true">
                        <h2>About This Video</h2>
                        <p>
                            Watch a virtual tour of {property.title} located in {property.location}.
                            This {property.bedrooms} bedroom {property.type} is available for {property.listingType}
                            at Ksh {property.price?.toLocaleString()}.
                            {property.listingType === 'rent' && ' per month.'}
                        </p>
                        <p>
                            For full property details including amenities, photos, and contact information,
                            visit the property listing page.
                        </p>
                    </article>
                </main>
            </div>
        </>
    );
};

export default PropertyVideoWatch;
