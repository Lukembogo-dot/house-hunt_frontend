import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios'; // Use your central API client
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Icons for actions

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); // Get current user info

  // Fetch all admin data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch all three data sources in parallel
      const [usersRes, propertiesRes, reviewsRes] = await Promise.all([
        // ✅ FIX: Removed /api from the start of the URL
        apiClient.get('/users', { withCredentials: true }),
        apiClient.get('/properties'), // Properties list is public
        apiClient.get('/reviews', { withCredentials: true }), // All reviews (admin)
      ]);
      setUsers(usersRes.data);
      setProperties(propertiesRes.data.properties); // Properties are nested
      setReviews(reviewsRes.data);
    } catch (err) {
      setError('Failed to fetch admin data. You may not be authorized.');
      console.error(err); // This line will show the detailed AxiosError
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // --- Delete Handlers ---

  const deleteProperty = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        // ✅ FIX: Removed /api from the start of the URL
        await apiClient.delete(`/properties/${id}`, { withCredentials: true });
        fetchData(); // Refresh all data
      } catch (err) {
        alert('Failed to delete property.');
      }
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      if (id === user._id) { // Prevent self-delete
        alert("You cannot delete your own admin account.");
        return;
      }
      try {
        // ✅ FIX: Removed /api from the start of the URL
        await apiClient.delete(`/users/${id}`, { withCredentials: true });
        fetchData(); // Refresh all data
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  const deleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        // ✅ FIX: Removed /api from the start of the URL
        await apiClient.delete(`/reviews/${id}`, { withCredentials: true });
        fetchData(); // Refresh all data
      } catch (err) {
        alert('Failed to delete review.');
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Admin Dashboard...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* === Manage Properties === */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Manage Properties ({properties.length})</h2>
          <Link to="/add-property" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + Add New
          </Link>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Price (Ksh)</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((prop) => (
                <tr key={prop._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{prop.title}</td>
                  <td className="p-3">{prop.location}</td>
                  <td className="p-3">{prop.price.toLocaleString()}</td>
                  <td className="p-3 flex space-x-3">
                    <Link to={`/admin/property/${prop._id}/edit`} className="text-blue-600 hover:text-blue-800" title="Edit">
                      <FaEdit />
                    </Link>
                    <button onClick={() => deleteProperty(prop._id)} className="text-red-600 hover:text-red-800" title="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* === Manage Users === */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Manage Users ({users.length})</h2>
        <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => deleteUser(u._id)} className="text-red-600 hover:text-red-800" title="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* === Manage Reviews === */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Manage Reviews ({reviews.length})</h2>
        <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="p-3 text-left">Comment</th>
                <th className="p-3 text-left">Rating</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Property</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 truncate max-w-xs">{review.comment}</td>
                  <td className="p-3">{review.rating} ★</td>
                  <td className="p-3">{review.user?.name || 'Anonymous'}</td>
                  <td className="p-3 truncate max-w-xs">{review.property?.title || 'N/A'}</td>
                  <td className="p-3">
                    <button onClick={() => deleteReview(review._id)} className="text-red-600 hover:text-red-800" title="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;