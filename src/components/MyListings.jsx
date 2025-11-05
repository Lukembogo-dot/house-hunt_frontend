import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';

const MyListings = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // ✅ FIX: Removed the extra /api/ from this URL
      const { data } = await apiClient.get(`/properties/by-agent/${user._id}`);
      setProperties(data);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [user]);

  const deleteProperty = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        // ✅ FIX: Removed the extra /api/ from this URL
        await apiClient.delete(`/properties/${id}`, { withCredentials: true });
        fetchMyListings(); // Refresh data
      } catch (err) {
        alert('Failed to delete property.');
      }
    }
  };

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">My Property Listings ({properties.length})</h2>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
        {loading ? (
          <p className="dark:text-gray-300">Loading listings...</p>
        ) : properties.length === 0 ? (
          <p className="dark:text-gray-300">You have not listed any properties yet. <Link to="/add-property" className="text-blue-500 underline">List one now!</Link></p>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="border-b dark:border-gray-600">
                <th className="p-3 text-left dark:text-gray-300">Title</th>
                <th className="p-3 text-left dark:text-gray-300">Status</th>
                <th className="p-3 text-left dark:text-gray-300">Price (Ksh)</th>
                <th className="p-3 text-left dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((prop) => (
                <tr key={prop._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-3 dark:text-gray-200">{prop.title}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      prop.status === 'available' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {prop.status}
                    </span>
                  </td>
                  <td className="p-3 dark:text-gray-200">{prop.price.toLocaleString()}</td>
                  <td className="p-3 flex space-x-3">
                    <Link to={`/admin/property/${prop._id}/edit`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" title="Edit">
                      <FaEdit />
                    </Link>
                    <button onClick={() => deleteProperty(prop._id)} className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400" title="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default MyListings;