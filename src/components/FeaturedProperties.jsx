// src/components/FeaturedProperties.jsx
import React from 'react';
import { FaGem } from 'react-icons/fa';
import PropertyList from './PropertyList';

const FeaturedProperties = () => {
  return (
    <section className="py-8 px-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto">

        {/* Conversational Header */}
        <div className="text-center mb-6">
          <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs mb-2 flex items-center justify-center gap-2">
            <FaGem className="text-sm" /> Editor's Choice
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">
            Hand-Picked Homes <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">We Love</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            Verified listings that stand out for value, location, and style. Find your gem before it's gone.
          </p>
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