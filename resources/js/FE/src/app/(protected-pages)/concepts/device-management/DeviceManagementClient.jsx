'use client'
import { useState } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import DeviceListProvider from './_components/DeviceListProvider'
import DeviceListTable from './_components/DeviceListTable'

import DashboardHeader from './_components/DashboardHeader'

import { useDeviceListStore } from './_store/deviceListStore'

import { useTranslations } from 'next-intl'

const DeviceManagementClient = ({ data, params }) => {
    const t = useTranslations('deviceManagement')
    const [isLoading, setIsLoading] = useState(false)
    

    


    const handleRefresh = async () => {
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsLoading(false)
        // In real implementation, you would refresh the data here
        window.location.reload()
    }

    const handleSettings = () => {
        // TODO: Implement device settings functionality
    }



    return (
        <DeviceListProvider deviceList={data?.data || []}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Dashboard Header */}
                <DashboardHeader
                    title={t('title')}
                    subtitle={t('subtitle')}
                    onRefresh={handleRefresh}
                    onSettings={handleSettings}
                />

                <Container className="py-6">
                    <div className="space-y-6">
                        {/* Main Content - Full Width Table */}
                        <div className="w-full">
                            <AdaptiveCard className="overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                                {t('deviceList')}
                                            </h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {t('deviceListDesc', { count: data?.total || 0 })}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <DeviceListTable
                                        deviceListTotal={data?.total || 0}
                                        page={parseInt(params.page) || 1}
                                        per_page={parseInt(params.per_page) || 10}
                                    />
                                </div>
                            </AdaptiveCard>
                        </div>
                    </div>
                </Container>
            </div>
        </DeviceListProvider>
    )
}

export default DeviceManagementClient
