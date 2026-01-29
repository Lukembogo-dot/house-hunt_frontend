// Skeleton Loaders for Instant Perceived Performance
// Shows content structure immediately while data loads

import React from 'react';

/**
 * Generic skeleton for any content block
 */
export const Skeleton = ({ className = '', width = 'w-full', height = 'h-4' }) => (
    <div className={`${width} ${height} bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} />
);

/**
 * Page-level skeleton for route transitions
 */
export const PageSkeleton = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Hero Skeleton */}
        <div className="h-64 md:h-80 bg-gray-300 dark:bg-gray-800 animate-pulse" />

        {/* Content Skeleton */}
        <div className="max-w-6xl mx-auto p-6">
            <Skeleton height="h-8" width="w-1/3" className="mb-4" />
            <Skeleton height="h-4" width="w-2/3" className="mb-2" />
            <Skeleton height="h-4" width="w-1/2" className="mb-8" />

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                        <Skeleton height="h-48" className="mb-4" />
                        <Skeleton height="h-4" className="mb-2" />
                        <Skeleton height="h-4" width="w-3/4" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/**
 * Property Card Skeleton
 */
export const PropertyCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden animate-pulse">
        {/* Image Skeleton */}
        <div className="h-48 md:h-56 bg-gray-300 dark:bg-gray-700" />

        {/* Content Skeleton */}
        <div className="p-4 space-y-3">
            <Skeleton height="h-6" width="w-3/4" />
            <Skeleton height="h-4" width="w-full" />
            <Skeleton height="h-4" width="w-2/3" />

            <div className="flex justify-between items-center pt-2">
                <Skeleton height="h-8" width="w-24" />
                <Skeleton height="h-8" width="w-20" />
            </div>
        </div>
    </div>
);

/**
 * Property List Skeleton (multiple cards)
 */
export const PropertyListSkeleton = ({ count = 6 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
        ))}
    </div>
);

/**
 * Property Details Skeleton
 */
export const PropertyDetailsSkeleton = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Image Gallery Skeleton */}
        <div className="h-96 bg-gray-300 dark:bg-gray-800 animate-pulse" />

        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Skeleton height="h-10" width="w-3/4" />
                    <Skeleton height="h-6" width="w-1/2" className="mb-4" />

                    {/* Description Lines */}
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} height="h-4" className="mb-2" />
                    ))}

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} height="h-12" />
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl animate-pulse space-y-4">
                        <Skeleton height="h-8" />
                        <Skeleton height="h-12" />
                        <Skeleton height="h-12" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/**
 * Service Provider Card Skeleton
 */
export const ServiceProviderSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton height="h-6" width="w-1/2" />
                <Skeleton height="h-4" width="w-1/3" />
            </div>
        </div>
        <Skeleton height="h-4" className="mb-2" />
        <Skeleton height="h-4" width="w-3/4" />
    </div>
);

/**
 * Form Skeleton
 */
export const FormSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl space-y-4 animate-pulse">
        <Skeleton height="h-6" width="w-1/3" className="mb-4" />
        {[1, 2, 3].map(i => (
            <div key={i}>
                <Skeleton height="h-4" width="w-24" className="mb-2" />
                <Skeleton height="h-12" />
            </div>
        ))}
        <Skeleton height="h-12" width="w-32" className="mt-6" />
    </div>
);

/**
 * Dashboard Stats Skeleton
 */
export const DashboardStatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl animate-pulse">
                <Skeleton height="h-4" width="w-1/2" className="mb-2" />
                <Skeleton height="h-10" width="w-3/4" />
            </div>
        ))}
    </div>
);

export default {
    Skeleton,
    PageSkeleton,
    PropertyCardSkeleton,
    PropertyListSkeleton,
    PropertyDetailsSkeleton,
    ServiceProviderSkeleton,
    FormSkeleton,
    DashboardStatsSkeleton,
};
