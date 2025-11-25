// src/App.jsx

import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter as Router, Link, useLocation, Routes, Route, useParams } from "react-router-dom"; 
import ReactGA from 'react-ga4';
import { AnimatePresence, motion } from "framer-motion";
import { FaCalculator, FaMapMarkedAlt, FaChartLine } from "react-icons/fa"; 
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
// ✅ IMPORTED: Service Provider Details Page
import ServiceProviderDetails from './pages/ServiceProviderDetails';

// ✅ IMPORTED: Service Provider Admin Pages
import AddServiceProvider from './pages/admin/AddServiceProvider';
import EditServiceProvider from './pages/admin/EditServiceProvider'; 

// --- Context ---
import { useAuth } from "./context/AuthContext";
import { useFeatureFlag } from "./context/FeatureFlagContext";
import apiClient from "./api/axios";

const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[70vh]">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// ✅ UPDATED: SEARCH PAGE WRAPPER WITH GEO SNAPSHOT & TABLE
const SearchPageWrapper = () => {
  const { listingType, location } = useParams();
  const [customSeo, setCustomSeo] = useState(null);
  const [stats, setStats] = useState(null); 
  
  // Format for display
  const displayLocation = location ? location.charAt(0).toUpperCase() + location.slice(1) : 'Kenya';
  const displayType = listingType === 'rent' ? 'Rent' : 'Sale';
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // 1. Fetch SEO & Stats
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const pagePath = `/search/${listingType}/${location}`;
        
        // Parallel Fetch: SEO + Market Stats
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

  // 2. Generate SEO Meta
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

              {/* ✅ GEO MARKET SNAPSHOT (AI-Readable Text Block) */}
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

                    {/* ✅ GEO DATA TABLE (Structured Data for LLMs) */}
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

  // GA4 Tracking
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search, title: document.title });
  }, [location]);

  // Search State
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

  // --- THE HOME PAGE CONTENT ---
  const HomePageElement = (
    <>
      <SeoInjector seo={homeSeo} />

      {/* ✅ UPDATED HERO SECTION 
          1. Reduced height to h-[50vh] (was 65vh) to pull bottom content up.
          2. Reduced min-height to 400px.
      */}
      <section id="home" className="relative bg-cover bg-center h-[50vh] min-h-[400px] flex flex-col items-center justify-center text-center text-white" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto-format&fit=crop&w=1600&q=80')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        
        {/* ✅ Added pb-16 to lift text higher inside the hero */}
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
        {/* ✅ Search Bar - Negative margin pulls it onto the hero image */}
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
            {/* 1. Top Agents - Now immediately visible due to reduced Hero height */}
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

            {/* 4. Trending Properties */}
            <TrendingProperties />

            {/* 5. Popular Searches */}
            <section className="py-12 px-6">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center mb-12">Popular Searches</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {emphasizedKeywords.property.map((search) => (
                    <Link key={search.path} to={search.path} className="block font-semibold text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 hover:shadow-lg transition-all dark:text-gray-200">
                      {search.name}
                    </Link>
                  ))}
                </div>
              </div>
            </section>

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
                
                {/* 1. The New Route for Demand-Side pSEO */}
                <Route path="/wanted/:slug" element={<WantedRequestPage />} />

                {/* 2. Community Insights (pSEO Loop) */}
                <Route path="/community" element={<CommunityHub />} />
                <Route path="/share-insight" element={<ShareInsight />} />
                <Route path="/community/:slug" element={<CommunityPost />} />

                {/* 3. Services Directory Routes */}
                <Route path="/services" element={<Services />} />
                {/* ✅ ROUTE FOR SINGLE SERVICE PROVIDER */}
                <Route path="/services/:slug" element={<ServiceProviderDetails />} />

                {/* ✅ 4. ADMIN: Add & Edit Service Provider Routes */}
                <Route path="/admin/add-service-provider" element={<AddServiceProvider />} />
                {/* ✅ ADDED: Edit Route */}
                <Route path="/admin/edit-service-provider/:id" element={<EditServiceProvider />} />

                {/* 5. pSEO SEARCH ROUTE (Matches Sitemap) */}
                <Route path="/search/:listingType/:location" element={<SearchPageWrapper />} />

                {/* 6. Fallback to Existing Config for all other routes */}
                <Route path="*" element={<AppRoutesConfig homeElement={HomePageElement} />} />
            
            </Routes>
        </AnimatePresence>
      </Suspense>

      <AppFooter />
      <ChatBubble />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <MainLayout />
    </Router>
  )
}

export default App;