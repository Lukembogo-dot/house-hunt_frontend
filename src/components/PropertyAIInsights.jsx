import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';
import { motion } from 'framer-motion';
import { FaRobot, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaMapMarkedAlt } from 'react-icons/fa';
import { Sparkles } from 'lucide-react';

const PropertyAIInsights = ({ propertyId }) => {
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

    if (!analysis) return null; // Only return null if NO data at all

    // Decide Badge Color based on Verdict (Handle Unknown default)
    const getVerdictStyle = (verdict) => {
        switch (verdict) {
            case 'Good Deal': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: <FaCheckCircle /> };
            case 'Premium': return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: <FaExclamationCircle /> };
            case 'Fair Price': return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: <FaInfoCircle /> };
            default: return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: <FaRobot /> }; // Fallback for Unknown
        }
    };

    const style = getVerdictStyle(analysis.verdict);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800"
        >
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg text-white">
                        <Sparkles size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Market Analysis</h2>
                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${style.bg} ${style.text}`}>
                        {style.icon} {analysis.verdict}
                    </span>
                </div>

                <div className="space-y-4">
                    {/* Market Comparison */}
                    <div className="flex gap-3 items-start">
                        <div className="mt-1 min-w-[20px] text-gray-400"><FaInfoCircle /></div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Pricing Verdict</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{analysis.comparisonText}</p>
                        </div>
                    </div>

                    {/* Vibe Check */}
                    {analysis.neighborhoodVibe && (
                        <div className="flex gap-3 items-start p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div className="mt-1 min-w-[20px] text-gray-400"><FaMapMarkedAlt /></div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">Neighborhood Vibe</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{analysis.neighborhoodVibe}</p>
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
