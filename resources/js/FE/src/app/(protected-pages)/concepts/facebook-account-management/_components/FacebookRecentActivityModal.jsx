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
import getAllFacebookAccountTasks from '@/server/actions/facebook-account/getAllFacebookAccountTasks'

const FacebookRecentActivityModal = ({ isOpen, onClose }) => {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState('all') // all, completed, failed, running, pending
    const [timeRange, setTimeRange] = useState('24h') // 24h, 7d, 30d
    const [pagination, setPagination] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isOpen) {
            console.log('🔄 Modal opened, loading tasks...')
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
                time_range: timeRange,
                sort: '-created_at' // Sắp xếp từ mới nhất đến cũ nhất
            }

            console.log('🔄 FacebookRecentActivityModal - Loading tasks with params:', params)

            // Lấy tất cả tasks của Facebook accounts
            const result = await getAllFacebookAccountTasks(params)

            console.log('✅ FacebookRecentActivityModal - getAllFacebookAccountTasks result:', result)

            if (result.success) {
                setTasks(result.data.data || [])
                setPagination({
                    current_page: result.data.current_page || page,
                    per_page: result.data.per_page || 20,
                    total: result.data.total || 0,
                    last_page: result.data.last_page || Math.ceil((result.data.total || 0) / 20),
                    from: ((page - 1) * 20) + 1,
                    to: Math.min(page * 20, result.data.total || 0)
                })
            } else {
                console.error('❌ FacebookRecentActivityModal - API returned error:', result.message)
                setError(result.message || 'Không thể tải dữ liệu tác vụ')
            }
        } catch (error) {
            console.error('❌ FacebookRecentActivityModal - Error loading tasks:', error)
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
            case 'like_post':
                return <Heart className="w-4 h-4" />
            case 'comment_post':
                return <Chat className="w-4 h-4" />
            case 'share_post':
                return <Share className="w-4 h-4" />
            case 'create_post':
                return <Document className="w-4 h-4" />
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
            'like_post': 'Thích bài viết',
            'comment_post': 'Bình luận bài viết',
            'share_post': 'Chia sẻ bài viết',
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

    if (!isOpen) return null

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={900}
            className="z-[60]"
        >
            <div className="p-6">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Hoạt động gần đây - Facebook
                    </h2>
                </div>

                {/* Filter Controls */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Lọc theo trạng thái
                        </label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="all">Tất cả</option>
                            <option value="running">Đang chạy</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="failed">Thất bại</option>
                            <option value="pending">Chờ xử lý</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Khoảng thời gian
                        </label>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="24h">24 giờ qua</option>
                            <option value="7d">7 ngày qua</option>
                            <option value="30d">30 ngày qua</option>
                        </select>
                    </div>
                </div>

                {/* Stats Summary */}
                {pagination && (
                    <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="flex items-center">
                                <Play className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Đang chạy</p>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                        {tasks.filter(task => task.status === 'running').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Hoàn thành</p>
                                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                        {tasks.filter(task => task.status === 'completed').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                            <div className="flex items-center">
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Thất bại</p>
                                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                                        {tasks.filter(task => task.status === 'failed').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-8">
                        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Lỗi tải dữ liệu
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                        <Button onClick={() => loadTasks()} variant="outline">
                            Thử lại
                        </Button>
                    </div>
                )}

                {/* Tasks List */}
                {!loading && !error && tasks.length > 0 && (
                    <div className="space-y-4">
                        {tasks.map((task, index) => (
                            <div key={task.id || index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            {getTaskTypeIcon(task.task_type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {getTaskTypeText(task.task_type)}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                    {getStatusIcon(task.status)}
                                                    <span className="ml-1">{getStatusText(task.status)}</span>
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                <p>Tài khoản: <span className="font-medium">{task.facebook_account?.username || 'N/A'}</span></p>
                                                {task.interaction_scenario && (
                                                    <p>Kịch bản: <span className="font-medium">{task.interaction_scenario.name}</span></p>
                                                )}
                                                {task.device && (
                                                    <p>Thiết bị: <span className="font-medium">{task.device.name}</span></p>
                                                )}
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                <p>Tạo lúc: {task.created_at ? new Date(task.created_at).toLocaleString('vi-VN') : 'N/A'}</p>
                                                {task.started_at && (
                                                    <p>Bắt đầu: {new Date(task.started_at).toLocaleString('vi-VN')}</p>
                                                )}
                                                {task.completed_at && (
                                                    <p>Hoàn thành: {new Date(task.completed_at).toLocaleString('vi-VN')}</p>
                                                )}
                                                {task.error_message && (
                                                    <p className="text-red-600 dark:text-red-400">Lỗi: {task.error_message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {getRelativeTime(task.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && tasks.length === 0 && (
                    <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Không có hoạt động
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Không có task nào trong khoảng thời gian đã chọn
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Hiển thị {pagination.from} - {pagination.to} trong tổng số {pagination.total} kết quả
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page <= 1}
                            >
                                Trước
                            </Button>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Trang {pagination.current_page} / {pagination.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page >= pagination.last_page}
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Dialog>
    )
}

export default FacebookRecentActivityModal
