// src/pages/AgentPublicProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'; 
import apiClient from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import { 
  FaComments, FaStar, FaUserSlash, FaPhone, FaCheckCircle, 
  FaShieldAlt, FaFire, FaBuilding, FaHome, FaQuoteLeft,
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGlobe
} from 'react-icons/fa'; 
import AgentReviews from '../components/AgentReviews';
import { useAuth } from '../context/AuthContext'; 
import { Helmet } from 'react-helmet-async'; 
import useSeoData from '../hooks/useSeoData'; 
import { toast } from 'react-hot-toast';

// --- HELPER: Star Rating ---
const StarRating = ({ rating, count }) => {
  const safeRating = Number(rating) || 0;
  const fullStars = Math.floor(safeRating);
  const halfStar = safeRating % 1 >= 0.5;
  const emptyStars = Math.max(0, 5 - fullStars - (halfStar ? 1 : 0));

  return (
    <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full border border-yellow-100 dark:border-yellow-800">
      <div className="flex text-yellow-400 text-sm">
        {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} />)}
        {halfStar && <FaStar key="half" className="opacity-50" />}
        {[...Array(emptyStars)].map((_, i) => <FaStar key={`empty-${i}`} className="text-gray-300 dark:text-gray-600" />)}
      </div>
      <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">
        {safeRating.toFixed(1)} <span className="font-normal text-gray-500 dark:text-gray-400">({count} Reviews)</span>
      </span>
    </div>
  );
};

