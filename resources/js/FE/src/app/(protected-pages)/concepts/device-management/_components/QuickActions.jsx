'use client'
import { useState, useEffect } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import getDeviceRecentActivities from '@/server/actions/device/getDeviceRecentActivities'
import {
    HiOutlinePlay as Play,
    HiOutlinePause as Pause,
    HiOutlineStop as Stop,
    HiOutlineRefresh as Refresh,
    HiOutlineClock as Clock,
    HiOutlineDesktopComputer as Desktop,
    HiOutlineDeviceMobile as Mobile
} from 'react-icons/hi'

const QuickActions = ({ selectedDevices = [], onAction, loading = false }) => {
    const [recentActivities, setRecentActivities] = useState([])
    const [activitiesLoading, setActivitiesLoading] = useState(false)

    const handleAction = async (actionType) => {
        if (onAction) {
            await onAction(actionType)
        }
    }

    const fetchRecentActivities = async () => {
        setActivitiesLoading(true)
        try {
            const result = await getDeviceRecentActivities()
            if (result.success) {
                setRecentActivities(result.data || [])
            } else {
                console.error('Failed to fetch recent activities:', result.message)
                setRecentActivities([])
            }
        } catch (error) {
            console.error('Error fetching recent activities:', error)
            setRecentActivities([])
        } finally {
            setActivitiesLoading(false)
        }
    }

    useEffect(() => {
        fetchRecentActivities()
    }, [])

    const getDeviceIcon = (deviceType) => {
        switch (deviceType?.toLowerCase()) {
            case 'mobile':
            case 'phone':
            case 'smartphone':
                return <Mobile className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            case 'desktop':
            case 'computer':
            case 'pc':
                return <Desktop className="w-4 h-4 text-green-600 dark:text-green-400" />
            default:
                return <Desktop className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        }
    }

    return (
        <div className="space-y-6">
            {/* Quick Actions Card */}
            <AdaptiveCard>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Thao tác nhanh
                    </h3>
                    
                    {selectedDevices.length > 0 ? (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Đã chọn {selectedDevices.length} thiết bị
                            </p>
                            
                            <div className="space-y-2">
                                <Button
                                    variant="solid"
                                    color="green-500"
                                    className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleAction('activate')}
                                    disabled={loading}
                                    loading={loading}
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Kích hoạt
                                </Button>
                                
                                <Button
                                    variant="solid"
                                    color="orange-500"
                                    className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white"
                                    onClick={() => handleAction('pause')}
                                    disabled={loading}
                                    loading={loading}
                                >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Tạm dừng
                                </Button>
                                
                                <Button
                                    variant="solid"
                                    color="red-500"
                                    className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => handleAction('block')}
                                    disabled={loading}
                                    loading={loading}
                                >
                                    <Stop className="w-4 h-4 mr-2" />
                                    Chặn
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Desktop className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Chọn thiết bị để thực hiện thao tác nhanh
                            </p>
                        </div>
                    )}
                </div>
            </AdaptiveCard>

            {/* Recent Activities Card */}
            <AdaptiveCard>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Hoạt động gần đây
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchRecentActivities}
                            disabled={activitiesLoading}
                        >
                            <Refresh className={`w-4 h-4 ${activitiesLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                    
                    <div className="space-y-3">
                        {activitiesLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentActivities.length > 0 ? (
                            recentActivities.slice(0, 5).map((activity, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                        {getDeviceIcon(activity.device_type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {activity.device_name || 'Thiết bị không xác định'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {activity.action || 'Hoạt động'} • {activity.time || 'Vừa xong'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        <span>{activity.duration || '1m'}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Clock className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Chưa có hoạt động nào
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </AdaptiveCard>
        </div>
    )
}

export default QuickActions
