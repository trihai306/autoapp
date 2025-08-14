'use client'
import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DataTable from '@/components/shared/DataTable'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useDeviceListStore } from '../_store/deviceListStore'
import DeviceDetailModal from './DeviceDetailModal'
import ColumnSelector from './ColumnSelector'
import DeviceListTableTools from './DeviceListTableTools'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import deleteDevice from '@/server/actions/device/deleteDevice'
import {
    HiOutlineEye as Eye,
    HiOutlinePencilAlt as Edit,
    HiOutlineTrash as Trash,
    HiOutlineDesktopComputer as Desktop,
    HiOutlineDeviceMobile as Mobile,
    HiOutlineStatusOnline as Online,
    HiOutlineStatusOffline as Offline,
    HiOutlineUser as User
} from 'react-icons/hi'

// Device Name Column Component
const DeviceNameColumn = ({ row, onViewDetail }) => {
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
        <div className="flex items-center gap-3">
            {getDeviceIcon(row.device_type)}
            <div>
                <button
                    onClick={() => onViewDetail(row)}
                    className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    {row.device_name}
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {row.device_id}
                </div>
            </div>
        </div>
    )
}

// Action Column Component
const ActionColumn = ({ row, onViewDetail, onDelete }) => {
    return (
        <div className="flex items-center gap-1">
            <Tooltip title="Xem chi tiết">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(row)}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 !px-2"
                    aria-label="Xem chi tiết"
                >
                    <Eye className="w-4 h-4" />
                </Button>
            </Tooltip>
            <Tooltip title="Xóa">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(row)}
                    className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 !px-2"
                    aria-label="Xóa"
                >
                    <Trash className="w-4 h-4" />
                </Button>
            </Tooltip>
        </div>
    )
}

