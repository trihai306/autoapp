'use client'

import { Card } from '@/components/ui'
import Skeleton from '@/components/ui/Skeleton'

const ContentItemSkeleton = () => {
    return (
        <Card className="animate-pulse">
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Skeleton variant="circle" width={16} height={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Skeleton width="80%" height={16} className="mb-1" />
                            <Skeleton width="30%" height={12} />
                        </div>
                    </div>
                    <Skeleton variant="circle" width={20} height={20} />
                </div>

                {/* Content Preview */}
                <div className="mb-3">
                    <Skeleton width="100%" height={14} className="mb-2" />
                    <Skeleton width="90%" height={14} className="mb-2" />
                    <Skeleton width="60%" height={14} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <Skeleton width="60px" height={12} />
                    <Skeleton width="40px" height={12} />
                </div>
            </div>
        </Card>
    )
}

export default ContentItemSkeleton
