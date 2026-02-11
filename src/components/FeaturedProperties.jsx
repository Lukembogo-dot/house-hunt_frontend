// src/components/FeaturedProperties.jsx
import React from 'react';
import { FaGem } from 'react-icons/fa';
import PropertyList from './PropertyList';

const FeaturedProperties = () => {
  return (
    <section className="py-4 px-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">

        {/* Unified Header Layout (Matches TopAgents) */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <FaGem className="text-sm" /> Editor's Choice
              </span>
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800 max-w-[100px]"></span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
              Hand-Picked Homes <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">We Love</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl text-lg leading-relaxed">
              Verified listings that stand out for value, location, and style. Find your gem before it's gone.
            </p>
          </div>
        </div>

        {/* Property List */}
        <PropertyList
          filterOverrides={null}
          showSearchBar={false}
          showTitle={false}
          limit={8} // Adjusted to 8 for a cleaner grid (4x2)
        />
      </div>
    </section>
  );
};

export default FeaturedProperties;