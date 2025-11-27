// src/components/admin/PaymentSettingsManager.jsx
// (FIXED: Auto-detects CamelCase vs Snake_case keys to ensure prices show up)

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import { 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaMoneyBillWave, 
  FaClock, 
  FaCogs,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';

const PaymentSettingsManager = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  // ✅ CONFIG: Define the settings we want to manage
  // We list 'possibleKeys' to catch data whether it's stored as 'featuredListingPrice' OR 'featured_listing_price'
  const SETTING_DEFINITIONS = [
    { 
      id: 'featured_listing_price', 
      possibleKeys: ['featuredListingPrice', 'featured_listing_price', 'featuredPrice'],
      label: 'Featured Listing Price', 
      icon: 'money', 
      dataType: 'number', 
      description: 'Cost to feature a property (Ksh).' 
    },
    { 
      id: 'featured_listing_duration', 
      possibleKeys: ['featuredListingDuration', 'featured_listing_duration', 'featuredDuration'],
      label: 'Featured Duration', 
      icon: 'time', 
      dataType: 'number', 
      description: 'Duration in Days.' 
    },
    { 
      id: 'listing_refresh_price', 
      possibleKeys: ['listingRefreshPrice', 'listing_refresh_price', 'refreshPrice'],
      label: 'Listing Refresh Price', 
      icon: 'money', 
      dataType: 'number', 
      description: 'Cost to refresh/boost a listing (Ksh).' 
    },
    { 
      id: 'lead_subscription_price', 
      possibleKeys: ['leadSubscriptionPrice', 'lead_subscription_price', 'subscriptionPrice'],
      label: 'Lead Subscription Price', 
      icon: 'money', 
      dataType: 'number', 
      description: 'Monthly cost for lead access.' 
    }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await apiClient.get('/settings', { withCredentials: true });
      
      console.log("Settings API Response:", data); // Debugging

      if (data) {
        // ✅ SMART ADAPTER: Extract values regardless of format (Array or Object)
        const extractedSettings = SETTING_DEFINITIONS.map(def => {
          let foundValue = 0; // Default

          if (Array.isArray(data)) {
            // Case A: Data is an Array [{key: '...', value: '...'}]
            const match = data.find(item => def.possibleKeys.includes(item.key));
            if (match) foundValue = match.value;
          } else if (typeof data === 'object') {
            // Case B: Data is a Global Object { featuredListingPrice: 500 }
            for (const key of def.possibleKeys) {
              if (data[key] !== undefined) {
                foundValue = data[key];
                break; // Stop once we find a matching key
              }
            }
          }

          return {
            key: def.id, // We use our internal ID as the reliable key
            value: foundValue,
            label: def.label,
            description: def.description,
            icon: def.icon,
            dataType: def.dataType
          };
        });

        setSettings(extractedSettings);
        setError('');
      } else {
        setSettings([]);
        setError('No settings data returned.');
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError('Failed to load settings.');
      setSettings([]);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (setting) => {
    setEditingKey(setting.key);
    setEditValue(setting.value);
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const handleSave = async (key) => {
    setSaving(true);
    try {
      // We send the update. The backend should handle creating the key if it doesn't exist.
      await apiClient.put(`/settings/${key}`, { value: editValue }, { withCredentials: true });
      
      // Update local state immediately for UI responsiveness
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value: editValue } : s));
      setEditingKey(null);
    } catch (error) {
      alert('Failed to update setting: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading Payment Configurations...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaCogs className="text-gray-500" /> Payment & System Configuration
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Adjust prices and durations dynamically. Changes reflect immediately.
            </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 border border-red-200">
            <FaExclamationTriangle /> 
            <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settings.map((setting) => (
          <div 
            key={setting.key} 
            className={`p-4 rounded-lg border transition-all ${
              editingKey === setting.key 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' 
                : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${
                    setting.icon === 'money' ? 'bg-green-100 text-green-600' : 
                    setting.icon === 'time' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                }`}>
                    {setting.icon === 'money' ? <FaMoneyBillWave /> : setting.icon === 'time' ? <FaClock /> : <FaCogs />}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{setting.label}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{setting.description}</p>
                </div>
              </div>
              
              {editingKey !== setting.key && (
                <button 
                  onClick={() => startEditing(setting)}
                  className="text-gray-400 hover:text-blue-600 transition p-1"
                  title="Edit Value"
                >
                  <FaEdit />
                </button>
              )}
            </div>

            <div className="mt-3">
               {editingKey === setting.key ? (
                 <div className="flex items-center gap-2">
                    <input 
                      type={setting.dataType === 'number' ? 'number' : 'text'}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-3 py-1.5 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      autoFocus
                    />
                    <button 
                      onClick={() => handleSave(setting.key)}
                      disabled={saving}
                      className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    </button>
                    <button 
                      onClick={cancelEditing}
                      className="bg-gray-200 text-gray-600 p-2 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200"
                    >
                      <FaTimes />
                    </button>
                 </div>
               ) : (
                 <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {setting.dataType === 'number' ? Number(setting.value).toLocaleString() : setting.value}
                    <span className="text-xs font-normal text-gray-500 ml-1">
                        {setting.icon === 'money' ? 'Ksh' : setting.icon === 'time' ? 'Days' : ''}
                    </span>
                 </p>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentSettingsManager;