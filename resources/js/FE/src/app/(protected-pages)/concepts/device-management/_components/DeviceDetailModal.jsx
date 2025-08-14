'use client'
import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Tooltip from '@/components/ui/Tooltip'
import { 
    HiOutlineDesktopComputer as Desktop,
    HiOutlineDeviceMobile as Mobile,
    HiOutlineCalendar as Calendar,
    HiOutlineLocationMarker as MapPin,
    HiOutlineGlobeAlt as Globe,
    HiOutlineUser as User,
    HiOutlineStatusOnline as Online,
    HiOutlineStatusOffline as Offline,
    HiOutlineClock as Clock,
    HiOutlineX as X,
    HiOutlinePencilAlt as Edit,
    HiOutlineTrash as Trash,
    HiOutlinePlay as Play,
    HiOutlinePause as Pause,
    HiOutlineCog as Settings,
    HiOutlineShieldCheck as Shield
} from 'react-icons/hi'

const DeviceDetailModal = ({ isOpen, onClose, device, onDelete }) => {
    const [activeTab, setActiveTab] = useState('overview')

    if (!device) return null

    const tabs = [
        { id: 'overview', label: 'Tổng quan', icon: Desktop },
        { id: 'accounts', label: 'Tài khoản kết nối', icon: User },
        { id: 'activity', label: 'Hoạt động', icon: Clock },
        { id: 'specs', label: 'Thông số', icon: Settings }
    ]

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            case 'inactive':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            case 'blocked':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'Hoạt động'
            case 'inactive':
                return 'Không hoạt động'
            case 'blocked':
                return 'Bị chặn'
            default:
                return 'Không xác định'
        }
    }

    const getDeviceIcon = (deviceType) => {
        switch (deviceType?.toLowerCase()) {
            case 'mobile':
            case 'phone':
            case 'smartphone':
                return <Mobile className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            case 'desktop':
            case 'computer':
            case 'pc':
                return <Desktop className="w-8 h-8 text-green-600 dark:text-green-400" />
            default:
                return <Desktop className="w-8 h-8 text-gray-600 dark:text-gray-400" />
        }
    }

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Device Info */}
            <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                    {getDeviceIcon(device.device_type)}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {device.device_name}
                        </h3>
                        <Badge className={getStatusColor(device.status)}>
                            {getStatusText(device.status)}
                        </Badge>
                        {device.is_online ? (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <Online className="w-4 h-4" />
                                <span className="text-sm">Online</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <Offline className="w-4 h-4" />
                                <span className="text-sm">Offline</span>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                        Device ID: {device.device_id}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>Người dùng: {device.user?.name || 'Chưa gán'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Tạo: {new Date(device.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        {device.ip_address && (
                            <div className="flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                <span>IP: {device.ip_address}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {device.plan || 'Free'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Gói dịch vụ</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {device.device_type || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Loại thiết bị</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {device.platform || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Nền tảng</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {device.os_version || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Phiên bản OS</div>
                </div>
            </div>

            {/* Device Details */}
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Thông tin chi tiết
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                    {device.serial && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Serial:</span>
                            <span className="text-gray-900 dark:text-gray-100 font-mono">{device.serial}</span>
                        </div>
                    )}
                    {device.app_version && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">App Version:</span>
                            <span className="text-gray-900 dark:text-gray-100">{device.app_version}</span>
                        </div>
                    )}
                    {device.user_agent && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">User Agent:</span>
                            <span className="text-gray-900 dark:text-gray-100 text-sm truncate max-w-xs" title={device.user_agent}>
                                {device.user_agent}
                            </span>
                        </div>
                    )}
                    {device.last_active_at && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Hoạt động cuối:</span>
                            <span className="text-gray-900 dark:text-gray-100">
                                {new Date(device.last_active_at).toLocaleString('vi-VN')}
                            </span>
                        </div>
                    )}
                    {device.first_login_at && (
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Đăng nhập đầu:</span>
                            <span className="text-gray-900 dark:text-gray-100">
                                {new Date(device.first_login_at).toLocaleString('vi-VN')}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Notes */}
            {device.note && (
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Ghi chú
                    </h4>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-yellow-800 dark:text-yellow-200">
                            {device.note}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )

    const renderAccounts = () => (
        <div className="space-y-6">
            <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Tài khoản đã kết nối
                </h4>
                
                {/* Mock data - Replace with real data */}
                <div className="space-y-3">
                    {[
                        { id: 1, platform: 'TikTok', username: '@user123', status: 'active', lastLogin: '2 giờ trước' },
                        { id: 2, platform: 'Instagram', username: '@insta_user', status: 'inactive', lastLogin: '1 ngày trước' },
                        { id: 3, platform: 'Facebook', username: 'facebook.user', status: 'active', lastLogin: '30 phút trước' },
                    ].map((account) => (
                        <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {account.platform}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {account.username}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge className={account.status === 'active' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                }>
                                    {account.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                </Badge>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {account.lastLogin}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Device Status */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${device?.is_online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                Trạng thái máy: {device?.is_online ? 'Đang chạy' : 'Đã dừng'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {device?.is_online 
                                    ? 'Thiết bị đang hoạt động và có thể thực hiện các tác vụ'
                                    : 'Thiết bị đã ngừng hoạt động hoặc mất kết nối'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderSpecs = () => (
        <div className="space-y-6">
            <div className="text-center text-gray-500 dark:text-gray-400">
                Thông số kỹ thuật chi tiết sẽ được hiển thị ở đây
            </div>
        </div>
    )

    const renderActivity = () => (
        <div className="space-y-6">
            <div className="text-center text-gray-500 dark:text-gray-400">
                Lịch sử hoạt động sẽ được hiển thị ở đây
            </div>
        </div>
    )

    const renderSecurity = () => (
        <div className="space-y-6">
            <div className="text-center text-gray-500 dark:text-gray-400">
                Thông tin bảo mật sẽ được hiển thị ở đây
            </div>
        </div>
    )

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={900}
            className="z-[60]"
            closable={false}
        >
            <div className="flex flex-col h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Chi tiết thiết bị
                    </h2>
                    <div className="flex items-center gap-2">
                        <Tooltip title={device?.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="!px-2"
                                aria-label={device?.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                            >
                                {device?.status === 'active' ? (
                                    <Pause className="w-4 h-4" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                            </Button>
                        </Tooltip>
                        {onDelete && (
                            <Tooltip title="Xóa">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:border-red-300 !px-2"
                                    onClick={() => {
                                        onDelete(device)
                                        onClose()
                                    }}
                                    aria-label="Xóa"
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                        )}
                        <Tooltip title="Đóng">
                            <Button variant="outline" size="sm" onClick={onClose} className="!px-2" aria-label="Đóng">
                                <X className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'accounts' && renderAccounts()}
                    {activeTab === 'activity' && renderActivity()}
                    {activeTab === 'specs' && renderSpecs()}
                </div>
            </div>
        </Dialog>
    )
}

export default DeviceDetailModal
