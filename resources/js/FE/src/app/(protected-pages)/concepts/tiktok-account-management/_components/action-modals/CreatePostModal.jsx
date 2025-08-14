'use client'
import { useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'

const CreatePostModal = ({ isOpen, onClose, action, onSave }) => {
    // Initialize config based on JSON schema for Create Post Form
    const initialConfig = {
        name: "Tạo bài viết",
        load_time_from: 3,
        load_time_to: 5,
        post_by_filename: false,
        title: "",
        content: "",
        uploaded_files: [],
        delete_used_images: false,
        auto_cut: false,
        filter_type: "random",
        custom_filters: "",
        add_trending_music: false
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
        const videoFiles = files.filter(file => file.type.startsWith('video/'))
        
        // Nếu có video, chỉ lấy video đầu tiên
        if (videoFiles.length > 0) {
            setConfig(prev => ({
                ...prev,
                uploaded_files: [videoFiles[0]]
            }))
        } else if (imageFiles.length > 0) {
            // Nếu chỉ có ảnh, có thể chọn nhiều
            setConfig(prev => ({
                ...prev,
                uploaded_files: imageFiles
            }))
        }
    }

    const removeFile = (index) => {
        setConfig(prev => ({
            ...prev,
            uploaded_files: prev.uploaded_files.filter((_, i) => i !== index)
        }))
    }

    const handleRadioChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSave = async () => {
        if (onSave && !isLoading) {
            setIsLoading(true)
            try {
                const saveData = {
                    name: config.name,
                    type: action?.type || 'create_post',
                    parameters: {
                        name: config.name,
                        description: config.name,
                        load_time_from: config.load_time_from,
                        load_time_to: config.load_time_to,
                        post_by_filename: config.post_by_filename,
                        title: config.title,
                        content: config.content,
                        uploaded_files: config.uploaded_files,
                        delete_used_images: config.delete_used_images,
                        auto_cut: config.auto_cut,
                        filter_type: config.filter_type,
                        custom_filters: config.custom_filters,
                        add_trending_music: config.add_trending_music
                    }
                }
                await onSave(action, saveData)
                // Reset form sau khi lưu thành công
                resetForm()
            } catch (error) {
                console.error('Error saving create post config:', error)
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
            <div className="flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                    <h5 className="font-bold text-lg">Thêm Tạo bài viết</h5>
                </div>
                
                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 min-h-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Cột trái */}
                        <div className="space-y-6">
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
                            
                            {/* Thời gian chờ load video */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Thời gian chờ load video
                                </label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        min="1"
                                        value={config.load_time_from}
                                        onChange={(e) => handleInputChange('load_time_from', e.target.value)}
                                        className="w-20 text-center border-gray-300 dark:border-gray-600"
                                    />
                                    <span className="text-gray-500 font-medium">-</span>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={config.load_time_to}
                                        onChange={(e) => handleInputChange('load_time_to', e.target.value)}
                                        className="w-20 text-center border-gray-300 dark:border-gray-600"
                                    />
                                    <span className="text-sm text-gray-500">giây</span>
                                </div>
                            </div>
                            
                            {/* Đăng video theo tên file */}
                            <div>
                                <Checkbox
                                    checked={config.post_by_filename}
                                    onChange={(checked) => handleCheckboxChange('post_by_filename', checked)}
                                >
                                    Đăng video theo tên file
                                </Checkbox>
                            </div>
                            
                            {/* Tiêu đề */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tiêu đề
                                </label>
                                <Input
                                    value={config.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="Nhập tiêu đề bài viết"
                                    className="border-gray-300 dark:border-gray-600"
                                />
                            </div>
                            
                            {/* Nội dung */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nội dung
                                </label>
                                <textarea
                                    value={config.content}
                                    onChange={(e) => handleInputChange('content', e.target.value)}
                                    placeholder="Nhập nội dung bài viết..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                        
                        {/* Cột phải */}
                        <div className="space-y-6">
                            {/* Upload File */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Upload File (Ảnh/Video):
                                </label>
                                <div className="space-y-3">
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            multiple
                                            accept="image/*,video/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer flex flex-col items-center justify-center text-center"
                                        >
                                            <div className="text-4xl text-gray-400 mb-2">📁</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-medium text-blue-600 hover:text-blue-500">
                                                    Nhấp để chọn file
                                                </span>
                                                <br />
                                                Video: chỉ chọn 1 file | Ảnh: chọn nhiều file
                                            </div>
                                        </label>
                                    </div>
                                    
                                    {/* Hiển thị file đã chọn */}
                                    {config.uploaded_files.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                File đã chọn:
                                            </h4>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {config.uploaded_files.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm">
                                                                {file.type.startsWith('video/') ? '🎥' : '🖼️'}
                                                            </span>
                                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                                {file.name}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                            </span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeFile(index)}
                                                            className="text-red-500 hover:text-red-700 px-2 py-1"
                                                        >
                                                            ✕
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-2">
                                        <Checkbox
                                            checked={config.delete_used_images}
                                            onChange={(checked) => handleCheckboxChange('delete_used_images', checked)}
                                        >
                                            Xóa file đã sử dụng
                                        </Checkbox>
                                        
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                checked={config.auto_cut}
                                                onChange={(checked) => handleCheckboxChange('auto_cut', checked)}
                                            >
                                                AutoCut
                                            </Checkbox>
                                            <span className="text-yellow-500 text-sm">ⓘ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Chỉnh sửa Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Chỉnh sửa Filter
                                </label>
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="filterType"
                                                value="random"
                                                checked={config.filter_type === 'random'}
                                                onChange={(e) => handleRadioChange('filter_type', e.target.value)}
                                                className="mr-2 text-blue-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Random</span>
                                        </label>
                                        
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="filterType"
                                                value="custom"
                                                checked={config.filter_type === 'custom'}
                                                onChange={(e) => handleRadioChange('filter_type', e.target.value)}
                                                className="mr-2 text-blue-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Custom (List Filter)</span>
                                            <span className="text-yellow-500 text-sm">ⓘ</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3">
                                        <Checkbox
                                            checked={config.add_trending_music}
                                            onChange={(checked) => handleCheckboxChange('add_trending_music', checked)}
                                        >
                                            Thêm nhạc trend
                                        </Checkbox>
                                    </div>
                                </div>
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
                            color="orange-500"
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

export default CreatePostModal
