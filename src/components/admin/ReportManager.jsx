import React, { useState, useEffect } from 'react';
import { FaFlag, FaTrash, FaExternalLinkAlt, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import apiClient from '../../api/axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const ReportManager = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get('/reports', { withCredentials: true });
            setReports(data);
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const dismissReport = async (id) => {
        if (!window.confirm("Are you sure you want to dismiss this report?")) return;
        try {
            await apiClient.delete(`/reports/${id}`, { withCredentials: true });
            setReports(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            console.error("Failed to dismiss report:", error);
            alert("Failed to dismiss report.");
        }
    };

    if (loading) return <div className="p-4 text-center">Loading Reports...</div>;

    if (reports.length === 0) return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700 text-center">
            <h3 className="text-gray-500 font-medium">No active reports.</h3>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 dark:text-white flex items-center gap-2">
                <FaFlag className="text-red-500" /> Property Reports ({reports.length})
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="p-3">Reported On</th>
                            <th className="p-3">Property</th>
                            <th className="p-3">Reason</th>
                            <th className="p-3">Reported By</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {reports.map(report => (
                            <tr key={report._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                    {format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}
                                </td>
                                <td className="p-3">
                                    {report.property ? (
                                        <div>
                                            <Link
                                                to={`/properties/${report.property.slug}`}
                                                target="_blank"
                                                className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                {report.property.title} <FaExternalLinkAlt size={10} />
                                            </Link>
                                            <div className="text-xs mt-1">
                                                Status: <span className={`px-1.5 py-0.5 rounded font-bold ${report.property.status === 'archived' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                    }`}>{report.property.status}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-red-500 italic">Property Deleted</span>
                                    )}
                                </td>
                                <td className="p-3 max-w-xs break-words">
                                    <div className="bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200 p-2 rounded text-xs">
                                        {report.reason}
                                    </div>
                                </td>
                                <td className="p-3 text-gray-600 dark:text-gray-300">
                                    {report.user ? report.user.name : "Unknown User"}
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => dismissReport(report._id)}
                                        className="text-gray-400 hover:text-red-500 transition"
                                        title="Dismiss Report"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportManager;
