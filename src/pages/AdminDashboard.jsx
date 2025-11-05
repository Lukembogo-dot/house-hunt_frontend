import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios'; 
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaUserShield } from 'react-icons/fa'; // ✅ 1. Add new icon

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); 

  const fetchData = async () => {
    // ... (fetchData is unchanged)
    try {
      setLoading(true);
      setError('');
      const [usersRes, propertiesRes, reviewsRes] = await Promise.all([
        apiClient.get('/users', { withCredentials: true }),
        apiClient.get('/properties'),
        apiClient.get('/reviews', { withCredentials: true }),
      ]);
      setUsers(usersRes.data);
      setProperties(propertiesRes.data.properties);
      setReviews(reviewsRes.data);
    } catch (err) {
      setError('Failed to fetch admin data. You may not be authorized.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ... (deleteProperty and deleteReview are unchanged)
  const deleteProperty = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await apiClient.delete(`/properties/${id}`, { withCredentials: true });
        fetchData();
      } catch (err) {
        alert('Failed to delete property.');
      }
    }
  };
  const deleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await apiClient.delete(`/reviews/${id}`, { withCredentials: true });
        fetchData();
      } catch (err) {
        alert('Failed to delete review.');
      }
    }
  };
  
  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      if (id === user._id) { 
        alert("You cannot delete your own admin account.");
        return;
      }
      try {
        await apiClient.delete(`/users/${id}`, { withCredentials: true });
        fetchData(); 
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  // ✅ 2. Add function to update user role
  const updateUserRole = async (id, newRole) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        await apiClient.put(`/users/${id}`, { role: newRole }, { withCredentials: true });
        fetchData(); // Refresh the user list
      } catch (err) {
        alert('Failed to update user role.');
      }
    }
  };

  if (loading) return <div className="p-10 text-center dark:text-gray-300">Loading Admin Dashboard...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Admin Dashboard</h1>

      {/* ... (Manage Properties section is unchanged) ... */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold dark:text-gray-100">Manage Properties ({properties.length})</h2>
          <Link to="/add-property" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-500">
            + Add New
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="border-b dark:border-gray-600">
                <th className="p-3 text-left dark:text-gray-300">Title</th>
                <th className="p-3 text-left dark:text-gray-300">Location</th>
                <th className="p-3 text-left dark:text-gray-300">Price (Ksh)</th>
                <th className="p-3 text-left dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((prop) => (
                <tr key={prop._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-3 dark:text-gray-200">{prop.title}</td>
                  <td className="p-3 dark:text-gray-200">{prop.location}</td>
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
        </div>
      </section>

      {/* === Manage Users === */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">Manage Users ({users.length})</h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="border-b dark:border-gray-600">
                <th className="p-3 text-left dark:text-gray-300">Name</th>
                <th className="p-3 text-left dark:text-gray-300">Email</th>
                <th className="p-3 text-left dark:text-gray-300">Role</th>
                <th className="p-3 text-left dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-3 dark:text-gray-200">{u.name}</td>
                  <td className="p-3 dark:text-gray-200">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      u.role === 'admin' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : u.role === 'agent' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  {/* ✅ 3. Add new actions for promoting/demoting */}
                  <td className="p-3 flex space-x-3">
                    {u.role === 'user' && (
                      <button onClick={() => updateUserRole(u._id, 'agent')} className="text-purple-600 dark:text-purple-400 hover:text-purple-800" title="Promote to Agent">
                        <FaUserShield />
                      </button>
                    )}
                    {u.role === 'agent' && (
                      <button onClick={() => updateUserRole(u._id, 'user')} className="text-gray-500 hover:text-gray-700" title="Demote to User">
                        (demote)
                      </button>
                    )}
                    {u._id !== user._id && (
                      <button onClick={() => deleteUser(u._id)} className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400" title="Delete">
                        <FaTrash />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ... (Manage Reviews section is unchanged) ... */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">Manage Reviews ({reviews.length})</h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="border-b dark:border-gray-600">
                <th className="p-3 text-left dark:text-gray-300">Comment</th>
                <th className="p-3 text-left dark:text-gray-300">Rating</th>
                <th className="p-3 text-left dark:text-gray-300">User</th>
                <th className="p-3 text-left dark:text-gray-300">Property</th>
                <th className="p-3 text-left dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-3 truncate max-w-xs dark:text-gray-200">{review.comment}</td>
                  <td className="p-3 dark:text-gray-200">{review.rating} ★</td>
                  <td className="p-3 dark:text-gray-200">{review.user?.name || 'Anonymous'}</td>
                  <td className="p-3 truncate max-w-xs dark:text-gray-200">{review.property?.title || 'N/A'}</td>
                  <td className="p-3">
                    <button onClick={() => deleteReview(review._id)} className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400" title="Delete">
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