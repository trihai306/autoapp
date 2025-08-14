'use client'
import Card from '@/components/ui/Card'
import { 
    HiOutlineDotsVertical as MoreVertical, 
    HiOutlineTrendingUp as ArrowUpRight, 
    HiOutlineTrendingDown as ArrowDownRight 
} from 'react-icons/hi'
import classNames from 'classnames'

const MetricCard = ({ 
    title,
    metrics = [],
    loading = false,
    className,
    showComparison = true
}) => {
    if (loading) {
        return (
            <Card className={classNames('h-full', className)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className={classNames('h-full', className)}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </h3>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>

                {/* Metrics */}
                <div className="space-y-6">
                    {metrics.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {metric.icon && (
                                        <div className={classNames(
                                            'w-8 h-8 rounded-lg flex items-center justify-center',
                                            metric.iconBg || 'bg-gray-100 dark:bg-gray-800'
                                        )}>
                                            <metric.icon className="w-4 h-4" />
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {metric.label}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                        {metric.value}
                                    </span>
                                    
                                    {showComparison && metric.change && (
                                        <div className={classNames(
                                            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                                            metric.changeType === 'increase' 
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                : metric.changeType === 'decrease'
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        )}>
                                            {metric.changeType === 'increase' && <ArrowUpRight className="w-3 h-3" />}
                                            {metric.changeType === 'decrease' && <ArrowDownRight className="w-3 h-3" />}
                                            {metric.change}
                                        </div>
                                    )}
                                </div>
                                
                                {metric.subtitle && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {metric.subtitle}
                                    </p>
                                )}
                            </div>
                            
                            {metric.progress && (
                                <div className="w-16">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                            className={classNames(
                                                'h-2 rounded-full transition-all duration-300',
                                                metric.progressColor || 'bg-blue-500'
                                            )}
                                            style={{ width: `${metric.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block text-center">
                                        {metric.progress}%
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}

export default MetricCard
