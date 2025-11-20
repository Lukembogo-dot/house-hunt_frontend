// src/App.jsx
// (UPDATED: Changed Featured Properties limit to 11)

import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter as Router, Link, useLocation } from "react-router-dom";
import ReactGA from 'react-ga4';
import { AnimatePresence, motion } from "framer-motion";

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

// --- New Layout Components ---
import AppHeader from "./components/layout/AppHeader";
import AppFooter from "./components/layout/AppFooter";
import AppRoutesConfig from "./components/layout/AppRoutesConfig";

// --- Context ---
import { useAuth } from "./context/AuthContext";
import { useFeatureFlag } from "./context/FeatureFlagContext";
import apiClient from "./api/axios";

const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[70vh]">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function MainLayout() {
  const { previewRole } = useAuth(); 
  const isQuizEnabled = useFeatureFlag('neighbourhood-quiz');
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

      {/* HERO */}
      <section id="home" className="relative bg-cover bg-center h-[65vh] min-h-[500px] flex flex-col items-center justify-center text-center text-white" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto-format&fit=crop&w=1600&q=80')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="relative z-10 px-6 max-w-3xl pb-10">
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

            {/* 2. Featured Properties (Moved Up & Limited to 11) */}
            <section className="py-12 px-6 bg-gray-100 dark:bg-gray-900">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Featured Properties</h2>
                {/* ✅ UPDATED: Limit set to 11 */}
                <PropertyList filterOverrides={null} showSearchBar={false} showTitle={false} limit={11} />
              </div>
            </section>
            
            {/* 3. HouseHunt Request (Moved Up) */}
            <HouseHuntRequest />

            {/* 4. Trending Properties (Moved Down) */}
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

            {isQuizEnabled && (
               <section className="py-12 px-6 bg-blue-50 dark:bg-gray-800 border-t dark:border-gray-700 text-center">
                  <h2 className="text-3xl font-extrabold mb-4 dark:text-white">Not Sure Where to Live?</h2>
                  <Link to="/find-my-neighbourhood" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 shadow-lg">Start the Quiz</Link>
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
             <AppRoutesConfig homeElement={HomePageElement} />
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