import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaUserPlus, FaArchive, FaBoxOpen, FaExclamationTriangle } from 'react-icons/fa';
import apiClient from '../../api/axios';

const PropertyManager = ({ properties, fetchData, onAssignAgent }) => {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archived'
  const [loading, setLoading] = useState(false);

  // Filter properties based on the tab
  // Note: For 'archived' to show up here, the backend fetch must include them.
  // If the backend filters them out, this tab might be empty until we update the 'getProperties' controller filter.
  const filteredProperties = properties.filter(p => {
    if (activeTab === 'active') {
      return p.status !== 'archived';
    }
    return p.status === 'archived';
  });

  // Soft Delete (Archive)
  const handleArchive = async (id) => {
    if (!window.confirm('Are you sure you want to archive this property? It will be hidden from the public.')) return;
    setLoading(true);
    try {
      await apiClient.delete(`/properties/${id}`, { withCredentials: true });
      alert('Property archived successfully.');
      fetchData(); // Refresh list
    } catch (err) {
      alert('Failed to archive property.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Hard Delete (Permanent)
  const handlePermanentDelete = async (id) => {
    if (!window.confirm('WARNING: This will PERMANENTLY DELETE the property and all its images. This cannot be undone. Proceed?')) return;
    setLoading(true);
    try {
      // Calling the new Permanent Delete Endpoint
      await apiClient.delete(`/properties/${id}/permanent`, { withCredentials: true });
      alert('Property permanently deleted.');
      fetchData();
    } catch (err) {
      alert('Failed to delete property permanently. Check if you are an admin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Restore this property to the market?')) return;
    setLoading(true);
    try {
      await apiClient.put(`/properties/${id}`, { status: 'available' }, { withCredentials: true });
      alert('Property restored.');
      fetchData();
    } catch (err) {
      alert('Failed to restore property.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 overflow-hidden">
      {/* --- Tabs Header --- */}
      <div className="flex border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-4 text-center font-semibold transition ${
            activeTab === 'active'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Active Properties
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`flex-1 py-4 text-center font-semibold transition ${
            activeTab === 'archived'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50 dark:bg-gray-700 dark:text-red-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Archived / Trash
        </button>
      </div>

      {/* --- Table Content --- */}
      <div className="p-4 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold dark:text-white">
            {activeTab === 'active' ? 'Live Market Listings' : 'Archived Listings (Hidden)'}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredProperties.length})
            </span>
          </h3>
          {activeTab === 'active' && (
            <Link to="/add-property" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition shadow-sm">
              + Add Property
            </Link>
          )}
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            {activeTab === 'active' ? (
              <p>No active properties found.</p>
            ) : (
              <div className="flex flex-col items-center">
                <FaBoxOpen className="text-4xl mb-2 opacity-50" />
                <p>No archived properties.</p>
                <p className="text-xs mt-1">Properties you delete will appear here first.</p>
              </div>
            )}
          </div>
        ) : (
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                <th className="p-3 rounded-tl-lg">Property</th>
                <th className="p-3">Location</th>
                <th className="p-3">Price</th>
                <th className="p-3">Agent</th>
                <th className="p-3 rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((prop) => (
                <tr key={prop._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="p-3">
                    <div className="font-medium text-gray-900 dark:text-white">{prop.title}</div>
                    <div className="text-xs text-gray-500">{prop.type} • {prop.status}</div>
                  </td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{prop.location}</td>
                  <td className="p-3 font-mono text-gray-700 dark:text-gray-300">
                    {prop.price.toLocaleString()}
                  </td>
                  <td className="p-3 text-sm">
                    {prop.agent ? (
                      <span className="text-gray-900 dark:text-white">{prop.agent.name}</span>
                    ) : (
                      <span className="text-red-500 text-xs font-bold">Admin / Unassigned</span>
                    )}
                  </td>
                  
                  <td className="p-3 flex justify-end gap-2">
                    {activeTab === 'active' ? (
                      <>
                        <button 
                          onClick={() => onAssignAgent(prop)} 
                          className="p-2 text-green-600 hover:bg-green-100 rounded-full transition" 
                          title="Assign Agent"
                        >
                          <FaUserPlus />
                        </button>
                        <Link 
                          to={`/admin/property/${prop._id}/edit`} 
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition" 
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                        <button 
                          onClick={() => handleArchive(prop._id)} 
                          className="p-2 text-orange-600 hover:bg-orange-100 rounded-full transition" 
                          title="Archive (Soft Delete)"
                        >
                          <FaArchive />
                        </button>
                      </>
                    ) : (
                      <>
                         <button 
                          onClick={() => handleRestore(prop._id)} 
                          className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-xs font-bold transition" 
                        >
                          Restore
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(prop._id)} 
                          className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-xs font-bold transition" 
                          title="Permanent Delete"
                        >
                          <FaExclamationTriangle /> Delete Forever
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PropertyManager;