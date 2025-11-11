// src/pages/AgentPublicProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'; // ✅ 1. Import new hooks
import apiClient from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import { 
  FaComments, 
  FaStar,
  FaUserSlash, // 1. IMPORT THE 'USER SLASH' ICON
  FaPhone     // <-- 1. IMPORT THE NEW ICON
} from 'react-icons/fa'; // ✅ 2. Import FaComments, remove FaWhatsapp
import AgentReviews from '../components/AgentReviews';
import { useAuth } from '../context/AuthContext'; // ✅ 3. Import your auth hook
import { useFeatureFlag } from '../context/FeatureFlagContext.jsx'; // <-- 1. IMPORT THE HOOK

// --- START: FIX FOR STARRATING ---
// Star Rating Display Component
const StarRating = ({ rating, count }) => {
  // 1. Default and validate the rating
  const safeRating = Number(rating) || 0;

  // 2. Clamp values between 0 and 5 (ensures rating isn't > 5 or negative)
  const clampedRating = Math.max(0, Math.min(5, safeRating));

  // 3. Calculate stars based on the safe, clamped value
  const fullStars = Math.floor(clampedRating);
  const halfStar = clampedRating % 1 >= 0.5;
  
  // 4. Ensure emptyStars can never be a negative number
  const emptyStars = Math.max(0, 5 - fullStars - (halfStar ? 1 : 0));

  return (
    <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className="text-yellow-400" />)}
        {halfStar && <FaStar key="half" className="text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => <FaStar key={`empty-${i}`} className="text-gray-300" />)}
      </div>
      {count > 0 && (
        <span className="text-sm">
          ({count} review{count > 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
};
// --- END: FIX FOR STARRATING ---


const AgentPublicProfile = () => {
  const { agentId } = useParams();
  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 4. Get auth state and navigation tools
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // <-- 2. CALL THE HOOK TO CHECK THE FLAG'S STATUS -->
  const isCallButtonEnabled = useFeatureFlag('agent-call-button');

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        // 1. Get the agent's public info (this now includes 'about', 'rating', and 'voiceCallNumber')
        const agentRes = await apiClient.get(`/users/${agentId}/public`);
        setAgent(agentRes.data);

        // 2. Get all properties for that agent
        const propertiesRes = await apiClient.get(`/properties/by-agent/${agentId}`);
        setProperties(propertiesRes.data);

      } catch (error) {
        console.error("Error fetching agent data:", error);
        // If API returns 404, 'agent' will remain null
      } finally {
        setLoading(false);
      }
    };
    fetchAgentData();
  }, [agentId]);

  // ✅ 5. Create the redirect handler
  const handleLoginRedirect = () => {
    // Save the current page location so we can redirect back after login
    navigate('/login', { state: { from: location } });
  };

  // --- FIX FOR NULL ERROR ---

  // 1. Handle the loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xl dark:text-white ml-4">Loading agent profile...</p>
      </div>
    );
  }

  // 2. --- UPDATED FOR DELETED AGENT ---
  // This block now catches if the agent wasn't found (i.e., deleted)
  // and displays a user-friendly 'Not Found' page.
  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-lg shadow-xl border dark:border-gray-700">
          <FaUserSlash className="text-gray-400 dark:text-gray-500 text-6xl mb-4 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Agent Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            The agent you are looking for may have been removed or the link is incorrect.
          </p>
          <Link
            to="/"
            className="inline-flex items-center bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }
  // --- END OF UPDATE ---


  // By the time React gets here, 'loading' is false AND 'agent' exists.
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Agent Header */}
      <section className="bg-white dark:bg-gray-800 p-8 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-6">
          <img 
            src={agent.profilePicture} 
            alt={agent.name} 
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
          />
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold dark:text-white">{agent.name}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Registered Agent</p>
            
            {/* ✅ 2. Add Average Rating Display (This is now safe) */}
            <div className="flex justify-center md:justify-start my-2">
              <StarRating rating={agent.averageRating} count={agent.numReviews} />
            </div>

            {/* --- 3. UPDATED BUTTONS SECTION --- */}
            <div className="flex flex-col md:flex-row gap-3 mt-4">
              { user ? (
                // --- User is LOGGED IN ---
                <Link
                  to="/chat"
                  state={{ recipient: agent }}
                  className="inline-flex items-center justify-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  <FaComments size={20} />
                  <span>Chat with Agent</span>
                </Link>
              ) : (
                // --- User is LOGGED OUT ---
                <button
                  onClick={handleLoginRedirect}
                  className="inline-flex items-center justify-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  <FaComments size={20} />
                  <span>Chat with Agent</span>
                </button>
              )}
              
              {/* --- 4. NEW "CALL" BUTTON (CONDITIONAL) --- */}
              {isCallButtonEnabled && agent.voiceCallNumber && (
                <a
                  href={`tel:${agent.voiceCallNumber}`}
                  className="inline-flex items-center justify-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  <FaPhone size={18} />
                  <span>Call Agent</span>
                </a>
              )}
            </div>
            {/* --- END OF BUTTON LOGIC --- */}
            
          </div>
        </div>
      </section>

      {/* ✅ 3. New Section for About Me & Reviews */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Column (About & Listings) */}
            <div className="flex-1">
              {/* About Section */}
              {agent.about && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-12 border dark:border-gray-700">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    About {agent.name}
                  </h3>
                  {/* --- THIS IS THE FIX --- */}
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {agent.about}
                  </p>
                  {/* --------------------- */}
                </div>
              )}

              {/* Listings Section */}
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center lg:text-left mb-10">
                  Listings from {agent.name}
                </h2>
                {properties.length > 0 ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-8">
                    {properties.map((property) => (
                      <PropertyCard key={property._id} property={property} />
                    ))}
                  </div>
                ) : (
                  // --- THIS IS THE FIX ---
                  <p className="text-center lg:text-left text-gray-500 dark:text-gray-400">
                    This agent has no active listings.
                  </p>
                  // ---------------------
                )}
              </div>
            </div>

            {/* Right Column (Reviews) - 1/3 width on large screens */}
            <div className="lg:w-1/3">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border dark:border-gray-700">
                <AgentReviews agentId={agentId} agentName={agent.name} />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AgentPublicProfile;