'use client'

import { useState } from 'react'
import { Card, Button, Dropdown } from '@/components/ui'
import { HiOutlineDotsVertical, HiOutlinePencil, HiOutlineTrash, HiOutlineFolder, HiOutlineDocumentText } from 'react-icons/hi'
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

    return (
        <Card
            className={`group cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                    ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={handleCardClick}
        >
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-lg ${
                            isSelected 
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300' 
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                            <HiOutlineFolder className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white text-base mb-1">
                                {group.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {group.id}
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

                {/* Content Count */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                            <HiOutlineDocumentText className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                {group.contents_count || 0}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                content{(group.contents_count || 0) !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                    
                    {/* Status badge */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (group.contents_count || 0) > 0
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                        {(group.contents_count || 0) > 0 ? 'Có nội dung' : 'Trống'}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Tạo: {new Date(group.created_at).toLocaleDateString('vi-VN')}
                    </div>
                    
                    <div className={`text-xs font-medium ${
                        isSelected 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-500 dark:text-gray-400'
                    }`}>
                        {isSelected ? 'Đang xem' : 'Click để xem'}
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default ContentGroupCard
