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
            className={`group cursor-pointer transition-all duration-500 ease-out hover:shadow-lg transform hover:-translate-y-2 hover:scale-[1.01] ${
                isSelected 
                    ? 'ring-1 ring-gray-300 dark:ring-gray-600 shadow-md bg-gradient-to-br from-gray-50/80 via-white to-gray-50/80 dark:from-gray-800/80 dark:via-gray-700/50 dark:to-gray-800/80 scale-[1.01] -translate-y-1 border-gray-300/50 dark:border-gray-600/50' 
                    : 'hover:shadow-md border-gray-200/80 dark:border-gray-700/80 hover:border-gray-300/60 dark:hover:border-gray-600/60'
            } ${isDeleting ? 'opacity-50 pointer-events-none animate-pulse' : ''} 
            relative overflow-hidden bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-900`}
            onClick={handleCardClick}
        >
            {/* Gradient overlay for selected state */}
            {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
            )}
            
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl transition-all duration-300 ${
                            isSelected 
                                ? 'bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 text-white shadow-sm' 
                                : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300 group-hover:from-gray-200 group-hover:to-gray-300 dark:group-hover:from-gray-600 dark:group-hover:to-gray-700 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                        }`}>
                            <HiOutlineFolder className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors duration-300">
                                {group.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
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

                {/* Content Count with enhanced styling */}
                                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg transition-all duration-300 ${
                                isSelected 
                                    ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                            }`}>
                                <HiOutlineDocumentText className="w-4 h-4" />
                            </div>
                        <div>
                            <span className={`text-2xl font-bold transition-colors duration-300 ${
                                isSelected 
                                    ? 'text-gray-800 dark:text-gray-100' 
                                    : 'text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100'
                            }`}>
                                {group.contents_count || 0}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                content{(group.contents_count || 0) !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                    
                    {/* Status badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                        (group.contents_count || 0) > 0
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                        {(group.contents_count || 0) > 0 ? 'Có nội dung' : 'Trống'}
                    </div>
                </div>

                {/* Footer with enhanced design */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <span>
                            Tạo: {new Date(group.created_at).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                    {isSelected && (
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <span className="text-primary font-semibold text-xs">
                                Đang xem
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

export default ContentGroupCard
