'use client'
import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { 
    HiOutlineClock as Clock,
    HiOutlineCheckCircle as CheckCircle,
    HiOutlineXCircle as XCircle,
    HiOutlinePlay as Play,
    HiOutlinePause as Pause,
    HiOutlineRefresh as Refresh,
    HiOutlineEye as Eye,
    HiOutlineHeart as Heart,
    HiOutlineChat as Chat,
    HiOutlineShare as Share,
    HiOutlineUserAdd as UserAdd,
    HiOutlineUserRemove as UserRemove,
    HiOutlineVideoCamera as Video,
    HiOutlineBell as Bell,
    HiOutlineCog as Settings,
    HiOutlineDocumentText as Document,
    HiOutlinePhotograph as Photo,
    HiOutlineUser as User
} from 'react-icons/hi'
import { useTranslations } from 'next-intl'
import getRecentActivities from '@/server/actions/tiktok-account/getRecentActivities'

const RecentActivityModal = ({ isOpen, onClose }) => {
    const t = useTranslations('tiktokAccountManagement')
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState('all') // all, completed, failed, running
    const [timeRange, setTimeRange] = useState('24h') // 24h, 7d, 30d
    const [pagination, setPagination] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isOpen) {
            loadActivities()
        }
    }, [isOpen, filter, timeRange])

    const loadActivities = async (page = 1) => {
        setLoading(true)
        setError(null)
        
        try {
            const params = {
                page,
                per_page: 20,
                status: filter === 'all' ? null : filter,
                time_range: timeRange
            }
            
            const result = await getRecentActivities(params)
            
            if (result.success) {
                setActivities(result.data.activities)
                setPagination(result.data.pagination)
            } else {
                setError(result.message || 'Không thể tải dữ liệu hoạt động')
            }
        } catch (error) {
            console.error('Error loading activities:', error)
            setError('Lỗi khi tải dữ liệu hoạt động')
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (page) => {
        loadActivities(page)
    }

    const getActionIcon = (action) => {
        switch (action) {
            case 'follow_user':
                return <UserAdd className="w-4 h-4" />
            case 'unfollow_user':
                return <UserRemove className="w-4 h-4" />
            case 'like_video':
                return <Heart className="w-4 h-4" />
            case 'comment_video':
                return <Chat className="w-4 h-4" />
            case 'share_video':
                return <Share className="w-4 h-4" />
            case 'create_post':
                return <Video className="w-4 h-4" />
            case 'live_interaction':
                return <Eye className="w-4 h-4" />
            case 'notification':
                return <Bell className="w-4 h-4" />
            case 'change_bio':
                return <Document className="w-4 h-4" />
            case 'update_avatar':
                return <Photo className="w-4 h-4" />
            case 'change_name':
                return <User className="w-4 h-4" />
            default:
                return <Settings className="w-4 h-4" />
        }
    }

    const getActionText = (action) => {
        const actionMap = {
            'follow_user': 'Theo dõi',
            'unfollow_user': 'Bỏ theo dõi',
            'like_video': 'Thích video',
            'comment_video': 'Bình luận',
            'share_video': 'Chia sẻ',
            'create_post': 'Tạo bài viết',
            'live_interaction': 'Tương tác live',
            'notification': 'Đọc thông báo',
            'change_bio': 'Đổi tiểu sử',
            'update_avatar': 'Cập nhật avatar',
            'change_name': 'Đổi tên'
        }
        return actionMap[action] || action
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />
            case 'running':
                return <Play className="w-4 h-4 text-blue-500 animate-pulse" />
            default:
                return <Clock className="w-4 h-4 text-gray-400" />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 dark:text-green-400'
            case 'failed':
                return 'text-red-600 dark:text-red-400'
            case 'running':
                return 'text-blue-600 dark:text-blue-400'
            default:
                return 'text-gray-600 dark:text-gray-400'
        }
    }

    const getRelativeTime = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now - date
        const minutes = Math.floor(diff / (1000 * 60))
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (minutes < 1) return 'Vừa xong'
        if (minutes < 60) return `${minutes} phút trước`
        if (hours < 24) return `${hours} giờ trước`
        return `${days} ngày trước`
    }

    const getFilteredCount = () => {
        return activities.length
    }

    const getTotalCount = () => {
        return pagination?.total || 0
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={900}
            className="z-[60]"
        >
            <div className="flex flex-col h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Hoạt động gần đây
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Theo dõi hoạt động của tất cả tài khoản TikTok
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadActivities(1)}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Làm mới
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                        >
                            Đóng
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Trạng thái:
                                </span>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="all">Tất cả ({getTotalCount()})</option>
                                    <option value="completed">Thành công</option>
                                    <option value="failed">Thất bại</option>
                                    <option value="running">Đang chạy</option>
                                </select>
                            </div>

                            {/* Time Range Filter */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Thời gian:
                                </span>
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="24h">24 giờ qua</option>
                                    <option value="7d">7 ngày qua</option>
                                    <option value="30d">30 ngày qua</option>
                                </select>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Hiển thị {getFilteredCount()} / {getTotalCount()} hoạt động
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
                            <Button variant="outline" size="sm" onClick={() => loadActivities(1)}>
                                Thử lại
                            </Button>
                        </div>
                    ) : activities.length > 0 ? (
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                                >
                                    {/* Account Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {activity.account.username.charAt(0).toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Activity Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    @{activity.account.username}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    ({activity.account.display_name})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(activity.status)}
                                                <span className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                                                    {activity.status === 'completed' ? 'Thành công' :
                                                     activity.status === 'failed' ? 'Thất bại' :
                                                     activity.status === 'running' ? 'Đang chạy' : 'Chờ xử lý'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            {getActionIcon(activity.action)}
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {getActionText(activity.action)}
                                            </span>
                                            {activity.target && (
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    • {activity.target}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {activity.details}
                                        </p>

                                        {activity.error_message && (
                                            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                                Lỗi: {activity.error_message}
                                            </div>
                                        )}

                                        {activity.status === 'running' && activity.progress !== undefined && (
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                    <span>Tiến độ</span>
                                                    <span>{activity.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                                                        style={{ width: `${activity.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{getRelativeTime(activity.timestamp)}</span>
                                            {activity.duration > 0 && (
                                                <span>Thời gian: {activity.duration}s</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Pagination */}
                            {pagination && pagination.last_page > 1 && (
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Hiển thị {pagination.from} - {pagination.to} của {pagination.total} hoạt động
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            disabled={pagination.current_page === 1}
                                            onClick={() => handlePageChange(pagination.current_page - 1)}
                                        >
                                            Trước
                                        </Button>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Trang {pagination.current_page} / {pagination.last_page}
                                        </span>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            disabled={pagination.current_page === pagination.last_page}
                                            onClick={() => handlePageChange(pagination.current_page + 1)}
                                        >
                                            Sau
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Không có hoạt động nào
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Không tìm thấy hoạt động nào trong khoảng thời gian đã chọn.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    )
}

export default RecentActivityModal
