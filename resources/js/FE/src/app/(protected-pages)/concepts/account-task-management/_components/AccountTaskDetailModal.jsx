'use client'
import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Tooltip from '@/components/ui/Tooltip'
import { 
    HiOutlineX as X,
    HiOutlineClock as Clock,
    HiOutlineUser as User,
    HiOutlineCog as Settings,
    HiOutlineDocumentText as Document,
    HiOutlineExclamationCircle as Error,
    HiOutlineCheckCircle as Success
} from 'react-icons/hi'
import dayjs from 'dayjs'

const AccountTaskDetailModal = ({ isOpen, onClose, task }) => {
    const [isLoading, setIsLoading] = useState(false)

    if (!task) return null

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'running':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Chờ xử lý'
            case 'running':
                return 'Đang chạy'
            case 'completed':
                return 'Hoàn thành'
            case 'failed':
                return 'Thất bại'
            case 'cancelled':
                return 'Đã hủy'
            default:
                return 'Không xác định'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            case 'medium':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        }
    }

    const getPriorityText = (priority) => {
        switch (priority) {
            case 'low':
                return 'Thấp'
            case 'medium':
                return 'Trung bình'
            case 'high':
                return 'Cao'
            default:
                return 'Không xác định'
        }
    }



    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={800}
            className="z-[60]"
            closable={false}
        >
            <div className="flex flex-col h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Chi tiết Task #{task.id}
                    </h2>
                    <div className="flex items-center gap-2">
                        <Tooltip title="Đóng">
                            <Button variant="outline" size="sm" onClick={onClose} className="!px-2">
                                <X className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Task Info */}
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                                <Document className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {task.task_type}
                                    </h3>
                                    <Badge className={getStatusColor(task.status)}>
                                        {getStatusText(task.status)}
                                    </Badge>
                                    <Badge className={getPriorityColor(task.priority)}>
                                        {getPriorityText(task.priority)}
                                    </Badge>
                                </div>
                                {task.description && (
                                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                                        {task.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {task.retry_count || 0}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Số lần thử lại</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {task.max_retries || 3}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Tối đa thử lại</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {task.scheduled_at ? dayjs(task.scheduled_at).format('HH:mm') : 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Lên lịch</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {task.completed_at ? dayjs(task.completed_at).format('HH:mm') : 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Hoàn thành</div>
                            </div>
                        </div>

                        {/* Related Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* TikTok Account */}
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Tài khoản TikTok
                                </h4>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    {task.tiktok_account ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                {task.tiktok_account.avatar_url ? (
                                                    <img 
                                                        src={task.tiktok_account.avatar_url} 
                                                        alt={task.tiktok_account.username}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        {task.tiktok_account.nickname || task.tiktok_account.username}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        @{task.tiktok_account.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">Không có tài khoản liên quan</p>
                                    )}
                                </div>
                            </div>

                            {/* Device */}
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Thiết bị
                                </h4>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    {task.device ? (
                                        <div className="space-y-2">
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {task.device.device_name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                ID: {task.device.device_id}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Loại: {task.device.device_type || 'N/A'}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">Không có thiết bị liên quan</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Parameters */}
                        {task.parameters && (
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    Tham số
                                </h4>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {JSON.stringify(task.parameters, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Result */}
                        {task.result && (
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <Success className="w-4 h-4" />
                                    Kết quả
                                </h4>
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <pre className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                                        {JSON.stringify(task.result, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {task.error_message && (
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                    <Error className="w-4 h-4" />
                                    Lỗi
                                </h4>
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <p className="text-sm text-red-800 dark:text-red-200">
                                        {task.error_message}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Timeline
                            </h4>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Tạo lúc:</span>
                                    <span className="text-gray-900 dark:text-gray-100">
                                        {task.created_at ? dayjs(task.created_at).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
                                    </span>
                                </div>
                                {task.scheduled_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Lên lịch:</span>
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {dayjs(task.scheduled_at).format('DD/MM/YYYY HH:mm:ss')}
                                        </span>
                                    </div>
                                )}
                                {task.started_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Bắt đầu:</span>
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {dayjs(task.started_at).format('DD/MM/YYYY HH:mm:ss')}
                                        </span>
                                    </div>
                                )}
                                {task.completed_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Hoàn thành:</span>
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {dayjs(task.completed_at).format('DD/MM/YYYY HH:mm:ss')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default AccountTaskDetailModal
