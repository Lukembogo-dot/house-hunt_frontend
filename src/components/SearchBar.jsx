// src/components/SearchBar.jsx
import React from 'react';

export default function SearchBar({ filters, onChange, onFilter }) {
  
  const handleChange = (e) => {
    onChange(e.target.name, e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(); 
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-transparent flex flex-wrap gap-4 justify-center items-end"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleChange}
          placeholder="e.g. Nairobi"
          className="border rounded p-2 w-48 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="border rounded p-2 w-40 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">All</option>
          <option value="Apartment">Apartment</option>
          <option value="House">House</option>
          <option value="Land">Land</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Min Price</label>
        <input
          type="number"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleChange}
          placeholder="10000"
          className="border rounded p-2 w-32 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Price</label>
        <input
          type="number"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleChange}
          placeholder="1000000"
          className="border rounded p-2 w-32 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />
      </div>

      <button
        type="submit"
        // ✅ ADDED: Click animation
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-150 active:scale-[0.97]"
      >
        Search
      </button>
    </form>
  );
}