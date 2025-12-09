// src/components/property/InsightLocker.jsx
import React from 'react';
import { FaLock, FaPenAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const InsightLocker = ({ children, isLocked }) => {
    const { user } = useAuth();

    // Logic: Locked if user hasn't contributed a review yet
    // We check for 'contributionCount' explicitly.
    const userHasContributed = user && (user.contributionCount > 0 || user.reviews?.length > 0 || user.livingExperiences?.length > 0);

    // Admin/Agent bypass
    const isPrivileged = user && (user.role === 'admin' || user.role === 'agent');

    const shouldLock = isLocked || (!isPrivileged && !userHasContributed);

    if (!shouldLock) return children;

    return (
        <div className="relative overflow-hidden rounded-xl">
            {/* Blur the content slightly */}
            <div className="filter blur-md select-none pointer-events-none opacity-40">
                {children}
            </div>

            {/* Overlay CTA */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-white/30 dark:bg-black/30 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm mx-auto transform transition-transform hover:scale-105">
                    <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <FaLock size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Unlock the Real Tea ☕
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                        To see exact <strong>water rationing schedules</strong>, <strong>internet speeds</strong>, and <strong>noise recordings</strong>, you must contribute at least 1 review of a place you've lived in.
                    </p>
                    <Link
                        to="/my-profile?tab=residency"
                        className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <FaPenAlt /> Write a Review to Unlock
                    </Link>
                    <p className="text-xs text-gray-400 mt-4">
                        It takes less than 2 minutes. Help the community!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InsightLocker;
