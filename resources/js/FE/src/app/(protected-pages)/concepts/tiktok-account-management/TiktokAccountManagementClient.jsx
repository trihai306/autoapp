'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import {
    TiktokAccountListProvider,
    TiktokAccountListTable,
    TiktokAccountListActionTools,
    TiktokAccountListPagination,
    DashboardHeader,
    InteractionConfigModal
} from './_components'
import { DashboardStats } from './_components'
import { useTiktokAccountListStore } from './_store'

import { useTranslations } from 'next-intl'

import { useTiktokAccountTableReload } from '@/utils/hooks/useRealtime'
import { useSession } from 'next-auth/react'

const TiktokAccountManagementClient = ({ data, params }) => {

    const t = useTranslations('tiktokAccountManagement')
    const router = useRouter()
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [showInteractionConfigModal, setShowInteractionConfigModal] = useState(false)

    // Proxy options state - load once for all accounts
    const [proxyOptions, setProxyOptions] = useState([{ value: '', label: 'Không sử dụng proxy' }])
    const [loadingProxies, setLoadingProxies] = useState(false)


    // Get selected accounts from store
    const selectedAccounts = useTiktokAccountListStore((state) => state.selectedTiktokAccount)

    // Load proxy options once for all accounts
    const loadProxyOptions = useCallback(async () => {
        if (loadingProxies) return // Prevent multiple calls

        setLoadingProxies(true)
        try {
            const { default: getActiveProxies } = await import('@/server/actions/proxy/getActiveProxies')
            const response = await getActiveProxies()

            console.log('🔍 Proxy API response:', response)

            if (response.success && response.data && response.data.length > 0) {
                const proxyOptions = response.data.map(proxy => ({
                    value: String(proxy.value),
                    label: `${proxy.data.host}:${proxy.data.port} (${proxy.data.type})`,
                    subLabel: proxy.label,
                    data: proxy.data,
                    status: proxy.data.status
                }))
                console.log('🔍 Mapped proxy options:', proxyOptions)
                const finalOptions = [{ value: '', label: 'Không sử dụng proxy' }, ...proxyOptions]
                console.log('🔍 Final proxy options:', finalOptions)
                setProxyOptions(finalOptions)
            } else {
                setProxyOptions([{ value: '', label: 'Không sử dụng proxy' }])
            }
        } catch (error) {
            console.error('❌ Error loading proxy options:', error)
            setProxyOptions([{ value: '', label: 'Không sử dụng proxy' }])
        } finally {
            setLoadingProxies(false)
        }
    }, [])

    const handleRefresh = useCallback(async () => {
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
    }, [router])

    // Realtime: reload table on broadcast event (private channel cho user hiện tại)
    const { listenToTableReload, stopListeningToTableReload } = useTiktokAccountTableReload(session?.user?.id)

    // Chỉ log khi reload table được kích hoạt
    useEffect(() => {
        // Chỉ setup khi có session
        if (!session?.user?.id) {
            return;
        }

        // Quiet logs; chỉ log khi nhận event

        let cleanup = null
        let retryInterval = null
        let retryCount = 0
        const maxRetries = 10 // Tối đa 10 lần retry (20 giây)

        const setup = async () => {
            const result = await listenToTableReload(() => {
                handleRefresh()
            })

            if (result && typeof result === 'object' && result.isRetry && typeof result.retry === 'function') {
                // silent
                retryInterval = setInterval(async () => {
                    retryCount++
                    if (retryCount > maxRetries) {
                        clearInterval(retryInterval)
                        retryInterval = null
                        return
                    }

                    const r = await result.retry()
                    if (r && typeof r === 'function') {
                        // Đã subscribe thành công, lưu cleanup và dừng retry
                        cleanup = r
                        clearInterval(retryInterval)
                        retryInterval = null
                        retryCount = 0
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
    }, [session?.user?.id, listenToTableReload, stopListeningToTableReload, handleRefresh])

    // Load proxy options once when component mounts
    useEffect(() => {
        loadProxyOptions()
    }, [loadProxyOptions])

    const handleSettings = useCallback(() => {
        // Open interaction config modal
        setShowInteractionConfigModal(true)
    }, [])



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



                        {/* Main Content - Full Width Table */}
                        <div className="w-full">
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
                                        proxyOptions={proxyOptions}
                                        loadingProxies={loadingProxies}
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
                    </div>
                </Container>
            </div>



            {/* Interaction Config Modal */}
            <InteractionConfigModal
                isOpen={showInteractionConfigModal}
                onClose={() => setShowInteractionConfigModal(false)}
                accountId={data?.list?.[0]?.id} // Sử dụng account đầu tiên hoặc có thể để null
            />
        </TiktokAccountListProvider>
    )
}

export default TiktokAccountManagementClient
