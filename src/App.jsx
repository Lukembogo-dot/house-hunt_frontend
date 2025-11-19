// App.jsx (UPDATED)

import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import PropertyList from "./components/PropertyList";

// --- 1. Import ReactGA & GlobalSchemaInjector ---
import ReactGA from 'react-ga4';
import GlobalSchemaInjector from './components/GlobalSchemaInjector';

// --- 2. CONVERT ALL PAGE IMPORTS TO React.lazy ---
const About = lazy(() => import("./pages/About"));
const Buy = lazy(() => import("./pages/Buy"));
const Rent = lazy(() => import("./pages/Rent"));
const Contact = lazy(() => import("./pages/Contact"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminRoute = lazy(() => import('./components/AdminRoute'));
const AddProperty = lazy(() => import('./pages/AddProperty'));
const EditProperty = lazy(() => import("./pages/EditProperty"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const EditProfileSettings = lazy(() => import("./pages/EditProfileSettings"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const AgentPublicProfile = lazy(() => import("./pages/AgentPublicProfile"));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const MessageStream = lazy(() => import('./components/MessageStream'));
const ChatPlaceholder = lazy(() => import('./components/ChatPlaceholder'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const SEOManager = lazy(() => import('./pages/SEOManager'));
const NeighbourhoodWatchHome = lazy(() => import("./components/NeighbourhoodWatchHome"));
const ServicePostDetails = lazy(() => import("./pages/ServicePostDetails"));
const AdminAddService = lazy(() => import("./pages/AdminAddService"));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const FeatureManager = lazy(() => import('./pages/FeatureManager'));
const ForAgents = lazy(() => import('./pages/ForAgents'));
const AgentAnalytics = lazy(() => import('./pages/AgentAnalytics'));
const PreviewBanner = lazy(() => import('./components/PreviewBanner'));
const NeighbourhoodQuiz = lazy(() => import('./pages/NeighbourhoodQuiz'));
const DynamicSearchPage = lazy(() => import('./pages/DynamicSearchPage'));
const AgentFinderPage = lazy(() => import('./pages/AgentFinderPage'));
const NeighbourhoodIntelPage = lazy(() => import('./pages/NeighbourhoodIntelPage'));
const CostOfLivingCalculator = lazy(() => import('./pages/CostOfLivingCalculator'));
const CreateIntelPost = lazy(() => import('./pages/CreateIntelPost'));
const AgentDashboard = lazy(() => import('./pages/AgentDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AgentWallet = lazy(() => import('./pages/AgentWallet')); 
const SoldPropertiesPage = lazy(() => import('./pages/SoldPropertiesPage')); 

// ✅ 1. NEW FAQ PAGE IMPORTS
const AdminFaqManager = lazy(() => import('./pages/AdminFaqManager'));
const FaqDetails = lazy(() => import('./pages/FaqDetails'));
const FaqIndex = lazy(() => import('./pages/FaqIndex')); // ✅ NEW: Lazy Load the Hub Page

// --- ADD NEW PAYMENT PAGES ---
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./pages/PaymentCancel'));

// --- Component Imports (These are small, no need to lazy load) ---
import { useAuth } from "./context/AuthContext";
import { useFeatureFlag } from "./context/FeatureFlagContext";
import ProfileDropdown from "./components/ProfileDropdown";
import { FaBars, FaTimes, FaWhatsapp } from "react-icons/fa"; 
import ThemeToggle from "./components/ThemeToggle";
import AgentRoute from "./components/AgentRoute";
import ScrollToTop from "./components/ScrollToTop";
import { AnimatePresence, motion } from "framer-motion";
import TrendingProperties from "./components/TrendingProperties";
import SearchBar from "./components/SearchBar";
import ChatBubble from "./components/ChatBubble";
import NotificationBell from "./components/NotificationBell";
import apiClient from "./api/axios";
import TopAgents from "./components/TopAgents"; 
import HomeFaqSection from "./components/HomeFaqSection"; // ✅ NEW: Import Home Section


// 3. CREATE A LOADING FALLBACK COMPONENT
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[70vh]">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);


function AppRoutes() {
  const { user, loading, logout, realUser, previewRole } = useAuth(); 
  
  const isQuizEnabled = useFeatureFlag('neighbourhood-quiz');
  const isCostCalculatorEnabled = useFeatureFlag('cost-of-living-calculator');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const navigate = useNavigate();

  const canListProperty = user && (user.role === 'admin' || user.role === 'agent');
  const location = useLocation();

  // 4. --- ADD THIS useEffect HOOK FOR GA4 PAGE TRACKING ---
  useEffect(() => {
    // Send a "pageview" event to Google Analytics every time the page changes
    ReactGA.send({ 
      hitType: "pageview", 
      page: location.pathname + location.search, 
      title: document.title // Send the page title (Helmet will update this)
    });
    console.log("GA Pageview Sent:", location.pathname + location.search);
  }, [location]); // This dependency array is key
  // --- END OF NEW CODE ---


  const [homeFilters, setHomeFilters] = useState({
    location: "",
    type: "",
    minPrice: "",
    maxPrice: "",
  });
  const [submittedHomeFilters, setSubmittedHomeFilters] = useState(null);

  const [emphasizedKeywords, setEmphasizedKeywords] = useState({
    property: [],
    agent: [],
    intel: [],
    other: [],
  });

  useEffect(() => {
    const fetchEmphasizedKeywords = async () => {
      try {
        const { data } = await apiClient.get('/seo/emphasized');
        // --- ADDED FALLBACK TO PREVENT CRASH ---
        setEmphasizedKeywords(data || { property: [], agent: [], intel: [], other: [] });
      } catch (error) {
        console.error("Failed to fetch emphasized keywords:", error);
      }
    };
    fetchEmphasizedKeywords();
  }, []);

  const handleHomeFilterChange = (name, value) => {
    setHomeFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleHomeFilterSubmit = () => {
    setSubmittedHomeFilters({ ...homeFilters });
  };

  const handleMobileLogout = async () => {
    await logout();
    navigate('/');
    closeMobileMenu();
  };


  return (
    <>
      <div className="min-h-screen flex flex-col font-inter scroll-smooth bg-gray-50 dark:bg-gray-950 overflow-x-hidden">

        {/* ================= HEADER ================= */}
        <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
          {/* ... (Header is unchanged) ... */}
          <div className="relative z-40 container mx-auto px-6 md:px-10 py-4 flex justify-between items-center">
            
            {/* --- LOGO UPDATE START --- */}
            <div className="flex items-center space-x-3">
              <Link to="/">
                <img 
                  src="/icons/icon-192x192.png" 
                  alt="HouseHunt Kenya Logo" 
                  className="h-10 w-10 object-contain rounded-md"
                />
              </Link>
              <Link to="/" className="text-2xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight">
                HouseHunt Kenya
              </Link>
            </div>
            {/* --- LOGO UPDATE END --- */}

            <nav className="hidden md:flex items-center space-x-10 text-gray-700 dark:text-gray-300 font-medium">
              <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Home</Link>
              <Link to="/buy" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Buy</Link>
              <Link to="/rent" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Rent</Link>
              <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition">About</Link>
              <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Contact</Link>
              
              {!user && (
                <Link 
                  to="/for-agents" 
                  className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow-md transform hover:-translate-y-0.5"
                >
                  List Property
                </Link>
              )}
            </nav>
            
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              {loading ? (
                <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              
              ) : realUser ? ( 
                <>
                  <NotificationBell />
                  <ProfileDropdown />
                </>
              ) : (
                <Link to="/login" className="font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Login
                </Link>
              )}
            </div>
            
            <div className="md:hidden flex items-center space-x-3">
              <ThemeToggle />
              {realUser && !loading && <NotificationBell />} 
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
              </button>
            </div>
          </div>

          {/* ================= MOBILE MENU ================= */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-50">
              {/* ... (Mobile Menu is unchanged) ... */}
              <nav className="flex flex-col p-6 space-y-4">
                <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={closeMobileMenu}>Home</Link>
                <Link to="/buy" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={closeMobileMenu}>Buy</Link>
                <Link to="/rent" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={closeMobileMenu}>Rent</Link>
                <Link to="/about" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={closeMobileMenu}>About</Link>
                <Link to="/contact" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-4Choose-400 transition" onClick={closeMobileMenu}>Contact</Link>

                {!user && (
                  <Link 
                    to="/for-agents" 
                    className="block text-blue-600 dark:text-blue-400 font-bold"
                    onClick={closeMobileMenu}
                  >
                    Partner with Us (Agents)
                  </Link>
                )}

                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
                  {loading ? (
                    <div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                  
                  ) : realUser ? ( 
                    <>
                      <Link
                        to="/profile"
                        className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        onClick={closeMobileMenu}
                      >
                        My Profile
                      </Link>
                      
                      <Link
                        to="/chat"
                        className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        onClick={closeMobileMenu}
                      >
                        My Messages
                      </Link>

                      {user && user.role === 'admin' && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            className="block font-bold text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 transition"
                            onClick={closeMobileMenu}
                          >
                            Admin Dashboard
                          </Link>
                          <Link
                            to="/admin/seo-manager"
                            className="block font-bold text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 transition"
                            onClick={closeMobileMenu}
                          >
                            SEO Manager
                          </Link>
                          <Link
                            to="/admin/feature-manager"
                            className="block font-bold text-purple-600 dark:text-purple-500 hover:text-purple-800 dark:hover:text-purple-400 transition"
                            onClick={closeMobileMenu}
                          >
                            Feature Manager
                          </Link>
                        </>
                      )}
                      
                      {/* ✅ AGENT LINKS */}
                      {canListProperty && (
                        <>
                          <Link
                            to="/agent/dashboard"
                            className="block font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
                            onClick={closeMobileMenu}
                          >
                            My Listings
                          </Link>
                          <Link
                            to="/add-property"
                            className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                            onClick={closeMobileMenu}
                          >
                            List Property
                          </Link>
                        </>
                      )}

                      <button
                        onClick={handleMobileLogout}
                        className="w-full text-left block text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="block w-full text-center bg-gray-100 dark:bg-gray-700 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 transition"
                      onClick={closeMobileMenu}
                    >
                      Login
                    </Link>
                  )}
                </div>
              </nav>
            </div>
          )}
        </header>
        
        {/* --- 5. ADD THE GLOBAL SCHEMA INJECTOR --- */}
        <GlobalSchemaInjector />

        {/* ... (Preview Banner is unchanged) ... */}
        {previewRole && <PreviewBanner />}


        {/* ================= ROUTES ================= */}
        {/* 6. WRAP YOUR ROUTES IN <Suspense> */}
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>

              <Route path="/" element={
                <>
                  {/* ✅ UPDATED HERO SECTION: Reduced height to pull content up */}
                  <section 
                    id="home" 
                    className="relative bg-cover bg-center h-[65vh] min-h-[500px] flex flex-col items-center justify-center text-center text-white" 
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto-format&fit=crop&w=1600&q=80')" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
                    <div className="relative z-10 px-6 max-w-3xl pb-10">

                      <motion.h1
                        className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        Find Your Dream Home in Kenya
                      </motion.h1>

                      <motion.p
                        className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                      >
                        Explore verified listings — from affordable rentals to luxury homes across Kenya.
                      </motion.p>
                    </div>
                  </section>

                  <main id="properties" className="flex-grow">

                    {/* ✅ UPDATED SEARCH SECTION: Negative margin to overlap hero and move up */}
                    <section className="relative z-20 -mt-16 px-6">
                      <div className="max-w-3xl mx-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl px-6 py-4 border border-gray-200 dark:border-gray-700">
                          <SearchBar
                            filters={homeFilters}
                            onChange={handleHomeFilterChange}
                            onFilter={handleHomeFilterSubmit}
                          />
                        </div>
                      </div>
                    </section>

                    {submittedHomeFilters ? (
                      // AFTER SEARCHING
                      <>
                        <section className="py-12 px-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                          <div className="max-w-6xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
                              Search Results
                            </h2>
                            <PropertyList
                              filterOverrides={submittedHomeFilters}
                              showSearchBar={false}
                              showTitle={false}
                            />
                          </div>
                        </section>
                        <TopAgents />
                        <TrendingProperties />
                      </>
                    ) : (
                      // DEFAULT VIEW
                      <>
                        
                        <TopAgents />
                        <TrendingProperties />

                        {/* ... (Popular Searches section) ... */}
                        {/* ✅ UPDATED: Reduced padding from py-20 to py-12 */}
                        <section className="py-12 px-6">
                          <div className="container mx-auto max-w-6xl">
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center mb-12">
                              Popular Searches
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {emphasizedKeywords.property.map((search) => (
                                <Link
                                  key={search.path}
                                  to={search.path}
                                  className="block font-semibold text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg transition-all"
                                >
                                  {search.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </section>

                        {/* ✅ UPDATED: Reduced padding from py-20 to py-12 */}
                        <section className="py-12 px-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                          <div className="max-w-6xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
                              Featured Properties
                            </h2>
                            <PropertyList
                              filterOverrides={null}
                              showSearchBar={false}
                              showTitle={false}
                              limit={20}
                            />
                          </div>
                        </section>

                        {/* --- MOVED SECTIONS: Quiz & Calculator ABOVE NeighbourhoodWatchHome --- */}
                        {isQuizEnabled && (
                          // ✅ UPDATED: Reduced padding to py-12
                          <section className="py-12 px-6 bg-blue-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="max-w-4xl mx-auto text-center">
                              <motion.h2 
                                className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.5 }}
                              >
                                Not Sure Where to Live?
                              </motion.h2>
                              <motion.p 
                                className="text-lg text-gray-600 dark:text-gray-300 mb-8"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                              >
                                Take our 2-minute quiz to discover the perfect Nairobi neighbourhood for your lifestyle and budget.
                              </motion.p>
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                              >
                                <Link
                                  to="/find-my-neighbourhood"
                                  className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg"
                                >
                                  Start the Quiz
                                </Link>
                              </motion.div>
                            </div>
                          </section>
                        )}
                        
                        {isCostCalculatorEnabled && (
                          // ✅ UPDATED: Reduced padding to py-12
                          <section className="py-12 px-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="max-w-4xl mx-auto text-center">
                              <motion.h2 
                                className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.5 }}
                              >
                                Which Neighbourhood is Cheaper?
                              </motion.h2>
                              <motion.p 
                                className="text-lg text-gray-600 dark:text-gray-300 mb-8"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                              >
                                Use our calculator to compare average rent, services, and lifestyle costs side-by-side.
                              </motion.p>
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                              >
                                <Link
                                  to="/tools/cost-of-living"
                                  className="inline-block bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-green-700 transition-transform hover:scale-105 shadow-lg"
                                >
                                  Compare Now
                                </Link>
                              </motion.div>
                            </div>
                          </section>
                        )}

                        {/* ✅ INSERT THE FAQ SECTION HERE */}
                        <HomeFaqSection />

                        <NeighbourhoodWatchHome />

                      </>
                    )}
                  </main>
                </>
              } />

              {/* Public Routes */}
              <Route path="/buy" element={<Buy />} />
              <Route path="/rent" element={<Rent />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/properties/:slug" element={<PropertyDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/agent/:agentId" element={<AgentPublicProfile />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/services/:slug" element={<ServicePostDetails />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/for-agents" element={<ForAgents />} />
              <Route path="/find-my-neighbourhood" element={<NeighbourhoodQuiz />} />
              <Route path="/tools/cost-of-living" element={<CostOfLivingCalculator />} />
              
              {/* pSEO Routes */}
              <Route path="/search/:listingType/:propertyType/:location/:bedrooms" element={<DynamicSearchPage />} />
              <Route path="/search/:listingType/:propertyType/:location" element={<DynamicSearchPage />} />
              <Route path="/search/:listingType/:location" element={<DynamicSearchPage />} />
              <Route path="/search/:listingType" element={<DynamicSearchPage />} />
              <Route path="/agents" element={<AgentFinderPage />} />
              <Route path="/agents/:location" element={<AgentFinderPage />} />
              <Route path="/neighbourhood/:location/:topic" element={<NeighbourhoodIntelPage />} />
              <Route path="/neighbourhood/:location" element={<NeighbourhoodIntelPage />} />
              
              {/* ✅ 2. ADD NEW ARCHIVE ROUTE FOR pSEO (e.g. /sold/kilimani) */}
              <Route path="/:status/:location" element={<SoldPropertiesPage />} />
              
              {/* ✅ 2. NEW: PUBLIC ROUTE FOR FAQ INDEX (THE HUB) */}
              <Route path="/faqs" element={<FaqIndex />} />

              {/* ✅ 2. PUBLIC ROUTE FOR FAQ SINGLE (THE SPOKE) */}
              <Route path="/faq/:slug" element={<FaqDetails />} />

              {/* Protected Routes */}
              <Route path="" element={<ProtectedRoute />}>
                <Route path="/profile" element={<MyProfile />} />
                <Route path="/profile/edit" element={<EditProfileSettings />} />
                <Route path="/create-intel-post" element={<CreateIntelPost />} />
                <Route path="/chat" element={<ChatPage />}>
                  <Route index element={<ChatPlaceholder />} />
                  <Route path=":id" element={<MessageStream />} />
                </Route>

                {/* --- 7. ADD NEW PAYMENT ROUTES --- */}
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancel" element={<PaymentCancel />} />
              </Route>

              {/* Admin Routes */}
              <Route path="" element={<AdminRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/seo-manager" element={<SEOManager />} />
                {/* ✅ 2. ADMIN ROUTE FOR FAQ MANAGER */}
                <Route path="/admin/faq-manager" element={<AdminFaqManager />} />
                <Route path="/admin/feature-manager" element={<FeatureManager />} />
                <Route path="/admin/add-service" element={<AdminAddService />} />
                <Route path="/admin/add-service/:id" element={<AdminAddService />} />
              </Route>

              {/* Agent Routes */}
              <Route path="" element={<AgentRoute />}>
                {/* ✅ 2. ADD NEW AGENT ROUTES */}
                <Route path="/agent/dashboard" element={<AgentDashboard />} />
                <Route path="/agent/wallet" element={<AgentWallet />} /> {/* <-- NEW WALLET ROUTE */}
                
                <Route path="/add-property" element={<AddProperty />} />
                <Route path="/admin/property/:id/edit" element={<EditProperty />} />
                <Route path="/profile/analytics" element={<AgentAnalytics />} />
              </Route>

              {/* --- 8. ADD 404 CATCH-ALL ROUTE --- */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </AnimatePresence>
        </Suspense>

        {/* ================= FOOTER ================= */}
        <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 py-12 border-t border-gray-800 dark:border-gray-900">
          {/* ... (Footer is unchanged) ... */}
          <div className="container mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">HouseHunt Kenya</h3>
              <p className="text-sm">Finding your next home, simplified. Explore hundreds of verified listings for sale and rent.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/buy" className="hover:text-blue-400 transition">Buy</Link></li>
                <li><Link to="/rent" className="hover:text-blue-400 transition">Rent</Link></li>
                <li><Link to="/about" className="hover:text-blue-400 transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400 transition">Contact</Link></li>
              </ul>
            </div>
            
            {/* ... (Dynamic Footer Columns are unchanged) ... */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Popular Searches</h3>
              <ul className="space-y-2 text-sm">
                {emphasizedKeywords.property.slice(0, 4).map((search) => (
                  <li key={search.path}>
                    <Link
                      to={search.path}
                      className="hover:text-blue-400 transition"
                    >
                      {search.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Find Agents</h3>
              <ul className="space-y-2 text-sm">
                {emphasizedKeywords.agent.slice(0, 4).map((search) => (
                  <li key={search.path}>
                    <Link
                      to={search.path}
                      className="hover:text-blue-400 transition"
                    >
                      {search.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Neighbourhoods</h3>
              <ul className="space-y-2 text-sm">
                {emphasizedKeywords.intel.slice(0, 4).map((search) => (
                  <li key={search.path}>
                    <Link
                      to={search.path}
                      className="hover:text-blue-400 transition"
                    >
                      {search.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms-of-service" className="hover:text-blue-400 transition">Terms of Service</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-blue-400 transition">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:support@househuntkenya.co.ke" className="hover:text-blue-400 transition">
                    support@househuntkenya.co.ke
                  </a>
                </li>
                <li>
                  <a 
                    href="https://wa.me/254776929021" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center md:justify-start space-x-2 hover:text-green-400 transition"
                  >
                    <FaWhatsapp />
                    <span>WhatsApp</span>
                  </a>
                </li>
                <li className="text-gray-400 pt-1">
                  +254 776 929 021
                </li>
              </ul>
            </div>
          </div>
          <div className="container mx-auto px-6 md:px-10 text-center mt-8 border-t border-gray-700 pt-6">
            <p className="text-sm">&copy; {new Date().getFullYear()} HouseHunt Kenya. All rights reserved.</p>
          </div>
        </footer>

        <ChatBubble />

      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppRoutes />
    </Router>
  )
}

export default App;