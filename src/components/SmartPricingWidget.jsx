import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios';
import { FaRobot, FaCheckCircle, FaInfoCircle, FaSpinner, FaSearch, FaTimes } from 'react-icons/fa';

const SmartPricingWidget = ({ location, type, bedrooms, currentPrice }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ NEW: AI Competitor Check State - MOVED TO TOP (Fixes Hook Error)
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Helper to format currency
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(price);

  useEffect(() => {
    // We need at least location and type to give a suggestion
    if (!location || !type) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const params = { location, type };
        if (bedrooms) params.bedrooms = bedrooms;

        const { data } = await apiClient.get('/properties/market-stats', { params });

        if (data.found) {
          setStats(data);
        } else {
          setStats(null); // No data found for this combo
        }
      } catch (error) {
        console.error("Pricing Intelligence Error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the call (wait 1 second after user stops typing)
    const timer = setTimeout(() => {
      fetchStats();
    }, 1000);

    return () => clearTimeout(timer);
  }, [location, type, bedrooms]);

  const checkCompetitors = async () => {
    if (!currentPrice || currentPrice < 100) return;
    setAnalyzing(true);
    try {
      const { data } = await apiClient.post('/ai/pricing', { location, type, bedrooms, price: currentPrice });
      setAiAnalysis(data);
    } catch (err) {
      console.error("AI Price Check Failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="text-xs text-gray-500 animate-pulse mt-2">Analyzing market data...</div>;
  if (!stats) return null;

  // Logic to check if user's entered price is "Good"
  let priceStatus = "neutral";
  if (currentPrice) {
    if (currentPrice < stats.minPrice) priceStatus = "low";
    else if (currentPrice > stats.maxPrice) priceStatus = "high";
    else priceStatus = "good";
  }

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <FaRobot className="text-blue-600 dark:text-blue-400" />
        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Smart Pricing Suggestion</h4>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-300 mb-3">
        Based on <strong>{stats.count} similar listings</strong> in our database:
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div className="bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
          <span className="block text-[10px] text-gray-400">Lowest</span>
          <span className="font-semibold text-green-600 text-xs">{formatPrice(stats.minPrice)}</span>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded border border-blue-200 dark:border-blue-700">
          <span className="block text-[10px] text-blue-500 font-bold">Average</span>
          <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">{formatPrice(stats.avgPrice)}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
          <span className="block text-[10px] text-gray-400">Highest</span>
          <span className="font-semibold text-red-500 text-xs">{formatPrice(stats.maxPrice)}</span>
        </div>
      </div>

      {/* Internal DB Feedback */}
      {
        currentPrice > 0 && (
          <div className={`text-xs flex items-center gap-2 p-2 rounded mb-3 ${priceStatus === 'good' ? 'bg-green-100 text-green-800' :
            priceStatus === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
            {priceStatus === 'good' && <><FaCheckCircle /> Internal DB: Competitive!</>}
            {priceStatus === 'high' && <><FaInfoCircle /> Internal DB: High.</>}
            {priceStatus === 'low' && <><FaInfoCircle /> Internal DB: Low.</>}
          </div>
        )
      }

      {/* ✅ NEW: AI Competitor Web Search */}
      <div className="border-t pt-3 dark:border-gray-700">
        {!aiAnalysis ? (
          <button
            type="button"
            onClick={checkCompetitors}
            disabled={analyzing || !currentPrice}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {analyzing ? <FaSpinner className="animate-spin" /> : <FaSearch />}
            Search Competitors (Web)
          </button>
        ) : (
          <div className="bg-purple-50 dark:bg-purple-900/40 p-3 rounded text-xs animate-fade-in">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-purple-800 dark:text-purple-200">AI Verdict: {aiAnalysis.verdict}</span>
              <button onClick={() => setAiAnalysis(null)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <p className="mb-2 text-gray-700 dark:text-gray-300">{aiAnalysis.advice}</p>

            {aiAnalysis.listingsFound && aiAnalysis.listingsFound.length > 0 && (
              <div className="mt-2">
                <span className="block font-semibold mb-1 text-purple-700 dark:text-purple-300">Found Online:</span>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  {aiAnalysis.listingsFound.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

    </div >
  );
};

export default SmartPricingWidget;