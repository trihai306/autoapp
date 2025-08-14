'use client'
import Card from '@/components/ui/Card'
import { HiOutlineTrendingUp as TrendingUp, HiOutlineTrendingDown as TrendingDown, HiOutlineMinus as Minus } from 'react-icons/hi'
import classNames from 'classnames'

const StatCard = ({ 
    title, 
    value, 
    change, 
    changeType = 'neutral', // 'increase', 'decrease', 'neutral'
    icon: Icon,
    color = 'blue',
    loading = false,
    subtitle,
    className
}) => {
    const getTrendIcon = () => {
        switch (changeType) {
            case 'increase':
                return <TrendingUp className="w-4 h-4" />
            case 'decrease':
                return <TrendingDown className="w-4 h-4" />
            default:
                return <Minus className="w-4 h-4" />
        }
    }

    const getTrendColor = () => {
        switch (changeType) {
            case 'increase':
                return 'text-green-600 dark:text-green-400'
            case 'decrease':
                return 'text-red-600 dark:text-red-400'
            default:
                return 'text-gray-500 dark:text-gray-400'
        }
    }

    const getIconBgColor = () => {
        const colors = {
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
            purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
            red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
            indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
        }
        return colors[color] || colors.blue
    }

    if (loading) {
        return (
            <Card className={classNames('h-full', className)}>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-3 flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                        </div>
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className={classNames('h-full hover:shadow-lg transition-shadow duration-200', className)}>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {title}
                            </h3>
                        </div>
                        
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {value}
                            </span>
                            {change && (
                                <div className={classNames(
                                    'flex items-center gap-1 text-sm font-medium',
                                    getTrendColor()
                                )}>
                                    {getTrendIcon()}
                                    <span>{change}</span>
                                </div>
                            )}
                        </div>
                        
                        {subtitle && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    
                    {Icon && (
                        <div className={classNames(
                            'w-12 h-12 rounded-lg flex items-center justify-center',
                            getIconBgColor()
                        )}>
                            <Icon className="w-6 h-6" />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

export default StatCard
