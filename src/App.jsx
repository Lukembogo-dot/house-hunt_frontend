// src/App.jsx
import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Link, useLocation, Routes, Route, useParams } from "react-router-dom";
import ReactGA from 'react-ga4';
import { AnimatePresence, motion } from "framer-motion";
import { FaCalculator, FaEnvelope, FaSearchLocation, FaLightbulb, FaRocket, FaQuestionCircle, FaBullhorn, FaWhatsapp } from "react-icons/fa";
import { Helmet } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { SWRConfig } from 'swr';

// ✅ Performance Optimizations
import './styles/smooth-scroll.css';

// --- Components (Critical - Load Immediately) ---
import GlobalSchemaInjector from './components/GlobalSchemaInjector';
import PropertyList from "./components/PropertyList";
// import GlobalSearchBar from "./components/GlobalSearchBar"; // Replaced by HeroSearchBar
import ChatBubble from "./components/ChatBubble";
import WhatsAppButton from "./components/WhatsAppButton";
import ScrollToTop from "./components/ScrollToTop";
import TopAgents from "./components/TopAgents";
import HomeFaqSection from "./components/HomeFaqSection";
import SeoInjector from "./components/SeoInjector";
import HouseHuntRequest from "./components/HouseHuntRequest";
import PreviewBanner from './components/PreviewBanner';
import TrendingMtaaScores from "./components/TrendingMtaaScores";
import FeaturedProperties from "./components/FeaturedProperties";
import NeighbourhoodWatchHome from "./components/NeighbourhoodWatchHome";
import useVisitorTracking from "./hooks/useVisitorTracking";
import { useRouteCache } from "./hooks/useCachedAPI";

// --- Visual Enhancement Components (Critical for Homepage) ---
import { HeroImageSlider, AnimatedStats, HeroSearchBar } from "./components/home";

// --- Layout Components (Critical) ---
import AppHeader from "./components/layout/AppHeader";
import AppFooter from "./components/layout/AppFooter";
import AppRoutesConfig from "./components/layout/AppRoutesConfig";

// ⚡ LAZY LOADED PAGES (Non-Critical - Load on Demand)
// This reduces initial bundle from ~800KB to ~250KB
const CommunityHub = lazy(() => import('./pages/CommunityHub'));
const ShareInsight = lazy(() => import('./pages/ShareInsight'));
const CommunityPost = lazy(() => import('./pages/CommunityPost'));
const WantedRequestPage = lazy(() => import('./pages/WantedRequestPage'));
const Services = lazy(() => import('./pages/Services'));
const LivingCommunityFeed = lazy(() => import('./pages/LivingCommunityFeed'));
const LivingPostDetail = lazy(() => import('./pages/LivingPostDetail'));
const ServiceProviderDetails = lazy(() => import('./pages/ServiceProviderDetails'));
const ServicePostDetails = lazy(() => import('./pages/ServicePostDetails'));
const AddServiceProvider = lazy(() => import('./pages/admin/AddServiceProvider'));
const EditServiceProvider = lazy(() => import('./pages/admin/EditServiceProvider'));
const Contact = lazy(() => import('./pages/Contact'));
const OurPlatform = lazy(() => import('./pages/OurPlatform'));
const ModeratorDashboard = lazy(() => import('./pages/ModeratorDashboard'));
const RatedPropertiesPage = lazy(() => import('./pages/RatedPropertiesPage'));
const DynamicSearchPage = lazy(() => import('./pages/DynamicSearchPage'));
const DynamicServiceSearch = lazy(() => import('./pages/DynamicServiceSearch'));
const DynamicAgentSearch = lazy(() => import('./pages/DynamicAgentSearch'));
const DynamicNeighbourhoodSearch = lazy(() => import('./pages/DynamicNeighbourhoodSearch'));

// --- Context & API ---
import { useAuth } from "./context/AuthContext";
import { useFeatureFlag } from "./context/FeatureFlagContext";
import apiClient from "./api/axios";

// ✅ Instant Page Transition (no spinner)
const PageLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.15 }}
    className="min-h-[70vh]"
  />
);

// ✅ Validated Service Route Handler (48h cache)

// ✅ Cached Service Route Handler (48h cache)
const ServiceRouteHandler = () => {
  const { slug } = useParams();

  // Try provider first, then post, cached for 48 hours
  const { data: providerData, error: providerError } = useRouteCache(`/service-providers/${slug}`);
  const { data: postData, error: postError } = useRouteCache(
    !providerData && providerError ? `/services/slug/${slug}` : null
  );

  // Instant loading - show cached content immediately
  if (providerData) return <ServiceProviderDetails />;
  if (postData) return <ServicePostDetails />;
  if (providerError && postError) return <DynamicServiceSearch />;

  return <PageLoader />;
};

