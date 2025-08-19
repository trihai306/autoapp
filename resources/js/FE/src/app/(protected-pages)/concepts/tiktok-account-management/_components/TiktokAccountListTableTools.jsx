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
    const t = useTranslations('tiktokAccountManagement.tableTools')
    const tTableTools = useTranslations('tiktokAccountManagement.tableTools')

    const handleInputChange = (query) => {
        onAppendQueryParams({
            search: query,
        })
    }

    // Quick filters & sort UI removed per request

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

            {/* Quick Filters & Sort UI removed */}
        </div>
    )
}

export default TiktokAccountListTableTools 