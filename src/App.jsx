// src/App.jsx
import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter as Router, Link, useLocation, Routes, Route, useParams, useNavigate } from "react-router-dom"; 
import ReactGA from 'react-ga4';
import { AnimatePresence, motion } from "framer-motion";
import { FaCalculator, FaMapMarkedAlt, FaChartLine, FaEnvelope } from "react-icons/fa"; 
import { Helmet } from 'react-helmet-async'; 

// --- Components ---
import GlobalSchemaInjector from './components/GlobalSchemaInjector';
import PropertyList from "./components/PropertyList";
import TrendingProperties from "./components/TrendingProperties";
import GlobalSearchBar from "./components/GlobalSearchBar"; 
import ChatBubble from "./components/ChatBubble";
import ScrollToTop from "./components/ScrollToTop";
import TopAgents from "./components/TopAgents"; 
import HomeFaqSection from "./components/HomeFaqSection"; 
import SeoInjector from "./components/SeoInjector"; 
import HouseHuntRequest from "./components/HouseHuntRequest"; 
import PreviewBanner from './components/PreviewBanner';
import NeighbourhoodWatchHome from "./components/NeighbourhoodWatchHome";
import MarketFactsTable from "./components/MarketFactsTable"; 
// FeaturedReviews import removed
import TrendingMtaaScores from "./components/TrendingMtaaScores"; // ✅ IMPORT NEW COMPONENT

// --- New Layout Components ---
import AppHeader from "./components/layout/AppHeader";
import AppFooter from "./components/layout/AppFooter";
import AppRoutesConfig from "./components/layout/AppRoutesConfig";

// Community Insights Pages
import CommunityHub from './pages/CommunityHub'; 
import ShareInsight from './pages/ShareInsight';
import CommunityPost from './pages/CommunityPost';

// Demand-Side Page
import WantedRequestPage from './pages/WantedRequestPage';

// Services Page
import Services from './pages/Services'; 
import LivingCommunityFeed from './pages/LivingCommunityFeed';
import LivingPostDetail from './pages/LivingPostDetail';

// Service Components
import ServiceProviderDetails from './pages/ServiceProviderDetails';
import ServicePostDetails from './pages/ServicePostDetails'; 

// Service Provider Admin Pages
import AddServiceProvider from './pages/admin/AddServiceProvider';
import EditServiceProvider from './pages/admin/EditServiceProvider'; 

// Static Pages
import Contact from './pages/Contact';
import OurPlatform from './pages/OurPlatform'; 
import RatedPropertiesPage from './pages/RatedPropertiesPage'; 

// ✅ IMPORT THE SEARCH ENGINES
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
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
      className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center group"
      title="Contact Us"
    >
      <FaEnvelope className="text-xl" />
      <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Contact Support
      </span>
    </motion.button>
  );
};

// ... (ServiceRouteHandler and AgentRouteHandler remain unchanged) ...

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
  if (viewType === 'profile') {
      return <div className="p-20 text-center">Agent Profile View (Coming Soon)</div>; 
  }
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
  const [emphasizedKeywords, setEmphasizedKeywords] = useState({ property: [] });
  const [homeSeo, setHomeSeo] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
        try {
            const [seoRes, keyRes] = await Promise.all([
                apiClient.get(`/seo/${encodeURIComponent('/')}`),
                apiClient.get('/seo/emphasized')
            ]);
            setHomeSeo(seoRes.data);
            setEmphasizedKeywords(keyRes.data || { property: [] });
        } catch (e) { console.error("Home data load error", e); }
    };
    fetchHomeData();
  }, []);

  const HomePageElement = (
    <>
      <SeoInjector seo={homeSeo} />

      <section id="home" className="pt-32 pb-6 px-6 text-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            className="text-4xl md:text-6xl font-extrabold mb-4 text-gray-900 dark:text-white leading-tight" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            Welcome to House Hunt Kenya
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
          >
            A community-driven platform where you can share insights, find trusted service providers, and browse verified listings. <span className="text-blue-600 dark:text-blue-400 font-bold">Agents, Real Estate Firm, and Property Management firms only post for free!</span>
          </motion.p>
        </div>
      </section>

      <main id="properties" className="flex-grow bg-gray-50 dark:bg-gray-900">
        <section className="px-6 pb-8">
           <GlobalSearchBar />
        </section>

        {submittedHomeFilters ? (
           <section className="py-8 px-6">
             <div className="max-w-6xl mx-auto">
               <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Search Results</h2>
               <PropertyList filterOverrides={submittedHomeFilters} showSearchBar={false} showTitle={false} />
             </div>
           </section>
        ) : (
          <>
            <div className="py-6">
               <TopAgents />
            </div>

            {/* ✅ INSERTED: The New Flip-Card Section for Mtaa Scores */}
            <TrendingMtaaScores />

            <section className="py-6 px-6">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Featured Properties</h2>
                <PropertyList filterOverrides={null} showSearchBar={false} showTitle={false} limit={11} />
              </div>
            </section>
            
            <div className="py-6">
               <HouseHuntRequest />
            </div>

            {(isQuizEnabled || isCostCalculatorEnabled) && (
               <section className="py-8 px-6">
                  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
                    {isQuizEnabled && (
                      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:shadow-md transition duration-300">
                         <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            <FaMapMarkedAlt />
                         </div>
                         <h3 className="text-xl font-bold mb-2 dark:text-white">Where Should You Live?</h3>
                         <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                           Take our AI-powered quiz to find the perfect Nairobi neighbourhood.
                         </p>
                         <Link to="/find-my-neighbourhood" className="inline-block bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition">
                           Start Quiz
                         </Link>
                      </div>
                    )}

                    {isCostCalculatorEnabled && (
                      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center hover:shadow-md transition duration-300">
                         <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            <FaCalculator />
                         </div>
                         <h3 className="text-xl font-bold mb-2 dark:text-white">Cost of Living</h3>
                         <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                           Estimate monthly expenses (Rent, Transport, Food) for different estates.
                         </p>
                         <Link to="/tools/cost-of-living" className="inline-block bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition">
                           Calculate
                         </Link>
                      </div>
                    )}
                  </div>
               </section>
            )}
            
            <div className="py-6">
               <HomeFaqSection />
            </div>

            {/* FeaturedReviews section removed */}

            <NeighbourhoodWatchHome />
          </>
        )}
      </main>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col font-inter scroll-smooth bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <AppHeader />
      <GlobalSchemaInjector />
      {previewRole && <PreviewBanner />}

      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/wanted/post" element={
                  <div className="pt-24 pb-16 px-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
                    <div className="max-w-4xl mx-auto">
                       <h1 className="text-3xl font-bold text-center mb-8 dark:text-white">Post a Property Request</h1>
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
      `}</style>
      <ScrollToTop />
      <MainLayout />
    </Router>
  )
}

export default App;