import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaRobot, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaMapMarkedAlt, FaQuestionCircle } from 'react-icons/fa';
import { Sparkles } from 'lucide-react';

const PropertyAIInsights = ({ propertyId, propertyTitle, propertyLocation, propertyDescription, propertyPostedDate, propertyStatus, propertyType, propertyPrice, agentName, agentImage, agentContact }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                setLoading(true);
                // Uses the cached endpoint (Backend handles the 7-day rule)
                const { data } = await apiClient.get(`/ai/analysis/${propertyId}`);
                setAnalysis(data);
            } catch (error) {
                console.error("Failed to load AI analysis:", error);
            } finally {
                setLoading(false);
            }
        };

        if (propertyId) fetchAnalysis();
    }, [propertyId]);

    if (loading) return (
        <div className="animate-pulse flex flex-col space-y-3 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
    );

    if (!analysis) return null;

    // Decide Badge Color based on Verdict (Handle Unknown default)
    const getVerdictStyle = (verdict) => {
        switch (verdict) {
            case 'Good Deal': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: <FaCheckCircle /> };
            case 'Premium': return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: <FaExclamationCircle /> };
            case 'Fair Price': return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: <FaInfoCircle /> };
            default: return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: <FaRobot /> }; // Fallback for Unknown
        }
    };

    // Helper to render Markdown links safely
    const renderTextWithLinks = (text) => {
        if (!text) return "";
        // Regex to find [Link Text](URL)
        const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);

        return parts.map((part, index) => {
            const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (match) {
                return (
                    <a
                        key={index}
                        href={match[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                        {match[1]}
                    </a>
                );
            }
            return part; // Return normal text
        });
    };

    const style = getVerdictStyle(analysis.verdict);

    return (
        <motion.div
        // ... (Framer motion props)
        >
            <div className="p-6">
                {/* 🔍 SEO Injection: Serve Data to Google */}
                {analysis && (
                    <Helmet>
                        <script type="application/ld+json">
                            {JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "FAQPage",
                                "mainEntity": analysis.faqs?.map(faq => ({
                                    "@type": "Question",
                                    "name": faq.question,
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": faq.answer
                                    }
                                })) || []
                            })}
                        </script>
                        {/* ✅ NEW: Full RealEstateListing Schema with Agent & Original Desc */}
                        <script type="application/ld+json">
                            {JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "RealEstateListing",
                                "name": propertyTitle || "Property Analysis",

                                // GOOGLE PREFERS: Using accurate description. 
                                "description": `${analysis.livingInsights || "AI Market Analysis provided."} \n\nOriginal Listing: ${propertyDescription ? propertyDescription.substring(0, 150) + "..." : ""}`,

                                "datePosted": propertyPostedDate,

                                "category": propertyType === 'land' ? 'Land' : 'Residential',

                                "offers": {
                                    "@type": "Offer",
                                    "price": propertyPrice,
                                    "priceCurrency": "KES",
                                    "availability": propertyStatus === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                                    "url": typeof window !== 'undefined' ? window.location.href : ""
                                },

                                "location": {
                                    "@type": "Place",
                                    "name": propertyLocation,
                                    "address": {
                                        "@type": "PostalAddress",
                                        "addressLocality": propertyLocation,
                                        "addressCountry": "KE"
                                    }
                                },
                                "about": {
                                    "@type": "Thing",
                                    "name": "Market Analysis",
                                    "description": analysis.comparisonText
                                },
                                // ✅ Inject Detailed Agent Data
                                "author": {
                                    "@type": "RealEstateAgent",
                                    "name": agentName || "HouseHunt Agent",
                                    "image": agentImage || "https://househuntkenya.co.ke/default-agent.png",
                                    "telephone": agentContact || ""
                                }
                            })}
                        </script>
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

                        {/* The Meter Bar */}
                        <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                            <div className="w-1/3 h-full bg-green-400/30 border-r border-white/20"></div>
                            <div className="w-1/3 h-full bg-blue-400/30 border-r border-white/20"></div>
                            <div className="w-1/3 h-full bg-purple-400/30"></div>

                            {/* Marker Indicator */}
                            <motion.div
                                initial={{ left: '50%' }}
                                animate={{
                                    left: analysis.verdict === 'Good Deal' ? '16%' :
                                        analysis.verdict === 'Fair Price' ? '50%' :
                                            '84%'
                                }}
                                transition={{ type: 'spring', stiffness: 100 }}
                                className="absolute top-0 bottom-0 w-1 bg-gray-900 dark:bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
                            <span>Value</span>
                            <span>Fair Market</span>
                            <span>Premium</span>
                        </div>

                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {renderTextWithLinks(analysis.comparisonText)}
                        </p>
                    </div>

                    {/* 🏙️ Living Insights */}
                    {(analysis.livingInsights || analysis.neighborhoodVibe) && (
                        <div className="flex gap-4 items-start">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <FaMapMarkedAlt size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Living Experience</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {renderTextWithLinks(analysis.livingInsights || analysis.neighborhoodVibe)}
                                </p>
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

                {/* Footer Removed */}

            </div>
        </motion.div>
    );
};

export default PropertyAIInsights;
