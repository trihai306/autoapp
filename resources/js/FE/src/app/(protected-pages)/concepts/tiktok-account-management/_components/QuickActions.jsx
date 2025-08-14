'use client'
import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import getTiktokAccountRecentActivities from '@/server/actions/tiktok-account/getTiktokAccountRecentActivities'
import { 
    HiOutlinePlay as Play,
    HiOutlineX as Square,
    HiOutlineUsers as Users,
    HiOutlineLightningBolt as Zap
} from 'react-icons/hi'

const QuickActions = ({ selectedAccounts = [], onAction, loading = false }) => {
    const [recentActivities, setRecentActivities] = useState([])
    const [activitiesLoading, setActivitiesLoading] = useState(false)

    const handleAction = async (actionType) => {
        await onAction?.(actionType)
        // Refresh activities after action
        fetchRecentActivities()
    }

    const fetchRecentActivities = async () => {
        // // console.log('🔄 Fetching recent activities...')
        setActivitiesLoading(true)
        try {
            const result = await getTiktokAccountRecentActivities()
            // // console.log('📊 API Result:', result)
            
            if (result.success) {
                // // console.log('✅ API Success, data count:', result.data.length)
                // Map the API response to match the expected format
                const mappedActivities = result.data.map(activity => ({
                    id: activity.id,
                    username: activity.username,
                    action: activity.action,
                    status: activity.status === 'completed' ? 'success' : 
                           activity.status === 'failed' ? 'error' : 
                           activity.status,
                    time: activity.time,
                    scenario_name: activity.scenario_name
                }))
                // // console.log('🎯 Mapped activities:', mappedActivities)
                setRecentActivities(mappedActivities)
            } else {
                console.error('❌ Failed to fetch recent activities:', result.message)
                setRecentActivities([])
            }
        } catch (error) {
            console.error('💥 Error fetching recent activities:', error)
            setRecentActivities([])
        } finally {
            setActivitiesLoading(false)
        }
    }

    useEffect(() => {
        fetchRecentActivities()
    }, [])

    // Debug effect to track state changes
    useEffect(() => {
        // // console.log('🔍 Recent activities state changed:', recentActivities.length, 'items')
        // // console.log('📋 Activities:', recentActivities)
    }, [recentActivities])

    const quickActions = [
        {
            id: 'start',
            label: 'Bắt đầu',
            icon: Play,
            color: 'bg-green-500 hover:bg-green-600',
            description: 'Khởi động kịch bản cho tài khoản đã chọn'
        },
        {
            id: 'stop',
            label: 'Dừng',
            icon: Square,
            color: 'bg-red-500 hover:bg-red-600',
            description: 'Dừng hoàn toàn tất cả tác vụ'
        }
    ]



    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Quick Actions */}
            <Card>
                <div className="p-4 lg:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm lg:text-base">
                            Thao tác nhanh
                        </h3>
                        {selectedAccounts.length > 0 && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                {selectedAccounts.length}
                            </span>
                        )}
                    </div>
                    
                    {/* Always show mobile-friendly layout */}
                    <div className="space-y-3">
                        {quickActions.map((action) => (
                            <Button
                                key={action.id}
                                onClick={() => handleAction(action.id)}
                                disabled={loading || selectedAccounts.length === 0}
                                className={`${action.color} text-white border-0 w-full flex items-center justify-center gap-3 h-12 rounded-lg transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <action.icon className="w-5 h-5" />
                                <span className="text-sm font-medium">
                                    {action.label}
                                </span>
                            </Button>
                        ))}
                    </div>
                    
                    {selectedAccounts.length === 0 && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                            Chọn tài khoản để sử dụng thao tác nhanh
                        </p>
                    )}
                </div>
            </Card>



            {/* Recent Activity */}
            <Card>
                <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 lg:p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <Users className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm lg:text-base">
                                Hoạt động gần đây
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs lg:text-sm">
                                Theo dõi các tác vụ mới nhất
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 lg:p-6">
                    <div className="space-y-4">
                        {activitiesLoading ? (
                            // Loading skeleton
                            Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="flex items-start gap-4 animate-pulse">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                                        {index < 3 && <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mt-2" />}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                                        </div>
                                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-40 mb-1"></div>
                                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                                    </div>
                                </div>
                            ))
                        ) : recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) => (
                                <div key={activity.id} className="flex items-start gap-3 lg:gap-4 group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 lg:p-3 -m-2 lg:-m-3 transition-colors">
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full shadow-sm ${
                                            activity.status === 'success' ? 'bg-green-500 shadow-green-200' :
                                            activity.status === 'error' ? 'bg-red-500 shadow-red-200' :
                                            activity.status === 'running' ? 'bg-blue-500 shadow-blue-200 animate-pulse' :
                                            activity.status === 'pending' ? 'bg-yellow-500 shadow-yellow-200' :
                                            'bg-gray-400 shadow-gray-200'
                                        }`} />
                                        {index < recentActivities.length - 1 && (
                                            <div className="w-px h-6 lg:h-8 bg-gray-200 dark:bg-gray-700 mt-2" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                            <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs lg:text-sm truncate">
                                                {activity.username}
                                            </span>
                                            <span className={`px-1.5 lg:px-2 py-0.5 rounded text-xs font-medium self-start ${
                                                activity.status === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                                activity.status === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                activity.status === 'running' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                                activity.status === 'pending' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                                {activity.status === 'success' ? 'Thành công' :
                                                 activity.status === 'error' ? 'Lỗi' :
                                                 activity.status === 'running' ? 'Đang chạy' :
                                                 activity.status === 'pending' ? 'Chờ xử lý' : 'Khác'}
                                            </span>
                                        </div>
                                        <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-1 leading-relaxed">
                                            {activity.action}
                                        </p>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500 dark:text-gray-500">
                                            <span>{activity.time}</span>
                                            {activity.scenario_name && (
                                                <>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                                                        {activity.scenario_name}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 lg:py-8">
                                <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                    <Users className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                                </div>
                                <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    Chưa có hoạt động nào
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                    Các tác vụ sẽ hiển thị ở đây khi bắt đầu
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default QuickActions
