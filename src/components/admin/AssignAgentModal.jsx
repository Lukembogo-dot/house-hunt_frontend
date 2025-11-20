// src/components/admin/AssignAgentModal.jsx
// (Extracted & Updated: Includes Service Type Dropdown)

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaSearch, FaPlusCircle, FaSpinner } from 'react-icons/fa';

const AssignAgentModal = ({ show, onClose, property, agents, onAssign }) => {
  const [mode, setMode] = useState('select'); 
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); 
  
  // ✅ UPDATED STATE: Added serviceType
  const [newAgent, setNewAgent] = useState({ 
    name: '', 
    companyName: '', 
    whatsappNumber: '',
    serviceType: 'Real Estate' // Default
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedAgentId('');
    setNewAgent({ name: '', companyName: '', whatsappNumber: '', serviceType: 'Real Estate' });
    setSearchTerm(''); 
    setMode('select');
  }, [property, show]);

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (agent.companyName && agent.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload = {};

    if (mode === 'select') {
        if (!selectedAgentId) {
            alert('Please select an agent.');
            setIsSubmitting(false);
            return;
        }
        payload.agentId = selectedAgentId;
    } else {
        if (!newAgent.name) {
            alert('Agent Name is required.');
            setIsSubmitting(false);
            return;
        }
        payload.newAgentData = newAgent;
    }

    await onAssign(property._id, payload);
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
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          disabled={isSubmitting}
        >
          <FaTimes size={20} />
        </button>
        
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Assign Agent
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">
          Property: {property?.title}
        </p>

        {/* --- TABS --- */}
        <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
                onClick={() => setMode('select')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${
                    mode === 'select' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
            >
                <div className="flex items-center justify-center gap-2">
                    <FaSearch /> Existing Agent
                </div>
            </button>
            <button
                onClick={() => setMode('create')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${
                    mode === 'create' 
                    ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
            >
                <div className="flex items-center justify-center gap-2">
                    <FaPlusCircle /> New Shadow Agent
                </div>
            </button>
        </div>

        {/* --- SELECT EXISTING --- */}
        {mode === 'select' && (
            <div className="mb-4 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search Agent
                </label>
                <div className="relative mb-2">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Type name or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Match
                </label>
                <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    size={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white overflow-y-auto"
                >
                    {filteredAgents.length === 0 && (
                        <option value="" disabled>No agents found matching "{searchTerm}"</option>
                    )}
                    {filteredAgents.map(agent => (
                    <option key={agent._id} value={agent._id} className="py-1">
                        {agent.name} {agent.companyName ? `(${agent.companyName})` : ''}
                    </option>
                    ))}
                </select>
            </div>
        )}

        {/* --- CREATE NEW SHADOW --- */}
        {mode === 'create' && (
            <div className="space-y-3 mb-4 animate-fade-in">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Agent Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text"
                        placeholder="e.g., John Doe"
                        value={newAgent.name}
                        onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Company Name <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input 
                        type="text"
                        placeholder="e.g., Villa Homes Ltd"
                        value={newAgent.companyName}
                        onChange={(e) => setNewAgent({...newAgent, companyName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
                
                {/* ✅ NEW: SERVICE TYPE DROPDOWN */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Account Type
                    </label>
                    <select
                        value={newAgent.serviceType}
                        onChange={(e) => setNewAgent({...newAgent, serviceType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="Real Estate">Real Estate Agent</option>
                        <option value="Movers">Mover / Relocation</option>
                        <option value="Internet">Internet Service Provider</option>
                        <option value="Cleaning">Cleaning Service</option>
                        <option value="Interior Design">Interior Design</option>
                        <option value="Security">Security</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        WhatsApp Number <span className="text-gray-400 text-xs">(For Claiming)</span>
                    </label>
                    <input 
                        type="text"
                        placeholder="e.g., 0712345678"
                        value={newAgent.whatsappNumber}
                        onChange={(e) => setNewAgent({...newAgent, whatsappNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
            </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
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
            disabled={isSubmitting}
            className={`w-auto px-6 flex items-center justify-center space-x-2 text-white py-2.5 rounded-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                mode === 'create' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : (mode === 'create' ? 'Create & Assign' : 'Assign Agent')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AssignAgentModal;