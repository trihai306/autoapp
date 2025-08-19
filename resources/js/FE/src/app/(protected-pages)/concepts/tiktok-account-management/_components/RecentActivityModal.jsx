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
    HiOutlineUser as User,
    HiOutlineCalendar as Calendar,
    HiOutlineTag as Tag
} from 'react-icons/hi'
import { useTranslations } from 'next-intl'
import getAccountTasks from '@/server/actions/account/getAccountTasks'

const RecentActivityModal = ({ isOpen, onClose }) => {
    const t = useTranslations('tiktokAccountManagement')
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState('all') // all, completed, failed, running, pending
    const [timeRange, setTimeRange] = useState('24h') // 24h, 7d, 30d
    const [pagination, setPagination] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isOpen) {
            loadTasks()
        }
    }, [isOpen, filter, timeRange])

    const loadTasks = async (page = 1) => {
        setLoading(true)
        setError(null)
        
        try {
            const params = {
                page,
                per_page: 20,
                'filter[status]': filter === 'all' ? null : filter,
                sort: '-created_at' // Sắp xếp từ mới nhất đến cũ nhất
            }
            
            console.log('🔄 RecentActivityModal - Loading tasks with params:', params)
            
            const result = await getAccountTasks(params)
            
            console.log('✅ RecentActivityModal - getAccountTasks result:', result)
            console.log('📋 RecentActivityModal - Tasks list:', result.list)
            console.log('📊 RecentActivityModal - Tasks total:', result.total)
            
            if (result.success) {
                // Log chi tiết từng task để debug
                if (result.list && result.list.length > 0) {
                    console.log('🔍 RecentActivityModal - First task details:', result.list[0])
                    console.log('🔍 RecentActivityModal - First task tiktok_account:', result.list[0]?.tiktok_account)
                }
                
                setTasks(result.list || [])
                setPagination({
                    current_page: page,
                    per_page: 20,
                    total: result.total || 0,
                    last_page: Math.ceil((result.total || 0) / 20),
                    from: ((page - 1) * 20) + 1,
                    to: Math.min(page * 20, result.total || 0)
                })
            } else {
                console.error('❌ RecentActivityModal - API returned error:', result.message)
                setError(result.message || 'Không thể tải dữ liệu tác vụ')
            }
        } catch (error) {
            console.error('❌ RecentActivityModal - Error loading tasks:', error)
            setError('Lỗi khi tải dữ liệu tác vụ')
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (page) => {
        loadTasks(page)
    }

    const getTaskTypeIcon = (taskType) => {
        switch (taskType) {
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
            case 'schedule_post':
                return <Calendar className="w-4 h-4" />
            default:
                return <Tag className="w-4 h-4" />
        }
    }

    const getTaskTypeText = (taskType) => {
        const taskTypeMap = {
            'follow_user': 'Theo dõi người dùng',
            'unfollow_user': 'Bỏ theo dõi người dùng',
            'like_video': 'Thích video',
            'comment_video': 'Bình luận video',
            'share_video': 'Chia sẻ video',
            'create_post': 'Tạo bài viết',
            'live_interaction': 'Tương tác live',
            'notification': 'Đọc thông báo',
            'change_bio': 'Thay đổi tiểu sử',
            'update_avatar': 'Cập nhật avatar',
            'change_name': 'Thay đổi tên',
            'schedule_post': 'Lên lịch bài viết'
        }
        return taskTypeMap[taskType] || taskType
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />
            case 'running':
                return <Play className="w-4 h-4 text-blue-500 animate-pulse" />
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-500" />
            case 'paused':
                return <Pause className="w-4 h-4 text-orange-500" />
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
            case 'pending':
                return 'text-yellow-600 dark:text-yellow-400'
            case 'paused':
                return 'text-orange-600 dark:text-orange-400'
            default:
                return 'text-gray-600 dark:text-gray-400'
        }
    }

    const getStatusText = (status) => {
        const statusMap = {
            'completed': 'Hoàn thành',
            'failed': 'Thất bại',
            'running': 'Đang chạy',
            'pending': 'Chờ xử lý',
            'paused': 'Tạm dừng'
        }
        return statusMap[status] || status
    }

    const getRelativeTime = (timestamp) => {
        if (!timestamp) return 'Không xác định'
        
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
        return tasks.length
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
                            Danh sách tác vụ tài khoản
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Quản lý và theo dõi các tác vụ của tài khoản TikTok
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadTasks(1)}
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
                                    <option value="pending">Chờ xử lý</option>
                                    <option value="running">Đang chạy</option>
                                    <option value="completed">Hoàn thành</option>
                                    <option value="failed">Thất bại</option>
                                    <option value="paused">Tạm dừng</option>
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
                            Hiển thị {getFilteredCount()} / {getTotalCount()} tác vụ
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
                            <Button variant="outline" size="sm" onClick={() => loadTasks(1)}>
                                Thử lại
                            </Button>
                        </div>
                    ) : tasks.length > 0 ? (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                                >
                                    {/* Account Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {task.tiktok_account?.username?.charAt(0)?.toUpperCase() || 
                                             task.tiktok_account?.nickname?.charAt(0)?.toUpperCase() || 
                                             'T'}
                                        </div>
                                    </div>

                                    {/* Task Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    @{task.tiktok_account?.username || 'Tài khoản không xác định'}
                                                </span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    ({task.tiktok_account?.nickname || 'Không có tên hiển thị'})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(task.status)}
                                                <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                                                    {getStatusText(task.status)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            {getTaskTypeIcon(task.task_type)}
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {getTaskTypeText(task.task_type)}
                                            </span>
                                            {task.target && (
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    • {task.target}
                                                </span>
                                            )}
                                            {task.priority && (
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                }`}>
                                                    {task.priority === 'high' ? 'Cao' : 
                                                     task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {task.description || 'Không có mô tả'}
                                        </p>

                                        {task.error_message && (
                                            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                                Lỗi: {task.error_message}
                                            </div>
                                        )}

                                        {task.status === 'running' && task.progress !== undefined && (
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                    <span>Tiến độ</span>
                                                    <span>{task.progress || 0}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                                                        style={{ width: `${task.progress || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                                            <span>Được tạo: {getRelativeTime(task.created_at)}</span>
                                            <div className="flex items-center gap-4">
                                                {task.updated_at && task.updated_at !== task.created_at && (
                                                    <span>Cập nhật: {getRelativeTime(task.updated_at)}</span>
                                                )}
                                                {task.retry_count > 0 && (
                                                    <span className="text-orange-600 dark:text-orange-400">
                                                        Thử lại: {task.retry_count}/{task.max_retries || 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {task.scheduled_at && (
                                            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                                <Calendar className="w-3 h-3 inline mr-1" />
                                                Lên lịch: {getRelativeTime(task.scheduled_at)}
                                            </div>
                                        )}

                                        {task.started_at && task.status === 'running' && (
                                            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                                <Play className="w-3 h-3 inline mr-1" />
                                                Bắt đầu: {getRelativeTime(task.started_at)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            {/* Pagination */}
                            {pagination && pagination.last_page > 1 && (
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Hiển thị {pagination.from} - {pagination.to} của {pagination.total} tác vụ
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
                                Không có tác vụ nào
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Không tìm thấy tác vụ nào trong khoảng thời gian đã chọn.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    )
}

export default RecentActivityModal
