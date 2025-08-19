'use client'
import Card from '@/components/ui/Card'
import { useProxyListStore } from '../_store/proxyListStore'
import { useTranslations } from 'next-intl'

const ProxyStatsCards = () => {
    const stats = useProxyListStore((state) => state.stats)
    const t = useTranslations('proxy-management')

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
                    <div className="text-gray-600">{t('stats.total')}</div>
                </div>
            </Card>
            <Card>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.active || 0}</div>
                    <div className="text-gray-600">{t('stats.active')}</div>
                </div>
            </Card>
            <Card>
                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.inactive || 0}</div>
                    <div className="text-gray-600">{t('stats.inactive')}</div>
                </div>
            </Card>
            <Card>
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.error || 0}</div>
                    <div className="text-gray-600">{t('stats.error')}</div>
                </div>
            </Card>
        </div>
    )
}

export default ProxyStatsCards
