import React, { useEffect, useState } from 'react';
import { FaBuilding, FaStar, FaArrowLeft, FaMapMarkerAlt, FaBullhorn, FaSpinner, FaCity } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import apiClient from '../../utils/apiClient';
// We use the existing card you have
import BuildingReviewCard from './BuildingReviewCard'; 

const BuildingReviewsSection = ({ buildingName, neighborhood, onBack, onSwitchBuilding }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Reviews for this building
        const { data: reviewData } = await apiClient.get(`/living-community/experience?buildingName=${encodeURIComponent(buildingName)}`);
        setReviews(reviewData);

        // 2. Fetch Aggregate Stats & Neighbors
        const { data: buildings } = await apiClient.get(`/living-community/search-buildings?query=${neighborhood || buildingName}`);
        
        // Find current building stats
        const match = buildings.find(b => b.name.toLowerCase() === buildingName.toLowerCase());
        if (match) setStats(match);

        // Filter for neighbors (excluding current)
        setNearby(buildings.filter(b => b.name.toLowerCase() !== buildingName.toLowerCase()).slice(0, 5));

      } catch (error) {
        console.error("Error loading building data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (buildingName) fetchData();
  }, [buildingName, neighborhood]);

  return (
    <div className="animate-fade-in w-full">
      
      {/* --- HEADER: Building Profile --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 relative overflow-hidden">
         {/* Back Button */}
         <button onClick={onBack} className="absolute top-4 left-4 text-gray-400 hover:text-blue-600 flex items-center gap-1 text-xs font-bold transition">
            <FaArrowLeft /> Back to Feed
         </button>

         <div className="flex flex-col items-center text-center mt-2">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-3 text-blue-600 dark:text-blue-300 text-2xl">
                <FaCity />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{buildingName}</h2>
            <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
                <FaMapMarkerAlt /> {neighborhood || 'Nairobi'}
            </p>

            {/* Stats Bar */}
            <div className="flex gap-8 border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold text-xl">
                        {stats?.avgRating || '-'} <FaStar />
                    </div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Avg Rating</span>
                </div>
                <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
                <div className="text-center">
                    <div className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                        {reviews.length}
                    </div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Verified Reviews</span>
                </div>
            </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
          
          {/* --- LEFT: REVIEWS LIST --- */}
          <div className="flex-1">
             <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                User Reviews
             </h3>
             
             {loading ? (
                <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-blue-500" /></div>
             ) : reviews.length > 0 ? (
                reviews.map(review => (
                    <BuildingReviewCard key={review._id} review={review} />
                ))
             ) : (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-gray-500 mb-2">No reviews yet.</p>
                    <Link 
                      to="/profile?action=add_review" 
                      state={{ prefillBuilding: buildingName }}
                      className="text-blue-600 font-bold hover:underline"
                    >
                       Be the first to review!
                    </Link>
                </div>
             )}
          </div>

          {/* --- RIGHT: SIDEBAR (Neighbors & Link to Feed) --- */}
          <div className="md:w-1/3 space-y-6">
              
              {/* Link to Area Feed */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-900/50">
                 <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-2">
                    Living in {neighborhood}?
                 </h4>
                 <p className="text-blue-700 dark:text-blue-300 text-xs mb-3 leading-relaxed">
                    Check security alerts, water updates, and events for the whole neighborhood.
                 </p>
                 <button 
                    onClick={onBack}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-md transition"
                 >
                    <FaBullhorn /> View {neighborhood} Feed
                 </button>
              </div>

              {/* Nearby Buildings */}
              {nearby.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
                      <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-3">Nearby Buildings</h4>
                      <ul className="space-y-3">
                          {nearby.map(b => (
                              <li key={b._id}>
                                  <button 
                                      onClick={() => onSwitchBuilding(b.name)}
                                      className="flex justify-between w-full text-left text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600 transition group"
                                  >
                                      <span className="group-hover:translate-x-1 transition-transform">{b.name}</span>
                                      <span className="text-yellow-500 flex items-center gap-1">{b.avgRating || '-'} <FaStar className="text-[10px]" /></span>
                                  </button>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default BuildingReviewsSection;