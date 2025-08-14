'use client'
import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'

const ActionConfigModal = ({ isOpen, onClose, action, onSave }) => {
    // Initial config state
    const initialConfig = {
        // Cấu hình chung - chuyển sang flat structure
        notification_count_from: 1,
        notification_count_to: 2,
        time_interval_from: 1,
        time_interval_to: 3,
        
        // Hành động phụ
        follow_back_enabled: true,
        follow_back_count_from: 1,
        follow_back_count_to: 3,
        say_hi_enabled: true,
        say_hi_count_from: 1,
        say_hi_count_to: 3
    }
    
    const [config, setConfig] = useState(initialConfig)
    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            [field]: field.includes('_from') || field.includes('_to') || field.includes('_count')
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
                    name: action?.name || 'Đọc thông báo',
                    type: action?.type || 'notification',
                    parameters: {
                        name: action?.name || 'Đọc thông báo',
                        description: action?.name || 'Đọc thông báo',
                        notification_count_from: config.notification_count_from,
                        notification_count_to: config.notification_count_to,
                        time_interval_from: config.time_interval_from,
                        time_interval_to: config.time_interval_to,
                        follow_back_enabled: config.follow_back_enabled,
                        follow_back_count_from: config.follow_back_count_from,
                        follow_back_count_to: config.follow_back_count_to,
                        say_hi_enabled: config.say_hi_enabled,
                        say_hi_count_from: config.say_hi_count_from,
                        say_hi_count_to: config.say_hi_count_to
                    }
                }
                await onSave(action, saveData)
                // Reset form sau khi lưu thành công
                resetForm()
                // onClose() được gọi từ parent component sau khi save thành công
            } catch (error) {
                console.error('Error saving action config:', error)
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
            width={800}
            className="z-[80]"
        >
            <div className="flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                    <h5 className="font-bold">Cấu hình {action?.name}</h5>
                </div>
                
                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 min-h-0 max-h-[calc(85vh-120px)]">
                    {/* Cấu hình cơ bản */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h6 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Cấu hình cơ bản
                        </h6>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tên hành động
                            </label>
                            <Input
                                value={action?.name || ''}
                                disabled
                                className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Đặt tên để dễ dáng nhận biết hành động này trong kịch bản.
                            </p>
                        </div>
                    </div>

                    {/* Giới hạn & Thời gian */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h6 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Giới hạn & Thời gian
                        </h6>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Số lượng thông báo sẽ đọc
                                </label>
                                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <Input
                                        type="number"
                                        min="1"
                                        value={config.notification_count_from}
                                        onChange={(e) => handleInputChange('notification_count_from', e.target.value)}
                                        className="w-20 text-center border-gray-300 dark:border-gray-600"
                                    />
                                    <span className="text-gray-500 font-medium">-</span>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={config.notification_count_to}
                                        onChange={(e) => handleInputChange('notification_count_to', e.target.value)}
                                        className="w-20 text-center border-gray-300 dark:border-gray-600"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Thời gian giãn cách (giây)
                                </label>
                                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <Input
                                        type="number"
                                        min="1"
                                        value={config.time_interval_from}
                                        onChange={(e) => handleInputChange('time_interval_from', e.target.value)}
                                        className="w-20 text-center border-gray-300 dark:border-gray-600"
                                    />
                                    <span className="text-gray-500 font-medium">-</span>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={config.time_interval_to}
                                        onChange={(e) => handleInputChange('time_interval_to', e.target.value)}
                                        className="w-20 text-center border-gray-300 dark:border-gray-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hành động tùy chọn */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h6 className="font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                            Hành động tùy chọn
                        </h6>
                        
                        {/* Theo dõi lại người Follow */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                        <h6 className="font-medium text-gray-900 dark:text-gray-100">
                                            Theo dõi lại người Follow
                                        </h6>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-3.5">
                                        Tự động follow lại những người đã follow bạn.
                                    </p>
                                </div>
                                <Switcher
                                    checked={config.follow_back_enabled}
                                    onChange={(checked) => handleSwitchChange('follow_back_enabled', checked)}
                                />
                            </div>
                            
                            {config.follow_back_enabled && (
                                <div className="ml-3.5 border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Số lượng follow lại
                                    </label>
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 w-fit">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={config.follow_back_count_from}
                                            onChange={(e) => handleInputChange('follow_back_count_from', e.target.value)}
                                            className="w-20 text-center border-gray-300 dark:border-gray-600"
                                        />
                                        <span className="text-gray-500 font-medium">-</span>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={config.follow_back_count_to}
                                            onChange={(e) => handleInputChange('follow_back_count_to', e.target.value)}
                                            className="w-20 text-center border-gray-300 dark:border-gray-600"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chào lại người mới */}
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                        <h6 className="font-medium text-gray-900 dark:text-gray-100">
                                            Chào lại người mới
                                        </h6>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-3.5">
                                        Tự động "Say Hi" với người dùng mới.
                                    </p>
                                </div>
                                <Switcher
                                    checked={config.say_hi_enabled}
                                    onChange={(checked) => handleSwitchChange('say_hi_enabled', checked)}
                                />
                            </div>
                            
                            {config.say_hi_enabled && (
                                <div className="ml-3.5 border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Số lượng "Say Hi"
                                    </label>
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 w-fit">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={config.say_hi_count_from}
                                            onChange={(e) => handleInputChange('say_hi_count_from', e.target.value)}
                                            className="w-20 text-center border-gray-300 dark:border-gray-600"
                                        />
                                        <span className="text-gray-500 font-medium">-</span>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={config.say_hi_count_to}
                                            onChange={(e) => handleInputChange('say_hi_count_to', e.target.value)}
                                            className="w-20 text-center border-gray-300 dark:border-gray-600"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex-shrink-0 bg-white dark:bg-gray-800">
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="default"
                            onClick={handleClose}
                        >
                            Thoát
                        </Button>
                        <Button
                            type="button"
                            variant="solid"
                            color="blue-500"
                            onClick={handleSave}
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default ActionConfigModal
