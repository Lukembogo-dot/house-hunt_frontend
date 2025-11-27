// src/App.jsx
// (UPDATED: Removed Trending Properties Section from Home)

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
import SearchBar from "./components/SearchBar";
import ChatBubble from "./components/ChatBubble";
import ScrollToTop from "./components/ScrollToTop";
import TopAgents from "./components/TopAgents"; 
import HomeFaqSection from "./components/HomeFaqSection"; 
import SeoInjector from "./components/SeoInjector"; 
import HouseHuntRequest from "./components/HouseHuntRequest"; 
import PreviewBanner from './components/PreviewBanner';
import NeighbourhoodWatchHome from "./components/NeighbourhoodWatchHome";
import MarketFactsTable from "./components/MarketFactsTable"; 
import FeaturedReviews from "./components/FeaturedReviews"; 

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

const ServiceRouteHandler = () => {
  const { slug } = useParams();
  const [isProvider, setIsProvider] = useState(null); 

  useEffect(() => {
    const checkType = async () => {
      try {
        await apiClient.get(`/service-providers/${slug}`);
        setIsProvider(true);
      } catch (err) {
        setIsProvider(false);
      }
    };
    checkType();
  }, [slug]);

  if (isProvider === null) return <PageLoader />;
  return isProvider ? <ServiceProviderDetails /> : <ServicePostDetails />;
};

