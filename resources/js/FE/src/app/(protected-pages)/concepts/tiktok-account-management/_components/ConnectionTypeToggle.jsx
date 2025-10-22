'use client'
import React, { useState } from 'react'
import { Switcher } from '@/components/ui/Switcher'
import { TbWifi, TbSignal4G } from 'react-icons/tb'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import updateTiktokAccountConnectionType from '@/server/actions/tiktok-account/updateTiktokAccountConnectionType'

const ConnectionTypeToggle = ({ account, onUpdate }) => {
    const [isUpdating, setIsUpdating] = useState(false)
    const [currentType, setCurrentType] = useState(account.connection_type || 'wifi')

    const handleToggle = async () => {
        if (isUpdating) return

        const newType = currentType === 'wifi' ? '4g' : 'wifi'
        setIsUpdating(true)

        try {
            const result = await updateTiktokAccountConnectionType(account.id, newType)

            if (result.success) {
                setCurrentType(newType)

                // Callback để cập nhật UI
                if (onUpdate) {
                    onUpdate(account.id, newType)
                }

                toast.push(
                    <Notification
                        title="Thành công"
                        type="success"
                    >
                        Đã chuyển {account.username} sang {newType === 'wifi' ? 'WiFi' : '4G'}
                    </Notification>
                )
            } else {
                throw new Error(result.message || 'Failed to update connection type')
            }
        } catch (error) {
            console.error('Error updating connection type:', error)
            toast.push(
                <Notification
                    title="Lỗi"
                    type="danger"
                >
                    Không thể cập nhật connection type: {error.message}
                </Notification>
            )
        } finally {
            setIsUpdating(false)
        }
    }

    const isWifi = currentType === 'wifi'

    return (
        <div className="flex items-center space-x-2">
            <Switcher
                checked={isWifi}
                onChange={handleToggle}
                disabled={isUpdating}
                switcherClass="bg-blue-600 dark:bg-blue-500"
            />
            <div className="flex items-center space-x-1 text-sm">
                {isWifi ? (
                    <>
                        <TbWifi className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-600 font-medium">WiFi</span>
                    </>
                ) : (
                    <>
                        <TbSignal4G className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">4G</span>
                    </>
                )}
            </div>
        </div>
    )
}

export default ConnectionTypeToggle