// --- SEO COMPONENT (Unchanged logic) ---
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
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(agentSchema) }} />
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
        setProperties(Array.isArray(propertiesRes.data) ? propertiesRes.data : []);
      } catch (error) {
        console.error("Error fetching agent data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentData();
  }, [agentId]);

  // --- 🔒 AUTH GATE HELPER ---
  const handleRestrictedAction = (actionCallback) => {
    if (!user) {
      toast('Please login to connect with agents', { icon: '🔒' });
      navigate('/login', { state: { from: location } });
      return;
    }
    actionCallback();
  };

  if (loading || seoLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-gray-500 animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border dark:border-gray-700 max-w-md w-full">
          <FaUserSlash className="text-gray-300 dark:text-gray-600 text-6xl mb-4 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Agent Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">This profile may have been removed or is temporarily unavailable.</p>
          <Link to="/" className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
        <AgentSeoInjector seo={seo} agent={agent} /> 

        {/* --- HERO SECTION --- */}
        <section className="bg-white dark:bg-gray-800 pt-10 pb-12 shadow-sm border-b dark:border-gray-700 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-10 opacity-5 dark:opacity-10 pointer-events-none">
                <FaBuilding className="text-9xl text-blue-600" />
            </div>

            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    
                    {/* Avatar Column */}
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl">
                             <img 
                                src={agent.profilePicture} 
                                alt={agent.name} 
                                className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800 bg-white"
                             />
                          </div>
                          {agent.isVerified && (
                            <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md" title="Verified Agent">
                              <FaCheckCircle className="text-blue-500 text-2xl" />
                            </div>
                          )}
                        </div>
                        
                        {/* Social Links (If Available) */}
                        <div className="flex gap-3 mt-6">
                            {agent.facebookUrl && (
                                <a href={agent.facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 text-blue-700 rounded-full hover:scale-110 transition"><FaFacebookF /></a>
                            )}
                            {agent.twitterUrl && (
                                <a href={agent.twitterUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-100 text-sky-600 rounded-full hover:scale-110 transition"><FaTwitter /></a>
                            )}
                            {agent.instagramUrl && (
                                <a href={agent.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-100 text-pink-600 rounded-full hover:scale-110 transition"><FaInstagram /></a>
                            )}
                            {agent.linkedinUrl && (
                                <a href={agent.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 text-blue-800 rounded-full hover:scale-110 transition"><FaLinkedinIn /></a>
                            )}
                             {agent.website && (
                                <a href={agent.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 text-gray-700 rounded-full hover:scale-110 transition"><FaGlobe /></a>
                            )}
                        </div>
                    </div>
                    
                    {/* Info Column */}
                    <div className="text-center md:text-left flex-1">
                        <div className="mb-2">
                           <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs">Registered Agent Profile</span>
                           <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-1">{agent.name}</h1>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-3 text-gray-600 dark:text-gray-300 mb-4">
                           <span className="flex items-center gap-1.5 font-medium"><FaBuilding className="text-gray-400" /> {agent.companyName || "Freelance Agent"}</span>
                           <span className="hidden md:inline text-gray-300">•</span>
                           <span>Based in <strong>{agent.location || "Nairobi, KE"}</strong></span>
                        </div>
                        
                        {/* Stats / Trust Indicators */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                            <StarRating rating={agent.averageRating} count={agent.numReviews} />
                            
                            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
                                <FaHome className="text-blue-500" />
                                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                   Manages {properties.length} Properties
                                </span>
                            </div>

                            {agent.activityScore > 100 && (
                                <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full border border-orange-100 dark:border-orange-800">
                                    <FaFire className="text-orange-500" />
                                    <span className="text-xs font-bold text-orange-700 dark:text-orange-300">Top Contributor</span>
                                </div>
                            )}
                        </div>

                        {/* --- GATED CTAs --- */}
                        <div className="flex flex-col sm:flex-row gap-3">
                             <button
                                onClick={() => handleRestrictedAction(() => navigate('/chat', { state: { recipient: agent } }))}
                                className="inline-flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                            >
                                <FaComments className="text-lg" />
                                <span>Start a Conversation</span>
                            </button>
                            
                            {agent.voiceCallNumber && (
                                <button
                                    onClick={() => handleRestrictedAction(() => window.location.href = `tel:${agent.voiceCallNumber}`)}
                                    className="inline-flex items-center justify-center space-x-2 bg-white text-gray-800 border-2 border-gray-200 px-8 py-3 rounded-xl font-bold hover:border-green-500 hover:text-green-600 transition-all dark:bg-transparent dark:border-gray-600 dark:text-white dark:hover:border-green-500"
                                >
                                    <FaPhone className="text-lg" />
                                    <span>Call Directly</span>
                                </button>
                            )}
                        </div>
                        
                        <p className="text-xs text-gray-400 mt-3 italic">
                           * Login required to contact agents for security purposes.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- MAIN CONTENT GRID --- */}
        <section className="py-12 px-6">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* LEFT COLUMN: Bio & Listings */}
                    <div className="flex-1">
                        
                        {/* Bio Section */}
                        {agent.about && (
                            <div className="mb-12">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                   <FaQuoteLeft className="text-blue-500 opacity-50" /> Getting to Know {agent.name.split(' ')[0]}
                                </h3>
                                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                                    {agent.about}
                                </div>
                            </div>
                        )}

                        {/* Listings Section */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                       Portfolio & Active Listings
                                   </h2>
                                   <p className="text-sm text-gray-500 dark:text-gray-400">
                                       {properties.length > 0 
                                         ? `Explore ${properties.length} properties currently managed by ${agent.name.split(' ')[0]}.` 
                                         : "No active public listings at the moment."}
                                   </p>
                                </div>
                            </div>
                            
                            {properties.length > 0 ? (
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {properties.map((property) => (
                                        <PropertyCard key={property._id} property={property} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <FaHome className="mx-auto text-gray-300 text-4xl mb-3" />
                                    <p className="text-gray-500 font-medium">Portfolio currently empty or private.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Reviews Sidebar */}
                    <div className="lg:w-[350px] shrink-0">
                        <div className="sticky top-24">
                           <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                               <h3 className="font-bold text-lg mb-1 dark:text-white">Client Feedback</h3>
                               <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">What others are saying</p>
                               <AgentReviews agentId={agentId} agentName={agent.name} />
                           </div>
                           
                           {/* Trust Badge */}
                           <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white text-center shadow-lg">
                              <FaShieldAlt className="text-4xl mx-auto mb-3 opacity-80" />
                              <h4 className="font-bold text-lg mb-1">Verified Partner</h4>
                              <p className="text-xs text-blue-100 opacity-90">
                                 {agent.name} has passed our identity checks and is a registered partner on HouseHunt Kenya.
                              </p>
                           </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>

    </div>
  );
}

export default AgentPublicProfile;