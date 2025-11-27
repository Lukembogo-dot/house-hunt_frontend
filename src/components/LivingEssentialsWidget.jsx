// src/components/LivingEssentialsWidget.jsx

import React from 'react';
import { FaBus, FaShoppingBasket, FaWifi, FaCheckCircle, FaWalking } from 'react-icons/fa';

const LivingEssentialsWidget = ({ property }) => {
  // 1. Safety Check: If no data exists, don't render the widget at all.
  const hasMatatu = property.matatuRoute || property.matatuFare;
  const hasMarket = property.mamaMbogaDistance;
  const hasInternet = property.internetReady;

  if (!hasMatatu && !hasMarket && !hasInternet) return null;

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
           🇰🇪 Nairobi Living Essentials
        </h3>
        <p className="text-blue-100 text-sm opacity-90">
          Real-world connectivity & convenience data.
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
        
        {/* 1. TRANSPORT SECTION */}
        <div className="flex flex-col items-start space-y-3 pt-2 md:pt-0">
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
               <FaBus size={20} />
             </div>
             <span className="font-semibold text-gray-900 dark:text-gray-100">Commute</span>
          </div>
          
          {property.matatuRoute ? (
             <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nearest Stage</p>
                <p className="font-medium text-gray-800 dark:text-gray-200 text-lg">
                  {property.matatuRoute}
                </p>
             </div>
          ) : (
            <span className="text-gray-400 text-sm italic">Route info not added</span>
          )}

          {property.matatuFare && (
             <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-green-700 dark:text-green-300 text-sm font-semibold">
                ~ Ksh {property.matatuFare} to CBD
             </div>
          )}
        </div>

        {/* 2. MARKET SECTION */}
        <div className="flex flex-col items-start space-y-3 pt-6 md:pt-0 md:pl-6">
           <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
               <FaShoppingBasket size={20} />
             </div>
             <span className="font-semibold text-gray-900 dark:text-gray-100">Shopping</span>
          </div>

          {property.mamaMbogaDistance ? (
            <div>
               <p className="text-sm text-gray-500 dark:text-gray-400">Fresh Market (Mama Mboga)</p>
               <div className="flex items-center gap-2 mt-1">
                  <FaWalking className="text-gray-400" />
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-lg">
                    {property.mamaMbogaDistance}
                  </p>
               </div>
            </div>
          ) : (
             <span className="text-gray-400 text-sm italic">Distance info not added</span>
          )}
        </div>

        {/* 3. INTERNET SECTION */}
        <div className="flex flex-col items-start space-y-3 pt-6 md:pt-0 md:pl-6">
           <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
               <FaWifi size={20} />
             </div>
             <span className="font-semibold text-gray-900 dark:text-gray-100">Connectivity</span>
          </div>

          {property.internetReady ? (
             <div className="w-full">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                   <FaCheckCircle size={14} />
                   <span className="text-sm font-bold">Internet Ready</span>
                </div>
                
                {property.internetProviders && property.internetProviders.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                      {property.internetProviders.map((isp, index) => (
                        <span key={index} className="text-xs border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md">
                           {isp}
                        </span>
                      ))}
                   </div>
                ) : (
                   <span className="text-xs text-gray-500">ISP details confirming...</span>
                )}
             </div>
          ) : (
             <span className="text-gray-400 text-sm italic">Connectivity info not added</span>
          )}
        </div>

      </div>
    </div>
  );
};

export default LivingEssentialsWidget;
