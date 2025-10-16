'use client'
import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import { apiUpdateAvatar } from '@/services/tiktok-account/TiktokAccountService'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const UpdateAvatarModal = ({ isOpen, onClose, action, onSave, accountId }) => {
    // Initialize config based on JSON schema for Update Avatar Form
    const initialConfig = {
        name: "Cập nhật Ảnh đại diện",
        uploaded_files: [],
        delete_used_images: false
    }

    const [config, setConfig] = useState(initialConfig)
    const [isLoading, setIsLoading] = useState(false)
    const [currentImageUrls, setCurrentImageUrls] = useState([])

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
                        // Lưu lại ảnh hiện tại (nếu có) để hiển thị preview khi edit
                        if (Array.isArray(scriptData.parameters.image_urls)) {
                            setCurrentImageUrls(scriptData.parameters.image_urls.filter(Boolean))
                        } else if (scriptData.parameters.image_url) {
                            setCurrentImageUrls([scriptData.parameters.image_url])
                        }
                    }
                }
            } catch (error) {
                console.warn('Failed to parse action script:', error)
            }
        }
    }, [isOpen, action])

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files)

        // Chỉ chấp nhận file ảnh
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
        // Trường hợp có file mới: upload rồi lưu script với URL mới
        if (Array.isArray(config.uploaded_files) && config.uploaded_files.length > 0) {
            if (!accountId) {
                toast.push(
                    <Notification type="danger" title="Lỗi">Vui lòng chọn tài khoản TikTok</Notification>
                )
                return
            }

            setIsLoading(true)
            try {
                const formData = new FormData()
                formData.append('avatar', config.uploaded_files[0])
                formData.append('description', config.name)

                const response = await apiUpdateAvatar(accountId, formData)

                if (response.success) {
                    toast.push(
                        <Notification type="success" title="Thành công">Ảnh đại diện đã được cập nhật</Notification>
                    )

                    if (onSave) {
                        const saveData = {
                            name: config.name,
                            type: action?.type || 'update_avatar',
                            parameters: {
                                name: config.name,
                                description: config.name,
                                image_urls: response.data?.avatar_url ? [response.data.avatar_url] : [],
                                delete_used_images: config.delete_used_images
                            }
                        }
                        await onSave(action, saveData)
                    }

                    resetForm()
                    onClose()
                } else {
                    toast.push(
                        <Notification type="danger" title="Lỗi">{response.message || 'Không thể cập nhật ảnh đại diện'}</Notification>
                    )
                }
            } catch (error) {
                console.error('Error updating avatar:', error)
                toast.push(
                    <Notification type="danger" title="Lỗi">Không thể cập nhật ảnh đại diện</Notification>
                )
            } finally {
                setIsLoading(false)
            }
            return
        }

        // Trường hợp không có file mới nhưng đang edit: lưu lại script với image_urls hiện có
        if (onSave && currentImageUrls.length > 0) {
            setIsLoading(true)
            try {
                const saveData = {
                    name: config.name,
                    type: action?.type || 'update_avatar',
                    parameters: {
                        name: config.name,
                        description: config.name,
                        image_urls: currentImageUrls,
                        delete_used_images: config.delete_used_images
                    }
                }
                await onSave(action, saveData)
                toast.push(
                    <Notification type="success" title="Thành công">Đã lưu cấu hình ảnh hiện tại</Notification>
                )
                resetForm()
                onClose()
            } catch (error) {
                console.error('Error saving avatar config:', error)
                toast.push(
                    <Notification type="danger" title="Lỗi">Không thể lưu cấu hình ảnh</Notification>
                )
            } finally {
                setIsLoading(false)
            }
            return
        }

        // Nếu không có file mới và không có ảnh hiện có
        toast.push(
            <Notification type="danger" title="Lỗi">Vui lòng chọn ảnh đại diện</Notification>
        )
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

                            {/* Hiển thị ảnh hiện tại (khi edit, chưa chọn file mới) */}
                            {config.uploaded_files.length === 0 && currentImageUrls.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Ảnh hiện tại:
                                    </h4>
                                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img src={currentImageUrls[0]} alt="current avatar" className="w-12 h-12 rounded-lg object-cover" />
                                                <div className="text-xs text-gray-500 truncate max-w-[220px]">{currentImageUrls[0]}</div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={()=>setCurrentImageUrls([])}
                                                className="text-red-500 hover:text-red-700 px-2 py-1"
                                            >
                                                Gỡ ảnh
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

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
