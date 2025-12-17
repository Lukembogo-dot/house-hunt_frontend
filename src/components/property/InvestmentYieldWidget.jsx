import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaLock, FaSpinner, FaFire, FaMoneyBillWave, FaShieldAlt } from 'react-icons/fa';
import apiClient from '../../api/axios';

const InvestmentYieldWidget = ({ property, user }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 1. Check if user is logged in
    if (!user) {
        return (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-xl border border-gray-700 relative overflow-hidden">
                {/* Blurred Background Content (Teaser) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none blur-sm">
                    <div className="p-4">
                        <div className="h-4 bg-gray-400 w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-400 w-1/2 mb-4"></div>
                        <div className="h-20 bg-gray-500 w-full mb-2"></div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-3">
                        <FaLock className="text-yellow-400 text-xl" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Unlock Investment Insights</h3>
                    <p className="text-gray-400 text-xs mb-4">
                        See expected Rental Yield, Land Appreciation, and ROI Hotspots for this property.
                    </p>
                    <button
                        onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                        className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg text-sm transition shadow-lg shadow-yellow-500/20"
                    >
                        Login to View ROI
                    </button>
                </div>
            </div>
        );
    }

    // 2. Logged In Logic
    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.post('/ai/investment', {
                location: property.location,
                price: property.price,
                type: property.type,
                size: property.landSize, // Pass size if land
                listingType: property.listingType
            });
            setAnalysis(data);
        } catch (err) {
            console.error("Investment Analysis Failed", err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        if (typeof val === 'number') return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(val);
        return val; // If already string like "KES 5M"
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md dark:border dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
                <FaChartLine className="text-green-500" /> Investment Potential
            </h3>

            {!analysis ? (
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        Use our AI to calculate the expected return on investment (ROI) for this property based on {new Date().getFullYear()} market trends.
                    </p>
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaMoneyBillWave />}
                        {loading ? 'Analyzing Market...' : 'Calculate Yield & ROI'}
                    </button>
                </div>
            ) : (
                <div className="animate-fade-in space-y-4">
                    {/* Verdict Badge */}
                    <div className={`p-3 rounded-lg border-l-4 flex justify-between items-center ${analysis.verdictColor === 'green' ? 'bg-green-50 border-green-500 text-green-800' :
                            analysis.verdictColor === 'red' ? 'bg-red-50 border-red-500 text-red-800' :
                                'bg-yellow-50 border-yellow-500 text-yellow-800'
                        }`}>
                        <span className="font-bold flex items-center gap-1">
                            {analysis.verdict === 'Hotspot' && <FaFire />} {analysis.verdict}
                        </span>
                        <span className="text-xs px-2 py-1 bg-white/50 rounded font-semibold">{analysis.riskLevel} Risk</span>
                    </div>

                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {property.type !== 'land' && (
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-gray-700">
                                <span className="block text-xs text-gray-500 dark:text-gray-400">Rental Yield</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">{analysis.rentalYield}</span>
                            </div>
                        )}
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-gray-700">
                            <span className="block text-xs text-gray-500 dark:text-gray-400">Appreciation</span>
                            <span className="text-lg font-bold text-green-600">{analysis.appreciationRate}</span>
                        </div>
                    </div>

                    {/* Projected Value */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center border border-blue-100 dark:border-blue-800">
                        <span className="block text-xs text-blue-500 dark:text-blue-300 uppercase font-bold tracking-wide">Projected Value (5 Years)</span>
                        <span className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-1">
                            {formatCurrency(analysis.projectedValue5Y)}
                        </span>
                    </div>

                    {/* Growth Factors */}
                    <div>
                        <span className="block text-xs font-bold text-gray-900 dark:text-white mb-2">Growth Drivers:</span>
                        <ul className="space-y-1">
                            {analysis.growthFactors.map((factor, idx) => (
                                <li key={idx} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span> {factor}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 italic border-t pt-2 mt-2 dark:border-gray-700">
                        "{analysis.shortAnalysis}"
                    </p>
                </div>
            )}
        </div>
    );
};

export default InvestmentYieldWidget;
