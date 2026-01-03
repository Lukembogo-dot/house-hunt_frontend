import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import { FaUserTimes, FaUserCheck, FaGavel, FaSpinner, FaEye, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';

const ModeratorRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchRequests = async () => {
        try {
            const { data } = await apiClient.get('/admin/moderator-actions', { withCredentials: true });
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch moderator actions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id, decision) => {
        if (!window.confirm(`Are you sure you want to ${decision} this action?`)) return;

        setProcessingId(id);
        try {
            await apiClient.post(`/admin/moderator-actions/${id}/resolve`, { decision }, { withCredentials: true });
            // Remove from list
            setRequests((prev) => prev.filter(req => req._id !== id));
            if (selectedRequest?._id === id) setSelectedRequest(null);
        } catch (error) {
            alert('Failed to process action.');
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    const renderDiff = (payload) => {
        if (!payload.old || !payload.new) {
            return <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">{JSON.stringify(payload, null, 2)}</pre>;
        }

        const keys = Object.keys(payload.new);

        return (
            <div className="space-y-4">
                {keys.map((key) => {
                    const oldVal = JSON.stringify(payload.old[key]);
                    const newVal = JSON.stringify(payload.new[key]);

                    // Skip identical values (except if it's an object/array, simple check)
                    if (oldVal === newVal) return null;

                    return (
                        <div key={key} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-red-500 font-semibold mb-1">PREVIOUS</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all bg-red-50 dark:bg-red-900/10 p-2 rounded">
                                        {typeof payload.old[key] === 'object' ? <pre>{JSON.stringify(payload.old[key], null, 2)}</pre> : String(payload.old[key])}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-green-600 font-semibold mb-1">NEW</div>
                                    <div className="text-xs text-gray-900 dark:text-white font-mono break-all bg-green-50 dark:bg-green-900/10 p-2 rounded">
                                        {typeof payload.new[key] === 'object' ? <pre>{JSON.stringify(payload.new[key], null, 2)}</pre> : String(payload.new[key])}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) return <div className="p-4 text-center">Loading requests...</div>;
    if (requests.length === 0) return null; // Don't show if empty

    return (
        <>
            <section className="mb-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl shadow border border-purple-200 dark:border-purple-700 p-6">
                <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2 mb-4">
                    <FaGavel /> Moderator Approval Requests ({requests.length})
                </h2>
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">Moderator</th>
                                <th className="p-3">Action Type</th>
                                <th className="p-3">Target</th>
                                <th className="p-3">Details</th>
                                <th className="p-3">Decision</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {requests.map((req) => (
                                <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="p-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                        {format(new Date(req.createdAt), 'MMM d, HH:mm')}
                                    </td>
                                    <td className="p-3 font-semibold dark:text-white">
                                        {req.requester?.name || 'Unknown'}
                                    </td>
                                    <td className="p-3">
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {req.type.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="p-3 dark:text-gray-300">
                                        {req.targetName || req.targetId}
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => setSelectedRequest(req)}
                                            className="flex items-center gap-1 text-blue-600 hover:underline text-xs font-bold"
                                        >
                                            <FaEye /> View Changes
                                        </button>
                                    </td>
                                    <td className="p-3 flex items-center gap-2">
                                        <button
                                            onClick={() => handleAction(req._id, 'approve')}
                                            disabled={processingId === req._id}
                                            className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                                            title="Approve"
                                        >
                                            {processingId === req._id ? <FaSpinner className="animate-spin" /> : <FaUserCheck />}
                                        </button>
                                        <button
                                            onClick={() => handleAction(req._id, 'reject')}
                                            disabled={processingId === req._id}
                                            className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                                            title="Reject"
                                        >
                                            <FaUserTimes />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* DETAILS MODAL */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                            <h3 className="text-xl font-bold dark:text-white">Review Changes</h3>
                            <button onClick={() => setSelectedRequest(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-grow">
                            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                <div>
                                    <span className="text-gray-500 block text-xs uppercase">Requested By</span>
                                    <span className="font-semibold dark:text-white">{selectedRequest.requester?.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block text-xs uppercase">Action Type</span>
                                    <span className="font-semibold dark:text-white">{selectedRequest.type.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-500 block text-xs uppercase">Target</span>
                                    <span className="font-semibold dark:text-white">{selectedRequest.targetName} ({selectedRequest.targetId})</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h4 className="font-bold mb-4 dark:text-white">Modifications</h4>
                                {selectedRequest.type === 'SERVICE_UPDATE' ? (
                                    renderDiff(selectedRequest.payload)
                                ) : (
                                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-xs overflow-x-auto text-gray-800 dark:text-gray-300">
                                        {JSON.stringify(selectedRequest.payload, null, 2)}
                                    </pre>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900">
                            <button
                                onClick={() => handleAction(selectedRequest._id, 'reject')}
                                disabled={processingId === selectedRequest._id}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-bold"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleAction(selectedRequest._id, 'approve')}
                                disabled={processingId === selectedRequest._id}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-bold"
                            >
                                {processingId === selectedRequest._id ? <FaSpinner className="animate-spin inline mr-2" /> : null}
                                Approve & Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ModeratorRequests;
