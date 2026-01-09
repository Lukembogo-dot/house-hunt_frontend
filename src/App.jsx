// src/App.jsx
import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter as Router, Link, useLocation, Routes, Route, useParams, useNavigate } from "react-router-dom";
import ReactGA from 'react-ga4';
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { FaCalculator, FaEnvelope, FaSearchLocation, FaLightbulb, FaRocket, FaQuestionCircle, FaBullhorn } from "react-icons/fa";
import { Helmet } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

// --- Components ---
import GlobalSchemaInjector from './components/GlobalSchemaInjector';
import PropertyList from "./components/PropertyList";
import GlobalSearchBar from "./components/GlobalSearchBar";
import ChatBubble from "./components/ChatBubble";
import ScrollToTop from "./components/ScrollToTop";
import TopAgents from "./components/TopAgents";
import HomeFaqSection from "./components/HomeFaqSection";
import SeoInjector from "./components/SeoInjector";
import HouseHuntRequest from "./components/HouseHuntRequest";
import PreviewBanner from './components/PreviewBanner';
import TrendingMtaaScores from "./components/TrendingMtaaScores";
import FeaturedProperties from "./components/FeaturedProperties";
import NeighbourhoodWatchHome from "./components/NeighbourhoodWatchHome";

// --- New Layout Components ---
import AppHeader from "./components/layout/AppHeader";
import AppFooter from "./components/layout/AppFooter";
import AppRoutesConfig from "./components/layout/AppRoutesConfig";

// Pages
import CommunityHub from './pages/CommunityHub';
import ShareInsight from './pages/ShareInsight';
import CommunityPost from './pages/CommunityPost';
import WantedRequestPage from './pages/WantedRequestPage';
import Services from './pages/Services';
import LivingCommunityFeed from './pages/LivingCommunityFeed';
import LivingPostDetail from './pages/LivingPostDetail';
import ServiceProviderDetails from './pages/ServiceProviderDetails';
import ServicePostDetails from './pages/ServicePostDetails';
import AddServiceProvider from './pages/admin/AddServiceProvider';
import EditServiceProvider from './pages/admin/EditServiceProvider';
import Contact from './pages/Contact';
import OurPlatform from './pages/OurPlatform';
import ModeratorDashboard from './pages/ModeratorDashboard';
import RatedPropertiesPage from './pages/RatedPropertiesPage';
import DynamicSearchPage from './pages/DynamicSearchPage';
import DynamicServiceSearch from './pages/DynamicServiceSearch';
import DynamicAgentSearch from './pages/DynamicAgentSearch';
import DynamicNeighbourhoodSearch from './pages/DynamicNeighbourhoodSearch';

// --- Context & API ---
import { useAuth } from "./context/AuthContext";
import { useFeatureFlag } from "./context/FeatureFlagContext";
import apiClient from "./api/axios";

const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[70vh]">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ContactButton = () => {
  const navigate = useNavigate();
  return (
    <motion.button
      onClick={() => navigate('/contact')}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-green-600 text-white rounded-full shadow-xl shadow-green-600/30 hover:bg-green-700 transition-all duration-300 flex items-center justify-center group"
      title="Contact Us"
    >
      <FaEnvelope className="text-xl" />
      <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold shadow-lg">
        Talk to Support
      </span>
    </motion.button>
  );
};

const ServiceRouteHandler = () => {
  const { slug } = useParams();
  const [viewType, setViewType] = useState('loading');

  useEffect(() => {
    const resolveRoute = async () => {
      try {
        await apiClient.get(`/service-providers/${slug}`);
        setViewType('provider');
      } catch (err) {
        try {
          await apiClient.get(`/services/slug/${slug}`);
          setViewType('post');
        } catch (err2) {
          setViewType('search');
        }
      }
    };
    resolveRoute();
  }, [slug]);

  if (viewType === 'loading') return <PageLoader />;
  if (viewType === 'provider') return <ServiceProviderDetails />;
  if (viewType === 'post') return <ServicePostDetails />;
  return <DynamicServiceSearch />;
};

const AgentRouteHandler = () => {
  const { slug } = useParams();
  const [viewType, setViewType] = useState('loading');

  useEffect(() => {
    const resolveRoute = async () => {
      try {
        await apiClient.get(`/users/agents/${slug}`);
        setViewType('profile');
      } catch (err) {
        setViewType('search');
      }
    };
    resolveRoute();
  }, [slug]);

  if (viewType === 'loading') return <PageLoader />;
  if (viewType === 'profile') return <div className="p-20 text-center">Agent Profile View (Coming Soon)</div>;
  return <DynamicAgentSearch />;
};

