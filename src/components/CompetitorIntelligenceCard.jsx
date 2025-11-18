import React from 'react';
// ✅ FIX: Changed Faminus to FaMinus
import { FaArrowUp, FaArrowDown, FaMinus, FaLightbulb } from 'react-icons/fa';

const CompetitorIntelligenceCard = ({ data }) => {
  if (!data) return null;

  const { myPerformance, marketAverage, priceDiffPercentage } = data;
  
  // Helper to format currency
  const formatPrice = (price) => 
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(price);

  // Determine status color and icon
  const isHigher = priceDiffPercentage > 0;
  const isLower = priceDiffPercentage < 0;
  // eslint-disable-next-line no-unused-vars
  const isEqual = priceDiffPercentage === 0;

  let colorClass = "text-gray-500";
  let Icon = FaMinus; // ✅ FIX: Use correct icon variable
  let message = "Your pricing is perfectly aligned with the market average.";

  if (isHigher) {
    colorClass = "text-red-500";
    Icon = FaArrowUp;
    message = `You are pricing ${priceDiffPercentage.toFixed(1)}% HIGHER than the competition. Consider lowering prices to attract more leads.`;
  } else if (isLower) {
    colorClass = "text-green-500";
    Icon = FaArrowDown;
    message = `You are pricing ${Math.abs(priceDiffPercentage).toFixed(1)}% LOWER than the competition. You might be leaving money on the table!`;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FaLightbulb className="text-yellow-500" /> 
          Market Intelligence
        </h3>
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          Beta
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Stats */}
        <div className="text-center p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-300">My Avg. Price</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(myPerformance.avgPrice)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{myPerformance.totalListings} Active Listings</p>
        </div>

        {/* Comparison Visual */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`text-4xl mb-2 ${colorClass}`}>
            <Icon />
          </div>
          <p className={`text-lg font-bold ${colorClass}`}>
            {Math.abs(priceDiffPercentage).toFixed(1)}% {isHigher ? 'Higher' : isLower ? 'Lower' : 'Diff'}
          </p>
          <p className="text-xs text-gray-400 uppercase">vs Market Average</p>
        </div>

        {/* Market Stats */}
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-300">Market Avg. Price</p>
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
            {formatPrice(marketAverage.avgPrice)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Based on {marketAverage.totalListings} Competitor Listings</p>
        </div>
      </div>

      {/* AI Insight / Recommendation */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
        <span className="font-bold">Insight:</span> {message}
      </div>
    </div>
  );
};

export default CompetitorIntelligenceCard;