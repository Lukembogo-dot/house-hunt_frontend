import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaHome, FaTruck, FaComments, FaBuilding } from 'react-icons/fa';

const GlobalSearchBar = ({ initialValues = {} }) => {
  const navigate = useNavigate();
  
  // Search Scope (Default to Rent)
  const [category, setCategory] = useState(initialValues.category || 'rent');
  const [location, setLocation] = useState(initialValues.location || '');
  const [keyword, setKeyword] = useState(''); // For generic searches if needed

  const handleSearch = (e) => {
    e.preventDefault();
    const loc = location.trim();
    const key = keyword.trim();

    // 🚀 ROUTING LOGIC: Directs user to the correct page based on Category
    switch (category) {
      case 'rent':
        navigate(`/search/rent/${loc || 'kenya'}`);
        break;
      case 'sale':
        navigate(`/search/sale/${loc || 'kenya'}`);
        break;
      case 'services':
        navigate(`/services?location=${loc}&keyword=${key}`);
        break;
      case 'community':
        navigate(`/living-feed?neighborhood=${loc}`);
        break;
      default:
        navigate(`/search/rent/${loc || 'kenya'}`);
    }
  };

  // Dynamic Placeholder based on category
  const getPlaceholder = () => {
    switch (category) {
      case 'services': return 'e.g. Movers in Westlands';
      case 'community': return 'e.g. Water situation in Kilimani';
      default: return 'e.g. 2 Bedroom in Kileleshwa';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* 1. Category Tabs (The "Scope") */}
      <div className="flex justify-center mb-2 space-x-1 md:space-x-2">
        <button 
          onClick={() => setCategory('rent')}
          className={`px-4 py-2 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-all ${category === 'rent' ? 'bg-white text-blue-600 shadow-sm' : 'bg-black/20 text-white hover:bg-black/30'}`}
        >
          <FaHome /> Rent
        </button>
        <button 
          onClick={() => setCategory('sale')}
          className={`px-4 py-2 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-all ${category === 'sale' ? 'bg-white text-blue-600 shadow-sm' : 'bg-black/20 text-white hover:bg-black/30'}`}
        >
          <FaBuilding /> Buy
        </button>
        <button 
          onClick={() => setCategory('services')}
          className={`px-4 py-2 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-all ${category === 'services' ? 'bg-white text-orange-600 shadow-sm' : 'bg-black/20 text-white hover:bg-black/30'}`}
        >
          <FaTruck /> Services
        </button>
        <button 
          onClick={() => setCategory('community')}
          className={`px-4 py-2 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-all ${category === 'community' ? 'bg-white text-purple-600 shadow-sm' : 'bg-black/20 text-white hover:bg-black/30'}`}
        >
          <FaComments /> Intel
        </button>
      </div>

      {/* 2. The Search Input Box */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 p-2 rounded-b-xl rounded-tr-xl shadow-2xl flex flex-col md:flex-row gap-2 items-center border border-gray-100 dark:border-gray-700">
        
        <div className="relative flex-grow w-full">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder={getPlaceholder()}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Optional: Price Range or Keyword (Only for Property Modes) */}
        {(category === 'rent' || category === 'sale') && (
           <div className="hidden md:block w-1/3 border-l border-gray-200 dark:border-gray-600 pl-2">
              <select className="w-full bg-transparent font-medium text-gray-600 dark:text-gray-300 outline-none cursor-pointer">
                 <option>Any Price</option>
                 <option>Budget Friendly</option>
                 <option>Mid-Range</option>
                 <option>Luxury</option>
              </select>
           </div>
        )}

        <button 
          type="submit"
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform active:scale-95 shadow-md"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default GlobalSearchBar;