// src/components/PropertyList.jsx
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom"; 
import apiClient from "../api/axios"; 
import PropertyCard from "./PropertyCard";
import SearchBar from "./SearchBar";
import { useFeatureFlag } from "../context/FeatureFlagContext.jsx";
import PropertyAlertForm from "./PropertyAlertForm";
// ✅ 1. IMPORT NEW ICONS
import { FaPlusCircle, FaComments, FaQuestionCircle } from "react-icons/fa";

// This object is created only once, so its reference never changes.
const STABLE_DEFAULT_FILTER = {};

export default function PropertyList({ 
  defaultFilter = STABLE_DEFAULT_FILTER, 
  filterOverrides = null, 
  showSearchBar = true, 
  showTitle = true,
  limit = 10,
  // Callback to pass total count back to parent
  onDataLoaded = null 
}) {
  
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
  
  const fetchProperties = useCallback(async (currentFilters = {}, pageNumber = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...currentFilters, 
        page: pageNumber,
        limit: limit
      });
      Object.keys(params).forEach(key => {
        if (!params.get(key) || params.get(key) === 'null') {
          params.delete(key);
        }
      });
      
      const response = await apiClient.get(`/properties?${params.toString()}`);
      setProperties(response.data.properties || []);
      setPage(response.data.page || 1);
      setTotalPages(response.data.pages || 1);

      if (onDataLoaded) {
        onDataLoaded(response.data.total || (response.data.properties ? response.data.properties.length : 0));
      }

    } catch (err) {
      console.error("❌ Error fetching properties:", err);
      setProperties([]); 
      
      if (onDataLoaded) {
        onDataLoaded(0);
      }
    } finally {
      setLoading(false);
    }
  }, [limit, onDataLoaded]);

  useEffect(() => {
    if (!filterOverrides) {
      fetchProperties(filters, 1); 
    }
  }, [fetchProperties, filters, filterOverrides]);

  useEffect(() => {
    if (filterOverrides) {
      const newFilters = { ...defaultFilter, ...filterOverrides };
      
      setFilters(newFilters); 
      setPage(1); 
      fetchProperties(newFilters, 1);
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

  const locationName = filters.location ? filters.location : 'this area';

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
            
            {properties.map((property, index) => {
              
              // ✅ INJECTION 1: "Ask a Local" Card at Index 1 (2nd Position)
              if (index === 1) {
                return (
                  <div key={`community-promo-${index}`} style={{ display: 'contents' }}>
                    {/* The Community Card */}
                    <div className="bg-purple-700 dark:bg-purple-900 rounded-xl shadow-lg overflow-hidden flex flex-col justify-center items-center text-center p-6 text-white transform hover:scale-105 transition duration-300 border-2 border-purple-500">
                      <div className="bg-white/20 p-4 rounded-full mb-4">
                        <FaComments className="text-4xl text-purple-200" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Living in <span className="capitalize">{locationName}</span>?</h3>
                      <p className="text-purple-100 text-sm mb-6">
                        Don't guess. Ask residents about security, water, and internet reliability.
                      </p>
                      <div className="flex flex-col gap-2 w-full px-4">
                        <Link 
                          to="/share-insight" 
                          state={{ location: filters.location, type: 'question' }}
                          className="bg-white text-purple-800 font-bold py-2 px-4 rounded-full shadow-md hover:bg-purple-50 transition text-sm flex items-center justify-center gap-2"
                        >
                          <FaQuestionCircle /> Ask a Local
                        </Link>
                         <Link 
                          to={`/search/rent/${filters.location}`} // Links to dynamic page where insights are shown
                          className="text-purple-200 hover:text-white text-xs underline mt-1"
                        >
                          Read existing reviews
                        </Link>
                      </div>
                    </div>

                    {/* The Actual Property Card */}
                    <PropertyCard key={property._id} property={property} />
                  </div>
                );
              }

              // ✅ INJECTION 2: Agent Promo Card at Index 3 (4th Position)
              if (index === 3) {
                return (
                  <div key={`agent-promo-${index}`} style={{ display: 'contents' }}>
                    {/* The Agent Promo Card */}
                    <div className="bg-blue-600 dark:bg-blue-700 rounded-xl shadow-lg overflow-hidden flex flex-col justify-center items-center text-center p-6 text-white transform hover:scale-105 transition duration-300 border-2 border-blue-400">
                      <div className="bg-white/20 p-4 rounded-full mb-4 animate-pulse">
                        <FaPlusCircle className="text-4xl text-yellow-300" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Are you an Agent?</h3>
                      <p className="text-blue-100 text-sm mb-6">
                        Get your listings in front of thousands of verified tenants today.
                      </p>
                      <Link 
                        to="/for-agents" 
                        className="bg-yellow-400 text-blue-900 font-bold py-2 px-6 rounded-full shadow-md hover:bg-yellow-300 transition whitespace-nowrap"
                      >
                        List Here for Free
                      </Link>
                    </div>

                    {/* The Actual Property Card */}
                    <PropertyCard key={property._id} property={property} />
                  </div>
                );
              }
              return <PropertyCard key={property._id} property={property} />;
            })}
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
        // --- ZERO RESULTS STATE ---
        <div className="text-center mt-10">
          
          {/* 1. User Alert Form */}
          {isAlertFormEnabled && (
            <PropertyAlertForm currentFilters={filters} />
          )}

          <div className="mt-12 max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
             
             {/* 2. ASK A LOCAL (When no results found) */}
             <div className="p-8 bg-purple-50 dark:bg-gray-800 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center">
                <FaComments className="text-4xl text-purple-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  No listings in <span className="capitalize">{locationName}</span>?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Start a thread. Ask locals if there are vacancies offline or what the neighborhood is like.
                </p>
                <Link 
                  to="/share-insight"
                  state={{ location: filters.location, type: 'question' }}
                  className="inline-block bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition shadow-lg"
                >
                  Start a Discussion
                </Link>
             </div>

             {/* 3. AGENT OPPORTUNITY */}
             <div className="p-8 bg-blue-50 dark:bg-gray-800 rounded-xl border-2 border-blue-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center">
                <FaPlusCircle className="text-4xl text-blue-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Do you own property here?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Tenants are searching for <span className="capitalize font-semibold">{locationName}</span> right now. List for free to capture this demand.
                </p>
                <Link 
                  to="/for-agents"
                  className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition shadow-lg"
                >
                  List Your Property
                </Link>
              </div>

          </div>
        </div>
      )}
    </>
  );
}