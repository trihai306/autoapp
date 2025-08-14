'use client'
import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'

const UpdateAvatarModal = ({ isOpen, onClose, action, onSave }) => {
    // Initialize config based on JSON schema for Update Avatar Form
    const initialConfig = {
        name: "Cập nhật avatar",
        uploaded_files: [],
        delete_used_images: false
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

    const handleArrayChange = (field, values) => {
        setConfig(prev => ({
            ...prev,
            [field]: values
        }))
    }

    const resetForm = () => {
        setConfig(initialConfig)
    }

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files)
        
        // Phân loại file theo loại
        const imageFiles = files.filter(file => file.type.startsWith('image/'))
        
        if (imageFiles.length > 0) {
            setConfig(prev => ({
                ...prev,
                uploaded_files: imageFiles
            }))
        }
    }

    const removeFile = () => {
        setConfig(prev => ({
            ...prev,
            uploaded_files: []
        }))
    }

    const handleSave = async () => {
        if (onSave && !isLoading) {
            setIsLoading(true)
            try {
                const saveData = {
                    name: config.name,
                    type: action?.type || 'update_avatar',
                    parameters: {
                        name: config.name,
                        description: config.name,
                        uploaded_files: config.uploaded_files,
                        delete_used_images: config.delete_used_images
                    }
                }
                await onSave(action, saveData)
                // Reset form sau khi lưu thành công
                resetForm()
            } catch (error) {
                console.error('Error saving update avatar config:', error)
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
            <div className="flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                    <h5 className="font-bold text-lg">Cập nhật Ảnh đại diện</h5>
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
                    
                    {/* Upload Ảnh đại diện */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Upload Ảnh đại diện:
                        </label>
                        <div className="space-y-3">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className="cursor-pointer flex flex-col items-center justify-center text-center"
                                >
                                    <div className="text-4xl text-gray-400 mb-2">🖼️</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium text-blue-600 hover:text-blue-500">
                                            Nhấp để chọn ảnh đại diện
                                        </span>
                                        <br />
                                        Chỉ chấp nhận file ảnh (JPG, PNG, GIF...)
                                    </div>
                                </label>
                            </div>
                            
                            {/* Hiển thị ảnh đã chọn */}
                            {config.uploaded_files.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Ảnh đã chọn:
                                    </h4>
                                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                                    <span className="text-lg">🖼️</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {config.uploaded_files[0].name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {(config.uploaded_files[0].size / 1024 / 1024).toFixed(2)} MB
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={removeFile}
                                                className="text-red-500 hover:text-red-700 px-2 py-1"
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div>
                                <Checkbox
                                    checked={config.delete_used_images}
                                    onChange={(checked) => handleCheckboxChange('delete_used_images', checked)}
                                >
                                    Xóa ảnh đã sử dụng
                                </Checkbox>
                            </div>
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

export default UpdateAvatarModal
