// src/components/admin/LeadManager.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import { 
  FaEnvelope, 
  FaPaperPlane, 
  FaSpinner, 
  FaUserTie, 
  FaGlobe, 
  FaCheckCircle,
  FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const LeadManager = () => {
  const [leads, setLeads] = useState([]);
  const [subscribedAgents, setSubscribedAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forwarding, setForwarding] = useState(false);
  
  // Modal State
  const [selectedLead, setSelectedLead] = useState(null);
  const [providerType, setProviderType] = useState('internal'); // 'internal' or 'external'
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [externalEmail, setExternalEmail] = useState('');
  const [externalName, setExternalName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leadsRes, agentsRes] = await Promise.all([
        apiClient.get('/leads', { withCredentials: true }),
        apiClient.get('/admin/subscribed-agents', { withCredentials: true })
      ]);
      setLeads(leadsRes.data);
      setSubscribedAgents(agentsRes.data);
    } catch (error) {
      console.error("Error fetching lead data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleForwardLead = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    
    let providerEmail = '';
    let providerName = '';

    if (providerType === 'internal') {
        const agent = subscribedAgents.find(a => a._id === selectedAgentId);
        if (!agent) return alert("Please select an agent.");
        providerEmail = agent.email;
        providerName = agent.name;
    } else {
        if (!externalEmail) return alert("Please enter an email address.");
        providerEmail = externalEmail;
        providerName = externalName || 'Service Partner';
    }

    setForwarding(true);
    try {
        await apiClient.post('/admin/forward-lead', {
            leadData: selectedLead,
            providerEmail,
            providerName
        }, { withCredentials: true });

        // Optionally update lead status locally
        alert(`Lead successfully forwarded to ${providerName}!`);
        setSelectedLead(null); // Close modal
        setExternalEmail('');
        setExternalName('');
        
        // Refresh leads to see if status updated (if you add logic to update status on forward)
        fetchData();

    } catch (error) {
        alert(error.response?.data?.message || "Failed to forward lead.");
    } finally {
        setForwarding(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Leads...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaEnvelope className="text-blue-500" /> HouseHunt Requests (Leads)
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {leads.length} total requests. Forward them to subscribed partners.
            </p>
        </div>
        <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
            {subscribedAgents.length} Subscribed Agents Active
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm uppercase">
              <th className="p-3">Date</th>
              <th className="p-3">Client</th>
              <th className="p-3">Category</th>
              <th className="p-3">Details</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
                <tr><td colSpan="6" className="p-6 text-center text-gray-500">No leads found yet.</td></tr>
            )}
            {leads.map(lead => (
              <tr key={lead._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td className="p-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                </td>
                <td className="p-3">
                    <p className="font-semibold text-gray-900 dark:text-white">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.phone}</p>
                </td>
                <td className="p-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        lead.category === 'Property' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                        {lead.category}
                    </span>
                </td>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={lead.details}>
                    {lead.details}
                </td>
                <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        lead.status === 'New' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {lead.status}
                    </span>
                </td>
                <td className="p-3">
                    <button 
                        onClick={() => setSelectedLead(lead)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition shadow-sm"
                    >
                        <FaPaperPlane size={12} /> Forward
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- FORWARD MODAL --- */}
      <AnimatePresence>
        {selectedLead && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setSelectedLead(null)}
            >
                <motion.div 
                    initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={() => setSelectedLead(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <FaTimes size={20} />
                    </button>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Forward Lead</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Send <strong>{selectedLead.name}'s</strong> request to a provider.
                    </p>

                    {/* Provider Type Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-6">
                        <button
                            onClick={() => setProviderType('internal')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition flex items-center justify-center gap-2 ${
                                providerType === 'internal' 
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            <FaUserTie /> Subscribed Agent
                        </button>
                        <button
                            onClick={() => setProviderType('external')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition flex items-center justify-center gap-2 ${
                                providerType === 'external' 
                                ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            <FaGlobe /> External Provider
                        </button>
                    </div>

                    <form onSubmit={handleForwardLead} className="space-y-4">
                        {providerType === 'internal' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Select Subscribed Agent
                                </label>
                                <select
                                    value={selectedAgentId}
                                    onChange={(e) => setSelectedAgentId(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">-- Choose Agent --</option>
                                    {subscribedAgents.map(agent => (
                                        <option key={agent._id} value={agent._id}>
                                            {agent.name} {agent.companyName ? `(${agent.companyName})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {subscribedAgents.length === 0 && (
                                    <p className="text-xs text-red-500 mt-1">No agents have active lead subscriptions.</p>
                                )}
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Provider Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={externalName}
                                        onChange={(e) => setExternalName(e.target.value)}
                                        placeholder="e.g. John's Movers"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Provider Email
                                    </label>
                                    <input
                                        type="email"
                                        value={externalEmail}
                                        onChange={(e) => setExternalEmail(e.target.value)}
                                        placeholder="e.g. sales@johnsmovers.co.ke"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedLead(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={forwarding}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                {forwarding ? <FaSpinner className="animate-spin" /> : <><FaPaperPlane /> Send Email</>}
                            </button>
                        </div>
                    </form>

                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadManager;