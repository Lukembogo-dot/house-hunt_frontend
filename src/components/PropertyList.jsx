import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
// motion used in PromoFlipCard component below
import { motion } from "framer-motion";
import apiClient from "../api/axios";
import PropertyCard from "./PropertyCard";
import {
  FaComments, FaTruck, FaIdCard, FaStar, FaUserTie,
  FaBullhorn, FaArrowRight, FaQuestionCircle, FaHandHoldingUsd, FaRocket, FaHandshake, FaTimes
} from "react-icons/fa";
import ServiceCard from "./services/ServiceCard";

const EMPTY_OBJECT = {};

// --- REUSABLE MODERN PROMO FLIP CARD ---
const PromoFlipCard = ({ frontContent, backContent, accentColor, backgroundImage }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative w-full h-[400px] cursor-pointer group" // Matched height to PropertyCard (400px)
      style={{ perspective: '1000px' }}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="w-full h-full relative transition-all"
        style={{ transformStyle: 'preserve-3d' }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.8 }}
      >
        {/* FRONT SIDE */}
        <div
          onClick={() => setIsFlipped(true)}
          className="absolute inset-0 backface-hidden w-full h-full rounded-2xl shadow-xl overflow-hidden flex flex-col items-center justify-center p-8 text-center border border-white/20 dark:border-white/10"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Background Image */}
          {backgroundImage && (
            <div className="absolute inset-0">
              <img src={backgroundImage} alt="Promo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
              <div className={`absolute inset-0 bg-${accentColor}-900/40 mix-blend-overlay`}></div>
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center drop-shadow-sm text-white">
            {frontContent}
          </div>

          <div className="absolute bottom-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors z-10">
            <span className={`w-2 h-2 rounded-full bg-${accentColor}-500 animate-pulse`}></span>
            Tap to View Details
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          className={`absolute inset-0 backface-hidden w-full h-full rounded-2xl shadow-xl overflow-hidden flex flex-col items-center justify-center p-8 text-center 
            text-gray-900 dark:text-white 
            bg-white/95 backdrop-blur-xl border border-white/50
            dark:bg-slate-900/95 dark:border-white/20`}
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
        >
          {/* Close Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
            className="absolute top-4 right-4 p-2 rounded-full transition backdrop-blur-md
                bg-gray-100 hover:bg-gray-200 text-gray-600
                dark:bg-white/10 dark:hover:bg-white/20 dark:text-white/80 z-20"
          >
            <FaTimes />
          </button>

          <div className={`absolute inset-0 bg-${accentColor}-500/5 pointer-events-none`}></div>

          <div className="relative z-10 flex flex-col items-center w-full drop-shadow-sm">
            {backContent}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function PropertyList({
  defaultFilter = EMPTY_OBJECT,
  filterOverrides = null,
  showTitle = true,
  limit = 10,
  excludedIds = []
}) {
  const [properties, setProperties] = useState([]);
  const [relatedServices, setRelatedServices] = useState([]);
  const navigate = useNavigate();

  // Extract stringified versions for stable dependencies
  const defaultFilterStr = JSON.stringify(defaultFilter);
  const filterOverridesStr = JSON.stringify(filterOverrides);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- using stringified version for stable reference
  const stableDefaultFilter = useMemo(() => defaultFilter, [defaultFilterStr]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- using stringified version for stable reference
  const stableFilterOverrides = useMemo(() => filterOverrides, [filterOverridesStr]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- page is passed as argument, excludedIds is stable per render
  }, [limit, excludedIds]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProperties(activeFilters, page, controller.signal);
    return () => controller.abort();
    // ⚡ CRITICAL FIX: Don't include fetchProperties in dependencies!
    // It causes infinite loop because fetchProperties is recreated on every render
    // activeFilters and page are enough to trigger refetch when needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters, page]);

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

  if (properties.length === 0) return null;

  return (
    <>
      {showTitle && (
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
            Discover Your Next Chapter
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Hand-picked homes, verified agents, and real community insights.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-8">
        {properties.map((property, index) => {

          // Insert PROMO at index 3 (4th slot)
          if (index === 3) {
            let PromoContent = null;

            // PAGE 1: AGENT PROMO
            if (page === 1) {
              PromoContent = (
                <div key={`promo-agent-${index}`} style={{ display: 'contents' }}>
                  <PromoFlipCard
                    accentColor="blue"
                    backgroundImage="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80"
                    frontContent={
                      <>
                        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-blue-400/30 backdrop-blur-md shadow-lg">
                          <FaUserTie className="text-4xl text-blue-200" />
                        </div>
                        <h3 className="text-2xl font-black mb-3 leading-tight tracking-tight drop-shadow-md">
                          Are You Managing Properties?
                        </h3>
                        <p className="text-sm text-blue-100 font-medium mb-2">We have an exclusive offer for pros.</p>

                        {/* Free 2 Months Highlight */}
                        <div className="bg-yellow-400/20 backdrop-blur-md border border-yellow-300/30 rounded-lg px-4 py-2 mb-4">
                          <p className="text-yellow-200 text-xs font-black uppercase tracking-wide">🎁 Limited Time Offer</p>
                          <p className="text-yellow-100 text-lg font-black">FREE for First 2 Months!</p>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); navigate('/pricing'); }}
                          className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg flex items-center gap-2 mx-auto"
                        >
                          <FaHandHoldingUsd /> Check Our Rates
                        </button>
                      </>
                    }
                    backContent={
                      <>
                        <FaRocket className="text-5xl text-blue-500 dark:text-blue-400 mb-5 drop-shadow-lg" />
                        <h3 className="text-xl font-bold mb-2 drop-shadow-md text-gray-900 dark:text-white">Join the Revolution</h3>
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded mb-4 uppercase tracking-wide shadow-sm">
                          Limited Time Offer
                        </span>
                        <p className="text-sm mb-6 leading-relaxed">
                          Post unlimited properties, access premium features, and grow your business.
                          <span className="block mt-2 font-bold text-blue-600 dark:text-blue-400">✨ Sign up now - First 2 months absolutely FREE!</span>
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate('/login'); }}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2 border border-blue-400/50"
                        >
                          Claim Free Account <FaArrowRight />
                        </button>
                      </>
                    }
                  />
                  <PropertyCard key={property._id} property={property} />
                </div>
              );
            }

            // PAGE 2: COMMUNITY PROMO
            else if (page === 2) {
              PromoContent = (
                <div key={`promo-community-${index}`} style={{ display: 'contents' }}>
                  <PromoFlipCard
                    accentColor="purple"
                    backgroundImage="https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1000&q=80"
                    frontContent={
                      <>
                        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 border border-purple-400/30 backdrop-blur-md shadow-lg animate-pulse">
                          <FaQuestionCircle className="text-4xl text-purple-200" />
                        </div>
                        <h3 className="text-2xl font-black mb-3 leading-tight tracking-tight drop-shadow-md">
                          True Vibe of {locationName}?
                        </h3>
                        <p className="text-sm text-purple-100 font-medium">Water? Security? Noise? Don't just guess.</p>
                      </>
                    }
                    backContent={
                      <>
                        <FaComments className="text-5xl text-purple-500 dark:text-purple-400 mb-5 drop-shadow-lg" />
                        <h3 className="text-xl font-bold mb-3 drop-shadow-md text-gray-900 dark:text-white">Speak to a Local</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-200 mb-8 leading-relaxed font-medium">
                          Skip the sales pitch. Connect directly with residents who live here right now and get the unfiltered truth.
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate('/share-insight', { state: { location: activeFilters.location, type: 'question' } }); }}
                          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2 border border-purple-400/50"
                        >
                          Start the Conversation <FaArrowRight />
                        </button>
                      </>
                    }
                  />
                  <PropertyCard key={property._id} property={property} />
                </div>
              );
            }

            // PAGE 3: PASSPORT PROMO
            else if (page === 3) {
              PromoContent = (
                <div key={`promo-passport-${index}`} style={{ display: 'contents' }}>
                  <PromoFlipCard
                    accentColor="yellow"
                    backgroundImage="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80"
                    frontContent={
                      <>
                        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 border border-yellow-400/30 backdrop-blur-md shadow-lg">
                          <FaIdCard className="text-4xl text-yellow-200" />
                        </div>
                        <h3 className="text-2xl font-black mb-3 leading-tight tracking-tight drop-shadow-md">
                          Your Rental History is <span className="text-yellow-300">Gold.</span>
                        </h3>
                        <p className="text-sm text-yellow-100 font-medium">Claim your Housing Passport today.</p>
                      </>
                    }
                    backContent={
                      <>
                        <FaStar className="text-5xl text-yellow-500 dark:text-yellow-400 mb-5 drop-shadow-lg" />
                        <h3 className="text-xl font-bold mb-3 drop-shadow-md text-gray-900 dark:text-white">Review, Earn, & Shine</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-200 mb-8 leading-relaxed font-medium">
                          Review your current building anonymously to earn XP, gain credibility as a tenant, and unlock hidden price trends.
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}
                          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 px-6 rounded-xl shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2 border border-yellow-400/50"
                        >
                          Unlock Your Badge <FaArrowRight />
                        </button>
                      </>
                    }
                  />
                  <PropertyCard key={property._id} property={property} />
                </div>
              );
            }

            if (PromoContent) return PromoContent;
          }

          return <PropertyCard key={property._id} property={property} />;
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition">Previous</button>
          <span className="dark:text-white font-mono font-bold">Page {page} of {totalPages}</span>
          <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-blue-700 transition">Next Page</button>
        </div>
      )}

      {/* --- ✅ TRUSTED PARTNERS (Conversational Redesign) --- */}
      {relatedServices.length > 0 && (
        <div className="mt-10 pt-6 border-t dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6 text-center md:text-left">
            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 shadow-sm">
              <FaHandshake size={28} />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                Need a Hand Moving In?
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                We don't just find you a house; we help you settle in. From verified movers to reliable internet—we've got the connections you need in <span className="text-orange-600 dark:text-orange-400 font-bold">{locationName}</span>.
              </p>
            </div>
          </div>

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