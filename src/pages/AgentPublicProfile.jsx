// src/pages/AgentPublicProfile.jsx
// (UPDATED: Display Live Property Count)

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'; 
import apiClient from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import { 
  FaComments, 
  FaStar,
  FaUserSlash, 
  FaPhone,     
  FaCheckCircle, 
  FaShieldAlt,   
  FaFire,        
  FaBuilding,
  FaHome // ✅ Added Icon
} from 'react-icons/fa'; 
import AgentReviews from '../components/AgentReviews';
import { useAuth } from '../context/AuthContext'; 
import { Helmet } from 'react-helmet-async'; 
import useSeoData from '../hooks/useSeoData'; 


// Star Rating Display Component (Unchanged)
const StarRating = ({ rating, count }) => {
  const safeRating = Number(rating) || 0;
  const clampedRating = Math.max(0, Math.min(5, safeRating));
  const fullStars = Math.floor(clampedRating);
  const halfStar = clampedRating % 1 >= 0.5;
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

// SEO Injector Component (Unchanged)
const AgentSeoInjector = ({ seo, agent }) => {
    const socialUrls = [];
    if (agent.facebookUrl) socialUrls.push(agent.facebookUrl);
    if (agent.twitterUrl) socialUrls.push(agent.twitterUrl);

    const agentSchema = {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "name": agent.name,
        "url": window.location.href, 
        "image": agent.profilePicture,
        "description": seo.metaDescription || agent.about?.substring(0, 160) || `Professional real estate agent ${agent.name} based in Kenya.`,
        "telephone": agent.voiceCallNumber,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": agent.location || "Nairobi", 
            "addressCountry": "KE"
        },
        ...(socialUrls.length > 0 && { "sameAs": socialUrls }), 
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": agent.averageRating || 0,
            "reviewCount": agent.numReviews || 0
        },
    };

    return (
        <Helmet>
            <title>{seo.metaTitle || `${agent.name} | Real Estate Agent Profile`}</title>
            <meta name="description" content={seo.metaDescription || `View properties and reviews for agent ${agent.name} on HouseHunt Kenya.`} />
            {seo.focusKeyword && <meta name="keywords" content={seo.focusKeyword} />}
            <link rel="canonical" href={window.location.href} />
            <meta property="og:title" content={seo.ogTitle || `${agent.name} Profile`} />
            <meta property="og:type" content="profile" />
            <meta property="og:image" content={agent.profilePicture} />
            <script 
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(agentSchema) }}
            />
        </Helmet>
    );
};


const AgentPublicProfile = () => {
  const { agentId } = useParams();
  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const pagePath = `/agent/${agentId}`;
  const { seo, loading: seoLoading } = useSeoData(
    pagePath,
    'Agent Profile | HouseHunt Kenya', 
    'View properties and reviews for this registered agent on HouseHunt Kenya.'
  );

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        const agentRes = await apiClient.get(`/users/${agentId}/public`);
        setAgent(agentRes.data);

        const propertiesRes = await apiClient.get(`/properties/by-agent/${agentId}`);
        // Ensure properties is always an array
        setProperties(Array.isArray(propertiesRes.data) ? propertiesRes.data : []);

      } catch (error) {
        console.error("Error fetching agent data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentData();
  }, [agentId]);

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: location } });
  };

  if (loading || seoLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xl dark:text-white ml-4">Loading agent profile...</p>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <AgentSeoInjector seo={seo} agent={agent} /> 

        {/* Agent Header */}
        <section className="bg-white dark:bg-gray-800 p-8 shadow-md">
            <div className="container mx-auto flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <img 
                      src={agent.profilePicture} 
                      alt={agent.name} 
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                  />
                  {/* Verified Badge */}
                  {agent.isVerified && (
                    <div className="absolute bottom-1 right-1 bg-white dark:bg-gray-800 rounded-full p-1">
                      <FaCheckCircle className="text-blue-500 text-2xl" title="Verified Agent" />
                    </div>
                  )}
                </div>
                
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <h1 className="text-4xl font-bold dark:text-white">{agent.name}</h1>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-1 text-gray-600 dark:text-gray-400">
                      <p className="text-lg">Registered Agent</p>
                      {agent.companyName && (
                        <span className="hidden md:inline">•</span>
                      )}
                      {agent.companyName && (
                        <span className="flex items-center gap-1"><FaBuilding /> {agent.companyName}</span>
                      )}
                    </div>
                    
                    {/* ✅ STATS ROW: Added Listings Count */}
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 my-3">
                        
                        <StarRating rating={agent.averageRating} count={agent.numReviews} />
                        
                        {/* Listings Count */}
                        <span className="flex items-center text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-sm border border-blue-100 dark:border-blue-800">
                            <FaHome className="mr-1" /> 
                            {properties.length} Active Listing{properties.length !== 1 && 's'}
                        </span>

                        {agent.activityScore > 0 && (
                          <span className="flex items-center text-orange-500 font-bold bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded text-sm border border-orange-100 dark:border-orange-800">
                            <FaFire className="mr-1" /> 
                            Activity Score: {agent.activityScore}
                          </span>
                        )}
                    </div>

                    {/* BUTTONS SECTION */}
                    <div className="flex flex-col md:flex-row gap-3 mt-4">
                        { user ? (
                            <Link
                                to="/chat"
                                state={{ recipient: agent }}
                                className="inline-flex items-center justify-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                            >
                                <FaComments size={20} />
                                <span>Chat with Agent</span>
                            </Link>
                        ) : (
                            <button
                                onClick={handleLoginRedirect}
                                className="inline-flex items-center justify-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                            >
                                <FaComments size={20} />
                                <span>Chat with Agent</span>
                            </button>
                        )}
                        
                        {agent.voiceCallNumber && (
                            <a
                                href={`tel:${agent.voiceCallNumber}`}
                                className="inline-flex items-center justify-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
                            >
                                <FaPhone size={18} />
                                <span>Call Agent</span>
                            </a>
                        )}
                    </div>
                    
                </div>
            </div>
        </section>

        {/* Content Section (About & Listings) */}
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
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {agent.about}
                                </p>
                            </div>
                        )}

                        {/* Listings Section */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center lg:text-left mb-10">
                                Listings from {agent.name} ({properties.length})
                            </h2>
                            {properties.length > 0 ? (
                                <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-8">
                                    {properties.map((property) => (
                                        <PropertyCard key={property._id} property={property} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center lg:text-left text-gray-500 dark:text-gray-400">
                                    This agent has no active listings.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Column (Reviews) */}
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
}

export default AgentPublicProfile;