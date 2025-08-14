'use client'

import { Card } from '@/components/ui'
import Skeleton from '@/components/ui/Skeleton'

const ContentGroupCardSkeleton = () => {
    return (
        <Card className="animate-pulse">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <Skeleton variant="circle" width={20} height={20} />
                        </div>
                        <div className="flex-1">
                            <Skeleton width="70%" height={16} className="mb-2" />
                            <Skeleton width="40%" height={12} />
                        </div>
                    </div>
                    <Skeleton variant="circle" width={24} height={24} />
                </div>

                {/* Content Count */}
                <div className="flex items-center space-x-2 mb-4">
                    <Skeleton variant="circle" width={16} height={16} />
                    <Skeleton width="60px" height={14} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <Skeleton width="80px" height={12} />
                    <Skeleton width="50px" height={12} />
                </div>
            </div>
        </Card>
    )
}

export default ContentGroupCardSkeleton
