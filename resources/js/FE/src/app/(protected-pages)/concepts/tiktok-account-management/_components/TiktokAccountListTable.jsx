'use client'
import React, { useMemo, useState, useEffect, useCallback } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Badge from '@/components/ui/Badge'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Checkbox from '@/components/ui/Checkbox'
import {
    useReactTable,
    getCoreRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table'
import { useTiktokAccountListStore } from '../_store'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { useTiktokAccountTableReload } from '@/utils/hooks/useRealtime'
import {
    TbEye,
    TbEdit,
    TbTrash,
    TbListCheck,
    TbClock,
    TbX,
    TbPhone,
    TbMail,
    TbPlayerPlay,
    TbPlayerStop,
    TbCalendar,
    TbDevices,
    TbTarget,
    TbCircleCheck,
    TbChevronDown,
    TbChevronRight
} from 'react-icons/tb'
import TiktokAccountListTableTools from './TiktokAccountListTableTools'
import AccountDetailModal from './AccountDetailModal'
import EditAccountModal from './EditAccountModal'
import ConnectionTypeToggle from './ConnectionTypeToggle'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
// Server actions will be imported dynamically to avoid client-side issues
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
import { useTranslations } from 'next-intl'


// Enhanced status configurations
const statusConfig = {
    active: {
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: TbCircleCheck,
        label: 'Hoạt động'
    },
    inactive: {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
        icon: TbClock,
        label: 'Tạm dừng'
    },
    suspended: {
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: TbX,
        label: 'Đình chỉ'
    },
    running: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: TbEye,
        label: 'Đang chạy'
    }
}

const taskStatusConfig = {
    pending: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: TbClock,
        label: 'Chờ xử lý'
    },
    no_pending: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: TbCircleCheck,
        label: 'Hoàn thành'
    }
}

