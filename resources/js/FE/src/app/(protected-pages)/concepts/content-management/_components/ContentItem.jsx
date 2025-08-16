'use client'

import { useState } from 'react'
import { Card, Dropdown } from '@/components/ui'
import { HiOutlineDotsVertical, HiOutlinePencil, HiOutlineTrash, HiOutlineDocumentText } from 'react-icons/hi'
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

    const handleEdit = () => {
        console.log('Edit clicked for content:', content.id)
        setEditContentModalOpen(true, content)
    }

    const handleDelete = async () => {
        console.log('Delete clicked for content:', content.id)
        
        if (!confirm('Bạn có chắc chắn muốn xóa content này?')) {
            return
        }

        try {
            setIsDeleting(true)
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

    const dropdownItems = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <HiOutlinePencil className="w-4 h-4" />,
            onClick: handleEdit,
        },
        {
            key: 'delete',
            label: 'Xóa',
            icon: <HiOutlineTrash className="w-4 h-4" />,
            onClick: handleDelete,
            className: 'text-red-600 hover:text-red-700',
        },
    ]

    // Get content preview using utility function
    const contentPreview = getContentPreview(content.content, 100)

    return (
        <Card className={`group transition-all duration-200 hover:shadow-md ${
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
                    
                    {/* Dropdown Menu */}
                    <Dropdown
                        placement="bottom-end"
                        renderTitle={
                            <button
                                type="button"
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                title="Tùy chọn"
                            >
                                <HiOutlineDotsVertical className="w-4 h-4" />
                            </button>
                        }
                    >
                        {dropdownItems.map((item) => (
                            <Dropdown.Item
                                key={item.key}
                                eventKey={item.key}
                                onClick={item.onClick}
                                className={item.className}
                            >
                                <div className="flex items-center space-x-2">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                            </Dropdown.Item>
                        ))}
                    </Dropdown>
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
    )
}

export default ContentItem
