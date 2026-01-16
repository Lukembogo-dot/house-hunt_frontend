import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import { FaRobot, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaMapMarkedAlt, FaQuestionCircle } from 'react-icons/fa';
import { Sparkles } from 'lucide-react';

const PropertyAIInsights = ({ propertyId, propertyTitle, propertyLocation, propertyDescription, propertyPostedDate, propertyStatus, propertyType, propertyPrice, agentName, agentImage, agentContact, cachedAiAnalysis = null }) => {
    const [analysis, setAnalysis] = useState(cachedAiAnalysis); // ✅ Use cached data immediately
    const [contextStats, setContextStats] = useState(null);
    const [loading, setLoading] = useState(!cachedAiAnalysis); // ✅ Only show loading if no cached data

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // ✅ OPTIMIZATION: Skip API call if we have fresh cached data
                if (cachedAiAnalysis && cachedAiAnalysis.lastAnalysisDate) {
                    const cacheAge = Date.now() - new Date(cachedAiAnalysis.lastAnalysisDate).getTime();
                    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

                    // If cache is less than 1 week old, skip fetching AI analysis
                    if (cacheAge < ONE_WEEK) {
                        console.log('✅ Using cached AI analysis (fresh)');
                        // Still fetch context data
                        try {
                            const contextRes = await apiClient.get('/ai/context');
                            if (contextRes.data && contextRes.data.neighborhoods) {
                                const neighborhoods = contextRes.data.neighborhoods;
                                const locKey = Object.keys(neighborhoods).find(key =>
                                    propertyLocation.toLowerCase().includes(key.toLowerCase()) ||
                                    key.toLowerCase().includes(propertyLocation.toLowerCase())
                                );
                                if (locKey) setContextStats(neighborhoods[locKey]);
                            }
                        } catch (err) {
                            console.error('Failed to fetch context:', err);
                        }
                        setLoading(false);
                        return;
                    }
                }

                setLoading(true);
                // 1. Fetch Specific Property Analysis (Only if cache is old/missing)
                const analysisReq = apiClient.get(`/ai/analysis/${propertyId}`);

                // 2. Fetch Global AI Context (Universal Data Layer)
                const contextReq = apiClient.get('/ai/context');

                const [analysisRes, contextRes] = await Promise.allSettled([analysisReq, contextReq]);

                if (analysisRes.status === 'fulfilled') {
                    setAnalysis(analysisRes.value.data);
                }

                if (contextRes.status === 'fulfilled' && contextRes.value.data && contextRes.value.data.neighborhoods) {
                    const neighborhoods = contextRes.value.data.neighborhoods;
                    const locKey = Object.keys(neighborhoods).find(key =>
                        propertyLocation.toLowerCase().includes(key.toLowerCase()) ||
                        key.toLowerCase().includes(propertyLocation.toLowerCase())
                    );

                    if (locKey) {
                        setContextStats(neighborhoods[locKey]);
                    }
                }

            } catch (error) {
                console.error("Failed to load AI data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (propertyId) fetchAllData();
    }, [propertyId, propertyLocation, cachedAiAnalysis]);

    if (loading) return (
        <div className="animate-pulse flex flex-col space-y-3 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
    );

    if (!analysis) return null;

    // Decide Badge Color based on Verdict
    const getVerdictStyle = (verdict) => {
        switch (verdict) {
            case 'Good Deal': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: <FaCheckCircle /> };
            case 'Premium': return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: <FaExclamationCircle /> };
            case 'Fair Price': return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: <FaInfoCircle /> };
            default: return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: <FaRobot /> };
        }
    };

    const renderTextWithLinks = (text) => {
        if (!text) return "";
        const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
        return parts.map((part, index) => {
            const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (match) {
                return <a key={index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">{match[1]}</a>;
            }
            return part;
        });
    };

    const style = getVerdictStyle(analysis.verdict);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
            <div className="p-6">
                {/* SEO Injection */}
                {analysis && (
                    <Helmet>
                        {/* 1. Primary Entity: Real Estate Listing */}
                        <script type="application/ld+json">
                            {JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "RealEstateListing",
                                "name": propertyTitle || "Property Analysis",
                                "description": `${analysis.livingInsights || "AI Market Analysis provided."} \n\nOriginal Listing: ${propertyDescription ? propertyDescription.substring(0, 150) + "..." : ""}`,
                                "datePosted": propertyPostedDate,
                                "url": typeof window !== 'undefined' ? window.location.href : "",
                                "image": Array.isArray(propertyId.images) ? propertyId.images[0] : null,
                                "mainEntity": {
                                    "@type": propertyType === 'land' ? 'Landform' : 'Accommodation',
                                    "name": propertyTitle,
                                    "description": propertyDescription,
                                    "address": {
                                        "@type": "PostalAddress",
                                        "addressLocality": propertyLocation,
                                        "addressCountry": "KE"
                                    },
                                    "numberOfRooms": propertyType !== 'land' ? 1 : undefined
                                },
                                "offers": {
                                    "@type": "Offer",
                                    "price": propertyPrice,
                                    "priceCurrency": "KES",
                                    "availability": propertyStatus === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                                    "url": typeof window !== 'undefined' ? window.location.href : ""
                                },
                                "author": {
                                    "@type": "RealEstateAgent",
                                    "name": agentName || "HouseHunt Agent",
                                    "image": agentImage || "https://househuntkenya.co.ke/default-agent.png",
                                    "telephone": agentContact || ""
                                }
                            })}
                        </script>

                        {/* 2. FAQ Schema: AI Key Insights (Rich Snippet Boost) */}
                        {analysis.faqs && analysis.faqs.length > 0 && (
                            <script type="application/ld+json">
                                {JSON.stringify({
                                    "@context": "https://schema.org",
                                    "@type": "FAQPage",
                                    "mainEntity": analysis.faqs.map(faq => ({
                                        "@type": "Question",
                                        "name": faq.question,
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": faq.answer
                                        }
                                    }))
                                })}
                            </script>
                        )}
                    </Helmet>
                )}

                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg text-white">
                        <Sparkles size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Househunt Kenya Market Research analysis</h2>
                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${style.bg} ${style.text}`}>
                        {style.icon} {analysis.verdict}
                    </span>
                </div>

                <div className="space-y-6">
                    {/* 📊 Visual Price Meter */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                        <div className="flex justify-between items-end mb-2">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Market Position</h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
                                {analysis.verdict}
                            </span>
                        </div>
                        <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                            <div className="w-1/3 h-full bg-green-400/30 border-r border-white/20"></div>
                            <div className="w-1/3 h-full bg-blue-400/30 border-r border-white/20"></div>
                            <div className="w-1/3 h-full bg-purple-400/30"></div>
                            <motion.div
                                initial={{ left: '50%' }}
                                animate={{ left: analysis.verdict === 'Good Deal' ? '16%' : analysis.verdict === 'Fair Price' ? '50%' : '84%' }}
                                transition={{ type: 'spring', stiffness: 100 }}
                                className="absolute top-0 bottom-0 w-1 bg-gray-900 dark:bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
                            <span>Value</span>
                            <span>Fair Market</span>
                            <span>Premium</span>
                        </div>
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed prose dark:prose-invert max-w-none">
                            <ReactMarkdown
                                components={{
                                    a: ({ node, ...props }) => (
                                        <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold" />
                                    )
                                }}
                            >
                                {analysis.comparisonText}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* ✅ NEW: MTAA REALITY (Contextual Data) */}
                    {contextStats && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                            <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FaMapMarkedAlt /> Mtaa Reality (Resident Verified)
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {contextStats.vibe && (
                                    <div className="col-span-2 space-y-1">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Vibe</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{contextStats.vibe}</p>
                                    </div>
                                )}
                                {contextStats.internet && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Internet</p>
                                        <div className="flex flex-wrap gap-1">
                                            {contextStats.internet.map((p, i) => (
                                                <span key={i} className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded text-xs border border-gray-200 dark:border-gray-700">
                                                    {p.provider}: {p.price}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {contextStats.commuterRoutes && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Commute</p>
                                        <ul className="list-disc list-inside text-xs text-gray-800 dark:text-gray-200">
                                            {contextStats.commuterRoutes.slice(0, 2).map((r, i) => <li key={i}>{r}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 🏙️ Living Insights (Standard) */}
                    {(analysis.livingInsights || analysis.neighborhoodVibe) && !contextStats && (
                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <FaMapMarkedAlt size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Living Experience</h3>
                                <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed prose dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            a: ({ node, ...props }) => (
                                                <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold" />
                                            )
                                        }}
                                    >
                                        {analysis.livingInsights || analysis.neighborhoodVibe}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 💡 Tech FAQs Grid */}
                    {analysis.faqs && analysis.faqs.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <FaQuestionCircle className="text-orange-500" />
                                Key Insights
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {analysis.faqs.map((faq, idx) => (
                                    <div key={idx} className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-1 line-clamp-2">{faq.question}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default PropertyAIInsights;