// Expanded Row Content Component
const ExpandedRowContent = ({ row }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Thông tin cá nhân */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        Thông tin cá nhân
                    </h4>
                    <div className="space-y-2 text-sm">
                        {row.displayName && (
                            <div className="flex items-center gap-2">
                                <TbEye className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Tên hiển thị:</span>
                                <span className="text-gray-900 dark:text-gray-100">{row.displayName}</span>
                            </div>
                        )}
                        {(row.joinDate || row.created_at) && (
                            <div className="flex items-center gap-2">
                                <TbCalendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Ngày tham gia:</span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    {dayjs(row.joinDate || row.created_at).format('DD/MM/YYYY')}
                                </span>
                            </div>
                        )}
                        {row.location && (
                            <div className="flex items-center gap-2">
                                <TbTarget className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Địa điểm:</span>
                                <span className="text-gray-900 dark:text-gray-100">{row.location}</span>
                            </div>
                        )}
                        {(row.phone || row.phone_number) && (
                            <div className="flex items-center gap-2">
                                <TbPhone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Điện thoại:</span>
                                <span className="text-gray-900 dark:text-gray-100">{row.phone || row.phone_number}</span>
                            </div>
                        )}
                        {row.email && (
                            <div className="flex items-center gap-2">
                                <TbMail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                <span className="text-gray-900 dark:text-gray-100">{row.email}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Thống kê */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        Thống kê
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {row.followers || '0'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                {row.likes || '0'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Likes</div>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {row.videos || '0'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Videos</div>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                {row.views || '0'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
                        </div>
                    </div>
                </div>

                {/* Proxy & Thiết bị & Kịch bản */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        Proxy & Thiết bị & Kịch bản
                    </h4>
                    <div className="space-y-2 text-sm">
                        {row.proxy && (
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                        row.proxy.status === 'active' ? 'bg-green-500' :
                                        row.proxy.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                                    }`}
                                />
                                <span className="text-gray-600 dark:text-gray-400">Proxy:</span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    {row.proxy.host}:{row.proxy.port} ({row.proxy.type})
                                    {row.proxy.country && ` - ${row.proxy.country}${row.proxy.city ? `, ${row.proxy.city}` : ''}`}
                                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                                        row.proxy.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                        row.proxy.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                        {row.proxy.status === 'active' ? 'Hoạt động' :
                                         row.proxy.status === 'error' ? 'Lỗi' : 'Không hoạt động'}
                                    </span>
                                </span>
                            </div>
                        )}
                        {(row.device?.name || row.device?.device_name || row.device_id) && (
                            <div className="flex items-center gap-2">
                                <TbDevices className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Thiết bị:</span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    {row.device?.name || row.device?.device_name || `Device #${row.device_id}`}
                                </span>
                            </div>
                        )}
                        {(row.interaction_scenario?.name || row.interactionScenario?.name || row.scenario_id) && (
                            <div className="flex items-center gap-2">
                                <TbListCheck className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Kịch bản:</span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    {row.interaction_scenario?.name || row.interactionScenario?.name || `Scenario #${row.scenario_id}`}
                                </span>
                            </div>
                        )}
                        {row.last_activity && (
                            <div className="flex items-center gap-2">
                                <TbClock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Hoạt động cuối:</span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    {dayjs(row.last_activity).fromNow()}
                                </span>
                            </div>
                        )}
                        {row.notes && (
                            <div className="mt-2">
                                <span className="text-gray-600 dark:text-gray-400 text-xs">Ghi chú:</span>
                                <div className="text-gray-900 dark:text-gray-100 text-xs mt-1 p-2 bg-white dark:bg-gray-700 rounded border">
                                    {row.notes}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Enhanced User Info Column with username, email and task status only
const UserInfoColumn = ({ row, onViewDetail }) => {
    return (
        <div className="flex items-center gap-3">
            <div className="relative">
                <Avatar size={44} shape="circle" className="bg-gradient-to-br from-blue-500 to-purple-600">
                    {row.username ? row.username[0].toUpperCase() : 'T'}
                </Avatar>
            </div>
            <div className="flex-1 min-w-0">
                <div
                    className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                    onClick={() => onViewDetail(row)}
                >
                    @{row.username}
                </div>
                {row.displayName && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {row.displayName}
                    </div>
                )}
                {row.email && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 truncate mt-0.5">
                        <TbMail className="w-3 h-3 flex-shrink-0" />
                        {row.email}
                    </div>
                )}
                {row.pending_tasks_count > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs px-1.5 py-0.5">
                            {row.pending_tasks_count} task{row.pending_tasks_count > 1 ? 's' : ''}
                        </Badge>
                    </div>
                )}
            </div>
        </div>
    )
}

// Enhanced Action Column with better UX
const ActionColumn = ({ row, onViewDetail, onViewTasks, onEdit, onDelete, onStart, onStop }) => {
    const t = useTranslations('tiktokAccountManagement.table')
    const hasPendingTasks = row.pending_tasks_count > 0

    return (
        <div className="flex items-center gap-1">
            {/* Start/Stop Button */}
            {!hasPendingTasks ? (
                <Tooltip title="Chạy">
                    <button
                        className="p-2 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                        onClick={() => onStart(row)}
                    >
                        <TbPlayerPlay className="w-4 h-4" />
                    </button>
                </Tooltip>
            ) : (
                <Tooltip title="Dừng">
                    <button
                        className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                        onClick={() => onStop(row)}
                    >
                        <TbPlayerStop className="w-4 h-4" />
                    </button>
                </Tooltip>
            )}

            {/* View Details */}
            <Tooltip title="Xem chi tiết">
                <button
                    className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    onClick={() => onViewDetail(row)}
                >
                    <TbEye className="w-4 h-4" />
                </button>
            </Tooltip>

            {/* Tasks */}
            <Tooltip title={`Xem tasks ${row.pending_tasks_count > 0 ? `(${row.pending_tasks_count} pending)` : ''}`}>
                <button
                    className={`p-2 rounded-lg transition-all duration-200 relative ${
                        row.pending_tasks_count > 0
                            ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                            : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => onViewTasks(row)}
                >
                    <TbListCheck className="w-4 h-4" />
                    {row.pending_tasks_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                            {row.pending_tasks_count > 9 ? '9+' : row.pending_tasks_count}
                        </span>
                    )}
                </button>
            </Tooltip>

            {/* Edit */}
            <Tooltip title="Chỉnh sửa">
                <button
                    className="p-2 rounded-lg text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                    onClick={() => onEdit(row)}
                >
                    <TbEdit className="w-4 h-4" />
                </button>
            </Tooltip>

            {/* Delete */}
            <Tooltip title="Xóa">
                <button
                    className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    onClick={() => onDelete(row)}
                >
                    <TbTrash className="w-4 h-4" />
                </button>
            </Tooltip>
        </div>
    )
}

// Enhanced Status Column
const StatusColumn = ({ row }) => {
    const statusInfo = statusConfig[row.status] || statusConfig.inactive
    const StatusIcon = statusInfo.icon

    return (
        <div className="flex items-center gap-2">
            <Badge className={`${statusInfo.color} flex items-center gap-1.5 px-2.5 py-1`}>
                <StatusIcon className="w-3.5 h-3.5" />
                <span className="font-medium">{statusInfo.label}</span>
            </Badge>
        </div>
    )
}

// Task Status Column
const TaskStatusColumn = ({ row }) => {
    const hasPendingTasks = row.pending_tasks_count > 0
    const taskInfo = hasPendingTasks ? taskStatusConfig.pending : taskStatusConfig.no_pending
    const TaskIcon = taskInfo.icon

    return (
        <div className="flex items-center gap-2">
            <Badge className={`${taskInfo.color} flex items-center gap-1.5 px-2.5 py-1`}>
                <TaskIcon className="w-3.5 h-3.5" />
                <span className="font-medium">
                    {hasPendingTasks ? `${row.pending_tasks_count} pending` : 'Hoàn thành'}
                </span>
            </Badge>
        </div>
    )
}

// Contact Info Column
const ContactColumn = ({ row, type }) => {
    const value = type === 'email' ? row.email : row.phone_number
    const Icon = type === 'email' ? TbMail : TbPhone

    if (!value) {
        return <span className="text-gray-400 dark:text-gray-500">-</span>
    }

    return (
        <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-900 dark:text-gray-100 truncate max-w-[200px]" title={value}>
                {value}
            </span>
        </div>
    )
}

// Device & Scenario Column
const DeviceScenarioColumn = ({ row }) => {
    const deviceName = row.device?.name || row.device?.device_name || `Device #${row.device_id}`
    const scenarioName = row.interaction_scenario?.name || row.interactionScenario?.name || `Scenario #${row.scenario_id}`

    return (
        <div className="space-y-2 min-w-[200px]">
            {row.device_id && (
                <div className="flex items-start gap-2">
                    <TbDevices className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Device:</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words" title={`Device ID: ${row.device_id}`}>
                            {deviceName}
                        </div>
                    </div>
                </div>
            )}
            {row.scenario_id && (
                <div className="flex items-start gap-2">
                    <TbTarget className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Scenario:</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words" title={`Scenario ID: ${row.scenario_id}`}>
                            {scenarioName}
                        </div>
                    </div>
                </div>
            )}
            {!row.device_id && !row.scenario_id && (
                <div className="flex items-center justify-center h-12">
                    <span className="text-gray-400 dark:text-gray-500 text-sm italic">Chưa cấu hình</span>
                </div>
            )}
        </div>
    )
}

// Notes Column with truncation
const NotesColumn = ({ row }) => {
    const notes = row.notes
    if (!notes) {
        return <span className="text-gray-400 dark:text-gray-500">-</span>
    }

    const truncated = notes.length > 50 ? notes.substring(0, 50) + '...' : notes

    return (
        <Tooltip title={notes.length > 50 ? notes : undefined}>
            <span className="text-sm text-gray-900 dark:text-gray-100 cursor-help">
                {truncated}
            </span>
        </Tooltip>
    )
}

// Date Column with relative time
const DateColumn = ({ row, field = 'created_at' }) => {
    const date = row[field]
    if (!date) return <span className="text-gray-400 dark:text-gray-500">-</span>

    const formattedDate = dayjs(date).format('DD/MM/YYYY')
    const relativeTime = dayjs(date).fromNow()

    return (
        <div className="flex items-center gap-2">
            <TbCalendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <div className="text-sm">
                <div className="text-gray-900 dark:text-gray-100">{formattedDate}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{relativeTime}</div>
            </div>
        </div>
    )
}

const TiktokAccountListTable = ({
    tiktokAccountListTotal,
    page = 1,
    per_page = 10,
    onRefresh,
    proxyOptions = [{ value: '', label: 'Không sử dụng proxy' }],
    loadingProxies = false,
}) => {
    const router = useRouter()
    const t = useTranslations('tiktokAccountManagement.table')
    const tDetail = useTranslations('tiktokAccountManagement.detail')

    // Realtime hook for table reload
    const { listenToTableReload, stopListeningToTableReload, debugEchoStatus } = useTiktokAccountTableReload()

    // Enhanced column definitions with expanding feature
    const allColumns = [
        { header: 'Thông tin người dùng', accessorKey: 'user_info', sortable: true },
        { header: 'Số điện thoại', accessorKey: 'phone_number', sortable: false },
        { header: 'Task Status', accessorKey: 'task_status', sortable: true },
        { header: 'Device & Scenario', accessorKey: 'device_scenario', sortable: false },
        { header: 'Kết nối', accessorKey: 'connection', sortable: false },
        { header: 'Ghi chú', accessorKey: 'notes', sortable: false },
        { header: 'Ngày tạo', accessorKey: 'created_at', sortable: true },
        { header: 'Cập nhật', accessorKey: 'updated_at', sortable: true },
    ]

    const [visibleColumns, setVisibleColumns] = useState([
        'user_info', 'connection', 'task_status', 'device_scenario', 'created_at'
    ])

    const [expandedRows, setExpandedRows] = useState(new Set())
    const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)
    const [selectedTiktokAccountForDetail, setSelectedTiktokAccountForDetail] = useState(null)

    // Edit modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedAccountForEdit, setSelectedAccountForEdit] = useState(null)

    // Data for edit modal
    const [devices, setDevices] = useState([])
    const [scenarios, setScenarios] = useState([])
    const [loadingDevices, setLoadingDevices] = useState(false)
    const [loadingScenarios, setLoadingScenarios] = useState(false)

    // Dialog states
    const [showStopConfirmDialog, setShowStopConfirmDialog] = useState(false)
    const [showStartConfirmDialog, setShowStartConfirmDialog] = useState(false)
    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [showErrorDialog, setShowErrorDialog] = useState(false)
    const [dialogMessage, setDialogMessage] = useState('')
    const [selectedAccountForAction, setSelectedAccountForAction] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Proxy options are now passed from parent component

    const tiktokAccountList = useTiktokAccountListStore((state) => state.tiktokAccountList)
    const selectedTiktokAccount = useTiktokAccountListStore((state) => state.selectedTiktokAccount)
    const isInitialLoading = useTiktokAccountListStore((state) => state.initialLoading)
    const setSelectedTiktokAccount = useTiktokAccountListStore((state) => state.setSelectedTiktokAccount)
    const setSelectAllTiktokAccount = useTiktokAccountListStore((state) => state.setSelectAllTiktokAccount)

    const { onAppendQueryParams } = useAppendQueryParams()

    // Listen to realtime table reload events
    useEffect(() => {

        // Debug Echo status first
        const echoStatus = debugEchoStatus();

        const handleTableReload = (data) => {

            // Call onRefresh to reload the table data
            if (onRefresh) {
                onRefresh()
            }

            // Show notification if message is provided
            if (data.message) {
                // You can add toast notification here if needed
            }
        }

        // Start listening to reload events (async)
        const setupListener = async () => {
            const result = await listenToTableReload(handleTableReload)

            if (result && result.isRetry) {
                // Set up a retry mechanism
                const retryInterval = setInterval(async () => {
                    const retryResult = await result.retry()

                    if (retryResult && !retryResult.isRetry) {
                        clearInterval(retryInterval)
                    }
                }, 3000) // Retry every 3 seconds

                // Cleanup retry interval on unmount
                return () => {
                    clearInterval(retryInterval)
                }
            }
        }

        setupListener()

        // Cleanup on unmount
        return () => {
            stopListeningToTableReload()
        }
    }, [listenToTableReload, stopListeningToTableReload, onRefresh])

    const handleViewDetails = useCallback((tiktokAccount) => {
        setSelectedTiktokAccountForDetail(tiktokAccount)
        setIsDetailViewOpen(true)
    }, [setSelectedTiktokAccountForDetail, setIsDetailViewOpen])

    const handleCloseDetailView = useCallback(() => {
        setIsDetailViewOpen(false)
        setSelectedTiktokAccountForDetail(null)
    }, [setIsDetailViewOpen, setSelectedTiktokAccountForDetail])

    const handleCloseEditModal = useCallback(() => {
        setIsEditModalOpen(false)
        setSelectedAccountForEdit(null)
        // Clear data when closing modal
        setDevices([])
        setScenarios([])
    }, [setIsEditModalOpen, setSelectedAccountForEdit, setDevices, setScenarios])

    const loadDevicesForEdit = useCallback(async () => {
        setLoadingDevices(true)
        try {
            const { default: getDevices } = await import('@/server/actions/device/getDevices')
            const response = await getDevices({ per_page: 100 }) // Get all devices

            if (response.success) {
                // Check if data is in response.data.data (paginated) or response.data (direct)
                const devicesData = response.data?.data || response.data || []

                const deviceOptions = devicesData.map((device, index) => {

                    // Handle different possible field names
                    const deviceName = device.device_name || device.name || device.deviceName || `Device ${device.id || index + 1}`
                    const deviceType = device.device_type || device.type || device.deviceType || 'Unknown'

                    return {
                        value: String(device.id ?? index),
                        label: `${deviceName} (${deviceType})`
                    }
                })
                setDevices([{ value: '', label: 'Chọn thiết bị' }, ...deviceOptions])
            } else {
                console.error('Error loading devices:', response.message)
                setDevices([{ value: '', label: 'Chọn thiết bị' }])
            }
        } catch (error) {
            console.error('Error loading devices:', error)
            setDevices([{ value: '', label: 'Chọn thiết bị' }])
        } finally {
            setLoadingDevices(false)
        }
    }, [setDevices, setLoadingDevices])

    const loadScenariosForEdit = useCallback(async () => {
        setLoadingScenarios(true)
        try {
            const { default: getInteractionScenarios } = await import('@/server/actions/interaction-scenario/getInteractionScenarios')
            const response = await getInteractionScenarios({ per_page: 100, platform: 'tiktok' })

            if (response.success) {
                const list = response.data?.data || response.data || []
                const scenarioOptions = list.map(scenario => ({
                    value: String(scenario.id),
                    label: scenario.name
                }))
                setScenarios([{ value: '', label: 'Chọn kịch bản' }, ...scenarioOptions])
            } else {
                console.error('Error loading scenarios:', response.message)
                setScenarios([{ value: '', label: 'Chọn kịch bản' }])
            }
        } catch (error) {
            console.error('Error loading scenarios:', error)
            setScenarios([{ value: '', label: 'Chọn kịch bản' }])
        } finally {
            setLoadingScenarios(false)
        }
    }, [setScenarios, setLoadingScenarios])

    // Proxy options are now loaded once in parent component and passed down

    // Callback functions for edit modal
    const handleLoadDevices = useCallback(() => {
        loadDevicesForEdit()
    }, [loadDevicesForEdit])

    const handleLoadScenarios = useCallback(() => {
        loadScenariosForEdit()
    }, [loadScenariosForEdit])

    // Proxy options are loaded once in parent component

    const handleSaveAccount = useCallback(async (accountId, accountData) => {
        try {
            const { default: updateTiktokAccount } = await import('@/server/actions/tiktok-account/updateTiktokAccount')
            const result = await updateTiktokAccount(accountId, accountData)

            if (result.success) {
                setDialogMessage(`Cập nhật thông tin tài khoản thành công!`)
                setShowSuccessDialog(true)

                // Update selectedAccountForEdit with new data
                if (selectedAccountForEdit) {
                    const updatedAccount = {
                        ...selectedAccountForEdit,
                        ...accountData,
                        // Ensure proxy_id is properly set
                        proxy_id: accountData.proxy_id || selectedAccountForEdit.proxy_id
                    }
                    setSelectedAccountForEdit(updatedAccount)
                }

                handleCloseEditModal()

                // Refresh data
                if (onRefresh) {
                    onRefresh()
                }
            } else {
                setDialogMessage(`Không thể cập nhật tài khoản: ${result.message}`)
                setShowErrorDialog(true)
            }
        } catch (error) {
            console.error('Error saving account:', error)
            setDialogMessage(`Có lỗi xảy ra khi cập nhật tài khoản`)
            setShowErrorDialog(true)
        }
    }, [handleCloseEditModal, onRefresh, setDialogMessage, setShowErrorDialog, setShowSuccessDialog, selectedAccountForEdit])

    // Handle connection type change from table
    const handleConnectionTypeUpdate = useCallback(async (accountId, newConnectionType) => {
        try {
            // Refresh data after connection type update
            if (onRefresh) {
                onRefresh()
            }
        } catch (error) {
            console.error('Error updating connection type:', error)
        }
    }, [onRefresh])

    // Enhanced action handlers

    const handleViewTasks = useCallback((tiktokAccount) => {
        // Navigate to tasks page or open tasks modal
        // router.push(`/concepts/tiktok-account-management/${tiktokAccount.id}/tasks`)
    }, [router])

    const handleEdit = useCallback((tiktokAccount) => {
        setSelectedAccountForEdit(tiktokAccount)
        setIsEditModalOpen(true)
        // Load devices and scenarios when opening edit modal
        loadDevicesForEdit()
        loadScenariosForEdit()
    }, [setSelectedAccountForEdit, setIsEditModalOpen, loadDevicesForEdit, loadScenariosForEdit])

    const handleDelete = useCallback((tiktokAccount) => {
        setSelectedAccountForAction(tiktokAccount)
        setShowDeleteConfirmDialog(true)
    }, [setSelectedAccountForAction, setShowDeleteConfirmDialog])

    const handleStart = useCallback((tiktokAccount) => {
        setSelectedAccountForAction(tiktokAccount)
        setShowStartConfirmDialog(true)
    }, [setSelectedAccountForAction, setShowStartConfirmDialog])

    const handleStop = useCallback((tiktokAccount) => {
        setSelectedAccountForAction(tiktokAccount)
        setShowStopConfirmDialog(true)
    }, [setSelectedAccountForAction, setShowStopConfirmDialog])

    const confirmStart = useCallback(async () => {
        if (!selectedAccountForAction) return

        setIsProcessing(true)
        setShowStartConfirmDialog(false)

        try {
            // Import the run scenario server action
            const { default: runTiktokAccountScenario } = await import('@/server/actions/tiktok-account/runTiktokAccountScenario')

            const result = await runTiktokAccountScenario(selectedAccountForAction.id)

            if (result.success) {
                setDialogMessage(`Đã tạo tasks cho tài khoản ${selectedAccountForAction.username} theo kịch bản liên kết.`)
                setShowSuccessDialog(true)
                // Refresh the data
                if (onRefresh) {
                    onRefresh()
                }
            } else {
                console.error('Failed to run scenario:', result.message)
                setDialogMessage(`Không thể tạo tasks cho tài khoản ${selectedAccountForAction.username}: ${result.message}`)
                setShowErrorDialog(true)
            }
        } catch (error) {
            console.error('Error running scenario:', error)
            setDialogMessage(`Có lỗi xảy ra khi tạo tasks cho tài khoản ${selectedAccountForAction.username}`)
            setShowErrorDialog(true)
        } finally {
            setIsProcessing(false)
        }
    }, [selectedAccountForAction, setDialogMessage, setShowErrorDialog, setShowSuccessDialog, onRefresh, setIsProcessing])

    const confirmStop = useCallback(async () => {
        if (!selectedAccountForAction) return

        setIsProcessing(true)
        setShowStopConfirmDialog(false)

        try {
            let deletedTasksCount = 0
            let deleteErrorMessages = []

            // First, delete all pending tasks
            try {
                const { default: deletePendingTasks } = await import('@/server/actions/tiktok-account/deletePendingTasks')
                const deleteResult = await deletePendingTasks([selectedAccountForAction.id])
                if (deleteResult.success) {
                    deletedTasksCount = deleteResult.data?.deleted_count || 0
                } else {
                    deleteErrorMessages.push(deleteResult.message)
                }
            } catch (error) {
                deleteErrorMessages.push(`Lỗi khi xóa tasks: ${error.message}`)
            }

            // Then, update account status to suspended
            const { default: updateTiktokAccountStatus } = await import('@/server/actions/tiktok-account/updateTiktokAccountStatus')
            const result = await updateTiktokAccountStatus([selectedAccountForAction.id], 'suspended')

            if (result.success) {
                let successMessage = `Tài khoản ${selectedAccountForAction.username} đã được dừng thành công!`
                if (deletedTasksCount > 0) {
                    successMessage += ` Đã xóa ${deletedTasksCount} pending tasks.`
                }
                setDialogMessage(successMessage)
                setShowSuccessDialog(true)
                // Refresh the data
                if (onRefresh) {
                    onRefresh()
                }
            } else {
                console.error('Failed to stop account:', result.message)
                setDialogMessage(`Không thể dừng tài khoản ${selectedAccountForAction.username}: ${result.message}`)
                setShowErrorDialog(true)
            }

            if (deleteErrorMessages.length > 0) {
                console.error('Some tasks deletion failed:', deleteErrorMessages)
                // Show warning if tasks deletion failed but account was suspended
                if (result.success) {
                    setDialogMessage(`Tài khoản đã được dừng nhưng một số tasks không thể xóa: ${deleteErrorMessages.join(', ')}`)
                    setShowErrorDialog(true)
                }
            }
        } catch (error) {
            console.error('Error stopping account:', error)
            setDialogMessage(`Có lỗi xảy ra khi dừng tài khoản ${selectedAccountForAction.username}`)
            setShowErrorDialog(true)
        } finally {
            setIsProcessing(false)
            setSelectedAccountForAction(null)
        }
    }, [selectedAccountForAction, setDialogMessage, setShowErrorDialog, setShowSuccessDialog, onRefresh, setIsProcessing])

    const confirmDelete = useCallback(async () => {
        if (!selectedAccountForAction) return

        setIsProcessing(true)
        setShowDeleteConfirmDialog(false)

        try {
            const { default: deleteTiktokAccounts } = await import('@/server/actions/tiktok-account/deleteTiktokAccounts')
            const result = await deleteTiktokAccounts([selectedAccountForAction.id])

            if (result.success) {
                setDialogMessage(`Đã xóa tài khoản ${selectedAccountForAction.username} thành công!`)
                setShowSuccessDialog(true)
                if (onRefresh) {
                    onRefresh()
                }
            } else {
                console.error('Failed to delete account:', result.message)
                setDialogMessage(`Không thể xóa tài khoản ${selectedAccountForAction.username}: ${result.message}`)
                setShowErrorDialog(true)
            }
        } catch (error) {
            console.error('Error deleting account:', error)
            setDialogMessage(`Có lỗi xảy ra khi xóa tài khoản ${selectedAccountForAction.username}`)
            setShowErrorDialog(true)
        } finally {
            setIsProcessing(false)
            setSelectedAccountForAction(null)
        }
    }, [selectedAccountForAction, setDialogMessage, setShowErrorDialog, setShowSuccessDialog, onRefresh, setIsProcessing])

    const onColumnToggle = useCallback((accessorKey) => {
        if (visibleColumns.includes(accessorKey)) {
            setVisibleColumns(visibleColumns.filter(key => key !== accessorKey))
        } else {
            setVisibleColumns([...visibleColumns, accessorKey])
        }
    }, [visibleColumns, setVisibleColumns])

    const toggleRowExpansion = useCallback((rowId) => {
        const newExpandedRows = new Set(expandedRows)
        if (newExpandedRows.has(rowId)) {
            newExpandedRows.delete(rowId)
        } else {
            newExpandedRows.add(rowId)
        }
        setExpandedRows(newExpandedRows)
    }, [expandedRows, setExpandedRows])

    const columns = useMemo(
        () => {
            const baseColumns = [
                {
                    id: 'expander',
                    header: '',
                    cell: (props) => {
                        const row = props.row.original
                        const rowId = row.id || row.username || props.row.id
                        const isExpanded = expandedRows.has(rowId)
                        return (
                            <button
                                onClick={() => toggleRowExpansion(rowId)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                            >
                                {isExpanded ? (
                                    <TbChevronDown className="w-4 h-4" />
                                ) : (
                                    <TbChevronRight className="w-4 h-4" />
                                )}
                            </button>
                        )
                    },
                    size: 40,
                },
                {
                    header: 'Thông tin người dùng',
                    accessorKey: 'user_info',
                    cell: (props) => {
                        const row = props.row.original
                        return <UserInfoColumn row={row} onViewDetail={() => handleViewDetails(row)} />
                    },
                },
                {
                    header: 'Số điện thoại',
                    accessorKey: 'phone_number',
                    cell: (props) => {
                        const row = props.row.original
                        return <ContactColumn row={row} type="phone" />
                    }
                },
                {
                    header: 'Task Status',
                    accessorKey: 'task_status',
                    cell: (props) => {
                        const row = props.row.original
                        return <TaskStatusColumn row={row} />
                    },
                },
                {
                    header: 'Device & Scenario',
                    accessorKey: 'device_scenario',
                    size: 250,
                    minSize: 200,
                    cell: (props) => {
                        const row = props.row.original
                        return <DeviceScenarioColumn row={row} />
                    },
                },
                {
                    header: 'Kết nối',
                    accessorKey: 'connection',
                    size: 280,
                    minSize: 240,
                    cell: (props) => {
                        const row = props.row.original
                        return <ConnectionCell account={row} proxies={proxyOptions} loading={loadingProxies} />
                    },
                },
                {
                    header: 'Ghi chú',
                    accessorKey: 'notes',
                    cell: (props) => {
                        const row = props.row.original
                        return <NotesColumn row={row} />
                    }
                },
                {
                    header: 'Ngày tạo',
                    accessorKey: 'created_at',
                    cell: (props) => {
                        const row = props.row.original
                        return <DateColumn row={row} field="created_at" />
                    }
                },
                {
                    header: 'Cập nhật',
                    accessorKey: 'updated_at',
                    cell: (props) => {
                        const row = props.row.original
                        return <DateColumn row={row} field="updated_at" />
                    }
                },
            ]

            const actionColumn = {
                header: 'Thao tác',
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        row={props.row.original}
                        onViewDetail={() => handleViewDetails(props.row.original)}
                        onViewTasks={() => handleViewTasks(props.row.original)}
                        onEdit={() => handleEdit(props.row.original)}
                        onDelete={() => handleDelete(props.row.original)}
                        onStart={() => handleStart(props.row.original)}
                        onStop={() => handleStop(props.row.original)}
                    />
                ),
            }

            return [...baseColumns.filter(col =>
                col.id === 'expander' || visibleColumns.includes(col.accessorKey)
            ), actionColumn]
        },
        [visibleColumns, expandedRows, handleViewDetails, handleViewTasks, handleEdit, handleDelete, handleConnectionTypeUpdate, toggleRowExpansion],
    )



    const handleSort = (sort) => {
        onAppendQueryParams({
            sort: (sort.order === 'desc' ? '-' : '') + sort.key,
        })
    }

    const handleRowSelect = (checked, row) => {
        setSelectedTiktokAccount(checked, row)
    }

    const handleAllRowSelect = (checked, rows) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllTiktokAccount(originalRows)
        } else {
            setSelectAllTiktokAccount([])
        }
    }

    // Custom table with expanding rows
    const table = useReactTable({
        data: tiktokAccountList,
        columns,
        state: {
            expanded: Object.fromEntries(Array.from(expandedRows).map(id => [id, true])),
        },
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowId: (row) => row.id || row.username || `row-${Math.random()}`,
    })

    const { Tr, Th, Td, THead, TBody } = Table

    return (
        <div className="relative">
            <TiktokAccountListTableTools columns={columns} selectableColumns={allColumns} onColumnToggle={onColumnToggle} onRefresh={onRefresh} />



            <div className="overflow-x-auto" style={{ position: 'static' }}>
                <Table className="relative" style={{ overflow: 'visible' }}>
                    <THead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                <Th className="w-12">
                                    <Checkbox
                                        checked={selectedTiktokAccount.length === tiktokAccountList.length && tiktokAccountList.length > 0}
                                        onChange={(checked) => handleAllRowSelect(checked, table.getRowModel().rows)}
                                    />
                                </Th>
                                {headerGroup.headers.map((header) => (
                                    <Th key={header.id} colSpan={header.colSpan}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </Th>
                                ))}
                            </Tr>
                        ))}
                    </THead>
                    <TBody>
                        {isInitialLoading ? (
                            // Loading skeleton
                            Array.from({ length: per_page }).map((_, index) => (
                                <Tr key={`skeleton-${index}`}>
                                    <Td className="w-12">
                                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </Td>
                                    <Td className="w-8">
                                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </Td>
                                    <Td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                                            <div className="space-y-2">
                                                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                                <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    </Td>
                                    {Array.from({ length: columns.length - 3 }).map((_, cellIndex) => (
                                        <Td key={cellIndex}>
                                            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        </Td>
                                    ))}
                                </Tr>
                            ))
                        ) : tiktokAccountList.length === 0 ? (
                            // Empty state
                            <Tr>
                                <Td colSpan={columns.length + 1} className="text-center py-12">
                                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                        <TbEye className="w-12 h-12 mb-4 opacity-50" />
                                        <p className="text-lg font-medium mb-2">Không có tài khoản nào</p>
                                        <p className="text-sm">Hãy thêm tài khoản TikTok để bắt đầu quản lý</p>
                                    </div>
                                </Td>
                            </Tr>
                        ) : (
                            // Data rows
                            table.getRowModel().rows.map((row) => {
                                const rowId = row.original.id || row.original.username || row.id
                                const isExpanded = expandedRows.has(rowId)
                                return (
                                    <React.Fragment key={rowId}>
                                        <Tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <Td className="w-12">
                                                <Checkbox
                                                    checked={selectedTiktokAccount.some(selected => selected.id === row.original.id)}
                                                    onChange={(checked) => handleRowSelect(checked, row.original)}
                                                />
                                            </Td>
                                            {row.getVisibleCells().map((cell) => (
                                                <Td key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </Td>
                                            ))}
                                        </Tr>
                                        {isExpanded && (
                                            <Tr key={`${rowId}-expanded`}>
                                                <Td colSpan={columns.length + 1} className="p-0">
                                                    <ExpandedRowContent row={row.original} />
                                                </Td>
                                            </Tr>
                                        )}
                                    </React.Fragment>
                                )
                            })
                        )}
                    </TBody>
                </Table>
            </div>



            {/* Enhanced Account Detail Modal */}
            <AccountDetailModal
                isOpen={isDetailViewOpen}
                onClose={handleCloseDetailView}
                account={selectedTiktokAccountForDetail}
            />

            {/* Start Confirmation Dialog */}
            <Dialog
                isOpen={showStartConfirmDialog}
                onClose={() => setShowStartConfirmDialog(false)}
                onRequestClose={() => setShowStartConfirmDialog(false)}
                width={400}
                className="z-[70]"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <TbPlayerPlay className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Xác nhận chạy kịch bản
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Hành động này không thể hoàn tác
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        Bạn có chắc chắn muốn chạy kịch bản cho tài khoản{' '}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {selectedAccountForAction?.username}
                        </span>?
                        <br />
                        <small className="text-gray-500 dark:text-gray-400">
                            Hệ thống sẽ tạo tasks theo kịch bản đã liên kết với tài khoản này.
                        </small>
                    </p>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="default"
                            onClick={() => setShowStartConfirmDialog(false)}
                            disabled={isProcessing}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="solid"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={confirmStart}
                            loading={isProcessing}
                        >
                            Chạy kịch bản
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Stop Confirmation Dialog */}
            <Dialog
                isOpen={showStopConfirmDialog}
                onClose={() => setShowStopConfirmDialog(false)}
                onRequestClose={() => setShowStopConfirmDialog(false)}
                width={400}
                className="z-[70]"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <TbPlayerStop className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Xác nhận dừng tài khoản
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Hành động này sẽ dừng tất cả các task đang chạy
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        Bạn có chắc chắn muốn dừng tài khoản{' '}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {selectedAccountForAction?.username}
                        </span>
                        ?
                    </p>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="default"
                            onClick={() => setShowStopConfirmDialog(false)}
                            disabled={isProcessing}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="solid"
                            color="red-500"
                            onClick={confirmStop}
                            loading={isProcessing}
                            disabled={isProcessing}
                        >
                            Dừng tài khoản
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                isOpen={showDeleteConfirmDialog}
                onClose={() => setShowDeleteConfirmDialog(false)}
                onRequestClose={() => setShowDeleteConfirmDialog(false)}
                width={400}
                className="z-[70]"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <TbTrash className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Xác nhận xóa tài khoản
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Hành động này không thể hoàn tác
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        Bạn có chắc chắn muốn xóa tài khoản{' '}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {selectedAccountForAction?.username}
                        </span>
                        ?
                    </p>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="default"
                            onClick={() => setShowDeleteConfirmDialog(false)}
                            disabled={isProcessing}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="solid"
                            color="red-500"
                            onClick={confirmDelete}
                            loading={isProcessing}
                            disabled={isProcessing}
                        >
                            Xóa tài khoản
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Success Dialog */}
            <Dialog
                isOpen={showSuccessDialog}
                onClose={() => setShowSuccessDialog(false)}
                onRequestClose={() => setShowSuccessDialog(false)}
                width={400}
                className="z-[80]"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <TbCircleCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Thành công
                            </h3>
                        </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        {dialogMessage}
                    </p>

                    <div className="flex justify-end">
                        <Button
                            variant="solid"
                            color="green-500"
                            onClick={() => setShowSuccessDialog(false)}
                        >
                            Đóng
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Error Dialog */}
            <Dialog
                isOpen={showErrorDialog}
                onClose={() => setShowErrorDialog(false)}
                onRequestClose={() => setShowErrorDialog(false)}
                width={400}
                className="z-[80]"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <TbX className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Có lỗi xảy ra
                            </h3>
                        </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        {dialogMessage}
                    </p>

                    <div className="flex justify-end">
                        <Button
                            variant="solid"
                            color="red-500"
                            onClick={() => setShowErrorDialog(false)}
                        >
                            Đóng
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Edit Account Modal */}
            <EditAccountModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                account={selectedAccountForEdit}
                onSave={handleSaveAccount}
                devices={devices}
                scenarios={scenarios}
                loadingDevices={loadingDevices}
                loadingScenarios={loadingScenarios}
                onLoadDevices={handleLoadDevices}
                onLoadScenarios={handleLoadScenarios}
            />
        </div>
    )
}

