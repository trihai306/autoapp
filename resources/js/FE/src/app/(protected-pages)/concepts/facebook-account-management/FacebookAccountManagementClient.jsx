'use client'
import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import FacebookAccountListTable from './_components/FacebookAccountListTable'
import FacebookAccountListPagination from './_components/FacebookAccountListPagination'
import FacebookAccountListActionTools from './_components/FacebookAccountListActionTools'
import FacebookDashboardHeader from './_components/FacebookDashboardHeader'
import { FacebookAccountDataProvider } from './_components/FacebookAccountDataManager'
import getFacebookAccounts from '@/server/actions/facebook-account/getFacebookAccounts'

const FacebookAccountManagementClient = ({ data, params }) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [list, setList] = useState(data?.list || [])
    const [total, setTotal] = useState(data?.total || 0)

    // Proxy options state - load once for all accounts
    const [proxyOptions, setProxyOptions] = useState([{ value: '', label: 'Không sử dụng proxy' }])
    const [loadingProxies, setLoadingProxies] = useState(false)

    // Đồng bộ lại dữ liệu khi props data thay đổi (sau router.refresh)
    useEffect(() => {
        setList(data?.list || [])
        setTotal(data?.total || 0)
    }, [data])

    const handleRefresh = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await getFacebookAccounts({
                page: params?.page || '1',
                per_page: params?.per_page || '10',
                search: params?.search,
                'filter[username]': params?.['filter[username]'],
                'filter[email]': params?.['filter[email]'],
                'filter[phone_number]': params?.['filter[phone_number]'],
                'filter[status]': params?.['filter[status]'],
                'filter[connection_type]': params?.['filter[connection_type]'],
                'filter[proxy_status]': params?.['filter[proxy_status]'],
            })
            setList(res?.list || [])
            setTotal(res?.total || 0)
        } finally {
            setTimeout(() => setIsLoading(false), 500)
        }
    }, [params])

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

    // Load proxy options once when component mounts
    useEffect(() => {
        loadProxyOptions()
    }, [loadProxyOptions])

    return (
        <FacebookAccountDataProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <FacebookDashboardHeader
                    title={'Quản lý tài khoản Facebook'}
                    subtitle={'Theo dõi và quản lý các tài khoản Facebook'}
                    onRefresh={handleRefresh}
                    showActions
                />

                <Container className="py-6">
                    <div className="space-y-6">
                        <AdaptiveCard className="overflow-hidden">
                            <div className="p-4 lg:p-6">
                                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Danh sách tài khoản</h2>
                                <div className="mb-4">
                                    <FacebookAccountListActionTools onRefresh={handleRefresh} />
                                </div>
                                <FacebookAccountListTable
                                    list={list}
                                    proxyOptions={proxyOptions}
                                    loadingProxies={loadingProxies}
                                />
                            </div>
                        </AdaptiveCard>
                        <FacebookAccountListPagination total={total} page={parseInt(params.page) || 1} per_page={parseInt(params.per_page) || 10} />
                    </div>
                </Container>
            </div>
        </FacebookAccountDataProvider>
    )
}

export default FacebookAccountManagementClient


