import { useEffect, useState } from 'react';
import { useFeatureFlag } from '../context/FeatureFlagContext';
import { Navigate } from 'react-router-dom';
import apiClient from '../api/axios';
import PropertyCard from '../components/PropertyCard'; // We reuse this!
import { FaEye, FaCrosshairs, FaChartLine, FaTrophy } from 'react-icons/fa';

// A small, reusable component for the Stat Cards
const StatCard = ({ icon, title, value, unit }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
          {unit && <span className="text-xl ml-1">{unit}</span>}
        </p> {/* ✅ --- FIX IS HERE --- */}
      </div>
    </div>
  </div>
);

export default function AgentAnalytics() {
  // --- 1. USE THE FEATURE FLAG ---
  const isAnalyticsEnabled = useFeatureFlag('agent-analytics-dashboard');

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only fetch if the flag is enabled
    if (isAnalyticsEnabled) {
      const fetchAnalytics = async () => {
        try {
          setLoading(true);
          const { data } = await apiClient.get('/users/my-analytics');
          setAnalytics(data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load analytics.');
        } finally {
          setLoading(false);
        }
      };
      fetchAnalytics();
    }
  }, [isAnalyticsEnabled]); // Depend on the flag

  // --- 2. PROTECT THE COMPONENT ---
  // If the flag is off, redirect them to their profile.
  if (!isAnalyticsEnabled) {
    return <Navigate to="/profile" replace />;
  }

  // --- 3. RENDER STATES ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!analytics) {
    return <p className="text-center text-gray-500">No analytics data found.</p>;
  }

  // --- 4. RENDER THE DASHBOARD ---
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
        My Analytics Dashboard
      </h1>
      
      {/* Grid for the 4 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={<FaEye className="text-blue-600 dark:text-blue-400" />}
          title="Total Listing Views"
          value={analytics.totalViews}
        />
        <StatCard 
          icon={<FaCrosshairs className="text-blue-600 dark:text-blue-400" />}
          title="Total Leads"
          value={analytics.totalLeads}
        />
        <StatCard 
          icon={<FaChartLine className="text-blue-600 dark:text-blue-400" />}
          title="Click-Through Rate"
          value={analytics.clickThroughRate}
          unit="%"
        />
        <StatCard 
          icon={<FaTrophy className="text-blue-600 dark:text-blue-400" />}
          title="Total Listings"
          value={analytics.totalListings}
        />
      </div>

      {/* Section for Top Performing Listing */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Your Top Performing Listing
      </h2>

      {analytics.topPerformingListing ? (
        <div className="max-w-md">
          <PropertyCard property={analytics.topPerformingListing} />
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Views: {analytics.topPerformingListing.views} | Leads: {analytics.topPerformingListing.leads}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          You have no listings yet. Post a property to start tracking!
        </p>
      )}
    </div>
  );
}