export default TiktokAccountListTable

const ConnectionCell = ({ account, proxies = [], loading = false }) => {
    const [saving, setSaving] = useState(false)
    const [currentType, setCurrentType] = useState(account?.connection_type || 'wifi')
    const [currentProxyId, setCurrentProxyId] = useState(account?.proxy?.id ? String(account.proxy.id) : '')

    // ConnectionCell component for managing account connection settings
    console.log('🔍 ConnectionCell received proxies:', proxies.length, proxies)

    const onChangeProxy = async (val) => {
        if (saving) return
        if (String(val) === currentProxyId) return
        setSaving(true)
        try {
            const { default: updateTiktokAccountProxy } = await import('@/server/actions/tiktok-account/updateTiktokAccountProxy')
            const res = await updateTiktokAccountProxy(account.id, val)
            if (res?.success || (res?.id && res?.username)) {
                setCurrentProxyId(String(val))
                toast.push(<Notification title="Thành công" type="success">Đã cập nhật proxy</Notification>)
            } else {
                toast.push(<Notification title="Lỗi" type="danger">{res?.message || 'Không thể cập nhật proxy'}</Notification>)
            }
        } catch (e) {
            toast.push(<Notification title="Lỗi" type="danger">{e.message}</Notification>)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex items-center gap-3">
            <ConnectionTypeToggle account={account} onUpdate={(_, type)=>setCurrentType(type)} />
            {currentType !== '4g' && (
                <div className="w-56">
                    {console.log('🔍 Select props:', { loading, proxiesCount: proxies.length, currentProxyId })}
                    <Select
                        size="sm"
                        placeholder="Chọn proxy"
                        loading={loading}
                        options={proxies}
                        value={currentProxyId ? { value: currentProxyId, label: proxies.find(p=>p.value===currentProxyId)?.label || 'Đang tải...' } : null}
                        onChange={(opt) => onChangeProxy(opt?.value || '')}
                        disabled={saving}
                    />
                </div>
            )}
        </div>
    )
}
