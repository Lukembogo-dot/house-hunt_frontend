// src/components/admin/ServiceManager.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axios';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaPhone,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaBriefcase,
  FaStar
} from 'react-icons/fa';

const ServiceManager = ({ services, onRefresh, allowDelete = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter services based on search
  const filteredServices = services.filter(service =>
    service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service provider? This cannot be undone.')) return;

    setIsDeleting(true);
    try {
      // ✅ UPDATED: Point to new Service Provider endpoint
      await apiClient.delete(`/service-providers/${id}`, { withCredentials: true });
      // Trigger refresh in parent
      onRefresh();
    } catch (err) {
      alert('Failed to delete service. ' + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaBriefcase className="text-blue-600" /> Service Providers
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage Movers, ISPs, Cleaners, and other professionals.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <Link
            to="/admin/add-service-provider"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition shadow-md whitespace-nowrap"
          >
            <FaPlus /> Add New
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
              <th className="p-4">Provider</th>
              <th className="p-4">Category</th>
              <th className="p-4">Location</th>
              <th className="p-4">Contact</th>
              <th className="p-4 text-center">Rating</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredServices.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No service providers found matching your search.
                </td>
              </tr>
            ) : (
              filteredServices.map((service) => (
                <tr key={service._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0">
                        {/* ✅ UPDATED: Use imageUrl */}
                        {service.imageUrl ? (
                          <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaBriefcase />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{service.title}</div>
                        {/* ✅ UPDATED: View Link */}
                        <a href={`/services/${service.slug}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                          View Live Page
                        </a>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                      {service.serviceType || 'General'}
                    </span>
                  </td>

                  <td className="p-4 text-gray-600 dark:text-gray-300 text-sm">
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-gray-400" />
                      {service.location || 'Nairobi'}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-xs">
                      {/* ✅ UPDATED: phoneNumber */}
                      {service.phoneNumber && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <FaPhone className="text-green-600" /> {service.phoneNumber}
                        </div>
                      )}
                      {/* ✅ UPDATED: whatsappNumber */}
                      {service.whatsappNumber && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <FaWhatsapp className="text-green-500" /> {service.whatsappNumber}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold">
                      {/* ✅ UPDATED: averageRating */}
                      <FaStar /> {service.averageRating || 5}
                      <span className="text-gray-400 text-xs font-normal">({service.numReviews || 0})</span>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {/* ✅ UPDATED: Link to EditServiceProvider */}
                      <Link
                        to={`/admin/edit-service-provider/${service._id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                        title="Edit Service"
                      >
                        <FaEdit size={16} />

                      </Link>
                      {allowDelete && (
                        <button
                          onClick={() => handleDelete(service._id)}
                          disabled={isDeleting}
                          className="text-red-600 dark:text-red-500 hover:text-red-800 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition disabled:opacity-50"
                          title="Delete Service"
                        >
                          <FaTrash size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div >
  );
};

export default ServiceManager;