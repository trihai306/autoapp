'use client'

import { useState } from 'react'
import { Card, Button, Dropdown } from '@/components/ui'
import { HiOutlineDotsVertical, HiOutlinePencil, HiOutlineTrash, HiOutlineFolder, HiOutlineDocumentText, HiOutlineCalendar, HiOutlineEye } from 'react-icons/hi'
import { useContentManagementStore } from '../_store/contentManagementStore'
import getContentsByGroup from '@/server/actions/content/getContentsByGroup'
import deleteContentGroups from '@/server/actions/content/deleteContentGroups'
import { toast } from 'react-hot-toast'

const ContentGroupCard = ({ group, onRefresh }) => {
    const {
        selectedContentGroup,
        setSelectedContentGroup,
        setContents,
        setContentsLoading,
        setEditGroupModalOpen,
    } = useContentManagementStore()

    const [isDeleting, setIsDeleting] = useState(false)
    const isSelected = selectedContentGroup?.id === group.id

    const handleCardClick = async () => {
        if (isSelected) {
            // If already selected, close sidebar
            setSelectedContentGroup(null)
            return
        }

        try {
            setContentsLoading(true)
            setSelectedContentGroup(group)
            
            // Fetch contents for this group
            const response = await getContentsByGroup(group.id)
            if (response.success && response.data) {
                setContents(response.data.data || response.data)
            }
        } catch (error) {
            console.error('Error fetching contents:', error)
            toast.error('Không thể tải danh sách content')
        } finally {
            setContentsLoading(false)
        }
    }

    const handleEdit = (e) => {
        e.stopPropagation()
        setEditGroupModalOpen(true, group)
    }

    const handleDelete = async (e) => {
        e.stopPropagation()
        
        if (!confirm('Bạn có chắc chắn muốn xóa nhóm content này?')) {
            return
        }

        try {
            setIsDeleting(true)
            const response = await deleteContentGroups([group.id])
            if (response.success) {
                toast.success(response.message || 'Xóa nhóm content thành công')
                onRefresh()
            } else {
                toast.error(response.message || 'Không thể xóa nhóm content')
            }
        } catch (error) {
            console.error('Error deleting content group:', error)
            toast.error('Không thể xóa nhóm content')
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

    const contentCount = group.contents_count || 0
    const hasContent = contentCount > 0

    return (
        <Card
            className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                isSelected 
                    ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={handleCardClick}
        >
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg transition-colors duration-200 ${
                            isSelected 
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300' 
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-800 dark:group-hover:text-blue-300'
                        }`}>
                            <HiOutlineFolder className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                                {group.name}
                            </h3>
                            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                <HiOutlineCalendar className="w-3 h-3" />
                                <span>{new Date(group.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <Dropdown
                        placement="bottom-end"
                        renderTitle={
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<HiOutlineDotsVertical />}
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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

                {/* Content Stats */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-md transition-colors duration-200 ${
                            hasContent 
                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                            <HiOutlineDocumentText className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex items-baseline space-x-1">
                            <span className={`text-lg font-semibold transition-colors duration-200 ${
                                hasContent 
                                    ? 'text-gray-900 dark:text-white' 
                                    : 'text-gray-900 dark:text-white'
                            }`}>
                                {contentCount}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                content{contentCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                        hasContent
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                        {hasContent ? 'Có nội dung' : 'Trống'}
                    </div>
                </div>

                {/* Action Hint */}
                <div className={`text-center py-2 rounded-md border border-dashed transition-colors duration-200 ${
                    isSelected 
                        ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 group-hover:border-blue-300 dark:group-hover:border-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10'
                }`}>
                    <div className={`text-xs font-medium transition-colors duration-200 ${
                        isSelected 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-700 dark:group-hover:text-blue-300'
                    }`}>
                        {isSelected ? '✓ Đang xem' : 'Click để xem nội dung'}
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default ContentGroupCard
