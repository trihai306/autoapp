'use client'
import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'

const FollowUserModal = ({ isOpen, onClose, action, onSave }) => {
    // Tab state
    const [activeTab, setActiveTab] = useState('list')
    
    // Initialize config based on JSON schema for Follow User Form
    const initialConfig = {
        name: "Theo dõi User",
        follow_type: "list", // "list" hoặc "keyword"
        user_list: "",
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

    const handleCheckboxChange = (field, checked) => {
        setConfig(prev => ({
            ...prev,
            [field]: checked
        }))
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setConfig(prev => ({
            ...prev,
            follow_type: tab
        }))
    }

    const resetForm = () => {
        setConfig(initialConfig)
        setActiveTab('list')
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
                        user_list: activeTab === 'list' ? config.user_list : null,
                        keyword_list: activeTab === 'keyword' ? config.keyword_list : null,
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
                console.error('Error saving follow user config:', error)
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
                    <h5 className="font-bold text-lg">Theo dõi User</h5>
                    
                    {/* Tabs */}
                    <div className="flex mt-4 border-b border-gray-200 dark:border-gray-600">
                        <button
                            onClick={() => handleTabChange('list')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'list'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Theo danh sách
                        </button>
                        <button
                            onClick={() => handleTabChange('keyword')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'keyword'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Theo từ khóa
                        </button>
                    </div>
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
                    
                    {/* Form theo danh sách người dùng */}
                    {activeTab === 'list' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Danh sách người dùng
                            </label>
                            <textarea
                                value={config.user_list}
                                onChange={(e) => handleInputChange('user_list', e.target.value)}
                                placeholder="hainc&#10;anhhai306&#10;username3..."
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Nhập mỗi dòng một username người dùng cần theo dõi.
                            </p>
                        </div>
                    )}
                    
                    {/* Form theo từ khóa */}
                    {activeTab === 'keyword' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Danh sách từ khóa
                            </label>
                            <textarea
                                value={config.keyword_list || ""}
                                onChange={(e) => handleInputChange('keyword_list', e.target.value)}
                                placeholder="abc&#10;abc2&#10;từ khóa 3..."
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Nhập mỗi dòng một từ khóa để tìm kiếm và theo dõi người dùng.
                            </p>
                            
                            {/* Thông tin bổ sung cho keyword mode */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                                <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm flex items-center">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                                    Chế độ tìm kiếm từ khóa
                                </h6>
                                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                                    <li>• Hệ thống sẽ tìm kiếm user dựa trên từ khóa</li>
                                    <li>• Tự động theo dõi user phù hợp được tìm thấy</li>
                                    <li>• Không cần cấu hình thoát khi fail (tự động xử lý)</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    
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
                    </div>
                    
                    {/* Chỉ hiển thị các tùy chọn này khi theo dõi theo danh sách */}
                    {activeTab === 'list' && (
                        <>
                            {/* Thoát khi follow fail */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Checkbox
                                        checked={config.exit_on_fail}
                                        onChange={(checked) => handleCheckboxChange('exit_on_fail', checked)}
                                    >
                                        Thoát khi follow fail
                                    </Checkbox>
                                    {config.exit_on_fail && (
                                        <>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={config.exit_fail_count}
                                                onChange={(e) => handleInputChange('exit_fail_count', e.target.value)}
                                                className="w-20 text-center border-gray-300 dark:border-gray-600"
                                            />
                                            <span className="text-sm text-gray-500">lượt</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {/* Mở link bằng tìm kiếm */}
                            <div>
                                <Checkbox
                                    checked={config.open_link_search}
                                    onChange={(checked) => handleCheckboxChange('open_link_search', checked)}
                                >
                                    Mở link bằng tìm kiếm
                                </Checkbox>
                            </div>
                        </>
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

export default FollowUserModal