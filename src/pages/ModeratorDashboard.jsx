import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    FaSpinner, FaClock, FaQuestionCircle, FaFlag,
    FaUserCheck, FaUserShield, FaTrash, FaEdit, FaGavel,
    FaIdCard, FaUserSecret, FaListAlt, FaTimes, FaChartLine,
    FaTachometerAlt, FaBox, FaUsers, FaChevronDown
} from 'react-icons/fa';
import FailedQueries from '../components/FailedQueries';
import PendingApprovals from '../components/PendingApprovals';

import LeadManager from '../components/admin/LeadManager';
import AssignAgentModal from '../components/admin/AssignAgentModal';
import CommunityModeration from '../components/admin/CommunityModeration';
import PropertyManager from '../components/admin/PropertyManager';
import ServiceManager from '../components/admin/ServiceManager';
import ReportManager from '../components/admin/ReportManager';
import AdminAnalyticsWidget from '../components/AdminAnalyticsWidget';

// eslint-disable-next-line no-unused-vars
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
        setSelectedPropIds([]);
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
        {Icon && <Icon size={18} />}
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

const ModeratorDashboard = () => {
    const [users, setUsers] = useState([]);
    const [properties, setProperties] = useState([]);

    const [serviceProviders, setServiceProviders] = useState([]);
    const [servicePosts, setServicePosts] = useState([]);

    const [allAgents, setAllAgents] = useState([]);

    const [claimRequests, setClaimRequests] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { user } = useAuth();

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);

    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [selectedShadowUser, setSelectedShadowUser] = useState(null);

    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [selectedBulkAgent, setSelectedBulkAgent] = useState(null);

    // ✅ TAB & COLLAPSIBLE STATE
    const [activeTab, setActiveTab] = useState('overview');
    const [collapsedSections, setCollapsedSections] = useState({
        analytics: false,
        community: false,
        reports: false,
        properties: false,
        providers: false,
        posts: false,
        claims: false,
        shadows: false,
        users: false,
        approvals: false,
        leads: false,
        queries: false
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

            const [usersRes, propertiesRes, providersRes, postsRes, agentsRes, claimsRes] = await Promise.all([
                apiClient.get('/users', { withCredentials: true }),
                apiClient.get('/properties?limit=1000'),
                apiClient.get('/service-providers?limit=100'),
                apiClient.get('/services'),
                apiClient.get('/users/all-agents', { withCredentials: true }),
                apiClient.get('/admin/claim-requests', { withCredentials: true }),
            ]);

            setUsers(usersRes.data);
            const propsData = propertiesRes.data.properties ? propertiesRes.data.properties : propertiesRes.data;
            setProperties(Array.isArray(propsData) ? propsData : []);

            setServiceProviders(providersRes.data.providers || providersRes.data || []);
            setServicePosts(postsRes.data.services || postsRes.data || []);

            setAllAgents(agentsRes.data);
            setClaimRequests(claimsRes.data || []);

        } catch (err) {
            setError('Failed to fetch dashboard data. You may not be authorized.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // DERIVED STATE
    const shadowAgents = users.filter(u =>
        u.role === 'agent' &&
        (u.isAccountClaimed === false || (u.email && u.email.includes('@househuntkenya.shadow')))
    );

    const adminProperties = properties.filter(p => !p.agent || (p.agent._id === user._id) || p.agent.role === 'admin' || p.agent.role === 'moderator');


    // --- ACTION HANDLERS ---

    const updateUserRole = async (id, newRole) => {
        if (newRole === 'admin' || newRole === 'moderator') {
            return alert("You do not have permission to promote users to this role.");
        }

        if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            try {
                const { data } = await apiClient.put(`/users/${id}`, { role: newRole }, { withCredentials: true });
                if (data.isPending) {
                    alert('Action submitted for Master Admin approval.');
                } else {
                    fetchData();
                }
            } catch {
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
            if (data.isPending) {
                alert('Assignment request submitted for Master Admin approval.');
            } else {
                alert(data.message);
                fetchData();
            }
        } catch (err) {
            alert(`Failed to assign agent: ${err.response?.data?.message || 'Server Error'}`);
            console.error(err);
        }
    };

    const openClaimModal = (u) => {
        setSelectedShadowUser(u);
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
            let pendingCount = 0;
            const promises = propertyIds.map(async (id) => {
                const { data } = await apiClient.put(`/admin/properties/${id}/assign-agent`, { agentId }, { withCredentials: true });
                if (data.isPending) pendingCount++;
                return data;
            });
            await Promise.all(promises);

            if (pendingCount > 0) {
                alert(`${pendingCount} assignments submitted for approval.`);
            } else {
                alert(`Successfully assigned ${propertyIds.length} properties.`);
            }
            fetchData();
        } catch (error) {
            alert("Some assignments may have failed.");
            console.error(error);
        }
    };

    if (loading) return <div className="p-10 text-center dark:text-gray-300">Loading Moderator Dashboard...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

    return (
        <>
            <div className="container mx-auto p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 min-h-screen">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                        <FaGavel className="text-blue-600" /> Moderator Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Manage content and users efficiently</p>
                </div>

                {/* ✅ TAB NAVIGATION */}
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
                </div>

                {/* ✅ OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-sm border border-blue-200/50 dark:border-blue-800/50"
                            >
                                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Properties</h3>
                                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{properties.length}</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-sm border border-purple-200/50 dark:border-purple-800/50"
                            >
                                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Users</h3>
                                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{users.length}</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl shadow-sm border border-yellow-200/50 dark:border-yellow-800/50"
                            >
                                <FaIdCard className="text-2xl text-yellow-600 dark:text-yellow-400 mb-1" />
                                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Pending Claims</h3>
                                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{claimRequests.length}</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-sm border border-green-200/50 dark:border-green-800/50"
                            >
                                <FaUserSecret className="text-2xl text-green-600 dark:text-green-400 mb-1" />
                                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Shadow Accounts</h3>
                                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{shadowAgents.length}</p>
                            </motion.div>
                        </div>

                        {/* Analytics Widget */}
                        <CollapsibleSection
                            title="Site Analytics"
                            icon={FaChartLine}
                            isCollapsed={collapsedSections.analytics}
                            onToggle={() => toggleSection('analytics')}
                        >
                            <AdminAnalyticsWidget properties={properties} />
                        </CollapsibleSection>
                    </>
                )}

                {/* ✅ CONTENT TAB */}
                {activeTab === 'content' && (
                    <>
                        <CollapsibleSection
                            title="Community Moderation"
                            icon={FaFlag}
                            isCollapsed={collapsedSections.community}
                            onToggle={() => toggleSection('community')}
                        >
                            <CommunityModeration />
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Report Manager"
                            icon={FaQuestionCircle}
                            isCollapsed={collapsedSections.reports}
                            onToggle={() => toggleSection('reports')}
                        >
                            <ReportManager />
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Manage Properties"
                            icon={FaBox}
                            isCollapsed={collapsedSections.properties}
                            onToggle={() => toggleSection('properties')}
                            badge={properties.length}
                        >
                            <PropertyManager
                                properties={properties}
                                fetchData={fetchData}
                                onAssignAgent={openAssignModal}
                            />
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Service Providers"
                            icon={FaUserShield}
                            isCollapsed={collapsedSections.providers}
                            onToggle={() => toggleSection('providers')}
                            badge={serviceProviders.length}
                        >
                            <ServiceManager services={serviceProviders} onRefresh={fetchData} allowDelete={false} />
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Neighbourhood Watch Posts"
                            icon={FaEdit}
                            isCollapsed={collapsedSections.posts}
                            onToggle={() => toggleSection('posts')}
                            badge={servicePosts.length}
                        >
                            <div className="flex justify-end mb-4">
                                <Link to="/admin/add-service" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                                    + Add Service Post
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px]">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr className="border-b dark:border-gray-600">
                                            <th className="p-3 text-left dark:text-gray-300">Title</th>
                                            <th className="p-3 text-left dark:text-gray-300">Service Type</th>
                                            <th className="p-3 text-left dark:text-gray-300">Location</th>
                                            <th className="p-3 text-left dark:text-gray-300">Reviews</th>
                                            <th className="p-3 text-left dark:text-gray-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {servicePosts.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No posts found.</td></tr>}
                                        {servicePosts.map((post) => (
                                            <tr key={post._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="p-3 dark:text-gray-200">{post.title}</td>
                                                <td className="p-3 dark:text-gray-200">{post.serviceType}</td>
                                                <td className="p-3 dark:text-gray-200">{post.location}</td>
                                                <td className="p-3 dark:text-gray-200">{post.numReviews}</td>
                                                <td className="p-3 flex space-x-3">
                                                    <Link to={`/admin/add-service/${post._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800" title="Edit">
                                                        <FaEdit />
                                                    </Link>
                                                    <Link to={`/services/slug/${post.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500" title="View">
                                                        (View)
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CollapsibleSection>
                    </>
                )}

                {/* ✅ USERS TAB */}
                {activeTab === 'users' && (
                    <>
                        {claimRequests.length > 0 && (
                            <CollapsibleSection
                                title="Pending Account Claims"
                                icon={FaIdCard}
                                isCollapsed={collapsedSections.claims}
                                onToggle={() => toggleSection('claims')}
                                badge={claimRequests.length}
                            >
                                <div className="overflow-x-auto">
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
                            </CollapsibleSection>
                        )}

                        <CollapsibleSection
                            title="Shadow Accounts"
                            icon={FaUserSecret}
                            isCollapsed={collapsedSections.shadows}
                            onToggle={() => toggleSection('shadows')}
                            badge={shadowAgents.length}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                                            <th className="p-3">Agent Name</th>
                                            <th className="p-3">Company</th>
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
                                                <td className="p-3">
                                                    <select
                                                        value={agent.agentType || 'Individual'}
                                                        onChange={async (e) => {
                                                            const newType = e.target.value;
                                                            if (window.confirm(`Change ${agent.name} to ${newType}?`)) {
                                                                try {
                                                                    await apiClient.put(`/users/${agent._id}`, { agentType: newType });
                                                                    fetchData();
                                                                } catch {
                                                                    alert('Failed to update type');
                                                                }
                                                            }
                                                        }}
                                                        className="text-xs border-gray-300 rounded shadow-sm focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
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
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Pending Approvals"
                            icon={FaClock}
                            isCollapsed={collapsedSections.approvals}
                            onToggle={() => toggleSection('approvals')}
                        >
                            <PendingApprovals />
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Lead Manager"
                            icon={FaUserCheck}
                            isCollapsed={collapsedSections.leads}
                            onToggle={() => toggleSection('leads')}
                        >
                            <LeadManager />
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Manage Users"
                            icon={FaUsers}
                            isCollapsed={collapsedSections.users}
                            onToggle={() => toggleSection('users')}
                            badge={users.length}
                        >
                            <div className="overflow-x-auto">
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
                                                <td className="p-3 dark:text-gray-200">
                                                    {u.name}
                                                    {u.isAccountClaimed === false && <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">Shadow</span>}
                                                </td>
                                                <td className="p-3 dark:text-gray-200">{u.email}</td>
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
                                                    {u.role === 'agent' && <button onClick={() => updateUserRole(u._id, 'user')} className="text-gray-500 hover:text-gray-700" title="Demote to User">(demote)</button>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Failed Queries"
                            icon={FaQuestionCircle}
                            isCollapsed={collapsedSections.queries}
                            onToggle={() => toggleSection('queries')}
                        >
                            <FailedQueries />
                        </CollapsibleSection>
                    </>
                )}
            </div>

            <BulkAssignModal
                show={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                agent={selectedBulkAgent}
                adminProperties={adminProperties}
                onBulkAssign={handleBulkAssign}
            />

            <AssignAgentModal
                isOpen={isAssignModalOpen}
                onClose={closeAssignModal}
                property={selectedProperty}
                agents={allAgents}
                onAssign={handleAssignAgent}
            />

            <ApproveClaimModal
                show={isClaimModalOpen}
                onClose={() => setIsClaimModalOpen(false)}
                user={selectedShadowUser}
                onApprove={handleApproveClaim}
            />
        </>
    );
};

export default ModeratorDashboard;
