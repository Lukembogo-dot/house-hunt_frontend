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
const AgentSeoInjector = ({ seo, agent, properties = [] }) => {
  const socialUrls = [];
  if (agent.facebookUrl) socialUrls.push(agent.facebookUrl);
  if (agent.twitterUrl) socialUrls.push(agent.twitterUrl);

  // Derive extracted locations from properties
  const locations = [...new Set(properties.map(p => p.location).filter(Boolean))].slice(0, 5); // Top 5 locations
  const primaryLocation = agent.location || locations[0] || "Nairobi";

  const agentSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": agent.name,
    "url": window.location.href,
    "image": agent.profilePicture,
    "description": agent.seo?.schemaDescription || seo.metaDescription || agent.about?.substring(0, 160) || `Professional real estate agent ${agent.name} specializing in properties in ${primaryLocation}.`,
    "telephone": agent.voiceCallNumber,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": primaryLocation,
      "addressCountry": "KE"
    },
    // ✅ DYNAMIC AREA SERVED FROM LISTINGS
    "areaServed": locations.length > 0 ? locations.map(loc => ({
      "@type": "Place",
      "name": loc
    })) : {
      "@type": "Place",
      "name": primaryLocation
    },
    "sameAs": socialUrls.length > 0 ? socialUrls : undefined,
    "priceRange": "$$-$$$$",
    // ✅ E-E-A-T ENHANCEMENTS
    "jobTitle": "Real Estate Agent",
    "knowsAbout": ["Real Estate", "Property Management", "Investment", ...locations],
    "email": agent.email,
    "mainEntityOfPage": {
      "@type": "ProfilePage",
      "@id": window.location.href
    }
  };

  return (
    <Helmet>
      <title>{agent.seo?.metaTitle || seo.metaTitle || `${agent.name} - Top Real Estate Agent in ${primaryLocation} | HouseHunt Kenya`}</title>
      <meta name="description" content={agent.seo?.metaDescription || seo.metaDescription || `Contact ${agent.name}, a verified agent in ${primaryLocation} with ${properties.length} active listings. View portfolio and reviews.`} />
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Unavailable</h2>
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

  // Calculate distinct locations for AI Pitch
  const distinctLocations = [...new Set(properties.map(p => p.location).filter(Boolean))].slice(0, 5);
  const primaryLoc = agent.location || distinctLocations[0] || "Nairobi";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      <AgentSeoInjector seo={seo} agent={agent} properties={properties} />

      {/* ✅ AI/CRAWLER HIDDEN PITCH */}
      <article className="sr-only" aria-hidden="true">
        <h2>{agent.name} - Top Rated Real Estate Agent in {primaryLoc}</h2>
        <p>
          Looking for a verified real estate agent in **{primaryLoc}**?
          **{agent.name}** is a top-rated professional with **{properties.length} active listings** and a **{agent.averageRating || 5}-star rating**.
        </p>
        <p>
          Specializing in properties in: {distinctLocations.join(', ')}.
          Contact {agent.name} today for verified land, apartments, and houses for sale or rent in Kenya.
        </p>
      </article>

      {/* --- 1. HERO SECTION WITH BLUR BACKGROUND --- */}
      <div className="relative h-48 md:h-56 w-full overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500"></div>

        {/* Blur Overlay with Pattern */}
        <div className="absolute inset-0 backdrop-blur-3xl bg-white/10 dark:bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>

        {/* Content */}
        <div className="relative h-full container mx-auto px-4 sm:px-6 max-w-6xl flex flex-col justify-center">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 mb-3">
              <FaBuilding className="text-white" />
              <span className="text-white font-semibold text-sm">Professional Real Estate Portfolio</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Discover Quality Properties</h2>
            <p className="text-white/90 text-sm md:text-base max-w-2xl mx-auto">Browse verified listings from trusted real estate professionals in Kenya</p>
          </div>
        </div>
      </div>

      {/* --- 2. PROFILE HEADER --- */}
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl -mt-20 relative z-20">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

          <div className="flex flex-col md:flex-row p-8 md:p-12 gap-8 items-center md:items-start text-center md:text-left">
            {/* Avatar with Share Button */}
            <div className="relative group shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-blue-500 ring-offset-4 ring-offset-white dark:ring-offset-gray-900 shadow-xl">
                <img
                  src={agent.profilePicture}
                  alt={agent.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              {agent.isVerified && (
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-2.5 rounded-full shadow-lg border-4 border-white dark:border-gray-900" title="Verified Agent">
                  <FaCheckCircle className="text-lg" />
                </div>
              )}
              {/* Share Button */}
              <button
                onClick={handleShare}
                className="absolute -top-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg border-4 border-white dark:border-gray-900 transition-all hover:scale-110"
                title="Share Profile"
              >
                <FaShareAlt className="text-sm" />
              </button>
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
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{properties.length}</div>
                  <div className="text-xs text-gray-500 uppercase font-medium mt-1">Properties</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">{agent.numReviews}</div>
                  <div className="text-xs text-gray-500 uppercase font-medium mt-1">Reviews</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-1 font-bold text-3xl">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">{agent.averageRating?.toFixed(1) || '0.0'}</span>
                    <FaStar className="text-lg text-yellow-500" />
                  </div>
                  <div className="text-xs text-gray-500 uppercase font-medium mt-1">Rating</div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleRestrictedAction(() => navigate('/chat', { state: { recipient: agent } }))}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  <FaComments /> Message
                </button>
                {agent.voiceCallNumber && (
                  <button
                    onClick={() => handleRestrictedAction(() => window.location.href = `tel:${agent.voiceCallNumber}`)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 px-6 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                  >
                    <FaPhone /> Call
                  </button>
                )}
              </div>

            </div>
          </div>
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  About {agent.name.split(' ')[0]}
                </h3>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 leading-relaxed">
                  <div className="whitespace-pre-wrap">{agent.about}</div>
                </div>
              </div>
            ) : (
              // Default generic bio if none provided to keep portfolio looking full
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About</h3>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 italic">This professional hasn't added a bio yet.</p>
                </div>
              </div>
            )}

            {/* Listings Section */}
            <div id="listings">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  Portfolio
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{properties.length}</span>
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Get in Touch</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Connect with {agent.name.split(' ')[0]}</p>

              <div className="space-y-3">
                {/* 1. Internal Chat */}
                <button
                  onClick={() => handleRestrictedAction(() => navigate('/chat', { state: { recipient: agent } }))}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <FaComments /> Message
                </button>

                {/* 2. WhatsApp */}
                {agent.whatsappNumber && (
                  <a
                    href={`https://wa.me/${agent.whatsappNumber.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md shadow-green-500/20 flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp className="text-xl" /> WhatsApp
                  </a>
                )}

                {/* 3. Phone Call */}
                {agent.voiceCallNumber && (
                  <a
                    href={`tel:${agent.voiceCallNumber}`}
                    className="block w-full text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3.5 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <FaPhone /> {agent.voiceCallNumber}
                  </a>
                )}

                {/* 4. Email */}
                {agent.email && (
                  <a
                    href={`mailto:${agent.email}`}
                    className="block w-full text-center border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <FaEnvelope /> Email
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
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <FaStar className="text-yellow-400" /> Reviews
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