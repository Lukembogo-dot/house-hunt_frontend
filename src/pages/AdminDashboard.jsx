// src/pages/AdminDashboard.jsx
// (UPDATED with Shadow Account Approval Logic)

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios'; 
import { useAuth } from '../context/AuthContext';
import { 
  FaEdit, 
  FaTrash, 
  FaUserShield, 
  FaSitemap, 
  FaStreetView,
  FaUserPlus,
  FaTimes,
  FaSpinner,
  FaFlag,
  FaMoneyBillWave, 
  FaClock,
  FaLink,
  FaImage,
  FaQuestionCircle,
  // ✅ 1. IMPORT NEW ICON FOR CLAIM APPROVAL
  FaUserCheck
} from 'react-icons/fa';
import FailedQueries from '../components/FailedQueries';
import PendingApprovals from '../components/PendingApprovals';
import { motion, AnimatePresence } from 'framer-motion'; 
import { format } from 'date-fns'; 


// --- ASSIGN AGENT MODAL (Unchanged) ---
const AssignAgentModal = ({ show, onClose, property, agents, onAssign }) => {
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedAgentId) {
      alert('Please select an agent.');
      return;
    }
    setIsSubmitting(true);
    await onAssign(property._id, selectedAgentId);
    setIsSubmitting(false);
    onClose(); 
  };
  
  useEffect(() => {
    setSelectedAgentId('');
  }, [property]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          disabled={isSubmitting}
        >
          <FaTimes size={20} />
        </button>
        
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Assign Agent to Property
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-1">
          Property: <strong>{property?.title}</strong>
        </p>

        <div className="mb-4">
          <label htmlFor="agentSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select an Agent
          </label>
          <select
            id="agentSelect"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">-- Please choose an agent --</option>
            {agents.map(agent => (
              <option key={agent._id} value={agent._id}>
                {agent.name} ({agent.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedAgentId}
            className="w-32 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : 'Assign Agent'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ✅ --- NEW: APPROVE CLAIM MODAL ---
const ApproveClaimModal = ({ show, onClose, user, onApprove }) => {
    const [realEmail, setRealEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const handleSubmit = async () => {
      if (!realEmail) return alert("Please enter the real agent's email.");
      if (!window.confirm(`Are you sure you want to transfer "${user.name}" to "${realEmail}"? This action is irreversible.`)) return;
      
      setIsSubmitting(true);
      await onApprove(user._id, realEmail);
      setIsSubmitting(false);
      onClose();
    };
  
    if (!show) return null;
  
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
            <FaTimes size={20} />
          </button>
          
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Approve Profile Claim
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            Transferring ownership of <strong>{user.name}</strong> ({user.whatsappNumber}).
          </p>
  
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enter Real Agent's Email (from notification)
            </label>
            <input
              type="email"
              value={realEmail}
              onChange={(e) => setRealEmail(e.target.value)}
              placeholder="e.g., realagent@gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
  
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Merging...' : 'Approve & Merge'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };


const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [allAgents, setAllAgents] = useState([]); 
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isMigrating, setIsMigrating] = useState(false);
  
  const { user } = useAuth();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // ✅ NEW STATE FOR CLAIM APPROVAL
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedShadowUser, setSelectedShadowUser] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [usersRes, propertiesRes, reviewsRes, servicesRes, agentsRes, ordersRes] = await Promise.all([
        apiClient.get('/users', { withCredentials: true }),
        apiClient.get('/properties'),
        apiClient.get('/reviews', { withCredentials: true }),
        apiClient.get('/services'), 
        apiClient.get('/users/all-agents', { withCredentials: true }), 
        apiClient.get('/payments', { withCredentials: true }), 
      ]);
      
      setUsers(usersRes.data);
      setProperties(propertiesRes.data.properties);
      setReviews(reviewsRes.data);
      setServices(servicesRes.data.services);
      setAllAgents(agentsRes.data); 
      setOrders(ordersRes.data); 

    } catch (err) {
      setError('Failed to fetch admin data. You may not be authorized.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const deleteService = async (id) => {
    if (window.confirm('Are you sure you want to delete this service post?')) {
      try {
        await apiClient.delete(`/services/${id}`, { withCredentials: true });
        fetchData(); 
      } catch (err) {
        alert('Failed to delete service post.');
      }
    }
  };

  const updateUserRole = async (id, newRole) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        await apiClient.put(`/users/${id}`, { role: newRole }, { withCredentials: true });
        fetchData(); 
      } catch (err) {
        alert('Failed to update user role.');
      }
    }
  };
  
  const openAssignModal = (property) => {
    setSelectedProperty(property);
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setSelectedProperty(null);
    setIsAssignModalOpen(false);
  };

  const handleAssignAgent = async (propertyId, agentId) => {
    try {
      const { data } = await apiClient.put(
        `/admin/properties/${propertyId}/assign-agent`, 
        { agentId },
        { withCredentials: true }
      );
      alert(data.message);
      fetchData(); 
    } catch (err) {
      alert(`Failed to assign agent: ${err.response?.data?.message || 'Server Error'}`);
      console.error(err);
    }
  };

  // ✅ NEW: Handle Claim Approval
  const openClaimModal = (user) => {
    setSelectedShadowUser(user);
    setIsClaimModalOpen(true);
  };

  const handleApproveClaim = async (userId, realEmail) => {
    try {
        const { data } = await apiClient.post('/users/approve-claim', { 
            userId, 
            realEmail 
        });
        alert(data.message);
        fetchData(); // Refresh list
    } catch (err) {
        alert(`Failed to approve claim: ${err.response?.data?.message || 'Error'}`);
    }
  };
  
  const handleRegisterIPN = async () => {
    if (!window.confirm("This will register the IPN URL with Pesapal. Proceed?")) return;
    try {
      const { data } = await apiClient.post('/payments/register-ipn');
      alert(`IPN Registered! ID: ${data.ipn_id} | URL: ${data.url}`);
    } catch (err) {
      alert('Failed to register IPN. Check console.');
      console.error(err);
    }
  };

  const handleWatermarkMigration = async () => {
    if (!window.confirm("Warning: This will update image URLs for ALL properties to include the watermark. This cannot be undone easily. Proceed?")) return;
    
    setIsMigrating(true);
    try {
      const { data } = await apiClient.get('/properties/migrate-watermarks', { withCredentials: true });
      alert(data.message);
    } catch (err) {
      alert(`Migration Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  if (loading) return <div className="p-10 text-center dark:text-gray-300">Loading Admin Dashboard...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((acc, order) => acc + order.amount, 0);
  
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <>
      <div className="container mx-auto p-6 md:p-10 bg-gray-50 dark:bg-gray-950 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Admin Dashboard</h1>

        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Revenue Card */}
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <FaMoneyBillWave className="text-4xl text-green-500 mb-2" />
                  <h3 className="text-xl font-semibold dark:text-gray-100">Total Revenue</h3>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">Ksh {totalRevenue.toLocaleString()}</p>
              </div>

              {/* Pending Orders Card */}
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <FaClock className="text-4xl text-yellow-500 mb-2" />
                  <h3 className="text-xl font-semibold dark:text-gray-100">Pending Orders</h3>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{pendingOrders}</p>
              </div>
              
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold dark:text-gray-100">Total Properties</h3>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{properties.length}</p>
              </div>
              
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold dark:text-gray-100">Total Users</h3>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{users.length}</p>
              </div>
              
              <Link 
                  to="/admin/seo-manager" 
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-200 dark:border-gray-700 flex items-center space-x-4"
              >
                  <FaSitemap className="text-4xl text-blue-500" />
                  <div>
                      <h3 className="text-xl font-semibold dark:text-gray-100">SEO Manager</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage all meta tags & schema.</p>
                  </div>
              </Link>

              <Link 
                  to="/admin/faq-manager" 
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-200 dark:border-gray-700 flex items-center space-x-4"
              >
                  <FaQuestionCircle className="text-4xl text-orange-500" />
                  <div>
                      <h3 className="text-xl font-semibold dark:text-gray-100">FAQ Hub</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Create & Link Questions.</p>
                  </div>
              </Link>
              
              <Link 
                  to="/admin/feature-manager" 
                  className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-200 dark:border-gray-700 flex items-center space-x-4"
              >
                  <FaFlag className="text-4xl text-purple-500" />
                  <div>
                      <h3 className="text-xl font-semibold dark:text-gray-100">Feature Manager</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage approvals & rollouts.</p>
                  </div>
              </Link>
          </div>
        </section>
        
        <section className="mb-12 p-6 bg-yellow-50 dark:bg-gray-800/50 rounded-xl border-l-4 border-yellow-400">
            <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
              <FaSitemap /> System Maintenance
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Use these tools cautiously. Actions here affect global system data.
            </p>
            <div className="flex gap-4">
                <button 
                  onClick={handleWatermarkMigration} 
                  disabled={isMigrating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                    isMigrating 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                  }`}
                >
                  {isMigrating ? <FaSpinner className="animate-spin" /> : <FaImage />}
                  {isMigrating ? 'Processing...' : 'Apply Watermark to Old Photos'}
                </button>
            </div>
        </section>
        
        <PendingApprovals />

        {/* === Manage Properties === */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold dark:text-gray-100">Manage Properties ({properties.length})</h2>
            <Link to="/add-property" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-500">
              + Add Property
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
            <table className="w-full min-w-[800px]"><thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-b dark:border-gray-600">
                  <th className="p-3 text-left dark:text-gray-300">Title</th>
                  <th className="p-3 text-left dark:text-gray-300">Location</th>
                  <th className="p-3 text-left dark:text-gray-300">Price (Ksh)</th>
                  <th className="p-3 text-left dark:text-gray-300">Agent</th>
                  <th className="p-3 text-left dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => (
                  <tr key={prop._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 dark:text-gray-200">{prop.title}</td>
                    <td className="p-3 dark:text-gray-200">{prop.location}</td>
                    <td className="p-3 dark:text-gray-200">{prop.price.toLocaleString()}</td>
                    
                    <td className="p-3 dark:text-gray-200 text-sm">
                      {prop.agent ? (
                        <span className="font-semibold">{prop.agent.name}</span>
                      ) : (
                        <span className="font-semibold text-red-500 dark:text-red-400">
                          Admin Property
                        </span>
                      )}
                    </td>
                    
                    <td className="p-3 flex space-x-3">
                      <Link to={`/admin/property/${prop._id}/edit`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" title="Edit">
                        <FaEdit />
                      </Link>
                      <button onClick={() => deleteProperty(prop._id)} className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400" title="Delete">
                        <FaTrash />
                      </button>
                      <button 
                        onClick={() => openAssignModal(prop)} 
                        className="text-green-600 dark:text-green-500 hover:text-green-800 dark:hover:text-green-400" 
                        title="Assign/Re-assign Agent"
                      >
                        <FaUserPlus />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* === Manage Neighbourhood Watch === */}
        <section id="manage-services" className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold dark:text-gray-100">Manage Neighbourhood Watch ({services.length})</h2>
            <Link to="/admin/add-service" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 dark:hover:bg-green-500">
              + Add Service Post
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
            <table className="w-full min-w-[600px]"><thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-b dark:border-gray-600">
                  <th className="p-3 text-left dark:text-gray-300">Title</th>
                  <th className="p-3 text-left dark:text-gray-300">Service Type</th>
                  <th className="p-3 text-left dark:text-gray-300">Location</th>
                  <th className="p-3 text-left dark:text-gray-300">Reviews</th>
                  <th className="p-3 text-left dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 dark:text-gray-200">{service.title}</td>
                    <td className="p-3 dark:text-gray-200">{service.serviceType}</td>
                    <td className="p-3 dark:text-gray-200">{service.location}</td>
                    <td className="p-3 dark:text-gray-200">{service.numReviews}</td>
                    <td className="p-3 flex space-x-3">
                      <Link to={`/admin/add-service/${service._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" title="Edit">
                        <FaEdit />
                      </Link>
                      <button onClick={() => deleteService(service._id)} className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400" title="Delete">
                        <FaTrash />
                      </button>
                      <Link to={`/services/slug/${service.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-blue-500" title="View Post">
                        (View)
                      </Link>
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
            <table className="w-full min-w-[500px]"><thead className="bg-gray-50 dark:bg-gray-700">
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
                    <td className="p-3 dark:text-gray-20Details">
                      {u.name}
                      {/* ✅ SHOW SHADOW BADGE */}
                      {u.isAccountClaimed === false && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">Shadow</span>
                      )}
                    </td>
                    <td className="p-3 dark:text-gray-20Details">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        u.role === 'admin' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : u.role === 'agent' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 flex space-x-3">
                      {/* ✅ APPROVE CLAIM BUTTON */}
                      {u.isAccountClaimed === false && (
                        <button 
                            onClick={() => openClaimModal(u)} 
                            className="text-green-600 dark:text-green-400 hover:text-green-800"
                            title="Approve & Merge Claim"
                        >
                            <FaUserCheck size={18} />
                        </button>
                      )}

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

        <FailedQueries />
        
        <section id="revenue-management" className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold dark:text-gray-100">
              Revenue & Subscriptions ({orders.length})
            </h2>
            <button 
              onClick={handleRegisterIPN} 
              className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 transition"
            >
              <FaLink /> Register IPN
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-b dark:border-gray-600">
                  <th className="p-3 text-left dark:text-gray-300">Date</th>
                  <th className="p-3 text-left dark:text-gray-300">Agent</th>
                  <th className="p-3 text-left dark:text-gray-300">Product</th>
                  <th className="p-3 text-left dark:text-gray-300">Property</th>
                  <th className="p-3 text-left dark:text-gray-300">Amount (Ksh)</th>
                  <th className="p-3 text-left dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 dark:text-gray-200">
                      {format(new Date(order.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="p-3 dark:text-gray-200">
                      {order.user?.name || 'User Not Found'}
                    </td>
                    <td className="p-3 dark:text-gray-200">
                      {order.productName}
                    </td>
                    <td className="p-3 dark:text-gray-200">
                      <Link 
                        to={`/properties/${order.property?.slug}`} 
                        className="text-blue-500 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {order.property?.title || 'Property Not Found'}
                      </Link>
                    </td>
                    <td className="p-3 font-semibold dark:text-white">
                      {order.amount.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">Manage Property Reviews ({reviews.length})</h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:border dark:border-gray-700 overflow-x-auto">
            <table className="w-full min-w-[600px]"><thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="border-b dark:border-gray-600">
                  <th className="p-3 text-left dark:text-gray-30D0">Comment</th>
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

      <AnimatePresence>
        <AssignAgentModal
          show={isAssignModalOpen}
          onClose={closeAssignModal}
          property={selectedProperty}
          agents={allAgents}
          onAssign={handleAssignAgent}
        />
        
        {/* ✅ NEW MODAL RENDERED HERE */}
        <ApproveClaimModal
          show={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          user={selectedShadowUser}
          onApprove={handleApproveClaim}
        />
      </AnimatePresence>
    </>
  );
};

export default AdminDashboard;