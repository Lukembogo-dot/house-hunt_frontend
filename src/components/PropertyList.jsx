// src/components/PropertyList.jsx
import { useEffect, useState } from "react";
import apiClient from "../api/axios"; // Import our central api client
import PropertyCard from "./PropertyCard";
import SearchBar from "./SearchBar";

// ✅ 1. Accept a 'defaultFilter' prop. Default to an empty object.
export default function PropertyList({ defaultFilter = {} }) {
  const [properties, setProperties] = useState([]);
  // ✅ 2. Initialize filters with the defaultFilter
  const [filters, setFilters] = useState(defaultFilter);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch properties from backend
  const fetchProperties = async (currentFilters = {}, pageNumber = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        ...currentFilters, // Use the filters passed to the function
        page: pageNumber,
      });

      const response = await apiClient.get(
        `/properties?${params.toString()}`
      );

      setProperties(response.data.properties || []);
      setPage(response.data.page || 1);
      setTotalPages(response.data.pages || 1);
    } catch (err) {
      console.error("❌ Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 3. Call fetchProperties on first load with the initial filters
  useEffect(() => {
    fetchProperties(filters, 1);
  }, []); // This now only runs once on mount

  const handleFilter = (newFilters) => {
    // ✅ 4. Combine default filters with new search filters
    const combinedFilters = { ...defaultFilter, ...newFilters };
    setFilters(combinedFilters);
    setPage(1);
    fetchProperties(combinedFilters, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      // Pass the current combined filters when changing pages
      fetchProperties(filters, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">
          Find Your Perfect Home
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Browse the latest listings to rent or buy, powered by real-time data.
        </p>
      </div>

      <div className="mb-10 flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl px-6 py-4 w-full max-w-2xl border border-gray-200 dark:border-gray-700">
          {/* ✅ 5. This SearchBar is now wired up correctly */}
          <SearchBar onFilter={handleFilter} />
        </div>
      </div>

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
        <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
          <p className="text-lg">No properties found.</p>
          <p className="text-sm">Try changing filters or search terms.</p>
        </div>
      )}
    </>
  );
}