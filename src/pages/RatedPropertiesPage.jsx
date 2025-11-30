import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaMapMarkerAlt, FaHome, FaShieldAlt } from 'react-icons/fa';
// ✅ Import the shared component
import CommunityPostCard from '../components/Community/CommunityPostCard'; 

const RatedPropertiesPage = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatedProperties = async () => {
      try {
        // SIMULATION: Properties with associated Community Posts
        setTimeout(() => {
          setProperties([
            {
              id: 1,
              title: "Serene Heights Apartment",
              location: "Kilimani, Nairobi",
              rating: 4.8,
              reviews: 24,
              price: "Ksh 85,000",
              image: "https://placehold.co/600x400?text=Apartment+1",
              badges: ["Verified Landlord", "Top Rated"],
              // ✅ DATA STRUCTURE MATCHING CommunityPostCard PROP
              featuredPost: {
                _id: "post_101",
                authorAlias: "Resident (Verified)",
                content: "The water pressure here is amazing compared to my last place. Security is tight, they call before letting guests in.",
                category: "Living Experience",
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
                neighborhood: "Kilimani"
              }
            },
            {
              id: 2,
              title: "Greenwood Estate Villa",
              location: "Runda, Nairobi",
              rating: 4.5,
              reviews: 12,
              price: "Ksh 250,000",
              image: "https://placehold.co/600x400?text=Villa+2",
              badges: ["Verified"],
              featuredPost: {
                _id: "post_102",
                authorAlias: "Tenant #402",
                content: "Beautiful compound and very quiet. The only downside is the garbage collection truck comes super early on Tuesdays.",
                category: "Question", // Using 'Question' or standard categories for color mapping
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
                neighborhood: "Runda"
              }
            },
            {
              id: 3,
              title: "Sunny Side Studio",
              location: "Westlands, Nairobi",
              rating: 3.9,
              reviews: 8,
              price: "Ksh 45,000",
              image: "https://placehold.co/600x400?text=Studio+3",
              badges: [],
              featuredPost: {
                _id: "post_103",
                authorAlias: "Student Explorer",
                content: "Perfect for students. Walking distance to the mall. It gets a bit noisy on weekends due to the club nearby.",
                category: "Security Alert", // Using Alert for visual distinctiveness
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
                neighborhood: "Westlands"
              }
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setLoading(false);
      }
    };

    fetchRatedProperties();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 pt-10">
      <div className="container mx-auto px-6 md:px-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2">
            Rated Properties <span className="text-green-600">★</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse properties with verified tenant reviews and ratings.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-[500px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          /* Property Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div key={property.id} className="flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-full">
                
                {/* 1. PROPERTY SECTION (Clickable Link) */}
                <Link to={`/property/${property.id}`} className="group block">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={property.image} 
                      alt={property.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                      <FaStar className="text-yellow-400" size={12} />
                      <span className="text-xs font-bold text-gray-800 dark:text-white">{property.rating}</span>
                      <span className="text-[10px] text-gray-500">({property.reviews})</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="px-5 pt-5 pb-2">
                    <div className="mb-3">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mt-1">
                        <FaMapMarkerAlt size={12} />
                        {property.location}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.badges.map((badge, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                          <FaShieldAlt size={10} /> {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>

                {/* 2. COMMUNITY POST INTEGRATION (The Actual Card) */}
                <div className="px-4 pb-4 mt-auto">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                    Featured Insight
                  </div>
                  {/* We scale it down slightly (95%) to fit nicely inside the property card */}
                  <div className="transform scale-[0.98] origin-top">
                     <CommunityPostCard post={property.featuredPost} />
                  </div>
                </div>

                {/* Footer Price */}
                <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                  <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                    {property.price} <span className="text-xs text-gray-400 font-normal">/mo</span>
                  </p>
                  <Link to={`/property/${property.id}`} className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors">
                    View Property &rarr;
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

        {!loading && properties.length === 0 && (
          <div className="text-center py-20">
            <FaHome className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No Rated Properties Yet</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatedPropertiesPage;