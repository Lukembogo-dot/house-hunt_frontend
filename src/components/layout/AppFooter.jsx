// src/components/layout/AppFooter.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa'; // ✅ Added FaMapMarkerAlt
import apiClient from '../../api/axios';

const AppFooter = () => {
  const [emphasizedKeywords, setEmphasizedKeywords] = useState({ property: [], agent: [], intel: [], other: [] });

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const { data } = await apiClient.get('/seo/emphasized');
        setEmphasizedKeywords(data || { property: [], agent: [], intel: [], other: [] });
      } catch (error) { console.error("Footer keywords error:", error); }
    };
    fetchKeywords();
  }, []);

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 py-12 border-t border-gray-800 dark:border-gray-900">
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
            
            {/* ✅ Added Community Links */}
            <li><Link to="/community" className="hover:text-blue-400 transition">Community Stories</Link></li>
            <li><Link to="/share-insight" className="hover:text-blue-400 transition">Write a Review</Link></li>
            
            <li><Link to="/about" className="hover:text-blue-400 transition">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400 transition">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Popular Searches</h3>
          <ul className="space-y-2 text-sm">
            {emphasizedKeywords.property.slice(0, 4).map((search) => (
              <li key={search.path}><Link to={search.path} className="hover:text-blue-400 transition">{search.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Find Agents</h3>
          <ul className="space-y-2 text-sm">
            {emphasizedKeywords.agent.slice(0, 4).map((search) => (
              <li key={search.path}><Link to={search.path} className="hover:text-blue-400 transition">{search.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Neighbourhoods</h3>
          <ul className="space-y-2 text-sm">
            {emphasizedKeywords.intel.slice(0, 4).map((search) => (
              <li key={search.path}><Link to={search.path} className="hover:text-blue-400 transition">{search.name}</Link></li>
            ))}
          </ul>
        </div>

        {/* ✅ NEW: GEO CRAWL PATH (Dynamic Locations) */}
        <div>
           <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center md:justify-start gap-2">
              <FaMapMarkerAlt className="text-green-500" /> Browse by Area
           </h3>
           <nav>
             <ul className="space-y-2 text-sm">
               {/* Dynamically list top pSEO paths for crawlers */}
               <li><Link to="/search/rent/kilimani" className="hover:text-green-400 transition">Rent in Kilimani</Link></li>
               <li><Link to="/search/rent/westlands" className="hover:text-green-400 transition">Rent in Westlands</Link></li>
               <li><Link to="/search/sale/karen" className="hover:text-green-400 transition">Buy in Karen</Link></li>
               <li><Link to="/search/rent/juja" className="hover:text-green-400 transition">Rent in Juja</Link></li>
               <li><Link to="/search/rent/roysambu" className="hover:text-green-400 transition">Rent in Roysambu</Link></li>
             </ul>
           </nav>
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
            <li><a href="mailto:support@househuntkenya.co.ke" className="hover:text-blue-400 transition">support@househuntkenya.co.ke</a></li>
            <li><a href="https://wa.me/254776929021" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start space-x-2 hover:text-green-400 transition"><FaWhatsapp /><span>WhatsApp</span></a></li>
            <li className="text-gray-400 pt-1">+254 776 929 021</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 md:px-10 text-center mt-8 border-t border-gray-700 pt-6">
        <p className="text-sm">&copy; {new Date().getFullYear()} HouseHunt Kenya. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default AppFooter;