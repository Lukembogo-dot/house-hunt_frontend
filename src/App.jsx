import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import PropertyList from "./components/PropertyList";
import About from "./pages/About";
import Buy from "./pages/Buy";
import Rent from "./pages/Rent";
import Contact from "./pages/Contact";
import PropertyDetails from "./pages/PropertyDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import AddProperty from './pages/AddProperty';
import EditProperty from "./pages/EditProperty";
import { useAuth } from "./context/AuthContext";
import ProfileDropdown from "./components/ProfileDropdown";
// ✅ 1. Import FaWhatsapp
import { FaBars, FaTimes, FaWhatsapp } from "react-icons/fa"; 
import ThemeToggle from "./components/ThemeToggle";
import AgentRoute from "./components/AgentRoute";
import MyProfile from "./pages/MyProfile";
import EditProfileSettings from "./pages/EditProfileSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import AgentPublicProfile from "./pages/AgentPublicProfile";
import ScrollToTop from "./components/ScrollToTop";
import { AnimatePresence, motion } from "framer-motion";
import TrendingProperties from "./components/TrendingProperties";
import SearchBar from "./components/SearchBar";
import ChatBubble from "./components/ChatBubble";
import NotificationBell from "./components/NotificationBell";

// Chat components
import ChatPage from './pages/ChatPage';
import MessageStream from './components/MessageStream';
import ChatPlaceholder from './components/ChatPlaceholder';

// Password Reset components
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// ✅ 1. Import new Email Verification component
import VerifyEmail from './pages/VerifyEmail';
// ✅ 3. Import new SEO Manager component
import SEOManager from './pages/SEOManager'; 
import TopAgents from "./components/TopAgents"; // ✅ 1. Import new component

// ✅ --- 1. IMPORT THE NEW COMPONENTS ---
import NeighbourhoodWatchHome from "./components/NeighbourhoodWatchHome";
import ServicePostDetails from "./pages/ServicePostDetails";
import AdminAddService from "./pages/AdminAddService"; // ✅ --- ADD THIS IMPORT ---

// --- 1. IMPORT NEW LEGAL PAGES ---
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
// ---------------------------------


function AppRoutes() {
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const navigate = useNavigate();

  const canListProperty = user && (user.role === 'admin' || user.role === 'agent');
  const location = useLocation();

  const [homeFilters, setHomeFilters] = useState({
    location: "",
    type: "",
    minPrice: "",
    maxPrice: "",
  });
  const [submittedHomeFilters, setSubmittedHomeFilters] = useState(null);

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
      <div className="min-h-screen flex flex-col font-inter scroll-smooth bg-gray-50 dark:bg-gray-950">

        {/* ================= HEADER ================= */}
        <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">

          <div className="relative z-40 container mx-auto px-6 md:px-10 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🏠</span>
              <Link to="/" className="text-2xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight">
                HouseHunt Kenya
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-10 text-gray-700 dark:text-gray-300 font-medium">
              <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Home</Link>
              <Link to="/buy" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Buy</Link>
              <Link to="/rent" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Rent</Link>
              <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition">About</Link>
              <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Contact</Link>
            </nav>
            
            {/* --- ✅ DESKTOP ICON SPACING CHANGED TO space-x-3 --- */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              {loading ? (
                <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              ) : user ? (
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
            
            {/* --- ✅ MOBILE ICON SPACING CHANGED TO space-x-3 --- */}
            <div className="md:hidden flex items-center space-x-3">
              <ThemeToggle />
              {user && !loading && <NotificationBell />}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                aria-label="Toggle menu"
              >
                {/* --- ✅ ICON SIZE CHANGED TO 22 --- */}
                {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
              </button>
            </div>
          </div>

          {/* ================= MOBILE MENU ================= */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-50">
              <nav className="flex flex-col p-6 space-y-4">
                <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={closeMobileMenu}>Home</Link>
                <Link to="/buy" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={closeMobileMenu}>Buy</Link>
                <Link to="/rent" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={closeMobileMenu}>Rent</Link>
                <Link to="/about" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={closeMobileMenu}>About</Link>
                <Link to="/contact" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={closeMobileMenu}>Contact</Link>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
                  {loading ? (
                    <div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                  ) : user ? (
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

                      {user.role === 'admin' && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            className="block font-bold text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 transition"
                            onClick={closeMobileMenu}
                          >
                            Admin Dashboard
                          </Link>
                          {/* ✅ 4. ADD SEO MANAGER LINK TO MOBILE MENU */}
                          <Link
                            to="/admin/seo-manager"
                            className="block font-bold text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 transition"
                            onClick={closeMobileMenu}
                          >
                            SEO Manager
                          </Link>
                          
                          {/* --- HERE IS THE NEW LINK --- */}
                          <Link
                            to="/admin/dashboard#feature-flags"
                            className="block font-bold text-purple-600 dark:text-purple-500 hover:text-purple-800 dark:hover:text-purple-400 transition"
                            onClick={closeMobileMenu}
                          >
                            Feature Flags
                          </Link>
                          {/* ----------------------------- */}
                        </>
                      )}

                      {canListProperty && (
                        <Link
                          to="/add-property"
                          className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          onClick={closeMobileMenu}
                        >
                          List Property
                        </Link>
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

        {/* ================= ROUTES ================= */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>

            <Route path="/" element={
              <>
                <section id="home" className="relative bg-cover bg-center h-[80vh] flex flex-col items-center justify-center text-center text-white" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto-format&fit=crop&w=1600&q=80')" }}>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
                  <div className="relative z-10 px-6 max-w-3xl">

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

                  <section className="pt-12 px-6">
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
                      <section className="py-20 px-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
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
                      <TopAgents /> {/* ✅ 2. Add TopAgents here */}
                      <TrendingProperties />
                    </>
                  ) : (
                    // DEFAULT VIEW
                    <>
                      <TopAgents /> {/* ✅ 3. Add TopAgents here */}
                      <TrendingProperties />
                      <section className="py-20 px-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
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
                      {/* ✅ --- 2. ADD THE NEW COMPONENT TO THE HOME PAGE --- */}
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
            
            {/* ✅ --- THIS ROUTE IS NOW UPDATED --- ✅ */}
            <Route path="/properties/:slug" element={<PropertyDetails />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/agent/:agentId" element={<AgentPublicProfile />} />
            
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* ✅ 2. ADD THE VERIFY EMAIL ROUTE */}
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* ✅ --- 3. ADD THE NEW DYNAMIC ROUTE FOR SERVICE POSTS --- */}
            <Route path="/services/:slug" element={<ServicePostDetails />} />

            {/* --- 2. ADD NEW LEGAL ROUTES --- */}
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            {/* --------------------------------- */}


            {/* Protected Routes */}
            <Route path="" element={<ProtectedRoute />}>
              <Route path="/profile" element={<MyProfile />} />
              <Route path="/profile/edit" element={<EditProfileSettings />} />
              
              <Route path="/chat" element={<ChatPage />}>
                <Route index element={<ChatPlaceholder />} />
                <Route path=":id" element={<MessageStream />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route path="" element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              {/* ✅ 5. ADD THE SEO MANAGER ROUTE */}
              <Route path="/admin/seo-manager" element={<SEOManager />} />
              {/* ✅ --- ADD THIS ROUTE --- */}
              <Route path="/admin/add-service" element={<AdminAddService />} /> 
              <Route path="/admin/add-service/:id" element={<AdminAddService />} /> 
            </Route>

            {/* Agent Routes */}
            <Route path="" element={<AgentRoute />}>
              <Route path="/add-property" element={<AddProperty />} />
              <Route path="/admin/property/:id/edit" element={<EditProperty />} />
            </Route>
          </Routes>
        </AnimatePresence>

        {/* ================= FOOTER ================= */}
        <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 py-12 border-t border-gray-800 dark:border-gray-900">
          {/* ✅ 2. Change grid to 4 columns on desktop, 2 on tablet */}
          <div className="container mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
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
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
              {/* --- 3. UPDATE FOOTER LINKS --- */}
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms-of-service" className="hover:text-blue-400 transition">Terms of Service</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-blue-400 transition">Privacy Policy</Link></li>
              </ul>
              {/* ------------------------------- */}
            </div>
            {/* ✅ 3. Add new Contact column */}
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