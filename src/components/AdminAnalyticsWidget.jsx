import React, { useEffect, useState } from 'react';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area
} from 'recharts';
import apiClient from '../api/axios';
import { FaChartLine, FaEye, FaMousePointer, FaGlobe, FaUserPlus } from 'react-icons/fa';

const AdminAnalyticsWidget = ({ properties = [] }) => {
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPropertyId, setSelectedPropertyId] = useState('');

    // Date Range State
    const [dateRange, setDateRange] = useState({ start: '', end: '', preset: '7d' });

    // Presets Helper
    const applyPreset = (preset) => {
        const end = new Date();
        const start = new Date();

        if (preset === '7d') start.setDate(end.getDate() - 6);
        if (preset === '30d') start.setDate(end.getDate() - 29);
        if (preset === 'month') start.setDate(1); // 1st of current month

        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0],
            preset
        });
    };

    // Apply default (7d) on mount
    useEffect(() => {
        applyPreset('7d');
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            if (!dateRange.start) return;
            try {
                setLoading(true);
                const queryParams = new URLSearchParams({
                    propertyId: selectedPropertyId,
                    startDate: dateRange.start,
                    endDate: dateRange.end
                });

                const res = await apiClient.get(`/tracking/weekly?${queryParams}`);
                setData(res.data.weeklyChart);
                setSummary(res.data.summary);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedPropertyId, dateRange.start, dateRange.end]);

    // Filter properties for dropdown
    const sortedProperties = [...properties].sort((a, b) => a.title.localeCompare(b.title));

    // Trend Helper
    const TrendIndicator = ({ value }) => {
        if (!value) return <span className="text-gray-400 text-xs">-</span>;
        const isPositive = value > 0;
        return (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ml-2 ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {isPositive ? '↑' : '↓'} {Math.abs(value)}%
            </span>
        );
    };

    if (loading && !summary) return <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            <div className="flex flex-col gap-6 mb-6">

                {/* Header Row: Title & Property Filter */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FaChartLine className="text-purple-600" /> Performance Analytics
                        </h3>
                        <p className="text-sm text-gray-500">
                            {dateRange.start} to {dateRange.end}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <select
                            value={selectedPropertyId}
                            onChange={(e) => setSelectedPropertyId(e.target.value)}
                            className="flex-1 md:flex-none px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 outline-none max-w-xs"
                        >
                            <option value="">Global Platform Stats</option>
                            {sortedProperties.map(p => (
                                <option key={p._id} value={p._id}>
                                    {p.title.substring(0, 30)}...
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Controls Row: Date Presets & Custom Range */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-gray-100 dark:border-gray-700 py-4">
                    <div className="flex items-center gap-2">
                        {['7d', '30d', 'month'].map(preset => (
                            <button
                                key={preset}
                                onClick={() => applyPreset(preset)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${dateRange.preset === preset
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                    }`}
                            >
                                {preset === '7d' ? 'Last 7 Days' : preset === '30d' ? 'Last 30 Days' : 'This Month'}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value, preset: 'custom' })}
                            className="px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value, preset: 'custom' })}
                            className="px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-700 dark:text-gray-300"
                        />
                    </div>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Page Views</div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{summary.totalViewsLast7Days}</span>
                                <TrendIndicator value={summary.trends?.views} />
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Actions</div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{summary.totalInteractionsLast7Days}</span>
                                <TrendIndicator value={summary.trends?.interactions} />
                            </div>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 hidden md:block">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Active Users</div>
                            <span className="text-2xl font-black text-green-600 dark:text-green-400">{summary.activeUsersLast7Days}</span>
                        </div>
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Total Visitors</div>
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{summary.visitors?.total || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 mt-1">
                                <span className="text-blue-600">{summary.visitors?.newPercent || 0}% New</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-purple-600">{summary.visitors?.returningPercent || 0}% Return</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="left" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            {/* Page Views as Area */}
                            <Area yAxisId="left" type="monotone" dataKey="views" fill="url(#colorViews)" stroke="#8b5cf6" strokeWidth={2} name="Page Views" />
                            {/* Actions as Bar */}
                            <Bar yAxisId="right" dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Engagement Actions" barSize={20} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Sources */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 overflow-y-auto max-h-80">
                    <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <FaGlobe className="text-blue-500" /> Top Traffic Sources
                    </h4>
                    <div className="space-y-3">
                        {summary?.trafficSources && summary.trafficSources.length > 0 ? (
                            summary.trafficSources.map((source, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400 truncate max-w-[150px]" title={source._id}>
                                        {source._id === 'direct' ? 'Direct / Unknown' : source._id}
                                    </span>
                                    <span className="font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-2 py-0.5 rounded border dark:border-gray-600">
                                        {source.count}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm italic">No traffic data.</p>
                        )}
                    </div>
                </div>

                {/* Top Pages */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 overflow-y-auto max-h-80 lg:col-span-3">
                    <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <FaEye className="text-purple-500" /> Top Performing Pages
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                                <tr>
                                    <th className="px-3 py-2 rounded-l-lg">#</th>
                                    <th className="px-3 py-2">Property Title</th>
                                    <th className="px-3 py-2">Location</th>
                                    <th className="px-3 py-2 text-right rounded-r-lg">Views</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary?.topProperties && summary.topProperties.length > 0 ? (
                                    summary.topProperties.map((prop, index) => (
                                        <tr key={index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{index + 1}</td>
                                            <td className="px-3 py-3 font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                                                {prop.title}
                                            </td>
                                            <td className="px-3 py-3 text-gray-500 dark:text-gray-400">{prop.location}</td>
                                            <td className="px-3 py-3 text-right font-bold text-purple-600 dark:text-purple-400">
                                                {prop.views}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-gray-400 italic">No page data available for this period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsWidget;
