'use client'

import { useState } from 'react'
import { Card, Button, Dialog } from '@/components/ui'
import { HiOutlinePencil, HiOutlineTrash, HiOutlineDocumentText, HiOutlineExclamation } from 'react-icons/hi'
import { useContentManagementStore } from '../_store/contentManagementStore'
import { apiDeleteContents } from '@/services/content/ContentService'
import { apiGetContentsByGroup } from '@/services/content/ContentService'
import { toast } from 'react-hot-toast'
import { getContentPreview } from '@/utils/contentUtils'

const ContentItem = ({ content }) => {
    const {
        selectedContentGroup,
        setEditContentModalOpen,
        setContents,
        setContentsLoading,
    } = useContentManagementStore()

    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const handleEdit = () => {
        console.log('Edit clicked for content:', content.id)
        setEditContentModalOpen(true, content)
    }

    const handleDeleteClick = () => {
        setShowDeleteDialog(true)
    }

    const handleDeleteConfirm = async () => {
        try {
            setIsDeleting(true)
            setShowDeleteDialog(false)
            console.log('Deleting content with ID:', content.id)
            
            await apiDeleteContents({ ids: [content.id] })
            toast.success('Xóa content thành công')
            
            // Refresh contents list
            if (selectedContentGroup) {
                setContentsLoading(true)
                const response = await apiGetContentsByGroup(selectedContentGroup.id)
                if (response.data) {
                    setContents(response.data.data || response.data)
                }
                setContentsLoading(false)
            }
        } catch (error) {
            console.error('Error deleting content:', error)
            toast.error('Không thể xóa content')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false)
    }

    // Get content preview using utility function
    const contentPreview = getContentPreview(content.content, 100)

    return (
        <>
            <Card className={`group transition-all duration-200 hover:shadow-md relative ${
                isDeleting ? 'opacity-50 pointer-events-none' : ''
            }`}>
                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                                <HiOutlineDocumentText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white text-base truncate">
                                    {content.title}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    ID: {content.id}
                                </p>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<HiOutlinePencil />}
                                onClick={handleEdit}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                title="Chỉnh sửa"
                            />
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<HiOutlineTrash />}
                                onClick={handleDeleteClick}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Xóa"
                            />
                        </div>
                    </div>

                    {/* Content Preview */}
                    <div className="mb-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
                                {contentPreview || 'Nội dung trống'}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Tạo: {new Date(content.created_at).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Cập nhật: {new Date(content.updated_at).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog
                isOpen={showDeleteDialog}
                onClose={handleDeleteCancel}
                width={400}
            >
                <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <HiOutlineExclamation className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Xác nhận xóa
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Hành động này không thể hoàn tác
                            </p>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <p className="text-gray-700 dark:text-gray-300">
                            Bạn có chắc chắn muốn xóa content <span className="font-semibold">"{content.title}"</span>?
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-end space-x-3">
                        <Button
                            variant="plain"
                            onClick={handleDeleteCancel}
                            disabled={isDeleting}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="solid"
                            onClick={handleDeleteConfirm}
                            loading={isDeleting}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xóa'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default ContentItem
