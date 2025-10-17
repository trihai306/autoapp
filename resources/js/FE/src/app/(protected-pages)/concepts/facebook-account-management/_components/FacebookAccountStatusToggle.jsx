'use client'
import React, { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { TbPlayerPlay, TbPlayerStop, TbRefresh, TbClock, TbCheck, TbX, TbAlertCircle } from 'react-icons/tb'
import { useFacebookAccountData } from './FacebookAccountDataManager'
import runFacebookAccountScenario from '@/server/actions/facebook-account/runFacebookAccountScenario'
import Dialog from '@/components/ui/Dialog'
import Select from '@/components/ui/Select'
import { apiGetDevices } from '@/services/device/DeviceService'
import stopFacebookAccountTasks from '@/server/actions/facebook-account/stopFacebookAccountTasks'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const FacebookAccountStatusToggle = ({ account, onStatusChange }) => {
    const [actionLoading, setActionLoading] = useState(false)
    const [deviceModalOpen, setDeviceModalOpen] = useState(false)
    const [devices, setDevices] = useState([])
    const [selectedDeviceId, setSelectedDeviceId] = useState(account?.device?.id ? String(account.device.id) : '')
    const { getAccountStatus, refreshData } = useFacebookAccountData()

    const status = getAccountStatus(account.id)

    const openDevicePickerIfNeeded = async () => {
        const hasActiveTask = status?.current_activity && status.current_activity.task_type

        if (status?.status === 'idle' || (status?.status === 'pending' && !hasActiveTask)) {
            // Chọn thiết bị trước khi chạy
            if (!selectedDeviceId) {
                try {
                    const res = await apiGetDevices({ per_page: 100 })
                    const list = res?.data?.data || []
                    setDevices(list.map(d => ({ value: String(d.id), label: d.name })))
                } catch {}
                setDeviceModalOpen(true)
                return true
            }
        }
        return false
    }

    const handleStartWithDevice = async () => {
        setActionLoading(true)
        try {
            const result = await runFacebookAccountScenario(account.id, selectedDeviceId ? { device_id: Number(selectedDeviceId) } : {})
            if (result.success) {
                toast.push(
                    <Notification title="Thành công" type="success">
                        {result.message}
                    </Notification>
                )
                await refreshData()
                if (onStatusChange) onStatusChange()
                setDeviceModalOpen(false)
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger">
                        {result.message}
                    </Notification>
                )
            }
        } catch (error) {
            toast.push(
                <Notification title="Lỗi" type="danger">
                    {error.message}
                </Notification>
            )
        } finally {
            setActionLoading(false)
        }
    }

    const handleToggleAction = async () => {
        setActionLoading(true)
        try {
            let result
            const hasActiveTask = status?.current_activity && status.current_activity.task_type

            if (status?.status === 'idle' || (status?.status === 'pending' && !hasActiveTask)) {
                // Start scenario with optional device
                const needPicker = await openDevicePickerIfNeeded()
                if (needPicker) {
                    setActionLoading(false)
                    return
                }
                result = await runFacebookAccountScenario(account.id, selectedDeviceId ? { device_id: Number(selectedDeviceId) } : {})
            } else {
                // Stop tasks (khi có task đang chạy hoặc status là running)
                result = await stopFacebookAccountTasks(account.id)
            }

            if (result.success) {
                toast.push(
                    <Notification title="Thành công" type="success">
                        {result.message}
                    </Notification>
                )
                // Refresh global data after action
                await refreshData()
                if (onStatusChange) {
                    onStatusChange()
                }
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger">
                        {result.message}
                    </Notification>
                )
            }
        } catch (error) {
            toast.push(
                <Notification title="Lỗi" type="danger">
                    {error.message}
                </Notification>
            )
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusConfig = (statusType) => {
        const configs = {
            idle: {
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
                label: 'Nhàn rỗi',
                icon: <TbAlertCircle className="w-3 h-3" />
            },
            pending: {
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                label: 'Chờ xử lý',
                icon: <TbClock className="w-3 h-3" />
            },
            running: {
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                label: 'Đang chạy',
                icon: <TbRefresh className="w-3 h-3" />
            }
        }
        return configs[statusType] || {
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            label: 'Không xác định',
            icon: <TbAlertCircle className="w-3 h-3" />
        }
    }

    const getButtonConfig = () => {
        if (!status) return { icon: <TbRefresh className="w-4 h-4" />, variant: 'outline' }

        // Nếu có current_activity (đang có task chạy) thì hiển thị nút Stop
        const hasActiveTask = status.current_activity && status.current_activity.task_type

        switch (status.status) {
            case 'idle':
                return {
                    icon: <TbPlayerPlay className="w-4 h-4" />,
                    variant: 'solid',
                    className: 'bg-green-600 hover:bg-green-700 text-white'
                }
            case 'pending':
            case 'running':
                // Nếu có task đang chạy hoặc đang pending thì hiển thị nút Stop
                if (hasActiveTask || status.status === 'running') {
                    return {
                        icon: <TbPlayerStop className="w-4 h-4" />,
                        variant: 'solid',
                        className: 'bg-red-600 hover:bg-red-700 text-white'
                    }
                } else {
                    return {
                        icon: <TbPlayerPlay className="w-4 h-4" />,
                        variant: 'solid',
                        className: 'bg-green-600 hover:bg-green-700 text-white'
                    }
                }
            default:
                return { icon: <TbRefresh className="w-4 h-4" />, variant: 'outline' }
        }
    }

    const buttonConfig = getButtonConfig()

    return (
        <>
            <Button
                variant={buttonConfig.variant}
                size="sm"
                className={`p-1 ${buttonConfig.className || ''}`}
                onClick={handleToggleAction}
                loading={actionLoading}
                disabled={actionLoading}
            >
                {buttonConfig.icon}
            </Button>

            <Dialog isOpen={deviceModalOpen} onClose={() => setDeviceModalOpen(false)} onRequestClose={() => setDeviceModalOpen(false)} width={480}>
                <div className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Chọn thiết bị để chạy</h3>
                    <Select
                        placeholder="Chọn thiết bị"
                        options={[{ value: '', label: '— Không chỉ định (dùng mặc định tài khoản) —' }, ...devices]}
                        value={selectedDeviceId ? { value: selectedDeviceId, label: devices.find(d => d.value === selectedDeviceId)?.label || 'Đang tải...' } : null}
                        onChange={(opt) => setSelectedDeviceId(opt?.value || '')}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="default" onClick={() => setDeviceModalOpen(false)}>Hủy</Button>
                        <Button variant="solid" onClick={handleStartWithDevice} loading={actionLoading} disabled={actionLoading}>Bắt đầu</Button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default FacebookAccountStatusToggle
