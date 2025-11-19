// src/pages/FaqIndex.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { Helmet } from 'react-helmet-async';
import { FaSearch, FaFolderOpen, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FaqIndex = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await apiClient.get('/faqs');
        setFaqs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group FAQs by Category
  const categories = ['Buying', 'Renting', 'Legal', 'Neighbourhoods', 'General'];
  
  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <Helmet>
        <title>Real Estate Knowledge Base | HouseHunt Kenya</title>
        <meta name="description" content="Find answers to all your questions about buying, renting, and living in Kenya. Expert advice and guides." />
      </Helmet>

      {/* Hero Header */}
      <div className="bg-blue-900 text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-800 opacity-50 pattern-grid-lg"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">How can we help you?</h1>
          <p className="text-blue-100 text-lg mb-8">Search our knowledge base for instant answers.</p>
          
          <div className="relative max-w-xl mx-auto">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search questions (e.g. 'Land rates', 'Kilimani rent')..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 focus:ring-4 focus:ring-blue-400 outline-none shadow-xl"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {loading ? (
          <div className="text-center py-20"><div className="spinner" /> Loading...</div>
        ) : (
          <>
            {categories.map(category => {
              const categoryFaqs = filteredFaqs.filter(f => f.category === category);
              if (categoryFaqs.length === 0) return null;

              return (
                <motion.section 
                  key={category} 
                  className="mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                    <FaFolderOpen className="text-blue-600 dark:text-blue-400 mr-3 text-xl" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{category}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryFaqs.map(faq => (
                      <Link 
                        key={faq._id} 
                        to={`/faq/${faq.slug}`}
                        className="group flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition"
                      >
                        <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {faq.question}
                        </span>
                        <FaArrowRight className="text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                </motion.section>
              );
            })}

            {filteredFaqs.length === 0 && (
               <div className="text-center py-10 text-gray-500">No results found for "{searchTerm}"</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FaqIndex;