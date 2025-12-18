import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import apiClient from '../api/axios';
import { FaChartLine, FaWhatsapp, FaPhone, FaMousePointer, FaUsers } from 'react-icons/fa';

const AdminAnalyticsWidget = () => {
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiClient.get('/tracking/weekly');
                setData(res.data.weeklyChart);
                setSummary(res.data.summary);
            } catch (error) {
                console.error("Failed to load analytics", error);
                if (import.meta.env.DEV) {
                    console.warn("Using dummy data for analytics");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FaChartLine className="text-blue-600" /> Weekly Engagement
                    </h3>
                    <p className="text-sm text-gray-500">Track leads and user interactions over the last 7 days.</p>
                </div>

                {/* Quick Stats */}
                {summary && (
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <div className="text-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-xl font-bold text-blue-600">{summary.totalInteractionsLast7Days}</div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Total Actions</div>
                        </div>
                        <div className="text-center px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-xl font-bold text-green-600">{summary.activeUsersLast7Days}</div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Active Users</div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ width: '100%', height: 300, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorWhatsapp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorCall" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="whatsapp" stroke="#22c55e" fillOpacity={1} fill="url(#colorWhatsapp)" name="WhatsApp" />
                        <Area type="monotone" dataKey="call" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCall)" name="Calls" />
                        <Area type="monotone" dataKey="email" stroke="#f59e0b" fillOpacity={0.4} fill="#f59e0b" name="Emails" />
                        <Area type="monotone" dataKey="chat" stroke="#8b5cf6" fillOpacity={0.4} fill="#8b5cf6" name="Chat" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AdminAnalyticsWidget;
