// src/pages/LivingCommunityFeed.jsx
import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaBullhorn, FaMapMarkerAlt } from 'react-icons/fa';
import apiClient from '../utils/apiClient';
import CommunityPostCard from '../components/Community/CommunityPostCard'; 
import BuildingReviewsSection from '../components/Community/BuildingReviewsSection'; 
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SeoInjector from '../components/SeoInjector'; // ✅ IMPORT

const LivingCommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [neighborhood, setNeighborhood] = useState('');
  const [category, setCategory] = useState('');
  const [buildingName, setBuildingName] = useState('');

  // SEO State
  const [seoConfig, setSeoConfig] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // 1. Sync State with URL & Generate Dynamic SEO
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlNeighborhood = searchParams.get('neighborhood');
    const urlBuilding = searchParams.get('buildingName');

    if (urlNeighborhood) setNeighborhood(urlNeighborhood);
    if (urlBuilding) setBuildingName(decodeURIComponent(urlBuilding));
    else setBuildingName('');

    // ✅ GENERATE DYNAMIC SEO CONFIG
    const title = urlBuilding
        ? `${urlBuilding} Reviews & Photos in ${urlNeighborhood || 'Nairobi'} | HouseHunt`
        : urlNeighborhood 
            ? `Living in ${urlNeighborhood}: Reviews, Security & Alerts | HouseHunt`
            : 'Living Experience Feed: Real-time Neighborhood Updates';

    const desc = urlBuilding
        ? `Read verified tenant reviews for ${urlBuilding}. Check water reliability, internet speed, and security ratings before you move.`
        : `Join the ${urlNeighborhood || 'Nairobi'} community. See real-time security alerts, water updates, and apartment reviews.`;

    setSeoConfig({
        metaTitle: title,
        metaDescription: desc,
        pagePath: `/living-feed${location.search}`, // Unique path for every filter combination
        schemaDescription: desc
    });

  }, [location]);

  // 2. Fetch Data
  useEffect(() => {
    if (buildingName) return; 

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (neighborhood) params.append('neighborhood', neighborhood);
        if (category && category !== 'All') params.append('category', category);

        const { data } = await apiClient.get(`/living-community/posts?${params.toString()}`);
        setPosts(data);
      } catch (error) {
        console.error("Error fetching community feed:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => fetchPosts(), 500);
    return () => clearTimeout(timeoutId);
  }, [neighborhood, category, buildingName]);

  const handleBackToFeed = () => {
    navigate(`/living-feed?neighborhood=${neighborhood || ''}`);
  };

  const handleSwitchBuilding = (newName) => {
    navigate(`/living-feed?neighborhood=${neighborhood || ''}&buildingName=${encodeURIComponent(newName)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      
      {/* ✅ INJECT DYNAMIC SEO */}
      {seoConfig && <SeoInjector seo={seoConfig} />}

      {/* --- HERO HEADER --- */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-12 px-6 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            {buildingName ? 'Building Insights' : 'Living Experience Feed'}
          </h1>
          <p className="text-blue-100 text-sm md:text-base">
            {buildingName 
                ? `Verified reviews for ${buildingName}`
                : 'Real-time updates, security alerts, and reviews from verified residents.'}
          </p>
          
          <div className="mt-6 flex justify-center">
            <Link 
              to="/profile" 
              className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold text-sm hover:bg-blue-50 transition shadow-lg flex items-center gap-2 transform hover:-translate-y-1"
            >
              <FaBullhorn /> {buildingName ? 'Review this Building' : 'Post Update'}
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 -mt-8 relative z-20">
        
        {buildingName ? (
            <BuildingReviewsSection 
                buildingName={buildingName}
                neighborhood={neighborhood}
                onBack={handleBackToFeed}
                onSwitchBuilding={handleSwitchBuilding}
            />
        ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Filters */}
              <div className="lg:w-1/4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 sticky top-24 border border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <FaFilter className="text-blue-500" /> Filter Feed
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Neighborhood</label>
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400 text-xs" />
                        <input 
                          type="text"
                          placeholder="e.g. Kilimani"
                          className="w-full pl-9 p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                          value={neighborhood}
                          onChange={(e) => {
                              setNeighborhood(e.target.value);
                              if (!e.target.value) handleBackToFeed();
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Topic</label>
                      <select 
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none dark:text-white focus:ring-2 focus:ring-blue-500"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="All">All Topics</option>
                        <option>Security Alert</option>
                        <option>Water/Power Status</option>
                        <option>General</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feed */}
              <div className="lg:w-2/4">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-48 animate-pulse shadow-sm border border-gray-100 dark:border-gray-700"></div>
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  <div>
                    <div className="mb-4 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FaMapMarkerAlt /> Latest Updates
                      </span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full font-bold">
                        {posts.length} Posts
                      </span>
                    </div>
                    <div className="space-y-6">
                      {posts.map(post => (
                        <CommunityPostCard key={post._id} post={post} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">No updates found</h3>
                    <p className="text-gray-500 text-sm mt-1">Be the first to post about {neighborhood || 'this area'}!</p>
                  </div>
                )}
              </div>

              {/* Promo */}
              <div className="hidden lg:block lg:w-1/4">
                 <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg sticky top-24">
                    <h4 className="font-bold mb-2 text-lg">Earn Mtaa Points</h4>
                    <p className="text-sm opacity-90 mb-4">Post helpful updates to level up your Resident Passport.</p>
                    <Link to="/profile" className="block text-center bg-white/20 backdrop-blur-md border border-white/30 text-white py-2 rounded-lg font-bold text-sm hover:bg-white hover:text-purple-600 transition">
                      Check My Level
                    </Link>
                 </div>
              </div>

            </div>
        )}

      </div>
    </div>
  );
};

export default LivingCommunityFeed;