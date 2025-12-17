// src/components/PropertyFaqSection.jsx
// (UPDATED: Generates Programmatic FAQs + Market Data Injection)

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { FaQuestionCircle, FaChevronRight, FaChartLine, FaShieldAlt, FaMapMarkerAlt } from 'react-icons/fa';

const PropertyFaqSection = ({ location, onFaqsLoaded }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Helper to format currency
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(price);

  useEffect(() => {
    const fetchData = async () => {
      if (!location) return;

      // Clean location string (e.g. "Kilimani, Nairobi" -> "Kilimani")
      const cleanLocation = location.split(',')[0].trim();

      try {
        // Parallel Fetch: 1. Existing Manual FAQs 2. Real-time Market Stats
        const [manualFaqsRes, statsRes] = await Promise.allSettled([
          apiClient.get(`/faqs?search=${cleanLocation}`),
          apiClient.get(`/properties/stats?location=${cleanLocation}`)
        ]);

        const manualFaqs = manualFaqsRes.status === 'fulfilled' ? manualFaqsRes.value.data : [];
        const marketStats = statsRes.status === 'fulfilled' ? statsRes.value.data : null;

        setStats(marketStats);

        // --- GENERATE PROGRAMMATIC FAQS ---
        const generatedFaqs = generateDynamicFaqs(cleanLocation, marketStats);

        // Merge: Put Programmatic FAQs first (high value), then manual ones
        const combinedFaqs = [...generatedFaqs, ...manualFaqs].slice(0, 6); // Limit to 6 total

        setFaqs(combinedFaqs);
        if (onFaqsLoaded) onFaqsLoaded(combinedFaqs); // ✅ Pass to parent for SEO Schema

      } catch (error) {
        console.error("Error loading property FAQs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  // --- DYNAMIC ANSWER GENERATOR ---
  const generateDynamicFaqs = (loc, data) => {
    const dynamicList = [];
    const locLower = loc.toLowerCase();

    // 1. Price Question (Data-Backed)
    if (data && data.avgPrice > 0) {
      dynamicList.push({
        _id: 'gen-price',
        question: `What is the average rent in ${loc}?`,
        slug: `rent-price-${locLower}`,
        answer: `Based on ${data.count} active listings on HouseHunt Kenya, the average price for properties in ${loc} is approximately **${formatPrice(data.avgPrice)}**. Prices vary depending on amenities and proximity to the main road.`
      });
    } else {
      // Fallback if no data
      dynamicList.push({
        _id: 'gen-price-fallback',
        question: `How much does it cost to live in ${loc}?`,
        slug: `cost-living-${locLower}`,
        answer: `Rental prices in ${loc} vary by property type. Bedsitters typically start lower, while family apartments command premium rates. Check our listings above for current pricing.`
      });
    }

    // 2. Safety Question (Context-Aware Templates)
    let safetyText = `${loc} is generally considered a residential area with good access to services.`;
    if (locLower.includes('kilimani') || locLower.includes('kileleshwa')) {
      safetyText = `${loc} is one of Nairobi's most secure upscale neighborhoods, featuring frequent police patrols, well-lit streets, and many gated communities with 24/7 security.`;
    } else if (locLower.includes('juja')) {
      safetyText = `${loc} is a vibrant student-friendly area. Security has improved significantly with new street lighting initiatives and gated estates near JKUAT.`;
    } else if (locLower.includes('westlands')) {
      safetyText = `${loc} is a commercial and residential hub with high-level security, private patrols, and proximity to major police stations.`;
    }

    dynamicList.push({
      _id: 'gen-safety',
      question: `Is ${loc} a safe place to live?`,
      slug: `safety-${locLower}`,
      answer: safetyText
    });

    // 3. Amenities Question (Context-Aware Templates)
    let amenityText = `Residents in ${loc} enjoy access to local markets, schools, and public transport links.`;
    if (locLower.includes('kilimani')) {
      amenityText = `${loc} offers premium amenities including Yaya Centre, Nairobi Hospital, and top international schools. Most apartments feature gyms, pools, and backup generators.`;
    } else if (locLower.includes('juja')) {
      amenityText = `${loc} is self-sufficient with Juja City Mall, JKUAT University, and reliable transport links (Superhighway and Train) making it ideal for students and commuters.`;
    } else if (locLower.includes('westlands')) {
      amenityText = `${loc} is known for its nightlife and malls like Sarit Centre and Westgate. It offers a cosmopolitan lifestyle with high-end gyms and rooftop lounges.`;
    }

    dynamicList.push({
      _id: 'gen-amenities',
      question: `What amenities are available in ${loc}?`,
      slug: `amenities-${locLower}`,
      answer: amenityText
    });

    return dynamicList;
  };

  if (!loading && faqs.length === 0) return null;

  return (
    <div className="mt-12 bg-blue-50 dark:bg-gray-800/50 rounded-xl p-6 border border-blue-100 dark:border-gray-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-2 md:mb-0">
          <FaQuestionCircle className="text-blue-600 dark:text-blue-400 mr-2 text-xl" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Living in {location}: Market Insights & FAQs
          </h3>
        </div>
        {stats && (
          <span className="bg-white dark:bg-gray-700 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full border border-blue-200 dark:border-blue-600 flex items-center">
            <FaChartLine className="mr-1" /> Verified Data
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {faqs.map((faq) => (
          <div
            key={faq._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:border-blue-400 dark:hover:border-blue-500 transition group"
          >
            <h4 className="text-md font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
              {faq._id === 'gen-safety' && <FaShieldAlt className="text-green-500 mr-2" />}
              {faq._id === 'gen-amenities' && <FaMapMarkerAlt className="text-orange-500 mr-2" />}
              {faq._id === 'gen-price' && <FaChartLine className="text-purple-500 mr-2" />}
              {faq.question}
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {/* Render simple markdown-like bolding if present */}
              {faq.answer.split('**').map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="text-gray-900 dark:text-white">{part}</strong> : part
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <Link to="/faqs" className="text-sm text-blue-600 font-semibold hover:underline">
          View all Knowledge Base articles &rarr;
        </Link>
      </div>
    </div>
  );
};

export default PropertyFaqSection;