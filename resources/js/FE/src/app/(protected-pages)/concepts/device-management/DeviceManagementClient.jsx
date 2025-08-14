'use client'
import { useState } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import DeviceListProvider from './_components/DeviceListProvider'
import DeviceListTable from './_components/DeviceListTable'

import DashboardHeader from './_components/DashboardHeader'
import QuickActions from './_components/QuickActions'

import { useDeviceListStore } from './_store/deviceListStore'
import updateDeviceStatus from '@/server/actions/device/updateDeviceStatus'
import { useTranslations } from 'next-intl'

const DeviceManagementClient = ({ data, params }) => {
    const t = useTranslations('deviceManagement')
    const [isLoading, setIsLoading] = useState(false)
    

    
    // Get selected devices from store
    const selectedDevices = useDeviceListStore((state) => state.selectedDevice)

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

    const handleQuickAction = async (actionType) => {
        if (selectedDevices.length === 0) {
            console.warn('No devices selected')
            return
        }


        setIsLoading(true)
        
        try {
            const deviceIds = selectedDevices.map(device => device.id)
            
            switch (actionType) {
                case 'activate':
                    // Kích hoạt - set status to active
                    const activateResult = await updateDeviceStatus(deviceIds, 'active')
                    if (activateResult.success) {
                        toast.push(
                            <Notification
                                title="Kích hoạt thiết bị thành công"
                                type="success"
                                duration={4000}
                            >
                                Đã kích hoạt thành công {selectedDevices.length} thiết bị.
                            </Notification>
                        )
                        handleRefresh()
                    } else {
                        console.error('Failed to activate devices:', activateResult.message)
                        toast.push(
                            <Notification
                                title="Lỗi kích hoạt thiết bị"
                                type="danger"
                                duration={5000}
                            >
                                {activateResult.message || 'Không thể kích hoạt thiết bị. Vui lòng thử lại.'}
                            </Notification>
                        )
                    }
                    break
                    
                case 'pause':
                    // Tạm dừng - set status to inactive
                    const pauseResult = await updateDeviceStatus(deviceIds, 'inactive')
                    if (pauseResult.success) {
                        toast.push(
                            <Notification
                                title="Tạm dừng thiết bị thành công"
                                type="success"
                                duration={4000}
                            >
                                Đã tạm dừng thành công {selectedDevices.length} thiết bị.
                            </Notification>
                        )
                        handleRefresh()
                    } else {
                        console.error('Failed to pause devices:', pauseResult.message)
                        toast.push(
                            <Notification
                                title="Lỗi tạm dừng thiết bị"
                                type="danger"
                                duration={5000}
                            >
                                {pauseResult.message || 'Không thể tạm dừng thiết bị. Vui lòng thử lại.'}
                            </Notification>
                        )
                    }
                    break
                    
                case 'block':
                    // Chặn - set status to blocked
                    const blockResult = await updateDeviceStatus(deviceIds, 'blocked')
                    if (blockResult.success) {
                        toast.push(
                            <Notification
                                title="Chặn thiết bị thành công"
                                type="success"
                                duration={4000}
                            >
                                Đã chặn thành công {selectedDevices.length} thiết bị.
                            </Notification>
                        )
                        handleRefresh()
                    } else {
                        console.error('Failed to block devices:', blockResult.message)
                        toast.push(
                            <Notification
                                title="Lỗi chặn thiết bị"
                                type="danger"
                                duration={5000}
                            >
                                {blockResult.message || 'Không thể chặn thiết bị. Vui lòng thử lại.'}
                            </Notification>
                        )
                    }
                    break
                    
                default:
                    console.warn('Unknown action type:', actionType)
            }
        } catch (error) {
            console.error('Error performing quick action:', error)
            toast.push(
                <Notification
                    title="Lỗi hệ thống"
                    type="danger"
                    duration={5000}
                >
                    Đã xảy ra lỗi khi thực hiện thao tác. Vui lòng thử lại sau.
                </Notification>
            )
        } finally {
            setIsLoading(false)
        }
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
                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                            {/* Device Management Table - Takes 3 columns */}
                            <div className="xl:col-span-3">
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

                            {/* Quick Actions Sidebar - Takes 1 column */}
                            <div className="xl:col-span-1">
                                <QuickActions 
                                    selectedDevices={selectedDevices}
                                    onAction={handleQuickAction}
                                    loading={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </DeviceListProvider>
    )
}

export default DeviceManagementClient