const DeviceListTable = ({
    deviceListTotal,
    page = 1,
    per_page = 10,
}) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Store state
    const {
        deviceList,
        selectedDevice,
        toggleDeviceSelection,
        selectAllDevices,
        clearSelectedDevice
    } = useDeviceListStore()
    

    
    // Local state
    const [selectedDetailDevice, setSelectedDetailDevice] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedDeleteDevice, setSelectedDeleteDevice] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [visibleColumns, setVisibleColumns] = useState([
        'device_name',
        'user',
        'status',
        'is_online',
        'device_type',
        'platform',
        'last_active_at',
        'created_at',
        'actions'
    ])

    const handleViewDetails = (device) => {
        setSelectedDetailDevice(device)
        setShowDetailModal(true)
    }

    const handleCloseDetailView = () => {
        setShowDetailModal(false)
        setSelectedDetailDevice(null)
    }

    const handleDelete = (device) => {
        setSelectedDeleteDevice(device)
        setShowDeleteConfirm(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedDeleteDevice) return

        setIsDeleting(true)
        try {
            const result = await deleteDevice(selectedDeleteDevice.id)
            
            if (result.success) {
                // Show success toast
                toast.push(
                    <Notification
                        title="Xóa thiết bị thành công"
                        type="success"
                        duration={4000}
                    >
                        Thiết bị "{selectedDeleteDevice.device_name}" đã được xóa khỏi hệ thống.
                    </Notification>
                )
                
                // Remove device from store
                const removeDeviceFromList = useDeviceListStore.getState().removeDeviceFromList
                removeDeviceFromList(selectedDeleteDevice.id)
                
                // Refresh page to get latest data
                router.refresh()
            } else {
                console.error('Failed to delete device:', result.message)
                
                // Show error toast
                toast.push(
                    <Notification
                        title="Lỗi xóa thiết bị"
                        type="danger"
                        duration={5000}
                    >
                        {result.message || 'Không thể xóa thiết bị. Vui lòng thử lại.'}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error deleting device:', error)
            
            // Show error toast
            toast.push(
                <Notification
                    title="Lỗi hệ thống"
                    type="danger"
                    duration={5000}
                >
                    Đã xảy ra lỗi khi xóa thiết bị. Vui lòng thử lại sau.
                </Notification>
            )
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
            setSelectedDeleteDevice(null)
        }
    }

    const onColumnToggle = (accessorKey) => {
        setVisibleColumns(prev => 
            prev.includes(accessorKey)
                ? prev.filter(col => col !== accessorKey)
                : [...prev, accessorKey]
        )
    }

    // Define table columns
    const columns = useMemo(() => [
        {
            accessorKey: 'device_name',
            header: 'Thiết bị',
            cell: ({ row }) => (
                <DeviceNameColumn 
                    row={row.original} 
                    onViewDetail={handleViewDetails}
                />
            ),
            enableSorting: true,
        },
        {
            accessorKey: 'user',
            header: 'Người dùng',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                        {row.original.user?.name || 'Chưa gán'}
                    </span>
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => {
                const status = row.original.status
                const getStatusColor = (status) => {
                    switch (status) {
                        case 'active':
                            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        case 'inactive':
                            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        case 'blocked':
                            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        default:
                            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }
                }
                
                const getStatusText = (status) => {
                    switch (status) {
                        case 'active':
                            return 'Hoạt động'
                        case 'inactive':
                            return 'Không hoạt động'
                        case 'blocked':
                            return 'Bị chặn'
                        default:
                            return 'Không xác định'
                    }
                }

                return (
                    <Badge className={getStatusColor(status)}>
                        {getStatusText(status)}
                    </Badge>
                )
            },
            enableSorting: true,
        },
        {
            accessorKey: 'is_online',
            header: 'Trực tuyến',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.is_online ? (
                        <>
                            <Online className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                        </>
                    ) : (
                        <>
                            <Offline className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Offline</span>
                        </>
                    )}
                </div>
            ),
            enableSorting: true,
        },
        {
            accessorKey: 'device_type',
            header: 'Loại thiết bị',
            cell: ({ row }) => (
                <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
                    {row.original.device_type || 'Không xác định'}
                </span>
            ),
            enableSorting: true,
        },
        {
            accessorKey: 'platform',
            header: 'Nền tảng',
            cell: ({ row }) => (
                <span className="text-sm text-gray-900 dark:text-gray-100">
                    {row.original.platform || 'Không xác định'}
                </span>
            ),
            enableSorting: true,
        },
        {
            accessorKey: 'last_active_at',
            header: 'Hoạt động cuối',
            cell: ({ row }) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {row.original.last_active_at 
                        ? new Date(row.original.last_active_at).toLocaleString('vi-VN')
                        : 'Chưa có'
                    }
                </span>
            ),
            enableSorting: true,
        },
        {
            accessorKey: 'created_at',
            header: 'Ngày tạo',
            cell: ({ row }) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(row.original.created_at).toLocaleDateString('vi-VN')}
                </span>
            ),
            enableSorting: true,
        },
        {
            accessorKey: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => (
                <ActionColumn
                    row={row.original}
                    onViewDetail={handleViewDetails}
                    onDelete={handleDelete}
                />
            ),
            enableSorting: false,
        },
    ], [])

    // Filter visible columns
    const visibleColumnsData = columns.filter(column => 
        visibleColumns.includes(column.accessorKey)
    )

    const selectableColumns = columns.filter(column => 
        column.accessorKey !== 'actions'
    )

    const handlePaginationChange = (page) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', page.toString())
        router.push(`?${params.toString()}`)
    }

    const handleSelectChange = (value) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('per_page', value.toString())
        params.set('page', '1') // Reset to first page
        router.push(`?${params.toString()}`)
    }

    const handleSort = (sort) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('sort', sort.column)
        params.set('order', sort.direction)
        router.push(`?${params.toString()}`)
    }

    const handleRowSelect = (checked, row) => {
        toggleDeviceSelection(row.original)
    }

    const handleAllRowSelect = (checked, rows) => {
        if (checked) {
            selectAllDevices()
        } else {
            clearSelectedDevice()
        }
    }

    return (
        <>
            <div className="space-y-4">
                {/* Table Tools */}
                <DeviceListTableTools
                    columns={columns}
                    selectableColumns={selectableColumns}
                    onColumnToggle={onColumnToggle}
                />

                {/* Data Table */}
                <DataTable
                    selectable
                    data={deviceList}
                    columns={visibleColumnsData}
                    pagingData={{
                        pageIndex: page,
                        pageSize: per_page,
                        total: deviceListTotal,
                    }}
                    onPaginationChange={handlePaginationChange}
                    onSelectChange={handleSelectChange}
                    onSort={handleSort}
                    onCheckBoxChange={handleRowSelect}
                    onIndeterminateCheckBoxChange={handleAllRowSelect}
                    checkboxChecked={(row) => selectedDevice.some(device => device.id === row.id)}
                    indeterminateCheckboxChecked={(rows) => {
                        const allRows = rows.map(row => row.original)
                        return selectedDevice.length === allRows.length && allRows.length > 0
                    }}
                    loading={false}
                    noData={deviceList.length === 0}
                    customNoDataIcon={
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Desktop className="w-10 h-10 text-gray-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Chưa có thiết bị nào
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                                    Hiện tại chưa có thiết bị nào được kết nối với hệ thống. 
                                    Hãy sử dụng token để kết nối thiết bị của bạn.
                                </p>
                            </div>
                        </div>
                    }
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                />
            </div>

            {/* Device Detail Modal */}
            <DeviceDetailModal
                isOpen={showDetailModal}
                onClose={handleCloseDetailView}
                device={selectedDetailDevice}
                onDelete={handleDelete}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteConfirm}
                title="Xác nhận xóa thiết bị"
                confirmButtonColor="red-600"
                loading={isDeleting}
            >
                <p>
                    Bạn có chắc chắn muốn xóa thiết bị <strong>{selectedDeleteDevice?.device_name}</strong>?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Hành động này không thể hoàn tác.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default DeviceListTable
