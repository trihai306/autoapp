'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import TiktokAccountListProvider from './_components/TiktokAccountListProvider'
import TiktokAccountListTable from './_components/TiktokAccountListTable'
import TiktokAccountListActionTools from './_components/TiktokAccountListActionTools'
import TiktokAccountListPagination from './_components/TiktokAccountListPagination'
import DashboardHeader from './_components/DashboardHeader'
import QuickActions from './_components/QuickActions'
import InteractionConfigModal from './_components/InteractionConfigModal'
import { DashboardStats } from './_components/stats'
import { useTiktokAccountListStore } from './_store/tiktokAccountListStore'
import updateTiktokAccountStatus from '@/server/actions/tiktok-account/updateTiktokAccountStatus'
import { useTranslations } from 'next-intl'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { useTiktokAccountTableReload } from '@/utils/hooks/useRealtime'
import { useSession } from 'next-auth/react'

const TiktokAccountManagementClient = ({ data, params }) => {
    
    const t = useTranslations('tiktokAccountManagement')
    const router = useRouter()
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [showInteractionConfigModal, setShowInteractionConfigModal] = useState(false)
    const [showStartConfirmation, setShowStartConfirmation] = useState(false)
    const [showStopConfirmation, setShowStopConfirmation] = useState(false)
    const [pendingAction, setPendingAction] = useState(null)
    
    // Get selected accounts from store
    const selectedAccounts = useTiktokAccountListStore((state) => state.selectedTiktokAccount)

    const handleRefresh = async () => {
        setIsLoading(true)
        try {
            // Use router.refresh() to trigger server component re-render
            // This will re-fetch data from getTiktokAccounts() without full page reload
            router.refresh()
            
            // Set loading to false after a short delay to show refresh feedback
            setTimeout(() => {
                setIsLoading(false)
            }, 500)
        } catch (error) {
            console.error('Error refreshing data:', error)
            setIsLoading(false)
        }
    }

    // Realtime: reload table on broadcast event (private channel cho user hiện tại)
    const { listenToTableReload, stopListeningToTableReload } = useTiktokAccountTableReload(session?.user?.id)
    
    // Chỉ log khi reload table được kích hoạt
    useEffect(() => {
        // Chỉ setup khi có session
        if (!session?.user?.id) {
            console.log('⏳ [TiktokAccountManagementClient] Waiting for session...');
            return;
        }
        
        // Quiet logs; chỉ log khi nhận event
        
        let cleanup = null
        let retryInterval = null
        const setup = async () => {
            const result = await listenToTableReload(() => {
                console.log('🔄 Table reload triggered');
                handleRefresh()
            })
            
            if (result && typeof result === 'object' && result.isRetry && typeof result.retry === 'function') {
                // silent
                retryInterval = setInterval(async () => {
                    const r = await result.retry()
                    if (r && typeof r === 'function') {
                        // Đã subscribe thành công, lưu cleanup và dừng retry
                        cleanup = r
                        clearInterval(retryInterval)
                        retryInterval = null
                        // silent
                    }
                }, 2000)
            } else if (typeof result === 'function') {
                cleanup = result
            }
        }
        setup()
        
        return () => {
            if (retryInterval) {
                clearInterval(retryInterval)
            }
            if (cleanup && typeof cleanup === 'function') {
                try { cleanup() } catch (_) {}
            }
            try { stopListeningToTableReload() } catch (_) {}
        }
    }, [session?.user?.id, listenToTableReload, stopListeningToTableReload])

    const handleSettings = () => {
        // Open interaction config modal
        setShowInteractionConfigModal(true)
    }

    const handleQuickAction = async (actionType) => {
        if (selectedAccounts.length === 0) {
            console.warn('No accounts selected')
            return
        }

        // Show confirmation for start and stop actions
        if (actionType === 'start') {
            setPendingAction('start')
            setShowStartConfirmation(true)
            return
        }
        
        if (actionType === 'stop') {
            setPendingAction('stop')
            setShowStopConfirmation(true)
            return
        }

        // Execute other actions directly
        await executeQuickAction(actionType)
    }

    const executeQuickAction = async (actionType) => {
        // // console.log(`Performing ${actionType} on accounts:`, selectedAccounts)
        setIsLoading(true)
        
        try {
            const accountIds = selectedAccounts.map(account => account.id)
            
            switch (actionType) {
                case 'start':
                    // Bắt đầu - run scenario for each selected account
                    const { default: runTiktokAccountScenario } = await import('@/server/actions/tiktok-account/runTiktokAccountScenario')
                    
                    let successCount = 0
                    let errorMessages = []
                    
                    for (const account of selectedAccounts) {
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
                        // // console.log(`Successfully created tasks for ${successCount} accounts`)
                        handleRefresh()
                    }
                    
                    if (errorMessages.length > 0) {
                        console.error('Some accounts failed:', errorMessages)
                    }
                    break
                    
                case 'stop':
                    // Dừng - update status to suspended and delete all pending tasks
                    const { default: deletePendingTasks } = await import('@/server/actions/tiktok-account/deletePendingTasks')
                    
                    let deletedTasksCount = 0
                    let deleteErrorMessages = []
                    let statusUpdateSuccess = false
                    
                    // First, update account status to suspended (most important)
                    try {
                        const stopResult = await updateTiktokAccountStatus(accountIds, 'suspended')
                        if (stopResult.success) {
                            statusUpdateSuccess = true
                            // // console.log(`Successfully updated ${selectedAccounts.length} accounts to suspended status`)
                        } else {
                            console.error('Failed to update account status:', stopResult.message)
                            deleteErrorMessages.push(`Lỗi cập nhật trạng thái: ${stopResult.message}`)
                        }
                    } catch (error) {
                        console.error('Error updating account status:', error)
                        deleteErrorMessages.push(`Lỗi cập nhật trạng thái: ${error.message}`)
                    }
                    
                    // Then, delete all pending tasks (secondary action)
                    try {
                        const deleteResult = await deletePendingTasks(accountIds)
                        if (deleteResult.success) {
                            deletedTasksCount = deleteResult.data?.deleted_count || 0
                            const devicesNotified = deleteResult.data?.devices_notified || 0
                            // // console.log(`Deleted ${deletedTasksCount} pending tasks and notified ${devicesNotified} devices`)
                        } else {
                            deleteErrorMessages.push(`Lỗi xóa tasks: ${deleteResult.message}`)
                        }
                    } catch (error) {
                        deleteErrorMessages.push(`Lỗi khi xóa tasks: ${error.message}`)
                    }
                    
                    // Show results
                    if (statusUpdateSuccess) {
                        // // console.log(`Đã dừng ${selectedAccounts.length} tài khoản${deletedTasksCount > 0 ? ` và xóa ${deletedTasksCount} pending tasks` : ''}`)
                        handleRefresh()
                    }
                    
                    if (deleteErrorMessages.length > 0) {
                        console.error('Some operations failed:', deleteErrorMessages)
                    }
                    break
                    
                default:
                    console.warn('Unknown action type:', actionType)
            }
        } catch (error) {
            console.error('Error performing quick action:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleStartConfirm = async () => {
        setShowStartConfirmation(false)
        await executeQuickAction('start')
    }

    const handleStopConfirm = async () => {
        setShowStopConfirmation(false)
        await executeQuickAction('stop')
    }

    return (
        <TiktokAccountListProvider tiktokAccountList={data?.list || []}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Dashboard Header */}
                <DashboardHeader
                    title={t('title')}
                    subtitle="Theo dõi và quản lý tất cả tài khoản TikTok của bạn một cách hiệu quả"
                    onRefresh={handleRefresh}
                    onSettings={handleSettings}
                />

                <Container className="py-6">
                    <div className="space-y-6">
                        {/* Statistics Dashboard */}
                        <DashboardStats loading={isLoading} />

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                            {/* Account Management Table - Takes 2/3 columns on lg, 3 columns on xl */}
                            <div className="lg:col-span-2 xl:col-span-3">
                                <AdaptiveCard className="overflow-hidden">
                                    <div className="p-4 lg:p-6">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 lg:mb-6">
                                            <div>
                                                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">
                                                    Danh sách tài khoản
                                                </h2>
                                                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    Quản lý và theo dõi trạng thái của {data?.total || 0} tài khoản
                                                </p>
                                            </div>
                                            <TiktokAccountListActionTools />
                                        </div>
                                        
                                                                <TiktokAccountListTable
                            tiktokAccountListTotal={data?.total || 0}
                            page={parseInt(params.page) || 1}
                            per_page={parseInt(params.per_page) || 10}
                            onRefresh={handleRefresh}
                        />
                                    </div>
                                </AdaptiveCard>
                                
                                {/* Pagination - Outside the card */}
                                <TiktokAccountListPagination
                                    tiktokAccountListTotal={data?.total || 0}
                                    page={parseInt(params.page) || 1}
                                    per_page={parseInt(params.per_page) || 10}
                                />
                            </div>

                            {/* Quick Actions Sidebar - Takes 1 column on both lg and xl */}
                            <div className="lg:col-span-1 xl:col-span-1">
                                <QuickActions 
                                    selectedAccounts={selectedAccounts}
                                    onAction={handleQuickAction}
                                    loading={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Start Confirmation Dialog */}
            <Dialog
                isOpen={showStartConfirmation}
                onClose={() => setShowStartConfirmation(false)}
                onRequestClose={() => setShowStartConfirmation(false)}
            >
                <h5 className="mb-4">Xác nhận bắt đầu</h5>
                <p>
                    Bạn có chắc chắn muốn bắt đầu chạy kịch bản cho {selectedAccounts.length} tài khoản đã chọn?
                    <br />
                    <small className="text-gray-500">Hệ thống sẽ tạo tasks theo kịch bản đã liên kết với từng tài khoản.</small>
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

            {/* Stop Confirmation Dialog */}
            <Dialog
                isOpen={showStopConfirmation}
                onClose={() => setShowStopConfirmation(false)}
                onRequestClose={() => setShowStopConfirmation(false)}
            >
                <h5 className="mb-4">Xác nhận dừng</h5>
                <p>
                    Bạn có chắc chắn muốn dừng {selectedAccounts.length} tài khoản đã chọn?
                    <br />
                    <small className="text-red-500">Tất cả pending tasks sẽ bị xóa và tài khoản sẽ được suspend.</small>
                </p>
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        onClick={() => setShowStopConfirmation(false)}
                    >
                        Hủy
                    </Button>
                    <Button variant="solid" className="bg-red-600 hover:bg-red-700" onClick={handleStopConfirm}>
                        Dừng
                    </Button>
                </div>
            </Dialog>

            {/* Interaction Config Modal */}
            <InteractionConfigModal
                isOpen={showInteractionConfigModal}
                onClose={() => setShowInteractionConfigModal(false)}
            />
        </TiktokAccountListProvider>
    )
}

export default TiktokAccountManagementClient 