// src/pages/AgentPublicProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import {
  FaComments, FaStar, FaUserSlash, FaPhone, FaCheckCircle,
  FaShieldAlt, FaFire, FaBuilding, FaHome, FaQuoteLeft,
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGlobe,
  FaMapMarkerAlt, FaShareAlt, FaEnvelopeOpenText, FaWhatsapp, FaTiktok, FaEnvelope
} from 'react-icons/fa';
import AgentReviews from '../components/AgentReviews';
import { useAuth } from '../context/AuthContext';
import useSeoData from '../hooks/useSeoData';
import { toast } from 'react-hot-toast';
import useAnalytics from '../hooks/useAnalytics';
import { Helmet } from 'react-helmet-async';

// --- HELPER: Star Rating (Refined) ---
const StarRating = ({ rating, count, size = "md" }) => {
  const safeRating = Number(rating) || 0;
  const fullStars = Math.floor(safeRating);
  const halfStar = safeRating % 1 >= 0.5;
  const emptyStars = Math.max(0, 5 - fullStars - (halfStar ? 1 : 0));

  return (
    <div className="flex items-center gap-1">
      <div className={`flex text-yellow-400 ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>
        {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} />)}
        {halfStar && <FaStar key="half" className="opacity-50" />}
        {[...Array(emptyStars)].map((_, i) => <FaStar key={`empty-${i}`} className="text-gray-300 dark:text-gray-600" />)}
      </div>
      <span className={`font-bold text-gray-700 dark:text-gray-300 ${size === 'lg' ? 'text-base' : 'text-xs'}`}>
        {safeRating.toFixed(1)} <span className="font-normal text-gray-500">({count})</span>
      </span>
    </div>
  );
};

// --- HELPER: Stat Box ---
const StatBox = ({ icon: Icon, value, label, colorClass }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-[100px] flex-1">
    <Icon className={`text-2xl mb-2 ${colorClass}`} />
    <span className="text-xl font-extrabold text-gray-900 dark:text-white">{value}</span>
    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">{label}</span>
  </div>
);

// --- SEO COMPONENT ---
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
    "description": agent.seo?.schemaDescription || seo.metaDescription || agent.about?.substring(0, 160) || `Professional real estate agent ${agent.name} based in Kenya.`,
    "telephone": agent.voiceCallNumber,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": agent.location || "Nairobi",
      "addressCountry": "KE"
    },
    "sameAs": socialUrls.length > 0 ? socialUrls : undefined,
    "priceRange": "$$-$$$$",
    // ✅ E-E-A-T ENHANCEMENTS
    "jobTitle": "Real Estate Agent",
    "knowsAbout": ["Real Estate", "Property Management", "Nairobi Real Estate", "Kenya Housing Market"],
    "email": agent.email,
    "mainEntityOfPage": {
      "@type": "ProfilePage",
      "@id": window.location.href
    }
  };

  return (
    <Helmet>
      <title>{agent.seo?.metaTitle || seo.metaTitle || `${agent.name} | Professional Real Estate Portfolio`}</title>
      <meta name="description" content={agent.seo?.metaDescription || seo.metaDescription || `View properties and reviews for agent ${agent.name} on HouseHunt Kenya.`} />
      <link rel="canonical" href={window.location.href} />
      <meta property="og:title" content={`${agent.name} - Real Estate Portfolio`} />
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
  const locationPath = useLocation();

  const pagePath = `/agent/${agentId}`;
  const { seo, loading: seoLoading } = useSeoData(
    pagePath,
    'Agent Portfolio',
    'View detailed real estate portfolio.'
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile Link Copied!");
  };

  const { trackEvent } = useAnalytics();

  const handleRestrictedAction = (actionCallback, trackType, trackMetadata = {}) => {
    if (!user) {
      toast('Please login to connect', { icon: '🔒' });
      navigate('/login', { state: { from: locationPath } });
      return;
    }

    // Fire tracking if provided
    if (trackType) {
      trackEvent(trackType, 'agent_profile', agent._id, trackMetadata);
    }

    actionCallback();
  };

  if (loading || seoLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 animate-pulse text-sm font-medium">Loading Portfolio...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md w-full">
          <FaUserSlash className="text-gray-300 text-6xl mb-4 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Unavailable</h1>
          <p className="text-gray-500 mt-2 mb-6">This agent profile could not be found.</p>
          <Link to="/" className="text-blue-600 font-bold hover:underline">Back Home</Link>
        </div>
      </div>
    );
  }

  // Determine Cover Gradient based on Agent Type
  const coverGradient = agent.agentType === 'Agency'
    ? 'from-slate-900 via-purple-900 to-slate-900'
    : 'from-slate-900 via-blue-900 to-slate-900';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      <AgentSeoInjector seo={seo} agent={agent} />

      {/* --- 1. HERO COVER --- */}
      <div className={`h-64 md:h-80 w-full bg-gradient-to-r ${coverGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-6 right-6 flex gap-3 z-10">
          <button onClick={handleShare} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition border border-white/10">
            <FaShareAlt /> Share Profile
          </button>
        </div>
      </div>

      {/* --- 2. PROFILE HEADER --- */}
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl -mt-24 md:-mt-32 relative z-20">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

          <div className="flex flex-col md:flex-row p-6 md:p-10 gap-8 items-center md:items-start text-center md:text-left">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl p-1 bg-white dark:bg-gray-800 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300 ease-out">
                <img
                  src={agent.profilePicture}
                  alt={agent.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              {agent.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg border-4 border-white dark:border-gray-900" title="Verified Agent">
                  <FaCheckCircle className="text-xl" />
                </div>
              )}
            </div>

            {/* Identity & Actions */}
            <div className="flex-1 w-full pt-2 md:pt-4">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                    {agent.companyName && (
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <FaBuilding /> {agent.companyName}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded border ${agent.agentType === 'Agency' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-green-100 text-green-700 border-green-200'
                      }`}>
                      {agent.agentType || 'Agent'}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">{agent.name}</h1>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2 text-sm md:text-base">
                    <FaMapMarkerAlt /> {agent.location || 'Nairobi, Kenya'} • Member since {new Date(agent.createdAt).getFullYear()}
                  </p>
                </div>

                {/* Social Links (If Available) */}
                <div className="flex gap-3 mt-6">
                  {[
                    { link: agent.facebookUrl, icon: FaFacebookF, color: 'hover:text-blue-600' },
                    { link: agent.twitterUrl, icon: FaTwitter, color: 'hover:text-sky-500' },
                    { link: agent.instagramUrl, icon: FaInstagram, color: 'hover:text-pink-600' },
                    { link: agent.linkedinUrl, icon: FaLinkedinIn, color: 'hover:text-blue-800' },
                    { link: agent.website, icon: FaGlobe, color: 'hover:text-gray-600' }
                  ].map((social, idx) => (
                    social.link && (
                      <button key={idx} onClick={() => handleRestrictedAction(() => window.open(social.link, '_blank'))}
                        className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 transition-colors ${social.color}`}>
                        <social.icon />
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="text-center md:text-left border-r dark:border-gray-700 last:border-0 px-2">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{properties.length}</div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Listed Properties</div>
                </div>
                <div className="text-center md:text-left border-r dark:border-gray-700 last:border-0 px-2">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{agent.numReviews}</div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Total Reviews</div>
                </div>
                <div className="text-center md:text-left border-r dark:border-gray-700 last:border-0 px-2">
                  <div className="flex items-center justify-center md:justify-start gap-1 font-bold text-2xl text-yellow-500">
                    {agent.averageRating?.toFixed(1) || '0.0'} <FaStar className="text-lg" />
                  </div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Avg. Rating</div>
                </div>

              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleRestrictedAction(() => navigate('/chat', { state: { recipient: agent } }))}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <FaComments /> Message Agent
                </button>
                {agent.voiceCallNumber && (
                  <button
                    onClick={() => handleRestrictedAction(() => window.location.href = `tel:${agent.voiceCallNumber}`)}
                    className="flex-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-gray-200 dark:border-gray-700 py-3 px-6 rounded-xl font-bold hover:border-green-500 hover:text-green-600 transition flex items-center justify-center gap-2"
                  >
                    <FaPhone /> Call Now
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Divider */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20"></div>
        </div>
      </div>

      {/* --- 3. MAIN CONTENT --- */}
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl mt-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* LEFT COLUMN: About & Listings */}
          <div className="flex-1">

            {/* About Section */}
            {agent.about ? (
              <div className="mb-12">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  Getting to Know {agent.name.split(' ')[0]}
                </h3>
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 leading-relaxed relative">
                  <FaQuoteLeft className="absolute top-4 left-4 text-4xl text-gray-100 dark:text-gray-800 -z-0" />
                  <div className="relative z-10 whitespace-pre-wrap">{agent.about}</div>
                </div>
              </div>
            ) : (
              // Default generic bio if none provided to keep portfolio looking full
              <div className="mb-12 opacity-60">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About Me</h3>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 italic">This professional hasn't added a bio yet, but they are an active member of the HouseHunt Kenya ecosystem.</p>
                </div>
              </div>
            )}

            {/* Listings Section */}
            <div id="listings">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaHome className="text-blue-500" /> Public Portfolio
                  <span className="text-sm font-normal text-gray-500 ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{properties.length} Items</span>
                </h3>
              </div>

              {properties.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {properties.map(property => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <FaHome className="mx-auto text-6xl text-gray-200 dark:text-gray-700 mb-4" />
                  <h4 className="text-lg font-bold text-gray-400">No active listings</h4>
                  <p className="text-gray-400">This portfolio is currently empty.</p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Contact & Reviews Sidebar */}
          <div className="lg:w-[380px] shrink-0 space-y-8">

            {/* Contact Card (Sticky) */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Connect with {agent.name.split(' ')[0]}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Reach out directly via your preferred channel.</p>

              <div className="space-y-3 relative z-10">
                {/* 1. Internal Chat */}
                <button
                  onClick={() => handleRestrictedAction(() => navigate('/chat', { state: { recipient: agent } }))}
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <FaComments /> Send Message
                </button>

                {/* 2. WhatsApp */}
                {agent.whatsappNumber && (
                  <a
                    href={`https://wa.me/${agent.whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp className="text-xl" /> WhatsApp
                  </a>
                )}

                {/* 3. Phone Call */}
                {agent.voiceCallNumber && (
                  <a
                    href={`tel:${agent.voiceCallNumber}`}
                    className="block w-full text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <FaPhone /> Call {agent.voiceCallNumber}
                  </a>
                )}

                {/* 4. Email */}
                {agent.email && (
                  <a
                    href={`mailto:${agent.email}`}
                    className="block w-full text-center border-2 border-gray-100 dark:border-gray-700 hover:border-blue-500 text-gray-600 dark:text-gray-300 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <FaEnvelope /> Send Email
                  </a>
                )}
              </div>

              {/* Social Media Row */}
              {(agent.socialLinks || agent.tiktokHandle || agent.instagramHandle) && (
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Social Profiles</p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {agent.socialLinks?.tiktok && (
                      <a href={agent.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="p-3 bg-black text-white rounded-full hover:scale-110 transition"><FaTiktok /></a>
                    )}
                    {agent.socialLinks?.instagram && (
                      <a href={agent.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-full hover:scale-110 transition"><FaInstagram /></a>
                    )}
                    {agent.socialLinks?.facebook && (
                      <a href={agent.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-600 text-white rounded-full hover:scale-110 transition"><FaFacebookF /></a>
                    )}
                    {agent.socialLinks?.twitter && (
                      <a href={agent.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-black text-white rounded-full hover:scale-110 transition"><FaTwitter /></a> // X/Twitter
                    )}
                    {agent.socialLinks?.website && (
                      <a href={agent.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-200 text-gray-600 rounded-full hover:scale-110 transition"><FaGlobe /></a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Widget */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <FaStar className="text-yellow-400" /> Client Reviews
              </h3>
              <AgentReviews agentId={agentId} agentName={agent.name} />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default AgentPublicProfile;