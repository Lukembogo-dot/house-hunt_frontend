import { useEffect, useState, useCallback, useMemo } from "react"; 
import { Link } from "react-router-dom"; 
import apiClient from "../api/axios"; 
import PropertyCard from "./PropertyCard";
import { FaComments, FaTruck, FaIdCard, FaStar } from "react-icons/fa";
import ServiceCard from "./services/ServiceCard";

const EMPTY_OBJECT = {};

export default function PropertyList({ 
  defaultFilter = EMPTY_OBJECT, 
  filterOverrides = null, 
  showTitle = true,
  limit = 10,
  excludedIds = [] 
}) {
  const [properties, setProperties] = useState([]);
  const [relatedServices, setRelatedServices] = useState([]);
  
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

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchProperties = useCallback(async (currentFilters, pageNumber, signal) => {
    try {
      if (pageNumber !== page) setLoading(true); 
      
      const params = new URLSearchParams({ ...currentFilters, page: pageNumber, limit: limit });
      const keys = Array.from(params.keys());
      keys.forEach(key => {
        if (!params.get(key) || params.get(key) === 'null') params.delete(key);
      });
      
      const locationQuery = params.get('location') || '';
      
      const [propertyRes, serviceRes] = await Promise.all([
        apiClient.get(`/properties?${params.toString()}`, { signal }),
        apiClient.get(`/service-providers?location=${locationQuery}&limit=4`, { signal })
      ]);

      let fetchedProps = propertyRes.data.properties || [];
      if (excludedIds.length > 0) {
        fetchedProps = fetchedProps.filter(p => !excludedIds.includes(p._id));
      }

      setProperties(fetchedProps);
      setPage(propertyRes.data.page || 1);
      setTotalPages(propertyRes.data.pages || 1);
      setRelatedServices(serviceRes.data.providers || serviceRes.data || []);

    } catch (err) {
      if (err.code !== "ERR_CANCELED") console.error("Error fetching data:", err);
    } 
    setLoading(false);
  }, [limit, JSON.stringify(excludedIds)]); 

  useEffect(() => {
    const controller = new AbortController();
    fetchProperties(activeFilters, page, controller.signal);
    return () => controller.abort();
  }, [fetchProperties, activeFilters, page]); 
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const locationName = activeFilters.location || 'this area';

  if (loading && properties.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[20vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ KEY CHANGE: Return null if empty so DynamicSearchPage shows NoResultsDashboard
  if (properties.length === 0) return null;

  return (
    <>
      {showTitle && (
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100">
            Find Your Perfect Home
          </h1>
        </div>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {properties.map((property, index) => {
          
          // 1. COMMUNITY PROMO (Index 1)
          if (index === 1) {
            return (
              <div key={`promo-community-${index}`} style={{ display: 'contents' }}>
                <div className="bg-purple-700 dark:bg-purple-900 rounded-xl shadow-lg overflow-hidden flex flex-col justify-center items-center text-center p-6 text-white transform hover:scale-105 transition duration-300">
                  <FaComments className="text-4xl text-purple-200 mb-2" />
                  <h3 className="text-lg font-bold mb-2">Living in {locationName}?</h3>
                  <p className="text-xs mb-4">Get intel on water & security.</p>
                  <Link to="/share-insight" state={{ location: activeFilters.location, type: 'question' }} className="bg-white text-purple-800 font-bold py-2 px-4 rounded-full text-xs shadow-md hover:bg-purple-50">
                    Ask a Local
                  </Link>
                </div>
                <PropertyCard key={property._id} property={property} />
              </div>
            );
          }

          // 2. ✅ NEW: HOUSING PASSPORT PROMO (Index 3)
          if (index === 3) {
            return (
              <div key={`promo-passport-${index}`} style={{ display: 'contents' }}>
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-lg overflow-hidden flex flex-col justify-center items-center text-center p-6 text-white transform hover:scale-105 transition duration-300 border border-gray-700">
                  <FaIdCard className="text-4xl text-yellow-400 mb-2" />
                  <h3 className="text-lg font-bold mb-1">Housing Passport</h3>
                  <p className="text-xs text-gray-300 mb-4 px-2">
                    Review your current building anonymously. Earn points & unlock price trends.
                  </p>
                  <Link to="/profile" className="bg-yellow-500 text-black font-bold py-2 px-4 rounded-full text-xs shadow-md hover:bg-yellow-400 flex items-center gap-2">
                    <FaStar /> Rate & Earn
                  </Link>
                </div>
                <PropertyCard key={property._id} property={property} />
              </div>
            );
          }

          return <PropertyCard key={property._id} property={property} />;
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">Prev</button>
          <span className="dark:text-white">{page} / {totalPages}</span>
          <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Next</button>
        </div>
      )}

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <div className="mt-16 pt-10 border-t dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FaTruck className="text-orange-500" /> Trusted Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedServices.map((service) => (
                  <div key={service._id} className="h-96"><ServiceCard service={service} /></div>
              ))}
            </div>
        </div>
      )}
    </>
  );
}