// ✅ Cached Agent Route Handler (48h cache)
const AgentRouteHandler = () => {
  const { slug } = useParams();

  // Check if agent exists, cached for 48 hours
  const { data: agentData, error: agentError } = useRouteCache(`/users/agents/${slug}`);

  // Instant loading - show cached content immediately
  if (agentData) return <div className="p-20 text-center">Agent Profile View (Coming Soon)</div>;
  if (agentError) return <DynamicAgentSearch />;

  return <PageLoader />;
};

function MainLayout() {
  const { previewRole } = useAuth();
  const isQuizEnabled = useFeatureFlag('neighbourhood-quiz');
  const isCostCalculatorEnabled = useFeatureFlag('cost-of-living-calculator');
  const location = useLocation();

  useVisitorTracking(); // ✅ Track Visits

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search, title: document.title });
  }, [location]);

  // Unused state removed
  const submittedHomeFilters = null;
  const [homeSeo, setHomeSeo] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [seoRes] = await Promise.all([
          apiClient.get(`/seo/${encodeURIComponent('/')}`),
        ]);
        setHomeSeo(seoRes.data);
      } catch (e) { console.error("Home data load error", e); }
    };
    fetchHomeData();
  }, []);

  // Scroll animations removed (unused)

  const HomePageElement = (
    <>
      <SeoInjector seo={homeSeo} />

      {/* ✅ LANDING PAGE SEO: WebSite Schema (Sitelinks Search Box) */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "HouseHunt Kenya",
            "url": "https://www.househuntkenya.co.ke",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.househuntkenya.co.ke/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      {/* ✅ AI/CRAWLER SUMMARY: Hidden from users, visible to bots */}
      <article className="sr-only">
        <h1>HouseHunt Kenya: Rentals, Sales, and Neighborhood Reviews</h1>
        <p>
          Welcome to **HouseHunt Kenya**, the most comprehensive real estate platform in Nairobi and beyond.
          We connect you with **rental properties**, **houses for sale**, and **land** while providing authentic **Mtaa Scores** (neighborhood reviews) from the people who live there.
        </p>
        <section>
          <h2>For Agents & Agencies</h2>
          <p>
            <strong>Real estate agencies, property management firms, and independent real estate agents are free to list with us and join our community.</strong>
            Create your profile today to reach thousands of verified house hunters.
          </p>
        </section>
        <section>
          <h2>What We Offer</h2>
          <ul>
            <li><strong>Rentals:</strong> Find apartments, bedsitters, and single rooms in areas like Kilimani, Westlands, Roysambu, and Ruiru.</li>
            <li><strong>Sales:</strong> Explore prime land, plots, and family homes for sale.</li>
            <li><strong>Living Community:</strong> Read real reviews about water consistency, security, and transport fares in every Mtaa.</li>
          </ul>
        </section>
      </article>

      {/* --- ✨ NEW: HERO IMAGE SLIDER WITH VISUAL EFFECTS --- */}
      <HeroImageSlider showText={true} autoPlayInterval={6000}>
        {/* Search Bar Inside Hero - ✅ Spring Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 250, damping: 25, mass: 0.5 }}
          className="w-full max-w-4xl mx-auto mt-6 will-change-transform px-4"
        >
          <HeroSearchBar />
        </motion.div>
      </HeroImageSlider>



      <main id="properties" className="flex-grow bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50 relative z-20">

        {/* --- HOUSE HUNT REQUEST (MOVED TO TOP) --- */}
        {!submittedHomeFilters && (
          <div className="py-6 w-full">
            <HouseHuntRequest variant="wide" />
          </div>
        )}

        {/* --- TOP AGENTS (MOVED) --- */}
        {!submittedHomeFilters && (
          <div className="py-1">
            <TopAgents />
            {/* Handpicked Section (Moved here) */}
            <FeaturedProperties />
          </div>
        )}


        <div className="py-1">
          <TrendingMtaaScores />
        </div>


        {submittedHomeFilters ? (
          <section className="py-6 px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-6 dark:text-white">Here's what we found</h2>
              <PropertyList filterOverrides={submittedHomeFilters} showSearchBar={false} showTitle={false} />
            </div>
          </section>
        ) : (
          <>


            {/* ✨ NEW: Animated Stats Section */}
            <AnimatedStats />

            {/* --- DECISION TOOLS (COMPACT) --- */}
            {(isQuizEnabled || isCostCalculatorEnabled) && (
              <section className="py-4 px-6">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-3">
                    <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs mb-1 block">Data-Driven Moves</span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Make Smarter Decisions</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    {isQuizEnabled && (
                      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 text-center hover:scale-[1.01] transition-transform duration-200 group">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl group-hover:rotate-6 transition-transform">
                          <FaLightbulb />
                        </div>
                        <h3 className="text-lg font-bold mb-2 dark:text-white">Neighbourhood Matchmaker AI</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                          Not sure where to live? Answer a few questions, find your perfect match.
                        </p>
                        <Link to="/find-my-neighbourhood" className="inline-block bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                          Launch Quiz
                        </Link>
                      </div>
                    )}

                    {isCostCalculatorEnabled && (
                      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 text-center hover:scale-[1.01] transition-transform duration-200 group">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl group-hover:rotate-6 transition-transform">
                          <FaCalculator />
                        </div>
                        <h3 className="text-lg font-bold mb-2 dark:text-white">True Cost of Living</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                          Calculate real expenses including rent, transport, and groceries.
                        </p>
                        <Link to="/tools/cost-of-living" className="inline-block bg-green-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-600/20">
                          Calculate Now
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* --- NEIGHBOURHOOD WATCH (COMPACT) --- */}
            <section className="py-4 px-6 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-3 gap-4">
                  <div className="max-w-2xl">
                    <span className="text-red-500 dark:text-red-400 font-bold uppercase tracking-widest text-xs mb-1 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Live Updates
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                      The Community Pulse.
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Real-time alerts, safety reports, and discussions on your street.
                    </p>
                  </div>
                  <Link to="/community" className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-2.5 px-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition text-sm">
                    <FaBullhorn className="text-red-500" /> View All Alerts
                  </Link>
                </div>

                <div className="relative">
                  <NeighbourhoodWatchHome />
                </div>
              </div>
            </section>

            {/* --- FAQ SECTION (COMPACT) --- */}
            <div className="py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800">
              <div className="text-center mb-3">
                <FaQuestionCircle className="text-2xl text-gray-300 mx-auto mb-2" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Curious Minds Ask...</h2>
              </div>
              <HomeFaqSection />
            </div>

          </>
        )}
      </main>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col font-inter scroll-smooth bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <Toaster position="top-center" reverseOrder={false} />

      <AppHeader />
      <GlobalSchemaInjector />
      {previewRole && <PreviewBanner />}

      {/* ✅ Instant page transitions - no skeleton */}
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/wanted/post" element={
              <Suspense fallback={<PageLoader />}>
                <div className="pt-24 pb-16 px-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
                  <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Let Us Do the Hunting</h1>
                    <p className="text-gray-500 mb-8">Tell us what you need, and agents will come to you.</p>
                    <HouseHuntRequest />
                  </div>
                </div>
              </Suspense>
            } />

            <Route path="/wanted/:slug" element={<WantedRequestPage />} />
            <Route path="/community" element={<CommunityHub />} />
            <Route path="/share-insight" element={<ShareInsight />} />
            <Route path="/community/:slug" element={<CommunityPost />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceRouteHandler />} />
            <Route path="/services/slug/:slug" element={<ServiceRouteHandler />} />
            <Route path="/services/local/:slug" element={<ServicePostDetails />} />
            <Route path="/admin/add-service-provider" element={<AddServiceProvider />} />
            <Route path="/admin/edit-service-provider/:id" element={<EditServiceProvider />} />
            <Route path="/moderator/dashboard" element={<ModeratorDashboard />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/our-platform" element={<OurPlatform />} />
            <Route path="/living-feed" element={<LivingCommunityFeed />} />
            <Route path="/living-feed/:id" element={<LivingPostDetail />} />

            <Route path="/rated-properties" element={<RatedPropertiesPage />} />

            <Route path="/search/:listingType/:location" element={<DynamicSearchPage />} />
            <Route path="/search/:listingType/:propertyType/:location" element={<DynamicSearchPage />} />
            <Route path="/neighbourhood/:slug" element={<DynamicNeighbourhoodSearch />} />
            <Route path="*" element={<AppRoutesConfig homeElement={HomePageElement} />} />
          </Routes>
        </AnimatePresence>
      </Suspense>

      <WhatsAppButton />
      <ChatBubble />

      <AppFooter />
    </div>
  );
}

function App() {
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
        dedupingInterval: 5000,
      }}
    >
      <Router>
        <style>{`
        body {
          user-select: none; 
          -webkit-user-select: none; 
          -moz-user-select: none; 
        }
        input, textarea {
          user-select: text;
          -webkit-user-select: text;
        }
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientMove 5s ease infinite;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
        <ScrollToTop />
        <MainLayout />
      </Router>
    </SWRConfig>
  )
}

export default App;