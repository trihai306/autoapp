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
                                <FacebookAccountListTable list={list} />
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


