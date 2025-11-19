// src/components/HomeFaqSection.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { motion } from 'framer-motion';
import { FaQuestionCircle, FaArrowRight, FaLightbulb } from 'react-icons/fa';

const HomeFaqSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        // Fetch all and take the top 6 newest/most popular
        const { data } = await apiClient.get('/faqs');
        setFaqs(data.slice(0, 6)); 
      } catch (error) {
        console.error("Failed to load FAQs for home", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  if (!loading && faqs.length === 0) return null;

  return (
    <section className="py-16 px-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10">
          <div className="max-w-2xl">
            <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase text-sm mb-2 block">
              Knowledge Hub
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Common Real Estate Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Get quick answers to your questions about buying, renting, and living in Nairobi.
            </p>
          </div>
          
          <Link 
            to="/faqs" 
            className="hidden md:flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-4 md:mt-0"
          >
            View All Questions <FaArrowRight className="ml-2" />
          </Link>
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={`/faq/${faq.slug}`}
                className="block h-full p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900 transition group"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                    <FaLightbulb size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                      {/* Strip HTML tags for preview */}
                      {faq.answer.replace(/<[^>]+>/g, '')}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link 
            to="/faqs" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Visit Knowledge Hub
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeFaqSection;