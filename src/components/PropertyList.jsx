// src/components/PropertyList.jsx
import { useEffect, useState } from "react";
// ❌ Remove: import axios from "axios";
import apiClient from "../api/axios"; // ✅ 1. Import our central api client
import PropertyCard from "./PropertyCard";
import SearchBar from "./SearchBar";

export default function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch properties from backend
  const fetchProperties = async (filters = {}, pageNumber = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        ...filters,
        page: pageNumber,
      });

      // ✅ 2. Use apiClient and a relative path
      const response = await apiClient.get(
        `/properties?${params.toString()}`
      );

      // The backend returns { total, page, pages, properties }
      setProperties(response.data.properties || []);
      setPage(response.data.page || 1);
      setTotalPages(response.data.pages || 1);
    } catch (err) {
      console.error("❌ Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties({}, 1);
  }, []);

  const handleFilter = (filters) => {
    setFilters(filters);
    setPage(1);
    fetchProperties(filters, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchProperties(filters, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    // ... rest of your JSX ...
    // (No changes needed to the JSX)
    <section className="bg-gray-100 min-h-screen py-10 px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Find Your Perfect Home
        </h1>
        <p className="text-gray-500 mt-2">
          Browse the latest listings to rent or buy, powered by real-time data.
        </p>
      </div>

      <div className="mb-10 flex justify-center">
        <SearchBar onFilter={handleFilter} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              ← Previous
            </button>

            <span className="text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`px-5 py-2 rounded-lg transition ${
                page === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 mt-20">
          <p className="text-lg">No properties found.</p>
          <p className="text-sm">Try changing filters or search terms.</p>
        </div>
      )}
    </section>
  );
}