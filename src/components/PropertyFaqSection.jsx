// src/components/PropertyFaqSection.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { FaQuestionCircle, FaChevronRight } from 'react-icons/fa';

const PropertyFaqSection = ({ location }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      if (!location) return;
      try {
        // Search for FAQs related to this property's location
        const { data } = await apiClient.get(`/faqs?search=${location}`);
        setFaqs(data.slice(0, 4)); // Take top 4
      } catch (error) {
        console.error("Error loading property FAQs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [location]);

  if (!loading && faqs.length === 0) return null;

  return (
    <div className="mt-12 bg-blue-50 dark:bg-gray-800/50 rounded-xl p-6 border border-blue-100 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <FaQuestionCircle className="text-blue-600 dark:text-blue-400 mr-2 text-xl" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Living in {location}: Common Questions
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((faq) => (
          <Link 
            key={faq._id} 
            to={`/faq/${faq.slug}`}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition group"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
              {faq.question}
            </span>
            <FaChevronRight className="text-gray-400 text-xs group-hover:text-blue-500" />
          </Link>
        ))}
      </div>
      
      <div className="mt-4 text-right">
         <Link to="/faqs" className="text-sm text-blue-600 font-semibold hover:underline">
           View all FAQs &rarr;
         </Link>
      </div>
    </div>
  );
};

export default PropertyFaqSection;