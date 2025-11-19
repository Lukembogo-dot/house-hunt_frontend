// src/pages/FaqDetails.jsx
// (UPDATED: Fixed Text Size, Dark Mode Visibility, and Links)

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  FaArrowLeft, FaQuestionCircle, FaLightbulb, FaShareAlt, FaThumbsUp, FaRegThumbsUp, FaHome 
} from 'react-icons/fa';
import PropertyList from '../components/PropertyList';

// --- SEO COMPONENT (Unchanged) ---
const FaqSeoInjector = ({ faq }) => {
  if (!faq) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.househuntkenya.co.ke" },
      { "@type": "ListItem", "position": 2, "name": "FAQs", "item": "https://www.househuntkenya.co.ke/faqs" },
      { "@type": "ListItem", "position": 3, "name": faq.question, "item": window.location.href }
    ]
  };

  return (
    <Helmet>
      <title>{faq.question} | HouseHunt Kenya Help</title>
      <meta name="description" content={faq.answer.replace(/<[^>]+>/g, '').substring(0, 160)} />
      <meta property="og:title" content={faq.question} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={window.location.href} />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
};

const FaqDetails = () => {
  const { slug } = useParams();
  const [faq, setFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await apiClient.get(`/faqs/slug/${slug}`);
        setFaq(data);
      } catch (err) {
        console.error(err);
        setError('Question not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchFaq();
  }, [slug]);

  const smartFilters = useMemo(() => {
    if (!faq) return null;
    const text = faq.question.toLowerCase();
    const filters = {};

    const locations = ['kilimani', 'westlands', 'kileleshwa', 'lavington', 'karen', 'ruaka', 'ngong', 'thika', 'nairobi'];
    const foundLocation = locations.find(loc => text.includes(loc));
    if (foundLocation) {
      filters.location = foundLocation.charAt(0).toUpperCase() + foundLocation.slice(1);
    }

    if (text.includes('apartment') || text.includes('flat')) filters.type = 'Apartment';
    if (text.includes('house') || text.includes('mansion')) filters.type = 'House';
    if (text.includes('land') || text.includes('plot')) filters.type = 'Land';

    if (text.includes('rent') || text.includes('let')) filters.listingType = 'rent';
    if (text.includes('buy') || text.includes('sale') || text.includes('price')) filters.listingType = 'sale';

    return Object.keys(filters).length > 0 ? filters : null;
  }, [faq]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !faq) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-gray-50 dark:bg-gray-950">
        <FaQuestionCircle className="text-6xl text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Question Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn't find the answer you were looking for.</p>
        <Link to="/" className="text-blue-600 hover:underline flex items-center">
          <FaArrowLeft className="mr-2" /> Back Home
        </Link>
      </div>
    );
  }

  // ✅ UPDATED: Styles for Dark Mode, Larger Text, and Highlighting Links
  const answerContentClass = `
    prose prose-xl max-w-none 
    dark:prose-invert 
    text-gray-800 dark:text-gray-200
    prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
    prose-p:text-gray-800 dark:prose-p:text-gray-300
    prose-strong:text-gray-900 dark:prose-strong:text-white
    prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
    prose-img:rounded-xl prose-img:shadow-md prose-img:my-6
    prose-li:text-gray-800 dark:prose-li:text-gray-300
  `;

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
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                      faq.category === 'Buying' ? 'bg-green-100 text-green-800' :
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
                  {/* ✅ APPLIED NEW STYLES HERE */}
                  <div 
                    className={answerContentClass}
                    dangerouslySetInnerHTML={{ __html: faq.answer }} 
                  />
                </div>

                <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <button 
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center space-x-2 text-sm font-medium transition ${
                      liked ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {liked ? <FaThumbsUp /> : <FaRegThumbsUp />}
                    <span>Helpful</span>
                  </button>
                  <button className="text-gray-500 hover:text-blue-600 transition">
                    <FaShareAlt />
                  </button>
                </div>
              </motion.article>

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