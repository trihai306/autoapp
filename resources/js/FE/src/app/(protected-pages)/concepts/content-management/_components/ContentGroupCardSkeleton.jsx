'use client'

import { Card } from '@/components/ui'
import Skeleton from '@/components/ui/Skeleton'

const ContentGroupCardSkeleton = () => {
    return (
        <Card className="animate-pulse">
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                        <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                            <Skeleton variant="circle" width={16} height={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Skeleton width="70%" height={14} className="mb-1" />
                            <div className="flex items-center space-x-1">
                                <Skeleton variant="circle" width={12} height={12} />
                                <Skeleton width="60px" height={10} />
                            </div>
                        </div>
                    </div>
                    <Skeleton variant="circle" width={24} height={24} />
                </div>

                {/* Content Stats */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <Skeleton variant="circle" width={20} height={20} />
                        <div className="flex items-baseline space-x-1">
                            <Skeleton width="24px" height={18} />
                            <Skeleton width="50px" height={10} />
                        </div>
                    </div>
                    <Skeleton width="70px" height={20} className="rounded-full" />
                </div>

                {/* Action Hint */}
                <div className="py-2 border border-dashed border-gray-200 dark:border-gray-600 rounded-md">
                    <Skeleton width="100px" height={12} className="mx-auto" />
                </div>
            </div>
        </Card>
    )
}

export default ContentGroupCardSkeleton
