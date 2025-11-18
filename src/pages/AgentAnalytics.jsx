import { useEffect, useState } from 'react';
import { useFeatureFlag } from '../context/FeatureFlagContext';
import { Navigate, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import CompetitorIntelligenceCard from '../components/CompetitorIntelligenceCard'; // ✅ IMPORT NEW COMPONENT
import { FaEye, FaCrosshairs, FaChartLine, FaTrophy, FaFire, FaExternalLinkAlt } from 'react-icons/fa';

// Reusable Stat Card Component
const StatCard = ({ icon, title, value, unit }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
          {unit && <span className="text-xl ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  </div>
);

export default function AgentAnalytics() {
  const isAnalyticsEnabled = useFeatureFlag('agent-analytics-dashboard');

  const [analytics, setAnalytics] = useState(null);
  const [competitorInsights, setCompetitorInsights] = useState(null); // ✅ EXISTING STATE
  const [listings, setListings] = useState([]); // ✅ NEW STATE FOR TABLE DATA
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAnalyticsEnabled) {
      const fetchData = async () => {
        try {
          setLoading(true);
          
          // ✅ FETCH 3 ENDPOINTS: Analytics, Intelligence, and Raw Listings for the Table
          const [analyticsRes, insightsRes, listingsRes] = await Promise.all([
            apiClient.get('/users/my-analytics'),
            apiClient.get('/users/competitor-insights'),
            apiClient.get('/properties/my-listings')
          ]);

          setAnalytics(analyticsRes.data);
          setCompetitorInsights(insightsRes.data);
          setListings(listingsRes.data);

        } catch (err) {
          console.error(err);
          setError(err.response?.data?.message || 'Failed to load analytics.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isAnalyticsEnabled]);

  if (!isAnalyticsEnabled) {
    return <Navigate to="/profile" replace />;
  }

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

  // Helper to calculate conversion rate
  const getConversionRate = (leads, views) => {
    if (!views || views === 0) return 0;
    return ((leads / views) * 100).toFixed(1);
  };

  // Sort listings by Leads (Hotness) Descending
  const sortedListings = [...listings].sort((a, b) => (b.leads || 0) - (a.leads || 0)).slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
        My Analytics Dashboard
      </h1>
      
      {/* ✅ COMPETITOR INTELLIGENCE SECTION */}
      {competitorInsights && (
        <CompetitorIntelligenceCard data={competitorInsights} />
      )}

      {/* Existing KPI Grid */}
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

      {/* ✅ NEW: LEAD CONVERSION SCOREBOARD (Replaces simple card) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaFire className="text-orange-500" />
            Top Converting Listings
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">Based on WhatsApp Clicks</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase font-semibold text-gray-500 dark:text-gray-200">
              <tr>
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4 text-center">Views</th>
                <th className="px-6 py-4 text-center">Leads</th>
                <th className="px-6 py-4 text-center">Conversion Rate</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedListings.length > 0 ? (
                sortedListings.map((property) => (
                  <tr key={property._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <img 
                          src={property.images?.[0]?.url || property.imageUrl || "https://placehold.co/100x100"} 
                          alt="" 
                          className="w-10 h-10 rounded object-cover bg-gray-200"
                        />
                        <span className="truncate max-w-[200px]">{property.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">{property.views || 0}</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600 dark:text-green-400">
                      {property.leads || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        getConversionRate(property.leads, property.views) > 2 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {getConversionRate(property.leads, property.views)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/properties/${property.slug}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Listing"
                      >
                        <FaExternalLinkAlt />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No listings found. Start posting to see your stats!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}