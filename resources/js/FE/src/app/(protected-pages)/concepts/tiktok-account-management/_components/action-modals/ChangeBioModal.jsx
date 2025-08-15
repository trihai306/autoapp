'use client'
import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'

const ChangeBioModal = ({ isOpen, onClose, action, onSave }) => {
    // Initialize config based on JSON schema for Change Bio Form
    const initialConfig = {
        name: "Đổi tiểu sử",
        new_bio: "",
        add_emoji: false
    }
    
    const [config, setConfig] = useState(initialConfig)
    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleCheckboxChange = (field, checked) => {
        setConfig(prev => ({
            ...prev,
            [field]: checked
        }))
    }

    const resetForm = () => {
        setConfig(initialConfig)
    }

    // Load config from action when editing
    useEffect(() => {
        if (isOpen && action) {
            try {
                if (action.script) {
                    const scriptData = JSON.parse(action.script)
                    if (scriptData.parameters) {
                        setConfig(prev => ({
                            ...prev,
                            ...scriptData.parameters
                        }))
                    }
                }
            } catch (error) {
                console.warn('Failed to parse action script:', error)
            }
        }
    }, [isOpen, action])

    const handleSave = async () => {
        if (onSave && !isLoading) {
            setIsLoading(true)
            try {
                const saveData = {
                    name: config.name,
                    type: action?.type || 'change_bio',
                    parameters: {
                        name: config.name,
                        description: config.name,
                        new_bio: config.new_bio,
                        add_emoji: config.add_emoji
                    }
                }
                await onSave(action, saveData)
                // Reset form sau khi lưu thành công
                resetForm()
            } catch (error) {
                console.error('Error saving change bio config:', error)
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
            width={500}
            className="z-[80]"
        >
            <div className="flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                    <h5 className="font-bold text-lg">Đổi tiểu sử</h5>
                </div>
                
                {/* Content */}
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                    {/* Tên hành động */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tên hành động
                        </label>
                        <Input
                            value={action?.name || ''}
                            disabled
                            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Tên hành động không thể thay đổi.
                        </p>
                    </div>
                    
                    {/* Tiểu sử mới */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tiểu sử mới <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={config.new_bio}
                            onChange={(e) => handleInputChange('new_bio', e.target.value)}
                            placeholder="Nhập tiểu sử mới..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Nhập nội dung tiểu sử mới cho tài khoản.
                        </p>
                    </div>
                    
                    {/* Thêm emoji */}
                    <div>
                        <Checkbox
                            checked={config.add_emoji}
                            onChange={(checked) => handleCheckboxChange('add_emoji', checked)}
                        >
                            Tự động thêm emoji
                        </Checkbox>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Hệ thống sẽ tự động thêm emoji phù hợp vào tiểu sử.
                        </p>
                    </div>
                    
                    {/* Thông tin bổ sung */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <h6 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            Lưu ý quan trọng
                        </h6>
                        <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                            <li>• Tiểu sử sẽ được thay đổi ngay lập tức</li>
                            <li>• Nên kiểm tra kỹ nội dung trước khi lưu</li>
                            <li>• Tránh sử dụng từ ngữ vi phạm chính sách TikTok</li>
                            <li>• Có thể mất vài phút để hiển thị trên profile</li>
                        </ul>
                    </div>
                    
                    {/* Preview */}
                    {config.new_bio && (
                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                                <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                                Xem trước
                            </h6>
                            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-3">
                                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                    {config.new_bio}
                                    {config.add_emoji && " ✨"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex-shrink-0 bg-white dark:bg-gray-800">
                    <div className="flex justify-end gap-3">
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
                            disabled={isLoading || !config.new_bio.trim()}
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default ChangeBioModal
