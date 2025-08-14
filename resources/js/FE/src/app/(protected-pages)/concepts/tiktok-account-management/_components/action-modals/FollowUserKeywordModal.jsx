'use client'
import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const FollowUserKeywordModal = ({ isOpen, onClose, action, onSave }) => {
    // Initialize config based on JSON schema for Follow User Keyword Form
    const initialConfig = {
        name: "Theo dõi User theo từ khóa",
        follow_type: "keyword",
        keyword_list: "",
        count_from: 1,
        count_to: 2,
        gap_from: 3,
        gap_to: 5,
        exit_on_fail: false,
        exit_fail_count: 5,
        open_link_search: false
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
                    type: action?.type || 'follow_user',
                    parameters: {
                        name: config.name,
                        description: config.name,
                        follow_type: config.follow_type,
                        user_list: null,
                        keyword_list: config.keyword_list,
                        count_from: config.count_from,
                        count_to: config.count_to,
                        gap_from: config.gap_from,
                        gap_to: config.gap_to,
                        exit_on_fail: config.exit_on_fail,
                        exit_fail_count: config.exit_fail_count,
                        open_link_search: config.open_link_search
                    }
                }
                await onSave(action, saveData)
                // Reset form sau khi lưu thành công
                resetForm()
            } catch (error) {
                console.error('Error saving follow user keyword config:', error)
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
                    <h5 className="font-bold text-lg">Theo dõi User theo từ khóa</h5>
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
                    
                    {/* Danh sách từ khóa */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Danh sách từ khóa <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={config.keyword_list}
                            onChange={(e) => handleInputChange('keyword_list', e.target.value)}
                            placeholder="abc&#10;abc2&#10;từ khóa 3..."
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Nhập mỗi dòng một từ khóa để tìm kiếm và theo dõi người dùng.
                        </p>
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
                            <span className="text-sm text-gray-500">user</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Số lượng user sẽ được theo dõi cho mỗi từ khóa.
                        </p>
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
                            <span className="text-sm text-gray-500">giây</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Thời gian chờ giữa các lần theo dõi.
                        </p>
                    </div>
                    
                    {/* Thông tin bổ sung cho keyword mode */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Chế độ tìm kiếm từ khóa
                        </h6>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>• Hệ thống sẽ tìm kiếm user dựa trên từ khóa</li>
                            <li>• Tự động theo dõi user phù hợp được tìm thấy</li>
                            <li>• Không cần cấu hình thoát khi fail (tự động xử lý)</li>
                            <li>• Không sử dụng tìm kiếm link (dùng API tìm kiếm)</li>
                        </ul>
                    </div>
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

export default FollowUserKeywordModal
