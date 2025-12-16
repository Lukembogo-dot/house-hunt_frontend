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

        {/* FAQ Grid with 3D Flip Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faqs.map((faq, index) => {
            // Helper to strip HTML and decode entities for the preview
            const getPreviewText = (html) => {
              const txt = document.createElement("textarea");
              txt.innerHTML = html;
              const decoded = txt.value;
              return decoded.replace(/<[^>]+>/g, '').substring(0, 120) + '...';
            };

            return (
              <div key={faq._id} className="group h-64 perspective-1000">
                <div className="relative w-full h-full text-center transition-all duration-500 transform preserve-3d group-hover:rotate-y-180 cursor-pointer">

                  {/* --- FRONT OF CARD --- */}
                  <div className="absolute inset-0 w-full h-full backface-hidden bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                      <FaLightbulb size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-3">
                      {faq.question}
                    </h3>
                  </div>

                  {/* --- BACK OF CARD --- */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-blue-600 dark:bg-blue-700 rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center text-white">
                    <p className="text-sm font-medium leading-relaxed mb-6 opacity-90">
                      {getPreviewText(faq.answer)}
                    </p>
                    <Link
                      to={`/faq/${faq.slug}`}
                      className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-full font-bold text-sm hover:scale-105 transition shadow-lg"
                    >
                      Read Answer <FaArrowRight className="ml-2 text-xs" />
                    </Link>
                  </div>

                </div>
              </div>
            );
          })}
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