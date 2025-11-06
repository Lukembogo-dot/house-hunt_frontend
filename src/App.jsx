import React, { useState } from "react";
// ✅ 1. Import useLocation
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
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
import { FaBars, FaTimes } from "react-icons/fa";
import ThemeToggle from "./components/ThemeToggle"; 
import AgentRoute from "./components/AgentRoute"; 
import MyProfile from "./pages/MyProfile"; 
import EditProfileSettings from "./pages/EditProfileSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import AgentPublicProfile from "./pages/AgentPublicProfile";
import ScrollToTop from "./components/ScrollToTop"; 

// ✅ 2. Import AnimatePresence and AnimatedPage
import { AnimatePresence } from "framer-motion";
import AnimatedPage from "./components/AnimatedPage";

// The <Router> is moved to main.jsx, so we just need the App content
// We create a new component to contain the routes for AnimatePresence
function AppRoutes() {
  const { user, loading } = useAuth(); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const canListProperty = user && (user.role === 'admin' || user.role === 'agent');
  
  // ✅ 3. Get the location
  const location = useLocation();

  return (
    <>
      <div className="min-h-screen flex flex-col font-inter scroll-smooth bg-gray-50 dark:bg-gray-950">
        
        {/* ================= HEADER ================= */}
        <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
          {/* ... (Your entire <header>... code is unchanged) ... */}
          <div className="container mx-auto px-6 md:px-10 py-4 flex justify-between items-center">
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
              {user && user.role === 'admin' && (
                <Link to="/admin/dashboard" className="font-bold text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 transition">Admin Dashboard</Link>
              )}
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              {loading ? (
                <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              ) : user ? (
                <ProfileDropdown />
              ) : (
                <Link to="/login" className="font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Login
                </Link>
              )}
              
              {canListProperty && (
                <Link 
                  to="/add-property" 
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-md hover:bg-blue-700 dark:hover:bg-blue-500 transition"
                >
                  List Property
                </Link>
              )}
            </div>
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-40">
              <nav className="flex flex-col p-6 space-y-4">
                <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={closeMobileMenu}>Home</Link>
                <Link to="/buy" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={closeMobileMenu}>Buy</Link>
                <Link to="/rent" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={closeMobileMenu}>Rent</Link>
                <Link to="/about" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={closeMobileMenu}>About</Link>
                <Link to="/contact" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={closeMobileMenu}>Contact</Link>
                
                {user && user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="font-bold text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 transition" onClick={closeMobileMenu}>Admin Dashboard</Link>
                )}
                
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
                  {loading ? (
                    <div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                  ) : user ? (
                    <ProfileDropdown />
                  ) : (
                    <Link 
                      to="/login" 
                      className="block w-full text-center bg-gray-100 dark:bg-gray-700 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 transition"
                      onClick={closeMobileMenu}
                    >
                      Login
                    </Link>
                  )}
                  
                  {canListProperty && (
                    <Link 
                      to="/add-property" 
                      className="block w-full text-center bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-md hover:bg-blue-700 dark:hover:bg-blue-500 transition"
                      onClick={closeMobileMenu}
                    >
                      List Property
                    </Link>
                  )}
                </div>
              </nav>
            </div>
          )}
        </header>

        {/* ================= ROUTES ================= */}
        {/* ✅ 4. Wrap Routes with AnimatePresence */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* ✅ 5. Wrap EVERY route's element in <AnimatedPage> */}
            <Route path="/" element={
              <AnimatedPage>
                <>
                  <section id="home" className="relative bg-cover bg-center h-[80vh] flex flex-col items-center justify-center text-center text-white" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80')" }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
                    <div className="relative z-10 px-6 max-w-3xl">
                      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
                        Find Your Dream Home in Kenya
                      </h1>
                      <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
                        Explore verified listings — from affordable rentals to luxury homes across Kenya.
                      </p>
                    </div>
                  </section>
                  <main id="properties" className="flex-grow">
                    <section className="py-20 px-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                      <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
                          Featured Properties
                        </h2>
                        <PropertyList />
                      </div>
                    </section>
                  </main>
                </>
              </AnimatedPage>
            } />
            <Route path="/buy" element={<AnimatedPage><Buy /></AnimatedPage>} />
            <Route path="/rent" element={<AnimatedPage><Rent /></AnimatedPage>} />
            <Route path="/about" element={<AnimatedPage><About /></AnimatedPage>} />
            <Route path="/contact" element={<AnimatedPage><Contact /></AnimatedPage>} />
            <Route path="/properties/:id" element={<AnimatedPage><PropertyDetails /></AnimatedPage>} />
            <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
            <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
            <Route path="/agent/:agentId" element={<AnimatedPage><AgentPublicProfile /></AnimatedPage>} />
            
            <Route path="" element={<ProtectedRoute />}>
              <Route path="/profile" element={<AnimatedPage><MyProfile /></AnimatedPage>} />
              <Route path="/profile/edit" element={<AnimatedPage><EditProfileSettings /></AnimatedPage>} />
            </Route>
            
            <Route path="" element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AnimatedPage><AdminDashboard /></AnimatedPage>} />
            </Route>

            <Route path="" element={<AgentRoute />}>
              <Route path="/add-property" element={<AnimatedPage><AddProperty /></AnimatedPage>} />
              <Route path="/admin/property/:id/edit" element={<AnimatedPage><EditProperty /></AnimatedPage>} />
            </Route>
          </Routes>
        </AnimatePresence>

        {/* ================= FOOTER ================= */}
        <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 py-12 border-t border-gray-800 dark:border-gray-900">
          {/* ... (Your entire <footer>... code is unchanged) ... */}
          <div className="max-w-6xl mx-auto px-6 grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">HouseHunt</h3>
              <p className="leading-relaxed text-gray-400 dark:text-gray-500">
                Your trusted platform for finding affordable, verified homes across Kenya — simple, fast, and reliable.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><Link to="/buy" className="hover:text-white transition">Buy</Link></li>
                <li><Link to="/rent" className="hover:text-white transition">Rent</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Contact</h3>
              <p>Email: <a href="mailto:support@househunt.co.ke" className="hover:text-white transition">support@househunt.co.ke</a></p>
              <p>Phone: <span className="hover:text-white transition">+254 717 109 971</span></p>
            </div>
          </div>
          <p className="text-center text-gray-500 dark:text-gray-600 mt-12 text-sm tracking-wide">
            © {new Date().getFullYear()} HouseHunt Kenya. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}

// ✅ 6. Main App component now just sets up the Router
function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppRoutes /> {/* All content, including header/footer, is in AppRoutes */}
    </Router>
  )
}

export default App;