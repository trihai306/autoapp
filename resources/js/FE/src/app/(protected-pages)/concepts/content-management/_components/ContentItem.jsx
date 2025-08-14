'use client'

import { useState } from 'react'
import { Card, Button, Dropdown } from '@/components/ui'
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
        setEditContentModalOpen(true, content)
    }

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa content này?')) {
            return
        }

        try {
            setIsDeleting(true)
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
            icon: <HiOutlinePencil />,
            onClick: handleEdit,
        },
        {
            key: 'delete',
            label: 'Xóa',
            icon: <HiOutlineTrash />,
            onClick: handleDelete,
            className: 'text-red-600 hover:text-red-700',
        },
    ]

    // Get content preview using utility function
    const contentPreview = getContentPreview(content.content, 100)

    return (
        <Card className={`group transition-all duration-500 ease-out hover:shadow-md hover:scale-[1.01] hover:-translate-y-1 ${
            isDeleting ? 'opacity-50 pointer-events-none animate-pulse' : ''
        } relative overflow-hidden bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-gray-800 dark:via-gray-700/30 dark:to-gray-800 border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/60 dark:hover:border-gray-600/60`}>
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-100/30 to-transparent dark:via-gray-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                        <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl transition-all duration-300 group-hover:from-gray-200 group-hover:to-gray-300 dark:group-hover:from-gray-600 dark:group-hover:to-gray-700 shadow-sm">
                            <HiOutlineDocumentText className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base text-gray-900 dark:text-white truncate group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors duration-300">
                                {content.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                                ID: {content.id}
                            </p>
                        </div>
                    </div>
                    
                    <Dropdown
                        placement="bottom-end"
                        renderTitle={
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<HiOutlineDotsVertical />}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            />
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

                {/* Content Preview with enhanced styling */}
                <div className="mb-4">
                    <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
                            {contentPreview || 'Nội dung trống'}
                        </p>
                    </div>
                </div>

                {/* Footer with enhanced design */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="font-medium">
                            {new Date(content.created_at).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Cập nhật:</span>
                        <span className="font-medium">
                            {new Date(content.updated_at).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default ContentItem
