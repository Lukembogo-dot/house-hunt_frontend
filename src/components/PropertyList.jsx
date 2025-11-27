// src/components/PropertyList.jsx
import { useEffect, useState, useCallback, useMemo } from "react"; 
import { Link } from "react-router-dom"; 
import apiClient from "../api/axios"; 
import PropertyCard from "./PropertyCard";
import { useFeatureFlag } from "../context/FeatureFlagContext.jsx";
import PropertyAlertForm from "./PropertyAlertForm";
import { FaPlusCircle, FaComments, FaQuestionCircle, FaTruck } from "react-icons/fa";
import ServiceCard from "./services/ServiceCard";

const EMPTY_OBJECT = {};

export default function PropertyList({ 
  defaultFilter = EMPTY_OBJECT, 
  filterOverrides = null, 
  showTitle = true,
  limit = 10,
  onDataLoaded = null,
  excludedIds = [] 
}) {
  
  const isAlertFormEnabled = useFeatureFlag('property-alert-magnet');

  const [properties, setProperties] = useState([]);
  const [relatedServices, setRelatedServices] = useState([]);
  
  // 1. STABILIZE FILTERS (Stops Infinite Loop)
  const stableDefaultFilter = useMemo(() => defaultFilter, [JSON.stringify(defaultFilter)]);
  const stableFilterOverrides = useMemo(() => filterOverrides, [JSON.stringify(filterOverrides)]);

  const activeFilters = useMemo(() => {
    return {
      location: "",
      type: "",
      minPrice: "",
      maxPrice: "",
      ...stableDefaultFilter,
      ...(stableFilterOverrides || {}), 
    };
  }, [stableDefaultFilter, stableFilterOverrides]); 

  const [filters, setFilters] = useState(activeFilters);

  useEffect(() => {
    setFilters(activeFilters);
  }, [activeFilters]);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // ✅ 2. FETCH WITH ABORT SIGNAL (Stops "In-Flight" Requests)
  const fetchProperties = useCallback(async (currentFilters, pageNumber, signal) => {
    try {
      if (pageNumber !== page) setLoading(true); 
      
      const params = new URLSearchParams({
        ...currentFilters, 
        page: pageNumber,
        limit: limit
      });
      
      const keys = Array.from(params.keys());
      keys.forEach(key => {
        if (!params.get(key) || params.get(key) === 'null') {
          params.delete(key);
        }
      });
      
      const locationQuery = params.get('location') || '';
      
      const [propertyRes, serviceRes] = await Promise.all([
        apiClient.get(`/properties?${params.toString()}`, { signal }), // Pass signal
        apiClient.get(`/service-providers?location=${locationQuery}&limit=4`, { signal }) // Pass signal
      ]);

      let fetchedProps = propertyRes.data.properties || [];
      if (excludedIds.length > 0) {
        fetchedProps = fetchedProps.filter(p => !excludedIds.includes(p._id));
      }

      setProperties(fetchedProps);
      setPage(propertyRes.data.page || 1);
      setTotalPages(propertyRes.data.pages || 1);
      setRelatedServices(serviceRes.data.providers || serviceRes.data || []);

      if (onDataLoaded) {
        onDataLoaded(propertyRes.data.total || fetchedProps.length);
      }

    } catch (err) {
      // ✅ Check if error was because we cancelled it
      if (err.code === "ERR_CANCELED") {
        console.log("🚫 Request cancelled (New filter applied)");
        return; // Do nothing, don't update state
      }
      console.error("❌ Error fetching data:", err);
    } finally {
      // Only turn off loading if we weren't cancelled
      // (If cancelled, the next request will handle loading state)
    }
    setLoading(false);
  }, [limit, JSON.stringify(excludedIds)]); 

  // ✅ 3. USE EFFECT WITH CLEANUP
  useEffect(() => {
    // Create a controller for this specific run
    const controller = new AbortController();
    
    fetchProperties(filters, page, controller.signal);

    // CLEANUP: If 'filters' or 'page' changes before this request finishes,
    // this function runs and KILLS the previous request.
    return () => {
      controller.abort();
    };
  }, [fetchProperties, filters, page]); 
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
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

      {loading && properties.length === 0 ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : properties.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
            {properties.map((property, index) => {
              
              if (index === 1) {
                return (
                  <div key={`community-promo-${index}`} style={{ display: 'contents' }}>
                    <div className="bg-purple-700 dark:bg-purple-900 rounded-xl shadow-lg overflow-hidden flex flex-col justify-center items-center text-center p-6 text-white transform hover:scale-105 transition duration-300 border-2 border-purple-500">
                      <div className="bg-white/20 p-4 rounded-full mb-4">
                        <FaComments className="text-4xl text-purple-200" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Living in <span className="capitalize">{locationName}</span>?</h3>
                      <p className="text-purple-100 text-sm mb-6">
                        Don't guess. Ask residents about security, water, and internet.
                      </p>
                      <div className="flex flex-col gap-2 w-full px-4">
                        <Link 
                          to="/share-insight" 
                          state={{ location: filters.location, type: 'question' }}
                          className="bg-white text-purple-800 font-bold py-2 px-4 rounded-full shadow-md hover:bg-purple-50 transition text-sm flex items-center justify-center gap-2"
                        >
                          <FaQuestionCircle /> Ask a Local
                        </Link>
                      </div>
                    </div>
                    <PropertyCard key={property._id} property={property} />
                  </div>
                );
              }

              if (index === 3) {
                return (
                  <div key={`agent-promo-${index}`} style={{ display: 'contents' }}>
                    <div className="bg-blue-600 dark:bg-blue-700 rounded-xl shadow-lg overflow-hidden flex flex-col justify-center items-center text-center p-6 text-white transform hover:scale-105 transition duration-300 border-2 border-blue-400">
                      <div className="bg-white/20 p-4 rounded-full mb-4">
                        <FaPlusCircle className="text-4xl text-yellow-300" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Are you an Agent?</h3>
                      <p className="text-blue-100 text-sm mb-6">
                        Get your listings in front of thousands of verified tenants.
                      </p>
                      <Link 
                        to="/for-agents" 
                        className="bg-yellow-400 text-blue-900 font-bold py-2 px-6 rounded-full shadow-md hover:bg-yellow-300 transition whitespace-nowrap"
                      >
                        List Here for Free
                      </Link>
                    </div>
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
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
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
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next →
            </button>
          </div>

          {relatedServices.length > 0 && (
            <div className="mt-16 mb-8 pt-10 border-t dark:border-gray-700">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                 <FaTruck className="text-orange-500" /> 
                 Trusted Services in <span className="capitalize">{locationName}</span>
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedServices.map((service) => (
                     <div key={service._id} className="w-full h-96"> 
                       <ServiceCard service={service} />
                     </div>
                  ))}
               </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center mt-10">
          {isAlertFormEnabled && <PropertyAlertForm currentFilters={filters} />}
          
          <div className="mt-12 max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
             <div className="p-8 bg-purple-50 dark:bg-gray-800 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center">
                <FaComments className="text-4xl text-purple-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No listings in {locationName}?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Start a thread. Ask locals if there are vacancies.</p>
                <Link to="/share-insight" state={{ location: filters.location, type: 'question' }} className="inline-block bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition shadow-lg">
                  Start a Discussion
                </Link>
             </div>
             <div className="p-8 bg-blue-50 dark:bg-gray-800 rounded-xl border-2 border-blue-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center">
                <FaPlusCircle className="text-4xl text-blue-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Do you own property here?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">List for free to capture this demand.</p>
                <Link to="/for-agents" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition shadow-lg">
                  List Your Property
                </Link>
              </div>
          </div>
        </div>
      )}
    </>
  );
}