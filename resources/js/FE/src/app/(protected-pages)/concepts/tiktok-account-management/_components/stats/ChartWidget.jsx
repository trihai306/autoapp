'use client'
import { useState } from 'react'
import Card from '@/components/ui/Card'
import { 
    HiOutlineDotsHorizontal as MoreHorizontal, 
    HiOutlineTrendingUp as TrendingUp, 
    HiOutlineChartBar as BarChart3, 
    HiOutlineChartPie as PieChart, 
    HiOutlineLightningBolt as Activity 
} from 'react-icons/hi'
import classNames from 'classnames'

const ChartWidget = ({ 
    title, 
    data = [], 
    type = 'line', // 'line', 'bar', 'pie', 'area'
    height = 200,
    loading = false,
    className,
    showLegend = true,
    colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
}) => {
    const [selectedPeriod, setSelectedPeriod] = useState('7d')

    const periods = [
        { value: '24h', label: '24h' },
        { value: '7d', label: '7 ngày' },
        { value: '30d', label: '30 ngày' },
        { value: '90d', label: '3 tháng' }
    ]

    // Mock chart component - in real app, you'd use a chart library like Chart.js or Recharts
    const renderChart = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center" style={{ height }}>
                    <div className="animate-pulse flex space-x-1">
                        {[...Array(8)].map((_, i) => (
                            <div 
                                key={i}
                                className="bg-gray-200 dark:bg-gray-700 rounded"
                                style={{ 
                                    width: '20px', 
                                    height: `${Math.random() * 80 + 20}px` 
                                }}
                            />
                        ))}
                    </div>
                </div>
            )
        }

        // Simple mock chart visualization
        return (
            <div className="flex items-end justify-between gap-1 px-2" style={{ height }}>
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                            className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                            style={{ 
                                height: `${(item.value / Math.max(...data.map(d => d.value))) * (height - 40)}px`,
                                backgroundColor: colors[index % colors.length]
                            }}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    const getChartIcon = () => {
        switch (type) {
            case 'bar':
                return <BarChart3 className="w-4 h-4" />
            case 'pie':
                return <PieChart className="w-4 h-4" />
            case 'area':
                return <Activity className="w-4 h-4" />
            default:
                return <TrendingUp className="w-4 h-4" />
        }
    }

    return (
        <Card className={classNames('h-full', className)}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            {getChartIcon()}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {title}
                        </h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Period Selector */}
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            {periods.map((period) => (
                                <button
                                    key={period.value}
                                    onClick={() => setSelectedPeriod(period.value)}
                                    className={classNames(
                                        'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                                        selectedPeriod === period.value
                                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                    )}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                        
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Chart */}
                <div className="mb-4">
                    {renderChart()}
                </div>

                {/* Legend */}
                {showLegend && data.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                        {data.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {item.label}: {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    )
}

export default ChartWidget
