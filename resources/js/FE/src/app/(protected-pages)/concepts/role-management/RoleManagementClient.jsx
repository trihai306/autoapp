'use client'
import { useState, useEffect } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import RoleListProvider from './_components/RoleListProvider'
import RoleListTable from './_components/RoleListTable'
import RoleListActionTools from './_components/RoleListActionTools'
import { useRoleListStore } from './_store/roleListStore'
import Dialog from '@/components/ui/Dialog'
import RoleForm from './_components/RoleForm'
import { useTranslations } from 'next-intl'
import { DashboardHeader, StatCard } from '@/components/shared/stats'
import { useRouter } from 'next/navigation'
import { 
    HiOutlineShieldCheck as Shield,
    HiOutlineUsers as Users,
    HiOutlineKey as Key,
    HiOutlineClock as Clock
} from 'react-icons/hi'

const RoleManagementClient = ({ data, params }) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [stats, setStats] = useState({
        totalRoles: 0,
        totalPermissions: 0,
        usersWithRoles: 0,
        recentlyCreated: 0
    })

    const isFormOpen = useRoleListStore((state) => state.isFormOpen)
    const formMode = useRoleListStore((state) => state.formMode)
    const selectedRoleForForm = useRoleListStore((state) => state.selectedRoleForForm)
    const openForm = useRoleListStore((state) => state.openForm)
    const closeForm = useRoleListStore((state) => state.closeForm)
    const t = useTranslations('roleManagement')

    useEffect(() => {
        // Calculate stats from data
        if (data) {
            setStats({
                totalRoles: data.total || 0,
                totalPermissions: data.list?.reduce((acc, role) => acc + (role.permissions?.length || 0), 0) || 0,
                usersWithRoles: data.list?.reduce((acc, role) => acc + (role.users_count || 0), 0) || 0,
                recentlyCreated: data.list?.filter(role => {
                    const createdDate = new Date(role.created_at)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return createdDate > weekAgo
                }).length || 0
            })
        }
    }, [data])

    const handleRefresh = async () => {
        setIsLoading(true)
        try {
            router.refresh()
        } finally {
            setTimeout(() => setIsLoading(false), 1000)
        }
    }

    const quickStats = [
        { label: 'Tổng vai trò', value: stats.totalRoles },
        { label: 'Quyền hạn', value: stats.totalPermissions },
        { label: 'Người dùng', value: stats.usersWithRoles }
    ]

    return (
        <RoleListProvider roleList={data.list}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Dashboard Header */}
                <DashboardHeader
                    title={t('title')}
                    subtitle="Quản lý vai trò và phân quyền người dùng trong hệ thống"
                    onRefresh={handleRefresh}
                    quickStats={quickStats}
                    loading={isLoading}
                />

                <Container className="py-6">
                    <div className="space-y-6">
                        {/* Statistics Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Tổng vai trò"
                                value={stats.totalRoles}
                                icon={Shield}
                                color="blue"
                                subtitle="Vai trò trong hệ thống"
                                loading={isLoading}
                            />
                            
                            <StatCard
                                title="Tổng quyền hạn"
                                value={stats.totalPermissions}
                                icon={Key}
                                color="green"
                                subtitle="Quyền được phân bổ"
                                loading={isLoading}
                            />
                            
                            <StatCard
                                title="Người dùng có vai trò"
                                value={stats.usersWithRoles}
                                icon={Users}
                                color="purple"
                                subtitle="Đã được phân quyền"
                                loading={isLoading}
                            />
                            
                            <StatCard
                                title="Tạo gần đây"
                                value={stats.recentlyCreated}
                                icon={Clock}
                                color="orange"
                                subtitle="Trong 7 ngày qua"
                                loading={isLoading}
                            />
                        </div>

                        {/* Main Content */}
                        <AdaptiveCard>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Danh sách vai trò
                                    </h3>
                                    <RoleListActionTools onAddNew={() => openForm('add')} />
                                </div>
                                <RoleListTable
                                    roleListTotal={data.total}
                                    page={parseInt(params.page) || 1}
                                    per_page={parseInt(params.per_page) || 10}
                                />
                            </div>
                        </AdaptiveCard>
                    </div>
                </Container>

                <Dialog
                    isOpen={isFormOpen}
                    onClose={closeForm}
                    onRequestClose={closeForm}
                    width={900}
                >
                    <RoleForm 
                        mode={formMode} 
                        role={selectedRoleForForm} 
                        onClose={closeForm} 
                    />
                </Dialog>
            </div>
        </RoleListProvider>
    )
}

export default RoleManagementClient
