import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { FaStar } from 'react-icons/fa';

// This is the card for a single service post
const ServicePostCard = ({ service }) => (
  <Link
    to={`/services/${service.slug}`}
    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border dark:border-gray-700 transition-transform transform hover:-translate-y-2 hover:shadow-xl flex flex-col"
  >
    <span className="text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full self-start">
      {service.serviceType}
    </span>
    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2 truncate group-hover:text-blue-600">
      {service.title}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
      {service.location}
    </p>
    <div className="flex items-center space-x-1 mt-auto">
      <FaStar className="text-yellow-400" />
      <span className="font-semibold text-gray-700 dark:text-gray-300">
        {service.averageRating.toFixed(1)}
      </span>
      <span className="text-gray-500 dark:text-gray-400 text-sm">
        ({service.numReviews} review{service.numReviews !== 1 ? 's' : ''})
      </span>
    </div>
  </Link>
);

const NeighbourhoodWatchHome = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Fetch the 4 most recent service posts
        const { data } = await apiClient.get('/services?limit=4');
        setServices(data.services);
      } catch (error) {
        console.error('Failed to fetch services', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading && services.length === 0) {
    // Optional: Add a loading skeleton here
    return null;
  }

  if (!services || services.length === 0) {
    return null; // Don't show the section if there are no posts
  }

  return (
    <section className="py-8 px-6 bg-white dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Neighbourhood Watch
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(service => (
            <ServicePostCard key={service._id} service={service} />
          ))}
        </div>
        {/* <div className="text-center mt-12">
          <Link 
            to="/services" 
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            View all local services →
          </Link>
        </div> 
        */}
      </div>
    </section>
  );
};

export default NeighbourhoodWatchHome;