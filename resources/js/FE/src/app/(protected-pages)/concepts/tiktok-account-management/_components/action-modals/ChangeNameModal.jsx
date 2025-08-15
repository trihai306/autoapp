'use client'
import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const ChangeNameModal = ({ isOpen, onClose, action, onSave }) => {
    // Initialize config based on JSON schema for Change Name Form
    const initialConfig = {
        name: "Đổi tên",
        selection_type: "random",
        name_type: "vietnamese",
        name_list: [] // Bổ sung field name_list theo tài liệu
    }
    
    const [config, setConfig] = useState(initialConfig)
    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleRadioChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleNameListChange = (value) => {
        // Chuyển đổi string thành array nếu cần
        const nameArray = value.split('\n').filter(name => name.trim() !== '')
        setConfig(prev => ({
            ...prev,
            name_list: nameArray
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
                    type: action?.type || 'change_name',
                    parameters: {
                        name: config.name,
                        description: config.name,
                        selection_type: config.selection_type,
                        name_type: config.name_type,
                        name_list: config.selection_type === 'custom' ? config.name_list : []
                    }
                }
                await onSave(action, saveData)
                // Reset form sau khi lưu thành công
                resetForm()
            } catch (error) {
                console.error('Error saving change name config:', error)
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
                    <h5 className="font-bold text-lg">Thêm Đổi tên</h5>
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Tên hành động */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <span className="text-red-500">*</span> Tên hành động
                        </label>
                        <Input
                            value={config.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="border-gray-300 dark:border-gray-600"
                        />
                    </div>
                    
                    {/* Lựa chọn */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Lựa chọn
                        </label>
                        <select 
                            value={config.selection_type}
                            onChange={(e) => handleInputChange('selection_type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="random">Ngẫu nhiên</option>
                            <option value="custom">Tùy chỉnh</option>
                        </select>
                    </div>
                    
                    {/* Danh sách tên - chỉ hiển thị khi selection_type = "custom" */}
                    {config.selection_type === 'custom' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Danh sách tên tùy chỉnh
                            </label>
                            <textarea
                                value={config.name_list.join('\n')}
                                onChange={(e) => handleNameListChange(e.target.value)}
                                placeholder="Tên 1&#10;Tên 2&#10;Tên 3..."
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Nhập mỗi dòng một tên. Hệ thống sẽ chọn ngẫu nhiên từ danh sách này.
                            </p>
                        </div>
                    )}
                    
                    {/* Loại tên */}
                    <div>
                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="nameType"
                                    value="vietnamese"
                                    checked={config.name_type === 'vietnamese'}
                                    onChange={(e) => handleRadioChange('name_type', e.target.value)}
                                    className="mr-3 text-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Theo tên Việt</span>
                            </label>
                            
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="nameType"
                                    value="english"
                                    checked={config.name_type === 'english'}
                                    onChange={(e) => handleRadioChange('name_type', e.target.value)}
                                    className="mr-3 text-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Theo tên Quốc Tế</span>
                            </label>
                        </div>
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

export default ChangeNameModal
