'use client'
import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'

const NotificationModal = ({ isOpen, onClose, action, onSave }) => {
    // Initialize config based on JSON schema for Notification Form
    const initialConfig = {
        name: "Đọc thông báo",
        count_from: 1,
        count_to: 2,
        gap_from: 1,
        gap_to: 3,
        count_follow: false,
        follow_from: 1,
        follow_to: 3,
        count_say_hi: false,
        say_hi_from: 1,
        say_hi_to: 3
    }
    
    const [config, setConfig] = useState(initialConfig)
    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            [field]: field.includes('_from') || field.includes('_to')
                ? parseInt(value) || 0 
                : value
        }))
    }

    const handleSwitchChange = (field, checked) => {
        setConfig(prev => ({
            ...prev,
            [field]: checked
        }))
    }

    const resetForm = () => {
        setConfig(initialConfig)
    }

    const handleSave = async () => {
        if (onSave && !isLoading) {
            setIsLoading(true)
            try {
                const saveData = {
                    name: config.name,
                    type: action?.type || 'notification',
                    parameters: {
                        name: config.name,
                        description: config.name,
                        count_from: config.count_from,
                        count_to: config.count_to,
                        gap_from: config.gap_from,
                        gap_to: config.gap_to,
                        count_follow: config.count_follow,
                        follow_from: config.follow_from,
                        follow_to: config.follow_to,
                        count_say_hi: config.count_say_hi,
                        say_hi_from: config.say_hi_from,
                        say_hi_to: config.say_hi_to
                    }
                }
                await onSave(action, saveData)
                // Reset form sau khi lưu thành công
                resetForm()
            } catch (error) {
                console.error('Error saving notification config:', error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleClose = () => {
        // Reset form khi đóng modal
        resetForm()
        onClose()
    }

    if (!action) return null

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            onRequestClose={handleClose}
            width={600}
            className="z-[70]"
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <h5 className="font-bold text-gray-900 dark:text-gray-100">
                        Cấu hình: {action.name}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Thiết lập các thông số cho việc đọc thông báo tự động
                    </p>
                </div>
                
                {/* Content */}
                <div className="p-4 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 min-h-0 max-h-[calc(85vh-120px)]">
                    {/* Cấu hình cơ bản */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h6 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Cấu hình cơ bản
                        </h6>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Tên hành động
                                </label>
                                <Input
                                    value={action?.name || ''}
                                    disabled
                                    className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Tên để nhận biết hành động này trong kịch bản.
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Số lượng thông báo đọc
                                </label>
                                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <Input
                                        type="number"
                                        min="1"
                                        value={config.count_from}
                                        onChange={(e) => handleInputChange('count_from', e.target.value)}
                                        className="w-20 text-center border-gray-300 dark:border-gray-600"
                                    />
                                    <span className="text-gray-500 font-medium">-</span>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={config.count_to}
                                        onChange={(e) => handleInputChange('count_to', e.target.value)}
                                        className="w-20 text-center border-gray-300 dark:border-gray-600"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Số lượng thông báo sẽ được đọc trong mỗi lần thực hiện.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Thời gian chờ */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h6 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Thời gian chờ
                        </h6>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Khoảng cách giữa các lần đọc (giây)
                            </label>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 w-fit">
                                <Input
                                    type="number"
                                    min="1"
                                    value={config.gap_from}
                                    onChange={(e) => handleInputChange('gap_from', e.target.value)}
                                    className="w-20 text-center border-gray-300 dark:border-gray-600"
                                />
                                <span className="text-gray-500 font-medium">-</span>
                                <Input
                                    type="number"
                                    min="1"
                                    value={config.gap_to}
                                    onChange={(e) => handleInputChange('gap_to', e.target.value)}
                                    className="w-20 text-center border-gray-300 dark:border-gray-600"
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Thời gian chờ giữa các lần đọc thông báo.
                            </p>
                        </div>
                    </div>

                    {/* Hành động tùy chọn */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h6 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                            Hành động tùy chọn
                        </h6>
                        
                        <div className="space-y-6">
                            {/* Theo dõi lại */}
                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h6 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                            Theo dõi lại
                                        </h6>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Tự động theo dõi lại những người đã theo dõi bạn.
                                        </p>
                                    </div>
                                    <Switcher
                                        checked={config.count_follow}
                                        onChange={(checked) => handleSwitchChange('count_follow', checked)}
                                    />
                                </div>
                                
                                {config.count_follow && (
                                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Số lượng theo dõi lại
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={config.follow_from}
                                                onChange={(e) => handleInputChange('follow_from', e.target.value)}
                                                className="w-16 text-center text-sm"
                                            />
                                            <span className="text-xs text-gray-500">-</span>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={config.follow_to}
                                                onChange={(e) => handleInputChange('follow_to', e.target.value)}
                                                className="w-16 text-center text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chào hỏi */}
                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h6 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                            Chào hỏi
                                        </h6>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Tự động gửi lời chào đến những người mới theo dõi.
                                        </p>
                                    </div>
                                    <Switcher
                                        checked={config.count_say_hi}
                                        onChange={(checked) => handleSwitchChange('count_say_hi', checked)}
                                    />
                                </div>
                                
                                {config.count_say_hi && (
                                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Số lượng chào hỏi
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={config.say_hi_from}
                                                onChange={(e) => handleInputChange('say_hi_from', e.target.value)}
                                                className="w-16 text-center text-sm"
                                            />
                                            <span className="text-xs text-gray-500">-</span>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={config.say_hi_to}
                                                onChange={(e) => handleInputChange('say_hi_to', e.target.value)}
                                                className="w-16 text-center text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="default"
                            onClick={handleClose}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            variant="solid"
                            onClick={handleSave}
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            Lưu cấu hình
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default NotificationModal
