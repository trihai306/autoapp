'use client'
import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const FollowBackModal = ({ isOpen, onClose, action, onSave }) => {
    const initialConfig = {
        name: 'Theo dõi lại',
        user_count_from: 1,
        user_count_to: 1,
        interval_from: 3,
        interval_to: 5
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

    const resetForm = () => {
        setConfig(initialConfig)
    }

    const handleSave = async () => {
        if (onSave && !isLoading) {
            setIsLoading(true)
            try {
                const saveData = {
                    name: config.name,
                    type: action?.type || 'follow_back',
                    parameters: {
                        name: config.name,
                        description: config.name,
                        user_count_from: config.user_count_from,
                        user_count_to: config.user_count_to,
                        interval_from: config.interval_from,
                        interval_to: config.interval_to
                    }
                }
                await onSave(action, saveData)
                // Reset form sau khi lưu thành công
                resetForm()
            } catch (error) {
                console.error('Error saving follow back config:', error)
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
            width={450}
            className="z-[80]"
        >
            <div className="flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                    <h5 className="font-bold">Thêm Theo dõi lại</h5>
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Tên hành động */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tên hành động
                        </label>
                        <Input
                            value={config.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="border-gray-300 dark:border-gray-600"
                        />
                    </div>
                    
                    {/* Số lượng user */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Số lượng user
                        </label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                min="1"
                                value={config.user_count_from}
                                onChange={(e) => handleInputChange('user_count_from', e.target.value)}
                                className="w-20 text-center border-gray-300 dark:border-gray-600"
                            />
                            <span className="text-gray-500 font-medium">-</span>
                            <Input
                                type="number"
                                min="1"
                                value={config.user_count_to}
                                onChange={(e) => handleInputChange('user_count_to', e.target.value)}
                                className="w-20 text-center border-gray-300 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-500">user</span>
                        </div>
                    </div>
                    
                    {/* Giãn cách */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Giãn cách
                        </label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="number"
                                min="1"
                                value={config.interval_from}
                                onChange={(e) => handleInputChange('interval_from', e.target.value)}
                                className="w-20 text-center border-gray-300 dark:border-gray-600"
                            />
                            <span className="text-gray-500 font-medium">-</span>
                            <Input
                                type="number"
                                min="1"
                                value={config.interval_to}
                                onChange={(e) => handleInputChange('interval_to', e.target.value)}
                                className="w-20 text-center border-gray-300 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-500">giây</span>
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
                            Lưu
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default FollowBackModal
