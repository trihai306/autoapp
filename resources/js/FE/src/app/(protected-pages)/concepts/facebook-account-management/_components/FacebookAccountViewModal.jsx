'use client'
import React from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { TbUser, TbMail, TbPhone, TbWifi, TbSignal4G, TbShield, TbDeviceMobile } from 'react-icons/tb'

const FacebookAccountViewModal = ({ isOpen, onClose, account }) => {
    if (!account) return null

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
            case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'Hoạt động'
            case 'inactive': return 'Tạm dừng'
            case 'suspended': return 'Đình chỉ'
            case 'running': return 'Đang chạy'
            case 'error': return 'Lỗi'
            default: return status || 'Không xác định'
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={800}>
            <div className="p-6">
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Chi tiết tài khoản Facebook
                    </h3>
                </div>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <TbUser className="w-5 h-5" />
                            Thông tin cơ bản
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</label>
                                <p className="text-gray-900 dark:text-gray-100">{account.username}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                                <p className="text-gray-900 dark:text-gray-100">{account.email || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Số điện thoại</label>
                                <p className="text-gray-900 dark:text-gray-100">{account.phone_number || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái</label>
                                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(account.status)}`}>
                                    {getStatusLabel(account.status)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Connection Information */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            {account.connection_type === 'wifi' ? (
                                <TbWifi className="w-5 h-5" />
                            ) : (
                                <TbSignal4G className="w-5 h-5" />
                            )}
                            Thông tin kết nối
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Loại kết nối</label>
                                <p className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    {account.connection_type === 'wifi' ? (
                                        <>
                                            <TbWifi className="w-4 h-4 text-blue-600" />
                                            WiFi
                                        </>
                                    ) : (
                                        <>
                                            <TbSignal4G className="w-4 h-4 text-green-600" />
                                            4G
                                        </>
                                    )}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Proxy</label>
                                <p className="text-gray-900 dark:text-gray-100">
                                    {account.proxy ? account.proxy.name : 'Không có proxy'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Security Information */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <TbShield className="w-5 h-5" />
                            Bảo mật
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">2FA</label>
                                <p className="text-gray-900 dark:text-gray-100">
                                    {account.two_factor_enabled ? 'Đã bật' : 'Chưa bật'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Backup Codes</label>
                                <p className="text-gray-900 dark:text-gray-100">
                                    {account.two_factor_backup_codes?.length || 0} mã
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Device Information */}
                    {(account.device || account.device_info) && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <TbDeviceMobile className="w-5 h-5" />
                                Thiết bị
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {account.device && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Device</label>
                                        <p className="text-gray-900 dark:text-gray-100">{account.device.name}</p>
                                    </div>
                                )}
                                {account.device_info && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Thông tin thiết bị</label>
                                        <p className="text-gray-900 dark:text-gray-100 text-sm">{account.device_info}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    {/* Notes */}
                    {account.notes && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Ghi chú</h4>
                            <p className="text-gray-700 dark:text-gray-300">{account.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    )
}

export default FacebookAccountViewModal