function MainLayout() {
  const { previewRole } = useAuth();
  const isQuizEnabled = useFeatureFlag('neighbourhood-quiz');
  const isCostCalculatorEnabled = useFeatureFlag('cost-of-living-calculator');
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search, title: document.title });
  }, [location]);

  const [homeFilters, setHomeFilters] = useState({ location: "", type: "", minPrice: "", maxPrice: "" });
  const [submittedHomeFilters, setSubmittedHomeFilters] = useState(null);
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

  const { scrollY } = useScroll();

  // --- SCROLL ANIMATION VALUES (OPTIMIZED) ---
  // Use mostly Opacity and Scale for GPU-only animations (no Reflows)
  const heroOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 200], [1, 0.95]); // Subtle scale
  const heroY = useTransform(scrollY, [0, 200], [0, 50]); // Parallax effect

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
      <article className="sr-only" aria-hidden="true">
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

      {/* --- HERO SECTION: COMPACT & ALIGNED --- */}
      <section id="home" className="pt-12 pb-4 px-6 text-center bg-gray-50 dark:bg-gray-900 relative overflow-hidden will-change-transform">
        <div className="absolute inset-0 bg-grid-slate-200/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            style={{
              opacity: heroOpacity,
              scale: heroScale,
              y: heroY, // Use Transform Y instead of Margin
              pointerEvents: useTransform(scrollY, [0, 150], ["auto", "none"])
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-widest mb-4"
            >
              <FaRocket /> The Next Gen Real Estate Tech
            </motion.div>
          </motion.div>
        </div>
      </section>

      <main id="properties" className="flex-grow bg-gray-50 dark:bg-gray-900 relative z-20">
        {/* Compact Search Bar Spacing */}
        <section className="px-6 pb-2">
          <GlobalSearchBar />
        </section>

        {submittedHomeFilters ? (
          <section className="py-8 px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Here's what we found</h2>
              <PropertyList filterOverrides={submittedHomeFilters} showSearchBar={false} showTitle={false} />
            </div>
          </section>
        ) : (
          <>
            {/* Reduced vertical padding between components */}
            <div className="py-2">
              <TopAgents />
            </div>

            <div className="py-2">
              <TrendingMtaaScores />
            </div>

            <div className="py-2">
              <FeaturedProperties />
            </div>

            {/* --- HOUSE HUNT REQUEST (COMPACT) --- */}
            <section className="py-6 px-6 bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700">
              <div className="max-w-7xl mx-auto flex flex-col items-center">
                <div className="text-center mb-4 max-w-3xl">
                  <div className="inline-block p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full mb-2 text-3xl shadow-sm">
                    <FaSearchLocation />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black mb-1 tracking-tight text-gray-900 dark:text-white">
                    Hit a Wall? Let Technology Do the Heavy Lifting.
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    Stop scrolling endlessly. Tell our intelligent network exactly what you need, and let the verified agents come to you with perfect matches.
                  </p>
                </div>

                {/* Full Width Container matching other components */}
                <div className="w-full bg-gray-50 dark:bg-gray-900 p-2 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <HouseHuntRequest />
                </div>
              </div>
            </section>

            {/* --- DECISION TOOLS (COMPACT) --- */}
            {(isQuizEnabled || isCostCalculatorEnabled) && (
              <section className="py-6 px-6">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-4">
                    <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs mb-2 block">Data-Driven Moves</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Make Smarter Decisions</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {isQuizEnabled && (
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:scale-[1.01] transition duration-300 group">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl group-hover:rotate-12 transition-transform">
                          <FaLightbulb />
                        </div>
                        <h3 className="text-xl font-bold mb-3 dark:text-white">Neighbourhood Matchmaker AI</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                          Not sure where to live? Answer a few lifestyle questions, and our algorithm will find your perfect estate match.
                        </p>
                        <Link to="/find-my-neighbourhood" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition shadow-xl shadow-blue-600/20">
                          Launch Quiz
                        </Link>
                      </div>
                    )}

                    {isCostCalculatorEnabled && (
                      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:scale-[1.01] transition duration-300 group">
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl group-hover:rotate-12 transition-transform">
                          <FaCalculator />
                        </div>
                        <h3 className="text-xl font-bold mb-3 dark:text-white">True Cost of Living</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                          Budgeting shouldn't be a guess. Calculate real-world expenses including rent, matatu fares, and groceries for any area.
                        </p>
                        <Link to="/tools/cost-of-living" className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition shadow-xl shadow-green-600/20">
                          Calculate Now
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* --- NEIGHBOURHOOD WATCH (COMPACT) --- */}
            <section className="py-6 px-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-4 gap-6">
                  <div className="max-w-2xl">
                    <span className="text-red-500 dark:text-red-400 font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Live Updates
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                      The Community Pulse.
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                      Don't just live here, belong here. See real-time alerts, safety reports, and discussions happening on your street right now.
                    </p>
                  </div>
                  <Link to="/community" className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
                    <FaBullhorn className="text-red-500" /> View All Alerts
                  </Link>
                </div>

                <div className="relative">
                  <NeighbourhoodWatchHome />
                </div>
              </div>
            </section>

            {/* --- FAQ SECTION (COMPACT) --- */}
            <div className="py-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <div className="text-center mb-4">
                <FaQuestionCircle className="text-3xl text-gray-300 mx-auto mb-3" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Curious Minds Ask...</h2>
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

      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/wanted/post" element={
              <div className="pt-24 pb-16 px-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="max-w-4xl mx-auto text-center">
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Let Us Do the Hunting</h1>
                  <p className="text-gray-500 mb-8">Tell us what you need, and agents will come to you.</p>
                  <HouseHuntRequest />
                </div>
              </div>
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

      <ContactButton />
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
  )
}

export default App;