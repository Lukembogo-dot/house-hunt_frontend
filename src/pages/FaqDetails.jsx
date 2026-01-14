// src/pages/FaqDetails.jsx
// (UPDATED: Adds Social Share & Helpful Voting)

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  FaArrowLeft, FaQuestionCircle, FaLightbulb, FaShareAlt, FaThumbsUp, FaRegThumbsUp, FaHome
} from 'react-icons/fa';
// ✅ 1. IMPORT PROPERTY LIST
import PropertyList from '../components/PropertyList';

// --- SEO COMPONENT (Updated to QAPage for Single Q&A Pages) ---
const FaqSeoInjector = ({ faq }) => {
  if (!faq) return null;

  // ✅ Generate canonical URL
  const canonicalUrl = `https://www.househuntkenya.co.ke/faq/${faq.slug}`;

  // Helper to decode for Schema too (So Google sees <h3> not &lt;h3&gt;)
  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const cleanAnswer = decodeHtml(faq.answer);
  const plainTextAnswer = cleanAnswer.replace(/<[^>]+>/g, ''); // Strip HTML for schema

  // ✅ QAPAGE SCHEMA (Correct for single question-answer pages)
  const qaPageSchema = {
    "@type": "QAPage",
    "@id": `${canonicalUrl}#qapage`,
    "mainEntity": {
      "@type": "Question",
      "name": faq.question,
      "text": faq.question,
      "answerCount": 1,
      "dateCreated": faq.createdAt,
      "author": {
        "@type": "Organization",
        "name": "HouseHunt Kenya"
      },
      "acceptedAnswer": {
        "@type": "Answer",
        "text": cleanAnswer, // ✅ Can include HTML formatting
        "dateCreated": faq.createdAt,
        "upvoteCount": faq.helpfulVotes || 0, // ✅ Shows vote count in rich results
        "url": canonicalUrl,
        "author": {
          "@type": "Organization",
          "name": "HouseHunt Kenya"
        }
      }
    }
  };

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.househuntkenya.co.ke" },
      { "@type": "ListItem", "position": 2, "name": "FAQs", "item": "https://www.househuntkenya.co.ke/faqs" },
      { "@type": "ListItem", "position": 3, "name": faq.question, "item": canonicalUrl }
    ]
  };

  // ✅ Combine schemas in @graph
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [qaPageSchema, breadcrumbSchema]
  };

  // Strip HTML for the meta description tag (Plain text only)
  const metaDesc = plainTextAnswer.substring(0, 160) + '...';

  return (
    <Helmet>
      <title>{faq.question} | HouseHunt Kenya Help</title>
      <meta name="description" content={metaDesc} />

      {/* ✅ ADDED: Canonical URL for proper indexing */}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={faq.question} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:description" content={metaDesc} />

      {/* ✅ SINGLE COMBINED SCHEMA with QAPage */}
      <script type="application/ld+json">{JSON.stringify(combinedSchema)}</script>
    </Helmet>
  );
};

const FaqDetails = () => {
  const { slug } = useParams();
  const [faq, setFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for interactions
  const [liked, setLiked] = useState(false);
  const [voteCount, setVoteCount] = useState(0);

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await apiClient.get(`/faqs/slug/${slug}`);
        setFaq(data);
        setVoteCount(data.helpfulVotes || 0); // Initialize with DB value
      } catch (err) {
        console.error(err);
        setError('Question not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchFaq();
  }, [slug]);

  // ✅ 2. SMART FILTERS: Extract intent from the question
  const smartFilters = useMemo(() => {
    if (!faq) return null;
    const text = faq.question.toLowerCase();
    const filters = {};

    // Detect Location
    const locations = ['kilimani', 'westlands', 'kileleshwa', 'lavington', 'karen', 'ruaka', 'ngong', 'thika', 'nairobi', 'mombasa', 'nakuru'];
    const foundLocation = locations.find(loc => text.includes(loc));
    if (foundLocation) {
      filters.location = foundLocation.charAt(0).toUpperCase() + foundLocation.slice(1);
    }

    // Detect Type
    if (text.includes('apartment') || text.includes('flat')) filters.type = 'Apartment';
    if (text.includes('house') || text.includes('mansion') || text.includes('bungalow')) filters.type = 'House';
    if (text.includes('land') || text.includes('plot')) filters.type = 'Land';
    if (text.includes('office')) filters.type = 'Commercial';

    // Detect Intent
    if (text.includes('rent') || text.includes('let')) filters.listingType = 'rent';
    if (text.includes('buy') || text.includes('sale') || text.includes('price')) filters.listingType = 'sale';

    return Object.keys(filters).length > 0 ? filters : null;
  }, [faq]);

  // ✅ NEW: Handle Social Share
  const handleShare = async () => {
    const shareData = {
      title: faq.question,
      text: `Check out this answer on HouseHunt Kenya: ${faq.question}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for desktop
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // ✅ NEW: Handle Helpful Vote
  const handleVote = async () => {
    if (liked) return; // Prevent multiple clicks locally

    try {
      setLiked(true);
      setVoteCount(prev => prev + 1); // Optimistic update
      await apiClient.put(`/faqs/${faq._id}/vote`);
    } catch (error) {
      console.error("Failed to record vote", error);
      setLiked(false); // Revert on error
      setVoteCount(prev => prev - 1);
    }
  };

  // ✅ CRITICAL FIX: Add loading state with SEO content
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Helmet>
          <title>FAQ | House Hunt Kenya Help Center</title>
          <meta name="description" content="Find answers to frequently asked questions about renting, buying, and property hunting in Kenya. Expert advice for house hunters." />
          <meta name="robots" content="index, follow" />
        </Helmet>

        <div className="sr-only" aria-hidden="true">
          <h1>Frequently Asked Questions</h1>
          <p>Browse our comprehensive FAQ library for property hunting, renting, and buying advice in Kenya.</p>
          <ul>
            <li>How to find affordable housing in Kenya</li>
            <li>Understanding rental agreements</li>
            <li>Property viewing tips</li>
            <li>Moving and relocation advice</li>
          </ul>
        </div>

        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !faq) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-gray-50 dark:bg-gray-950">
        {/* ✅ CRITICAL FIX: Prevent Soft 404 for missing FAQs */}
        <Helmet>
          <title>FAQ Not Found | House Hunt Kenya</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <FaQuestionCircle className="text-6xl text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Question Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn't find the answer you were looking for.</p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link to="/faqs" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Browse All FAQs
          </Link>
          <Link to="/" className="text-blue-600 hover:underline flex items-center justify-center border-2 border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition">
            <FaArrowLeft className="mr-2" /> Back Home
          </Link>
        </div>
      </div>
    );
  }

  // ✅ UPDATED: Robust Styling with Force-Overrides for Dark Mode
  const answerContentClass = `
    prose prose-xl max-w-none 
    dark:prose-invert 
    text-gray-800 dark:text-gray-200
    [&_*]:text-gray-800 dark:[&_*]:text-gray-200
    prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
    prose-p:leading-relaxed
    prose-strong:text-gray-900 dark:prose-strong:text-white
    prose-a:text-blue-600 dark:prose-a:text-blue-400 
    prose-a:font-bold 
    prose-a:no-underline hover:prose-a:underline
    prose-img:rounded-xl prose-img:shadow-md prose-img:my-8
    prose-li:text-gray-800 dark:prose-li:text-gray-300
  `;

  // ✅ Helper to unescape HTML entities if they were double-escaped
  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <>
      <FaqSeoInjector faq={faq} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 font-inter">
        <div className="max-w-6xl mx-auto">

          <nav className="mb-8 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Link to="/" className="hover:text-blue-600 transition">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/faqs" className="hover:text-blue-600 transition">FAQs</Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{faq.question}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2 space-y-10">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800"
              >
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${faq.category === 'Buying' ? 'bg-green-100 text-green-800' :
                      faq.category === 'Renting' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                      {faq.category || 'General'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      Updated {formatDistanceToNow(new Date(faq.updatedAt), { addSuffix: true })}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                    {faq.question}
                  </h1>
                </div>

                <div className="p-8">
                  <div
                    className={answerContentClass}
                    dangerouslySetInnerHTML={{ __html: decodeHtml(faq.answer) }}
                  />
                </div>

                <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <button
                    onClick={handleVote}
                    disabled={liked}
                    className={`flex items-center space-x-2 text-sm font-medium transition ${liked ? 'text-blue-600 cursor-default' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer'
                      }`}
                  >
                    {liked ? <FaThumbsUp /> : <FaRegThumbsUp />}
                    <span>{liked ? 'Marked Helpful' : 'Helpful'} ({voteCount})</span>
                  </button>

                  {/* ✅ UPDATED SHARE BUTTON */}
                  <button
                    onClick={handleShare}
                    className="text-gray-500 hover:text-blue-600 transition flex items-center gap-2"
                  >
                    <FaShareAlt /> <span className="text-sm">Share</span>
                  </button>
                </div>
              </motion.article>

              {/* ✅ 3. RELEVANT PROPERTIES SECTION */}
              {smartFilters && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                      <FaHome className="mr-2 text-blue-600" />
                      Properties mentioned above
                    </h2>
                    <Link
                      to={`/search/${smartFilters.listingType || 'rent'}/${smartFilters.location || 'nairobi'}`}
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm"
                    >
                      View All
                    </Link>
                  </div>

                  <PropertyList
                    filterOverrides={smartFilters}
                    showSearchBar={false}
                    showTitle={false}
                    limit={3}
                  />
                </motion.section>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              {faq.relatedFaqs && faq.relatedFaqs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6"
                >
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaLightbulb className="text-yellow-500 mr-2" /> Related Questions
                  </h3>
                  <div className="space-y-3">
                    {faq.relatedFaqs.map((rel) => (
                      <Link
                        key={rel._id}
                        to={`/faq/${rel.slug}`}
                        className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition border border-transparent hover:border-blue-200 dark:hover:border-blue-500 group"
                      >
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          {rel.question}
                        </p>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white"
              >
                <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Can't find the answer you're looking for? Our support team is here to help.
                </p>
                <Link
                  to="/contact"
                  className="block w-full text-center bg-white text-blue-700 font-bold py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  Contact Support
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FaqDetails;