'use client'

import ContentGroupCardSkeleton from './ContentGroupCardSkeleton'

const ContentGroupGridSkeleton = ({ count = 8 }) => {
    return (
        <div className="space-y-6">
            {/* Search Bar Skeleton */}
            <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-md">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: count }, (_, index) => (
                    <div
                        key={index}
                        style={{
                            animationDelay: `${index * 100}ms`,
                        }}
                        className="animate-fade-in"
                    >
                        <ContentGroupCardSkeleton />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ContentGroupGridSkeleton
