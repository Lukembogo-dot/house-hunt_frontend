// src/components/PropertyList.jsx
import { useEffect, useState, useCallback } from "react";
import apiClient from "../api/axios"; 
import PropertyCard from "./PropertyCard";
import SearchBar from "./SearchBar";
import { useFeatureFlag } from "../context/FeatureFlagContext.jsx"; // <-- 1. IMPORT HOOK
import PropertyAlertForm from "./PropertyAlertForm"; // <-- 2. IMPORT COMPONENT

export default function PropertyList({ 
  defaultFilter = {}, 
  filterOverrides = null, 
  showSearchBar = true, 
  showTitle = true,
  limit = 10 
}) {
  
  // 3. CHECK THE FEATURE FLAG
  const isAlertFormEnabled = useFeatureFlag('property-alert-magnet');

  const [properties, setProperties] = useState([]);
  
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    minPrice: "",
    maxPrice: "",
    ...defaultFilter,
    ...(filterOverrides || {}), 
  });

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Use useCallback to prevent unnecessary re-renders (good practice)
  const fetchProperties = useCallback(async (currentFilters = {}, pageNumber = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...currentFilters, 
        page: pageNumber,
        limit: limit
      });
      // Clean up empty params
      Object.keys(params).forEach(key => {
        if (!params.get(key) || params.get(key) === 'null') {
          params.delete(key);
        }
      });
      
      const response = await apiClient.get(`/properties?${params.toString()}`);
      setProperties(response.data.properties || []);
      setPage(response.data.page || 1);
      setTotalPages(response.data.pages || 1);
    } catch (err) {
      console.error("❌ Error fetching properties:", err);
      // Keep properties empty on error so the alert form can still show
      setProperties([]); 
    } finally {
      setLoading(false);
    }
  }, [limit]); // Dependency added for limit

  useEffect(() => {
    if (!filterOverrides) {
      fetchProperties(filters, 1);
    }
  }, [fetchProperties, filters, filterOverrides]); // Added missing dependencies

  useEffect(() => {
    if (filterOverrides) {
      const newFilters = { ...defaultFilter, ...filterOverrides };
      setFilters(newFilters);
      setPage(1); // Reset to page 1 for new search
      fetchProperties(newFilters, 1);
    } else if (filterOverrides === null) {
      // Handle the case where filters are cleared
      setFilters(defaultFilter);
      setPage(1);
      fetchProperties(defaultFilter, 1);
    }
  }, [filterOverrides, fetchProperties, defaultFilter]); 
  
  const handleFilter = () => {
    setPage(1);
    fetchProperties(filters, 1);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchProperties(filters, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {showTitle && (
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">
            Find Your Perfect Home
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Browse the latest listings to rent or buy, powered by real-time data.
          </p>
        </div>
      )}

      {showSearchBar && (
        <div className="mb-10 flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl px-6 py-4 w-full max-w-2xl border border-gray-200 dark:border-gray-700">
            <SearchBar 
              filters={filters}
              onChange={handleFilterChange}
              onFilter={handleFilter} 
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : properties.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>

          {/* ... (Pagination is unchanged) ... */}
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-5 py-2 rounded-lg transition ${
                page === 1
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
              }`}
            >
              ← Previous
            </button>

            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`px-5 py-2 rounded-lg transition ${
                page === totalPages
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
              }`}
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        // --- 4. CONDITIONAL RENDER: SHOW ALERT FORM IF ENABLED ---
        <div className="text-center mt-20">
          {isAlertFormEnabled ? (
            <PropertyAlertForm currentFilters={filters} />
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              <p className="text-lg">No properties found.</p>
              <p className="text-sm">Try changing filters or search terms.</p>
            </div>
          )}
        </div>
        // --------------------------------------------------------
      )}
    </>
  );
}