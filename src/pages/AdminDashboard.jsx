// src/pages/AdminDashboard.jsx
// (FIXED: Separated 'Service Posts' from 'Service Providers')

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  FaSpinner, FaMoneyBillWave, FaClock, FaSitemap, FaQuestionCircle, FaFlag,
  FaUserCheck, FaUserShield, FaTrash, FaEdit, FaLink, FaGavel,
  FaFistRaised, FaIdCard, FaUserSecret, FaListAlt, FaCommentDots, FaSearch, FaUserPlus, FaTimes, FaPlusCircle, FaImage,
  FaTachometerAlt, FaBox, FaUsers, FaCog, FaChevronDown, FaChevronUp // ✅ Added for tabs & collapsible sections
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import FailedQueries from '../components/FailedQueries';
import PendingApprovals from '../components/PendingApprovals';
import ModeratorRequests from '../components/admin/ModeratorRequests'; // ✅ IMPORTED

import LeadManager from '../components/admin/LeadManager';
import AssignAgentModal from '../components/admin/AssignAgentModal';
import PaymentSettingsManager from '../components/admin/PaymentSettingsManager';
import CommunityModeration from '../components/admin/CommunityModeration';
import PropertyManager from '../components/admin/PropertyManager';
import ServiceManager from '../components/admin/ServiceManager';
// ✅ FIXED: Changed '../components/Admin/...' to '../components/admin/...'
import BattleManager from '../components/admin/BattleManager';
import ReportManager from '../components/admin/ReportManager';
import AdminAnalyticsWidget from '../components/AdminAnalyticsWidget';

import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';


