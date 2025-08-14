'use client'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import getDeviceStats from '@/server/actions/device/getDeviceStats'
import { useSession } from 'next-auth/react'
import {
    HiOutlineRefresh as Refresh,
    HiOutlineCog as Settings,
    HiOutlineDesktopComputer as Desktop,
    HiOutlineStatusOnline as Online,
    HiOutlineStatusOffline as Offline,
    HiOutlineShieldCheck as Shield,
    HiOutlineKey as Key,
    HiOutlineClipboardCopy as Copy,
    HiOutlineInformationCircle as Info
} from 'react-icons/hi'

const DashboardHeader = ({ 
    title = "Quản lý thiết bị",
    subtitle = "Theo dõi và quản lý tất cả thiết bị của bạn",
    onRefresh,
    onSettings,
    showActions = true
}) => {
    const { data: session } = useSession()
    const [quickStats, setQuickStats] = useState({
        total: 0,
        online: 0,
        offline: 0,
        active: 0
    })
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [showTokenModal, setShowTokenModal] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)



    const fetchQuickStats = async () => {
        try {
            const result = await getDeviceStats()
            if (result.success && result.data) {
                setQuickStats({
                    total: result.data.total || 0,
                    online: result.data.online || 0,
                    offline: result.data.offline || 0,
                    active: result.data.active || 0
                })
            }
        } catch (error) {
            console.error('Error fetching quick stats:', error)
        }
    }

    useEffect(() => {
        fetchQuickStats()
    }, [])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await fetchQuickStats()
            if (onRefresh) {
                await onRefresh()
            }
        } catch (error) {
            console.error('Error refreshing:', error)
        } finally {
            setIsRefreshing(false)
        }
    }

    const handleCopyToken = async () => {
        if (!session?.user?.login_token) return
        
        try {
            await navigator.clipboard.writeText(session.user.login_token)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        } catch (error) {
            console.error('Failed to copy token:', error)
        }
    }

    const handleShowTokenInfo = () => {
        setShowTokenModal(true)
    }

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6">
                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {title}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {subtitle}
                            </p>
                        </div>
                        
                        {showActions && (
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="text-gray-600 dark:text-gray-400"
                                >
                                    <Refresh className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Làm mới
                                </Button>
                                
                                {session?.user?.login_token && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={handleCopyToken}
                                            className={`text-gray-600 dark:text-gray-400 ${copySuccess ? 'bg-green-50 border-green-200 text-green-600' : ''}`}
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            {copySuccess ? 'Đã copy!' : 'Copy Token'}
                                        </Button>
                                        
                                        <Button
                                            variant="outline"
                                            onClick={handleShowTokenInfo}
                                            className="text-blue-600 dark:text-blue-400"
                                        >
                                            <Info className="w-4 h-4 mr-2" />
                                            Hướng dẫn
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <Desktop className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {quickStats.total}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Tổng thiết bị
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                    <Online className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {quickStats.online}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Đang online
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                    <Offline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {quickStats.offline}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Offline
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {quickStats.active}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Hoạt động
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Token Info Modal */}
            {showTokenModal && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-50" 
                        onClick={() => setShowTokenModal(false)}
                    />
                    
                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Hướng dẫn sử dụng Token
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Cách kết nối thiết bị với hệ thống
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowTokenModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </Button>
                            </div>
                            
                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Token Display */}
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                        Token của bạn:
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
                                        <div className="flex items-center justify-between">
                                            <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                                                {session?.user?.login_token || 'Không có token'}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleCopyToken}
                                                className="ml-2 flex-shrink-0"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Instructions */}
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                                        Cách sử dụng:
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">1</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    Copy token ở trên
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Nhấn nút "Copy Token" để sao chép token vào clipboard
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">2</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    Mở ứng dụng trên thiết bị
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Khởi động ứng dụng quản lý thiết bị trên máy tính/điện thoại của bạn
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">3</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    Dán token vào ứng dụng
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Tìm mục "Kết nối" hoặc "Login Token" và dán token vào đó
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-xs font-medium text-green-600 dark:text-green-400">✓</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    Hoàn tất kết nối
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Thiết bị sẽ tự động kết nối và hiển thị trong danh sách
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Warning */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-yellow-800 dark:text-yellow-200">
                                                Lưu ý bảo mật
                                            </p>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                                Không chia sẻ token này với người khác. Token có thể được sử dụng để truy cập tài khoản của bạn.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default DashboardHeader
