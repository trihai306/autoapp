'use client'

import TiktokAccountListSearch from './TiktokAccountListSearch'
import ColumnSelector from './ColumnSelector'
import TiktokAccountTableFilter from './TiktokAccountTableFilter'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useTiktokAccountListStore } from '../_store'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { 
    TbTrash, 
    TbX,
    TbPlayerPlay,
    TbPlayerStop,
    TbRefresh,
    TbSortAscending,
    TbSortDescending
} from 'react-icons/tb'
import Dialog from '@/components/ui/Dialog'
import { useState } from 'react'
import deleteTiktokAccounts from '@/server/actions/tiktok-account/deleteTiktokAccounts'
import updateTiktokAccountStatus from '@/server/actions/tiktok-account/updateTiktokAccountStatus'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

const TiktokAccountListBulkActionTools = () => {
    const router = useRouter()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [showSuspendConfirmation, setShowSuspendConfirmation] = useState(false)
    const [showStartConfirmation, setShowStartConfirmation] = useState(false)
    const tTableTools = useTranslations('tiktokAccountManagement.tableTools')

    const selectedTiktokAccount = useTiktokAccountListStore((state) => state.selectedTiktokAccount)
    const setSelectAllTiktokAccount = useTiktokAccountListStore((state) => state.setSelectAllTiktokAccount)

    const onBulkDelete = () => {
        setShowDeleteConfirmation(true)
    }

    const onBulkSuspend = () => {
        setShowSuspendConfirmation(true)
    }

    const onBulkStart = () => {
        setShowStartConfirmation(true)
    }

    const handleStartConfirm = async () => {
        try {
            // Import the run scenario server action
            const { default: runTiktokAccountScenario } = await import('@/server/actions/tiktok-account/runTiktokAccountScenario')
            
            let successCount = 0
            let errorMessages = []
            
            for (const account of selectedTiktokAccount) {
                try {
                    const result = await runTiktokAccountScenario(account.id)
                    if (result.success) {
                        successCount++
                        // // console.log(`Created tasks for account ${account.username}`)
                    } else {
                        errorMessages.push(`${account.username}: ${result.message}`)
                    }
                } catch (error) {
                    errorMessages.push(`${account.username}: ${error.message}`)
                }
            }
            
            if (successCount > 0) {
                toast.push(
                    <Notification title={t('success')} type="success" closable>
                        {t('activateSuccess', { count: successCount })} - {t('activateSuccessDesc')}
                    </Notification>
                )
                setSelectAllTiktokAccount([])
                router.refresh()
            }
            
            if (errorMessages.length > 0) {
                toast.push(
                    <Notification title={t('error')} type="danger" closable>
                        {t('someAccountsFailed')}: {errorMessages.join(', ')}
                    </Notification>
                )
            }
        } catch (error) {
            toast.push(
                <Notification title={t('error')} type="danger" closable>
                    {t('errorCreatingTasks')}
                </Notification>
            )
        }
        
        setShowStartConfirmation(false)
    }



    const onClearSelection = () => {
        setSelectAllTiktokAccount([])
    }

    const handleRefresh = async () => {
        try {
            router.refresh()
            toast.push(
                <Notification title="Thành công" type="success" closable>
                    Đã làm mới dữ liệu
                </Notification>
            )
        } catch (error) {
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    Không thể làm mới dữ liệu
                </Notification>
            )
        }
    }

    const handleDeleteConfirm = async () => {
        const tiktokAccountIds = selectedTiktokAccount.map((tiktokAccount) => tiktokAccount.id)
        const result = await deleteTiktokAccounts(tiktokAccountIds)

        if (result.success) {
            toast.push(
                <Notification title={t('successTitle')} type="success" closable>
                    {result.message}
                </Notification>
            )
            setSelectAllTiktokAccount([])
            router.refresh()
        } else {
            toast.push(
                <Notification title={t('errorTitle')} type="danger" closable>
                    {result.message}
                </Notification>
            )
        }
        setShowDeleteConfirmation(false)
    }

    const handleSuspendConfirm = async () => {
        try {
            const tiktokAccountIds = selectedTiktokAccount.map((tiktokAccount) => tiktokAccount.id)
            
            // Import the delete pending tasks server action
            const { default: deletePendingTasks } = await import('@/server/actions/tiktok-account/deletePendingTasks')
            
            let deletedTasksCount = 0
            let deleteErrorMessages = []
            
            let statusUpdateSuccess = false
            
            // First, update account status to suspended (most important)
            try {
                const result = await updateTiktokAccountStatus(tiktokAccountIds, 'suspended')
                if (result.success) {
                    statusUpdateSuccess = true
                    // // console.log(`Successfully updated ${selectedTiktokAccount.length} accounts to suspended status`)
                } else {
                    deleteErrorMessages.push(`${t('statusUpdateError')}: ${result.message}`)
                }
            } catch (error) {
                deleteErrorMessages.push(`${t('statusUpdateError')}: ${error.message}`)
            }
            
            // Then, delete all pending tasks (secondary action)
            try {
                const deleteResult = await deletePendingTasks(tiktokAccountIds)
                if (deleteResult.success) {
                    deletedTasksCount = deleteResult.data?.deleted_count || 0
                    const devicesNotified = deleteResult.data?.devices_notified || 0
                    // // console.log(`Deleted ${deletedTasksCount} pending tasks and notified ${devicesNotified} devices`)
                } else {
                    deleteErrorMessages.push(`${t('deleteTasksError')}: ${deleteResult.message}`)
                }
            } catch (error) {
                deleteErrorMessages.push(`${t('deleteTasksErrorDesc')}: ${error.message}`)
            }
            
            // Show results
            if (statusUpdateSuccess) {
                let successMessage = t('suspendSuccess', { count: selectedTiktokAccount.length })
                if (deletedTasksCount > 0) {
                    successMessage += ` ${t('deleteTasksSuccess', { count: deletedTasksCount })}`
                }
                
                toast.push(
                    <Notification title={t('successTitle')} type="success" closable>
                        {successMessage}
                    </Notification>
                )
                setSelectAllTiktokAccount([])
                router.refresh()
            } else {
                toast.push(
                    <Notification title="Error" type="danger" closable>
                        Không thể cập nhật trạng thái tài khoản
                    </Notification>
                )
            }
            
            if (deleteErrorMessages.length > 0) {
                toast.push(
                    <Notification title="Warning" type="warning" closable>
                        Một số tasks không thể xóa: {deleteErrorMessages.join(', ')}
                    </Notification>
                )
            }
        } catch (error) {
            toast.push(
                <Notification title={t('errorTitle')} type="danger" closable>
                    {t('errorStoppingAccounts')}
                </Notification>
            )
        }
        
        setShowSuspendConfirmation(false)
    }

    return (
        <>
            <div className="flex flex-col items-start md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        Đã chọn {selectedTiktokAccount.length} tài khoản
                    </Badge>
                </div>
                
                {/* Status Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="solid"
                        className="bg-green-500 hover:bg-green-400"
                        icon={<TbPlayerPlay />}
                        onClick={onBulkStart}
                    >
                        Bắt đầu
                    </Button>
                    <Button
                        size="sm"
                        variant="solid"
                        className="bg-amber-500 hover:bg-amber-400"
                        icon={<TbPlayerStop />}
                        onClick={onBulkSuspend}
                    >
                        Dừng
                    </Button>
                </div>
                
                {/* Destructive Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="solid"
                        className="bg-blue-500 hover:bg-blue-400"
                        icon={<TbRefresh />}
                        onClick={handleRefresh}
                    >
                        Làm mới
                    </Button>
                    <Button
                        size="sm"
                        variant="solid"
                        className="bg-red-500 hover:bg-red-400"
                        icon={<TbTrash />}
                        onClick={onBulkDelete}
                    >
                        Xóa
                    </Button>
                    <Button
                        size="sm"
                        variant="default"
                        icon={<TbX />}
                        onClick={onClearSelection}
                    >
                        Bỏ chọn
                    </Button>
                </div>
            </div>
            <Dialog
                isOpen={showDeleteConfirmation}
                onClose={() => setShowDeleteConfirmation(false)}
                onRequestClose={() => setShowDeleteConfirmation(false)}
            >
                <h5 className="mb-4">Xóa tài khoản đã chọn</h5>
                <p>
                    Bạn có chắc chắn muốn xóa {selectedTiktokAccount.length} tài khoản TikTok đã chọn? Hành động này không thể hoàn tác.
                </p>
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        onClick={() => setShowDeleteConfirmation(false)}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="solid"
                        color="red-600"
                        onClick={handleDeleteConfirm}
                    >
                        Xóa
                    </Button>
                </div>
            </Dialog>
            <Dialog
                isOpen={showSuspendConfirmation}
                onClose={() => setShowSuspendConfirmation(false)}
                onRequestClose={() => setShowSuspendConfirmation(false)}
            >
                <h5 className="mb-4">Tạm khóa tài khoản đã chọn</h5>
                <p>
                    Bạn có chắc chắn muốn tạm khóa {selectedTiktokAccount.length} tài khoản TikTok đã chọn?
                </p>
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        onClick={() => setShowSuspendConfirmation(false)}
                    >
                        Hủy
                    </Button>
                    <Button variant="solid" onClick={handleSuspendConfirm}>
                        Tạm khóa
                    </Button>
                </div>
            </Dialog>
            <Dialog
                isOpen={showStartConfirmation}
                onClose={() => setShowStartConfirmation(false)}
                onRequestClose={() => setShowStartConfirmation(false)}
            >
                <h5 className="mb-4">Bắt đầu tài khoản đã chọn</h5>
                <p>
                    Bạn có chắc chắn muốn bắt đầu chạy kịch bản cho {selectedTiktokAccount.length} tài khoản TikTok đã chọn?
                </p>
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        onClick={() => setShowStartConfirmation(false)}
                    >
                        Hủy
                    </Button>
                    <Button variant="solid" onClick={handleStartConfirm}>
                        Bắt đầu
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

const TiktokAccountListTableTools = ({ columns, selectableColumns, onColumnToggle, onRefresh }) => {
    const { onAppendQueryParams } = useAppendQueryParams()
    const selectedTiktokAccount = useTiktokAccountListStore((state) => state.selectedTiktokAccount)
    const [sortBy, setSortBy] = useState('')
    const [sortOrder, setSortOrder] = useState('asc')
    const t = useTranslations('tiktokAccountManagement.tableTools')
    const tTableTools = useTranslations('tiktokAccountManagement.tableTools')

    const handleInputChange = (query) => {
        onAppendQueryParams({
            search: query,
        })
    }

    const handleQuickFilter = (filterType, value) => {
        onAppendQueryParams({
            [`filter[${filterType}]`]: value,
            page: '1'
        })
    }

    const handleSort = (field) => {
        const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc'
        setSortBy(field)
        setSortOrder(newOrder)
        onAppendQueryParams({
            sort: newOrder === 'desc' ? `-${field}` : field,
            page: '1'
        })
    }

    const clearFilters = () => {
        onAppendQueryParams({
            search: '',
            'filter[status]': '',
            'filter[task_status]': '',
            'filter[has_pending_tasks]': '',
            sort: '',
            page: '1'
        })
    }

    if (selectedTiktokAccount.length > 0) {
        return <TiktokAccountListBulkActionTools />
    }

    return (
        <div className="space-y-4">
            {/* Main Search and Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 max-w-md">
                    <TiktokAccountListSearch onInputChange={handleInputChange} />
                </div>
                <div className="flex items-center gap-2">
                    <TiktokAccountTableFilter />
                    <ColumnSelector
                        columns={columns}
                        selectableColumns={selectableColumns}
                        onColumnToggle={onColumnToggle}
                    />
                    <Button
                        size="sm"
                        variant="default"
                        icon={<TbRefresh />}
                        onClick={onRefresh}
                    >
                        {tTableTools('refresh')}
                    </Button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tTableTools('quickFilters')}:</span>
                
                {/* Status Filters */}
                <Button
                    size="xs"
                    variant="default"
                    className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
                    onClick={() => handleQuickFilter('status', 'active')}
                >
                    {tTableTools('status.active')}
                </Button>
                <Button
                    size="xs"
                    variant="default"
                    className="bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
                    onClick={() => handleQuickFilter('status', 'inactive')}
                >
                    {tTableTools('status.inactive')}
                </Button>
                <Button
                    size="xs"
                    variant="default"
                    className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                    onClick={() => handleQuickFilter('status', 'suspended')}
                >
                    {tTableTools('status.suspended')}
                </Button>

                {/* Task Status Filters */}
                <Button
                    size="xs"
                    variant="default"
                    className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400"
                    onClick={() => handleQuickFilter('has_pending_tasks', 'true')}
                >
                    {tTableTools('taskStatus.hasPending')}
                </Button>
                <Button
                    size="xs"
                    variant="default"
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                    onClick={() => handleQuickFilter('has_pending_tasks', 'false')}
                >
                    {tTableTools('taskStatus.noPending')}
                </Button>

                {/* Sort Options */}
                <div className="flex items-center gap-1 ml-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tTableTools('sortBy')}:</span>
                    <Button
                        size="xs"
                        variant="default"
                        icon={sortBy === 'username' && sortOrder === 'desc' ? <TbSortDescending /> : <TbSortAscending />}
                        onClick={() => handleSort('username')}
                        className={sortBy === 'username' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                    >
                        {tTableTools('sort.username')}
                    </Button>
                    <Button
                        size="xs"
                        variant="default"
                        icon={sortBy === 'created_at' && sortOrder === 'desc' ? <TbSortDescending /> : <TbSortAscending />}
                        onClick={() => handleSort('created_at')}
                        className={sortBy === 'created_at' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                    >
                        {tTableTools('sort.createdAt')}
                    </Button>
                    <Button
                        size="xs"
                        variant="default"
                        icon={sortBy === 'pending_tasks_count' && sortOrder === 'desc' ? <TbSortDescending /> : <TbSortAscending />}
                        onClick={() => handleSort('pending_tasks_count')}
                        className={sortBy === 'pending_tasks_count' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                    >
                        {tTableTools('sort.tasks')}
                    </Button>
                </div>

                {/* Clear Filters */}
                <Button
                    size="xs"
                    variant="default"
                    icon={<TbX />}
                    onClick={clearFilters}
                    className="ml-2"
                >
                    {tTableTools('clearFilters')}
                </Button>
            </div>
        </div>
    )
}

export default TiktokAccountListTableTools 