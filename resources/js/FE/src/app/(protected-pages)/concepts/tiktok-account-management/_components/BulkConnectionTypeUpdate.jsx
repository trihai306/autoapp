'use client'
import React, { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Select from '@/components/ui/Select'
import { TbWifi, TbSignal4G } from 'react-icons/tb'
import { useTiktokAccountListStore } from '../_store'
import { apiBulkUpdateTiktokAccountConnectionType } from '@/services/tiktokAccount/TiktokAccountService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const BulkConnectionTypeUpdate = ({ onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [connectionType, setConnectionType] = useState('wifi')
    
    const selectedAccounts = useTiktokAccountListStore((state) => state.selectedTiktokAccount)
    const clearSelection = useTiktokAccountListStore((state) => state.clearSelection)

    const handleOpen = () => {
        if (selectedAccounts.length === 0) {
            toast.push(
                <Notification title="Thông báo" type="warning">
                    Vui lòng chọn ít nhất một tài khoản để cập nhật
                </Notification>
            )
            return
        }
        setIsOpen(true)
    }

    const handleClose = () => {
        setIsOpen(false)
        setConnectionType('wifi')
    }

    const handleUpdate = async () => {
        if (selectedAccounts.length === 0) return

        setIsUpdating(true)
        try {
            const accountIds = selectedAccounts.map(account => account.id)
            const result = await apiBulkUpdateTiktokAccountConnectionType(accountIds, connectionType)

            if (result.success) {
                toast.push(
                    <Notification title="Thành công" type="success">
                        Đã cập nhật connection type thành {connectionType === 'wifi' ? 'WiFi' : '4G'} cho {result.data.updated_count} tài khoản
                    </Notification>
                )
                
                clearSelection()
                if (onSuccess) {
                    onSuccess()
                }
                handleClose()
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger">
                        Không thể cập nhật connection type: {result.message}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error bulk updating connection type:', error)
            toast.push(
                <Notification title="Lỗi" type="danger">
                    Có lỗi xảy ra khi cập nhật connection type
                </Notification>
            )
        } finally {
            setIsUpdating(false)
        }
    }

    const getConnectionTypeIcon = () => {
        return connectionType === 'wifi' ? (
            <TbWifi className="w-4 h-4 text-blue-600" />
        ) : (
            <TbSignal4G className="w-4 h-4 text-green-600" />
        )
    }

    const getConnectionTypeLabel = () => {
        return connectionType === 'wifi' ? 'WiFi' : '4G'
    }

    return (
        <>
            <Button
                variant="outline"
                color="blue-500"
                icon={getConnectionTypeIcon()}
                onClick={handleOpen}
                disabled={selectedAccounts.length === 0}
            >
                Cập nhật kết nối ({selectedAccounts.length})
            </Button>

            <Dialog
                isOpen={isOpen}
                onClose={handleClose}
                title="Cập nhật loại kết nối hàng loạt"
            >
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Bạn đang cập nhật loại kết nối cho <strong>{selectedAccounts.length}</strong> tài khoản đã chọn
                        </p>
                        
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Loại kết nối mới
                            </label>
                            <Select
                                placeholder="Chọn loại kết nối"
                                options={[
                                    { value: 'wifi', label: 'WiFi' },
                                    { value: '4g', label: '4G' }
                                ]}
                                value={{ value: connectionType, label: getConnectionTypeLabel() }}
                                onChange={(option) => setConnectionType(option?.value || 'wifi')}
                            />
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                                {getConnectionTypeIcon()}
                                <span className="text-sm font-medium">
                                    Sẽ chuyển tất cả tài khoản sang {getConnectionTypeLabel()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={handleClose}>
                        Hủy
                    </Button>
                    <Button
                        variant="solid"
                        color="blue-500"
                        onClick={handleUpdate}
                        loading={isUpdating}
                        disabled={isUpdating}
                    >
                        Cập nhật ({selectedAccounts.length} tài khoản)
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

export default BulkConnectionTypeUpdate