// --- BULK ASSIGN PROPERTIES MODAL ---
const BulkAssignModal = ({ show, onClose, agent, adminProperties, onBulkAssign }) => {
  const [selectedPropIds, setSelectedPropIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!show || !agent) return null;

  const toggleProperty = (id) => {
    setSelectedPropIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedPropIds.length === 0) return alert("Select at least one property.");
    setIsSubmitting(true);
    await onBulkAssign(agent._id, selectedPropIds);
    setIsSubmitting(false);
    setSelectedPropIds([]); // Reset
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 relative flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>

        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Assign Properties</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Assigning to: <span className="font-semibold text-blue-600">{agent.name}</span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900/50">
          {adminProperties.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No admin properties available to assign.</p>
          ) : (
            adminProperties.map(prop => (
              <div key={prop._id} onClick={() => toggleProperty(prop._id)} className={`flex items-center p-3 mb-2 rounded cursor-pointer border transition ${selectedPropIds.includes(prop._id) ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100'}`}>
                <input type="checkbox" checked={selectedPropIds.includes(prop._id)} onChange={() => { }} className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{prop.title}</p>
                  <p className="text-xs text-gray-500">{prop.location} • {prop.price.toLocaleString()} Ksh</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">{selectedPropIds.length} selected</p>
          <button onClick={handleAssign} disabled={isSubmitting || selectedPropIds.length === 0} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {isSubmitting ? <FaSpinner className="animate-spin" /> : 'Assign Selected'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- APPROVE CLAIM MODAL ---
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


// ✅ TAB COMPONENT - Modern tab buttons
const Tab = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${isActive
      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
      }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

// ✅ COLLAPSIBLE SECTION - Accordion panels
const CollapsibleSection = ({ title, icon: Icon, children, isCollapsed, onToggle, badge }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6"
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="text-2xl text-blue-600 dark:text-blue-400" />}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        {badge && (
          <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
            {badge}
          </span>
        )}
      </div>
      <motion.div
        animate={{ rotate: isCollapsed ? 0 : 180 }}
        transition={{ duration: 0.2 }}
      >
        <FaChevronDown className="text-gray-400" />
      </motion.div>
    </button>
    <AnimatePresence>
      {!isCollapsed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-700">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);

  // ✅ SEPARATED STATE for clearer logic
  const [serviceProviders, setServiceProviders] = useState([]);
  const [servicePosts, setServicePosts] = useState([]); // Blog posts

  const [allAgents, setAllAgents] = useState([]);
  const [orders, setOrders] = useState([]);

  const [claimRequests, setClaimRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isMigrating, setIsMigrating] = useState(false);

  const { user } = useAuth();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Claim Approval State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedShadowUser, setSelectedShadowUser] = useState(null);

  // Bulk Assign
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedBulkAgent, setSelectedBulkAgent] = useState(null);

  // ✅ TAB & COLLAPSIBLE STATE
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'content', 'users', 'system'
  const [collapsedSections, setCollapsedSections] = useState({
    analytics: false,
    battles: false,
    community: false,
    reports: false,
    properties: false,
    providers: false,
    posts: false,
    claims: false,
    shadows: false,
    moderators: false,
    users: false,
    maintenance: false,
    approvals: false,
    leads: false,
    queries: false,
    revenue: false
  });

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // ✅ FETCH BOTH: Providers AND Posts
      const [usersRes, propertiesRes, reviewsRes, providersRes, postsRes, agentsRes, ordersRes, claimsRes] = await Promise.all([
        apiClient.get('/users', { withCredentials: true }),
        apiClient.get('/properties?limit=1000'),
        apiClient.get('/reviews', { withCredentials: true }),
        apiClient.get('/service-providers?limit=100'), // 1. Providers (People)
        apiClient.get('/services'),                    // 2. Posts (Blogs/Articles)
        apiClient.get('/users/all-agents', { withCredentials: true }),
        apiClient.get('/payments', { withCredentials: true }),
        apiClient.get('/admin/claim-requests', { withCredentials: true }),
      ]);

      setUsers(usersRes.data);
      const propsData = propertiesRes.data.properties ? propertiesRes.data.properties : propertiesRes.data;
      setProperties(Array.isArray(propsData) ? propsData : []);

      setReviews(reviewsRes.data);

      // ✅ Assign correctly
      setServiceProviders(providersRes.data.providers || providersRes.data || []);
      setServicePosts(postsRes.data.services || postsRes.data || []); // Blog posts

      setAllAgents(agentsRes.data);
      setOrders(ordersRes.data);
      setClaimRequests(claimsRes.data || []);

    } catch (err) {
      setError('Failed to fetch admin data. You may not be authorized.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'moderator') {
      navigate('/moderator/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // DERIVED STATE
  const shadowAgents = users.filter(u =>
    u.role === 'agent' &&
    (u.isAccountClaimed === false || (u.email && u.email.includes('@househuntkenya.shadow')))
  );

  const adminProperties = properties.filter(p => !p.agent || (p.agent._id === user._id) || p.agent.role === 'admin' || p.agent.role === 'moderator');

  // ✅ ROLE CHECK HELPER
  const isMasterAdmin = user.role === 'admin';
  const isModerator = user.role === 'moderator';

  // --- ACTION HANDLERS ---

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

  const deleteServicePost = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        // Assuming standard endpoint for deleting service posts
        await apiClient.delete(`/services/${id}`, { withCredentials: true });
        fetchData();
      } catch (err) {
        alert('Failed to delete post.');
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

  const handleAssignAgent = async (propertyId, payload) => {
    try {
      const { data } = await apiClient.put(
        `/admin/properties/${propertyId}/assign-agent`,
        payload,
        { withCredentials: true }
      );
      alert(data.message);
      fetchData();
    } catch (err) {
      alert(`Failed to assign agent: ${err.response?.data?.message || 'Server Error'}`);
      console.error(err);
    }
  };

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
      fetchData();
    } catch (err) {
      alert(`Failed to approve claim: ${err.response?.data?.message || 'Error'}`);
    }
  };

  const handleApproveRequest = async (request) => {
    if (!window.confirm(`Approve claim for "${request.realName}"? This will merge account ${request.shadowUser?.name} with email ${request.realEmail}.`)) return;
    await handleApproveClaim(request.shadowUser._id, request.realEmail);
  };

  const openBulkAssign = (agent) => {
    setSelectedBulkAgent(agent);
    setIsBulkModalOpen(true);
  };

  const handleBulkAssign = async (agentId, propertyIds) => {
    try {
      const promises = propertyIds.map(id =>
        apiClient.put(`/admin/properties/${id}/assign-agent`, { agentId }, { withCredentials: true })
      );
      await Promise.all(promises);
      alert(`Successfully assigned ${propertyIds.length} properties.`);
      fetchData();
    } catch (error) {
      alert("Some assignments may have failed.");
      console.error(error);
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
      <div className="container mx-auto p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your platform with ease</p>
        </div>

        {/* \u2705 TAB NAVIGATION */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <Tab
            icon={FaTachometerAlt}
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <Tab
            icon={FaBox}
            label="Content"
            isActive={activeTab === 'content'}
            onClick={() => setActiveTab('content')}
          />
          <Tab
            icon={FaUsers}
            label="Users"
            isActive={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
          <Tab
            icon={FaCog}
            label="System"
            isActive={activeTab === 'system'}
            onClick={() => setActiveTab('system')}
          />
        </div>

        {/* \u2705 OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards - Modern Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-sm border border-green-200/50 dark:border-green-800/50 hover:shadow-lg transition-shadow"
              >
                <FaMoneyBillWave className="text-3xl text-green-600 dark:text-green-400 mb-2" />
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Revenue</h3>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">Ksh {totalRevenue.toLocaleString()}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl shadow-sm border border-yellow-200/50 dark:border-yellow-800/50 hover:shadow-lg transition-shadow"
              >
                <FaClock className="text-3xl text-yellow-600 dark:text-yellow-400 mb-2" />
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Pending Orders</h3>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{pendingOrders}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-sm border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Properties</h3>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{properties.length}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-sm border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Users</h3>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{users.length}</p>
              </motion.div>
            </div>

            {/* Analytics Widget - \u2705 USER ENGAGEMENT TRACKING */}
            <CollapsibleSection
              title="Analytics & User Engagement"
              icon={FaTachometerAlt}
              isCollapsed={collapsedSections.analytics}
              onToggle={() => toggleSection('analytics')}
            >
              <AdminAnalyticsWidget properties={properties} />
            </CollapsibleSection>

            {/* Quick Navigation Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/admin/seo-manager" className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 flex items-center gap-4 group">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FaSitemap className="text-2xl text-blue-600 dark:text-blue-400 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">SEO Manager</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Manage meta tags</p>
                </div>
              </Link>

              <Link to="/admin/faq-manager" className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 flex items-center gap-4 group">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <FaQuestionCircle className="text-2xl text-orange-600 dark:text-orange-400 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">FAQ Hub</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Manage questions</p>
                </div>
              </Link>

              <Link to="/admin/feature-manager" className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 flex items-center gap-4 group">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <FaFlag className="text-2xl text-purple-600 dark:text-purple-400 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Feature Manager</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Control rollouts</p>
                </div>
              </Link>
            </div>
          </>
        )}

        {/* \u2705 CONTENT TAB */}
        {activeTab === 'content' && (
          <>

            {/* ✅ NEW: MTAA BATTLE ARENA (Admin Controls) */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 dark:text-white flex items-center gap-2">
                <FaFistRaised className="text-red-500" /> Mtaa Battle Arena
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BattleManager />
                {/* Placeholder for future Battle Stats Widget */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-center text-gray-400">
                  <p>Live Battle Stats Coming Soon...</p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <CommunityModeration />
            </section>

            <section className="mb-12">
              <ReportManager />
            </section>

            {claimRequests.length > 0 && (
              <section className="mb-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow border border-yellow-200 dark:border-yellow-700 p-6">
                <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 flex items-center gap-2 mb-4">
                  <FaIdCard /> Pending Account Claims ({claimRequests.length})
                </h2>
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs">
                      <tr>
                        <th className="p-3">Request Date</th>
                        <th className="p-3">Requester (Real)</th>
                        <th className="p-3">Target Profile (Shadow)</th>
                        <th className="p-3">Verification</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {claimRequests.map(req => (
                        <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="p-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                            {format(new Date(req.createdAt), 'MMM d, yyyy HH:mm')}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-gray-900 dark:text-white">{req.realName}</div>
                            <div className="text-xs text-gray-500">{req.realEmail}</div>
                            <div className="text-xs font-mono text-blue-600">{req.realWhatsapp}</div>
                          </td>
                          <td className="p-3">
                            {req.shadowUser ? (
                              <>
                                <div className="font-bold text-gray-900 dark:text-white">{req.shadowUser.name}</div>
                                {req.shadowUser.isAccountClaimed ? (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Already Claimed</span>
                                ) : (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Shadow Active</span>
                                )}
                              </>
                            ) : (
                              <span className="text-red-500">Profile Deleted</span>
                            )}
                          </td>
                          <td className="p-3">
                            <a
                              href={`https://wa.me/${req.realWhatsapp.replace(/\+/g, '')}?text=Hello ${req.realName}, verifying your claim request.`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline text-xs"
                            >
                              Verify via WhatsApp
                            </a>
                          </td>
                          <td className="p-3">
                            {req.shadowUser && !req.shadowUser.isAccountClaimed && (
                              <button
                                onClick={() => handleApproveRequest(req)}
                                className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1"
                              >
                                <FaUserCheck /> Approve Merge
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Shadow Accounts Manager */}
            <section className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FaUserSecret className="text-yellow-500" /> Manage Shadow Accounts
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">View unclaimed profiles and assign listings directly.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                      <th className="p-3">Agent Name</th>
                      <th className="p-3">Company</th>
                      {/* ✅ NEW: Agent Type Column */}
                      <th className="p-3">Type</th>
                      <th className="p-3">WhatsApp</th>
                      <th className="p-3">Listings</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shadowAgents.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">No shadow agents found.</td></tr>}
                    {shadowAgents.map(agent => (
                      <tr key={agent._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-3 font-medium dark:text-white flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                            <img src={agent.profilePicture} alt="" className="w-full h-full object-cover" />
                          </div>
                          {agent.name}
                        </td>
                        <td className="p-3 dark:text-gray-300">{agent.companyName || '-'}</td>

                        {/* ✅ NEW: Agent Type Dropdown */}
                        <td className="p-3">
                          <select
                            value={agent.agentType || 'Individual'}
                            onChange={async (e) => {
                              const newType = e.target.value;
                              if (window.confirm(`Change ${agent.name} to ${newType}?`)) {
                                try {
                                  await apiClient.put(`/users/${agent._id}`, { agentType: newType });
                                  fetchData(); // Refresh list
                                } catch (err) {
                                  alert('Failed to update type');
                                }
                              }
                            }}
                            className="text-xs border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          >
                            <option value="Individual">Freelancer</option>
                            <option value="Agency">Agency</option>
                          </select>
                        </td>

                        <td className="p-3 dark:text-gray-300 font-mono text-xs">{agent.whatsappNumber || 'N/A'}</td>
                        <td className="p-3 dark:text-gray-300">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                            {agent.propertyPostCount || 0}
                          </span>
                        </td>
                        <td className="p-3">
                          <button onClick={() => openBulkAssign(agent)} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition shadow-sm">
                            <FaListAlt /> Assign Properties
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-12 p-6 bg-yellow-50 dark:bg-gray-800/50 rounded-xl border-l-4 border-yellow-400">
              <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                <FaSitemap /> System Maintenance
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={handleWatermarkMigration}
                  disabled={isMigrating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${isMigrating ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                    }`}
                >
                  {isMigrating ? <FaSpinner className="animate-spin" /> : <FaImage />}
                  {isMigrating ? 'Processing...' : 'Apply Watermark to Old Photos'}
                </button>
              </div>
            </section>

            <ModeratorRequests /> {/* ✅ RENDERED */}

            <PendingApprovals />

            <section className="mb-12">
              <LeadManager />
            </section>

            <section className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold dark:text-gray-100">Manage Properties</h2>
              </div>

              <PropertyManager
                properties={properties}
                fetchData={fetchData}
                onAssignAgent={openAssignModal}
              />
            </section>

            {/* ✅ NEW SECTION: SERVICE PROVIDER MANAGER (Using serviceProviders state) */}
            <section className="mb-12">
              <ServiceManager services={serviceProviders} onRefresh={fetchData} />
            </section>

            {/* ✅ FIXED SECTION: Manage Neighbourhood Watch / Blog Posts (Using servicePosts state) */}
            <section id="manage-services" className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold dark:text-gray-100">Manage Neighbourhood Watch ({servicePosts.length})</h2>
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
                    {servicePosts.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No blog posts found.</td></tr>}
                    {servicePosts.map((post) => (
                      <tr key={post._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="p-3 dark:text-gray-200">{post.title}</td>
                        <td className="p-3 dark:text-gray-200">{post.serviceType}</td>
                        <td className="p-3 dark:text-gray-200">{post.location}</td>
                        <td className="p-3 dark:text-gray-200">{post.numReviews}</td>
                        <td className="p-3 flex space-x-3">
                          <Link to={`/admin/add-service/${post._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" title="Edit">
                            <FaEdit />
                          </Link>
                          <button onClick={() => deleteServicePost(post._id)} className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400" title="Delete">
                            <FaTrash />
                          </button>
                          <Link to={`/services/slug/${post.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-blue-500" title="View Post">
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
                          {u.isAccountClaimed === false && <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">Shadow</span>}
                        </td>
                        <td className="p-3 dark:text-gray-20Details">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : u.role === 'agent' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 flex space-x-3">
                          {u.isAccountClaimed === false && (
                            <button onClick={() => openClaimModal(u)} className="text-green-600 dark:text-green-400 hover:text-green-800" title="Approve & Merge Claim"><FaUserCheck size={18} /></button>
                          )}
                          {u.role === 'user' && <button onClick={() => updateUserRole(u._id, 'agent')} className="text-purple-600 dark:text-purple-400 hover:text-purple-800" title="Promote to Agent"><FaUserShield /></button>}
                          {u.role !== 'admin' && u.role !== 'moderator' && <button onClick={() => updateUserRole(u._id, 'moderator')} className="text-blue-600 dark:text-blue-400 hover:text-blue-800" title="Promote to HouseHunt Admin"><FaGavel /></button>}
                          {u.role === 'moderator' && <button onClick={() => updateUserRole(u._id, 'user')} className="text-gray-500 hover:text-gray-700" title="Demote to User">(demote)</button>}
                          {u.role === 'agent' && <button onClick={() => updateUserRole(u._id, 'user')} className="text-gray-500 hover:text-gray-700" title="Demote to User">(demote)</button>}
                          {u._id !== user._id && <button onClick={() => deleteUser(u._id)} className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400" title="Delete"><FaTrash /></button>}
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
                <button onClick={handleRegisterIPN} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 transition"><FaLink /> Register IPN</button>
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
                        <td className="p-3 dark:text-gray-200">{format(new Date(order.createdAt), 'dd MMM yyyy')}</td>
                        <td className="p-3 dark:text-gray-200">{order.user?.name || 'User Not Found'}</td>
                        <td className="p-3 dark:text-gray-200">{order.productName}</td>
                        <td className="p-3 dark:text-gray-200">
                          <Link to={`/properties/${order.property?.slug}`} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">{order.property?.title || 'Property Not Found'}</Link>
                        </td>
                        <td className="p-3 font-semibold dark:text-white">{order.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{order.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-12">
              <PaymentSettingsManager />
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
          </>
        )}

        {/* ✅ USERS TAB - Placeholder for now */}
        {activeTab === 'users' && (
          <>
            <CollapsibleSection
              title="User Management"
              icon={FaUsers}
              badge={users.length}
              isCollapsed={collapsedSections.users}
              onToggle={() => toggleSection('users')}
            >
              <p className="text-gray-500 dark:text-gray-400">User management sections coming soon...</p>
            </CollapsibleSection>
          </>
        )}

        {/* ✅ SYSTEM TAB - Placeholder for now */}
        {activeTab === 'system' && (
          <>
            <CollapsibleSection
              title="System Settings"
              icon={FaCog}
              isCollapsed={collapsedSections.maintenance}
              onToggle={() => toggleSection('maintenance')}
            >
              <p className="text-gray-500 dark:text-gray-400">System settings coming soon...</p>
            </CollapsibleSection>
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <AssignAgentModal
            show={isAssignModalOpen}
            onClose={closeAssignModal}
            property={selectedProperty}
            agents={allAgents}
            onAssign={handleAssignAgent}
          />
        )}

        {isClaimModalOpen && selectedShadowUser && (
          <ApproveClaimModal
            show={isClaimModalOpen}
            onClose={() => setIsClaimModalOpen(false)}
            user={selectedShadowUser}
            onApprove={handleApproveClaim}
          />
        )}

        {isBulkModalOpen && selectedBulkAgent && (
          <BulkAssignModal
            show={isBulkModalOpen}
            onClose={() => setIsBulkModalOpen(false)}
            agent={selectedBulkAgent}
            adminProperties={adminProperties}
            onBulkAssign={handleBulkAssign}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminDashboard;