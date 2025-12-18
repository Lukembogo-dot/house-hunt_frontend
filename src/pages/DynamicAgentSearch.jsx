// src/pages/DynamicAgentSearch.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { Helmet } from 'react-helmet-async';
import SeoInjector from '../components/SeoInjector';
import {
  FaSearch, FaExclamationTriangle, FaUserTie,
  FaPhone, FaWhatsapp, FaCheckCircle, FaBuilding
} from 'react-icons/fa';

// --- Simple Agent Card Component (Inline for reliability) ---
const AgentCard = ({ agent }) => {
  const whatsappMessage = encodeURIComponent(`Hello ${agent.name}, I found your profile on HouseHunt Kenya.`);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition group">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="w-full md:w-1/3 h-48 md:h-auto relative bg-gray-200">
          <img
            src={agent.profilePicture || "https://placehold.co/400x400?text=Agent"}
            alt={agent.name}
            className="w-full h-full object-cover"
          />
          {agent.isVerified && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <FaCheckCircle /> Verified
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition">
                  {agent.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                  <FaBuilding className="text-xs" /> {agent.agencyName || 'Independent Agent'}
                </p>
              </div>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                {agent.listingsCount || 0} Listings
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
              {agent.bio || `Professional real estate agent serving ${agent.location || 'Kenya'}.`}
            </p>

            {agent.specialties && (
              <div className="flex flex-wrap gap-1 mb-4">
                {agent.specialties.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-auto">
            <a href={`tel:${agent.phoneNumber}`} className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition">
              <FaPhone size={12} /> Call
            </a>
            <a href={`https://wa.me/${agent.whatsappNumber?.replace('+', '')}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition">
              <FaWhatsapp size={14} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const DynamicAgentSearch = () => {
  const { slug } = useParams();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seo, setSeo] = useState(null);

  // "real-estate-agents-in-kilimani" -> "Real Estate Agents In Kilimani"
  const searchTerm = slug.replace(/-/g, ' ');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Custom SEO (AI Supercharged)
        const path = `/agents/${slug}`;
        try {
          // Calls the new endpoint which checks DB -> Generates AI -> Returns
          const seoRes = await apiClient.get(`/seo/generate?path=${encodeURIComponent(path)}`);
          setSeo(seoRes.data);
        } catch (e) {
          console.warn("Agent SEO Generation failed, using fallback.");
        }

        // 2. Fetch Agents matching the slug keywords
        // Assuming your backend supports ?search= or ?location= for agents
        const { data } = await apiClient.get(`/users/agents?search=${searchTerm}`);
        setAgents(data.agents || data || []);
      } catch (error) {
        console.error("Agent Search Error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, searchTerm]);

  // Default SEO Fallback
  const pageTitle = seo?.metaTitle || `Top Real Estate Agents in ${searchTerm} | HouseHunt Kenya`;
  const pageDesc = seo?.metaDescription || `Find verified real estate agents and property managers in ${searchTerm}. Compare profiles, view listings, and contact them directly.`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <SeoInjector seo={seo || { metaTitle: pageTitle, metaDescription: pageDesc }} />

      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 z-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 capitalize leading-tight">
            {pageTitle}
          </h1>

          {/* ✅ AI Intro Text (HTML) */}
          <div
            className="text-gray-300 text-lg mb-8 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: seo?.introText || pageDesc }}
          />

          {/* ✅ AI Market Insight (HTML) */}
          {seo?.marketInsight && (
            <div className="bg-white/10 p-4 rounded-lg border border-white/20 mb-8 inline-block text-left">
              <h3 className="text-sm font-bold text-blue-300 mb-1 uppercase tracking-wide">Market Insight</h3>
              <div
                className="text-white text-sm prose-sm prose-invert"
                dangerouslySetInnerHTML={{ __html: seo.marketInsight }}
              />
            </div>
          )}

          {/* Search Refinement */}
          <div className="relative max-w-lg mx-auto">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              defaultValue={searchTerm}
              readOnly
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:bg-white/20 backdrop-blur-sm text-center"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-5xl">

        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl"></div>)}
          </div>
        ) : agents.length > 0 ? (
          // ✅ SHOW RESULTS
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agents.map(agent => (
              <AgentCard key={agent._id} agent={agent} />
            ))}
          </div>
        ) : (
          // ✅ NO RESULTS DASHBOARD (Agent Acquisition)
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 text-center border border-gray-200 dark:border-gray-700">
            <div className="inline-block p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-500 mb-6">
              <FaExclamationTriangle className="text-4xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              No agents found in "{searchTerm}"
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-lg mx-auto">
              We are actively looking for trusted partners in this area. This is a prime opportunity to claim this market.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Supply Side CTA */}
              <div className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 hover:shadow-lg transition">
                <div className="flex justify-center mb-4 text-blue-600 dark:text-blue-400"><FaUserTie size={32} /></div>
                <h3 className="font-bold text-xl text-blue-900 dark:text-blue-200 mb-2">Are you an Agent here?</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  Join HouseHunt Kenya for free and become the top recommended agent for <strong>{searchTerm}</strong>.
                </p>
                <Link to="/register?role=agent" className="inline-block w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                  Claim This Area
                </Link>
              </div>

              {/* Demand Side CTA */}
              <div className="p-8 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition">
                <div className="flex justify-center mb-4 text-gray-600 dark:text-gray-400"><FaSearch size={32} /></div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Need help finding a home?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Post a "Wanted" request and let verified agents in nearby areas come to you.
                </p>
                <Link to="/wanted/post" className="inline-block w-full bg-white border border-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-100 transition">
                  Post Request
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DynamicAgentSearch;