const SearchPageWrapper = () => {
  const { listingType, location } = useParams();
  const [customSeo, setCustomSeo] = useState(null);
  const [stats, setStats] = useState(null); 
  
  const displayLocation = location ? location.charAt(0).toUpperCase() + location.slice(1) : 'Kenya';
  const displayType = listingType === 'rent' ? 'Rent' : 'Sale';
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const pagePath = `/search/${listingType}/${location}`;
        const [seoRes, statsRes] = await Promise.allSettled([
            apiClient.get(`/seo/${encodeURIComponent(pagePath)}`),
            apiClient.get(`/properties/stats?location=${location}&listingType=${listingType}`)
        ]);

        if (seoRes.status === 'fulfilled' && seoRes.value.data?.metaTitle) {
          setCustomSeo(seoRes.value.data);
        } else {
          setCustomSeo(null);
        }

        if (statsRes.status === 'fulfilled') {
            setStats(statsRes.value.data);
        }
      } catch (err) {
        console.error("Error loading search page data", err);
      }
    };
    fetchPageData();
  }, [listingType, location]);

  const defaultTitle = `Properties for ${displayType} in ${displayLocation} | HouseHunt Kenya`;
  const defaultDescription = `Find the best houses, apartments, and land for ${displayType.toLowerCase()} in ${displayLocation}. Verified listings, real agents, and market insights.`;
  const canonicalUrl = `https://www.househuntkenya.co.ke/search/${listingType}/${location}`;

  const metaTitle = customSeo?.metaTitle || defaultTitle;
  const metaDescription = customSeo?.metaDescription || defaultDescription;

  const filterOverrides = {
    listingType: listingType, 
    location: location       
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="pt-24 pb-16 px-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 capitalize">
                  {listingType === 'rent' ? 'Properties for Rent' : 'Properties for Sale'} in {displayLocation}
              </h1>

              {stats && stats.count > 0 && (
                  <>
                    <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-blue-600 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <FaChartLine className="text-blue-600" /> Market Snapshot: {displayType} in {displayLocation}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            As of <strong>{currentMonth}</strong>, there are currently <strong>{stats.count}</strong> active listings for {displayType.toLowerCase()} in {displayLocation} on HouseHunt Kenya. 
                            The average market price is approximately <strong>KES {stats.avgPrice?.toLocaleString()}</strong>. 
                            {displayLocation} remains a popular choice for {displayType === 'Rent' ? 'tenants' : 'investors'} seeking verified properties with access to local amenities.
                        </p>
                    </div>
                    <MarketFactsTable location={location} type={listingType} stats={stats} />
                  </>
              )}

              <PropertyList 
                  filterOverrides={filterOverrides} 
                  showSearchBar={true} 
                  showTitle={false} 
              />
          </div>
      </div>
    </>
  );
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

  const handleHomeFilterSubmit = () => setSubmittedHomeFilters({ ...homeFilters });

  const HomePageElement = (
    <>
      <SeoInjector seo={homeSeo} />

      <section id="home" className="relative bg-cover bg-center h-[50vh] min-h-[400px] flex flex-col items-center justify-center text-center text-white" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto-format&fit=crop&w=1600&q=80')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="relative z-10 px-6 max-w-3xl pb-16">
          <motion.h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Find Your Dream Home in Kenya
          </motion.h1>
          <motion.p className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            Explore verified listings — from affordable rentals to luxury homes.
          </motion.p>
        </div>
      </section>

      <main id="properties" className="flex-grow">
        <section className="relative z-20 -mt-16 px-6">
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl px-6 py-4 border border-gray-200 dark:border-gray-700">
            <SearchBar filters={homeFilters} onChange={(name, val) => setHomeFilters(prev => ({ ...prev, [name]: val }))} onFilter={handleHomeFilterSubmit} />
          </div>
        </section>

        {submittedHomeFilters ? (
           <section className="py-12 px-6 bg-gray-100 dark:bg-gray-900">
             <div className="max-w-6xl mx-auto">
               <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Search Results</h2>
               <PropertyList filterOverrides={submittedHomeFilters} showSearchBar={false} showTitle={false} />
             </div>
           </section>
        ) : (
          <>
            {/* 1. Top Agents */}
            <TopAgents />

            {/* 2. Featured Properties (11 Items) */}
            <section className="py-12 px-6 bg-gray-100 dark:bg-gray-900">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Featured Properties</h2>
                <PropertyList filterOverrides={null} showSearchBar={false} showTitle={false} limit={11} />
              </div>
            </section>
            
            {/* 3. HouseHunt Request */}
            <HouseHuntRequest />

            {/* 4. Trending Properties - REMOVED as requested */}

            {/* 6. TOOLS SECTION (Quiz + Cost Calculator) */}
            {(isQuizEnabled || isCostCalculatorEnabled) && (
               <section className="py-16 px-6 bg-blue-50 dark:bg-gray-800/50 border-t dark:border-gray-700">
                  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                    
                    {/* Neighbourhood Quiz */}
                    {isQuizEnabled && (
                      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700 text-center hover:transform hover:scale-105 transition duration-300">
                         <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            <FaMapMarkedAlt />
                         </div>
                         <h3 className="text-2xl font-bold mb-2 dark:text-white">Where Should You Live?</h3>
                         <p className="text-gray-600 dark:text-gray-300 mb-6">
                           Take our AI-powered quiz to find the perfect Nairobi neighbourhood for your lifestyle and budget.
                         </p>
                         <Link to="/find-my-neighbourhood" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 shadow-md">
                           Start the Quiz
                         </Link>
                      </div>
                    )}

                    {/* Cost of Living Calculator */}
                    {isCostCalculatorEnabled && (
                      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700 text-center hover:transform hover:scale-105 transition duration-300">
                         <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            <FaCalculator />
                         </div>
                         <h3 className="text-2xl font-bold mb-2 dark:text-white">Cost of Living Calculator</h3>
                         <p className="text-gray-600 dark:text-gray-300 mb-6">
                           Planning a move? Estimate monthly expenses (Rent, Transport, Food) for different estates.
                         </p>
                         <Link to="/tools/cost-of-living" className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 shadow-md">
                           Calculate Costs
                         </Link>
                      </div>
                    )}

                  </div>
               </section>
            )}
            
            <HomeFaqSection />

            {/* ✅ NEW: FEATURED RESIDENT REVIEWS */}
            <FeaturedReviews />

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
                <Route path="/search/:listingType/:location" element={<SearchPageWrapper />} />
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
      `}</style>
      <ScrollToTop />
      <MainLayout />
    </Router>
  )
}

export default App;