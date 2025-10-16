'use client'
import Card from '@/components/ui/Card'
import { useProxyListStore } from '../_store/proxyListStore'

const ProxyStatsCards = () => {
    const stats = useProxyListStore((state) => state.stats)

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
                    <div className="text-gray-600">Tổng cộng</div>
                </div>
            </Card>
            <Card>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.active || 0}</div>
                    <div className="text-gray-600">Hoạt động</div>
                </div>
            </Card>
            <Card>
                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.inactive || 0}</div>
                    <div className="text-gray-600">Không hoạt động</div>
                </div>
            </Card>
            <Card>
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.error || 0}</div>
                    <div className="text-gray-600">Lỗi</div>
                </div>
            </Card>
        </div>
    )
}

export default ProxyStatsCards
