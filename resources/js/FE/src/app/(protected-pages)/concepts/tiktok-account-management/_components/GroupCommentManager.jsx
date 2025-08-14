'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Select, Card, Dialog } from '@/components/ui'
import { HiOutlinePlus, HiOutlineTrash, HiOutlineFolder, HiOutlinePencil, HiOutlineEye } from 'react-icons/hi'
import { toast } from 'react-hot-toast'
import { 
    apiGetCommentGroups, 
    apiGetCommentsByGroup, 
    apiCreateComment, 
    apiUpdateComment, 
    apiDeleteComment,
    apiDeleteMultipleComments,
    extractCommentText 
} from '@/services/content/CommentService'

const GroupCommentManager = ({ isOpen, onClose }) => {
    const [groupComments, setGroupComments] = useState({})
    const [contentGroups, setContentGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [newComment, setNewComment] = useState('')
    const [editingIndex, setEditingIndex] = useState(null)
    const [editingComment, setEditingComment] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingComments, setIsLoadingComments] = useState(false)

    // Load content groups on mount
    useEffect(() => {
        if (isOpen) {
            loadContentGroups()
        }
    }, [isOpen])

    // Load comments when selected group changes
    useEffect(() => {
        if (selectedGroup) {
            loadGroupComments(selectedGroup.id)
        }
    }, [selectedGroup])

    const loadContentGroups = async () => {
        setIsLoading(true)
        try {
            const response = await apiGetCommentGroups()
            const groups = response.data || []
            setContentGroups(groups)
            
            // Auto-select first group if available
            if (groups.length > 0 && !selectedGroup) {
                setSelectedGroup(groups[0])
            }
        } catch (error) {
            console.error('Error loading content groups:', error)
            toast.error('Không thể tải danh sách nhóm content')
        } finally {
            setIsLoading(false)
        }
    }

    const loadGroupComments = async (groupId) => {
        setIsLoadingComments(true)
        try {
            const response = await apiGetCommentsByGroup(groupId)
            const comments = response.data || []
            
            setGroupComments(prev => ({
                ...prev,
                [groupId]: comments
            }))
        } catch (error) {
            console.error('Error loading group comments:', error)
            toast.error('Không thể tải comments từ nhóm')
        } finally {
            setIsLoadingComments(false)
        }
    }

    const contentGroupOptions = contentGroups.map(group => ({
        value: group.id,
        label: group.name
    }))

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast.error('Vui lòng nhập nội dung comment')
            return
        }

        if (!selectedGroup) {
            toast.error('Vui lòng chọn nhóm')
            return
        }

        // Check if comment already exists
        const currentComments = getCurrentGroupComments()
        const existingComment = currentComments.find(comment => 
            extractCommentText(comment) === newComment.trim()
        )
        
        if (existingComment) {
            toast.error('Comment này đã tồn tại trong nhóm')
            return
        }

        try {
            await apiCreateComment(selectedGroup.id, newComment.trim(), 'general')
            setNewComment('')
            toast.success('Đã thêm comment vào nhóm')
            
            // Reload comments
            loadGroupComments(selectedGroup.id)
        } catch (error) {
            console.error('Error adding comment:', error)
            toast.error('Không thể thêm comment')
        }
    }

    const handleDeleteComment = async (index) => {
        if (!confirm('Bạn có chắc chắn muốn xóa comment này?')) {
            return
        }

        const currentComments = getCurrentGroupComments()
        const commentToDelete = currentComments[index]
        
        if (!commentToDelete) {
            toast.error('Không tìm thấy comment')
            return
        }

        try {
            await apiDeleteComment(commentToDelete.id)
            toast.success('Đã xóa comment')
            
            // Reload comments
            loadGroupComments(selectedGroup.id)
        } catch (error) {
            console.error('Error deleting comment:', error)
            toast.error('Không thể xóa comment')
        }
    }

    const handleEditComment = (index) => {
        const currentComments = getCurrentGroupComments()
        const commentToEdit = currentComments[index]
        
        setEditingIndex(index)
        setEditingComment(extractCommentText(commentToEdit))
    }

    const handleSaveEdit = async () => {
        if (!editingComment.trim()) {
            toast.error('Vui lòng nhập nội dung comment')
            return
        }

        const currentComments = getCurrentGroupComments()
        const commentToUpdate = currentComments[editingIndex]
        
        if (!commentToUpdate) {
            toast.error('Không tìm thấy comment')
            return
        }

        try {
            await apiUpdateComment(commentToUpdate.id, editingComment.trim())
            setEditingIndex(null)
            setEditingComment('')
            toast.success('Đã cập nhật comment')
            
            // Reload comments
            loadGroupComments(selectedGroup.id)
        } catch (error) {
            console.error('Error updating comment:', error)
            toast.error('Không thể cập nhật comment')
        }
    }

    const handleCancelEdit = () => {
        setEditingIndex(null)
        setEditingComment('')
    }

    const handleClearGroup = async () => {
        const currentComments = getCurrentGroupComments()
        
        if (!currentComments.length) {
            toast.error('Nhóm này không có comment nào')
            return
        }

        if (!confirm(`Bạn có chắc chắn muốn xóa tất cả comments trong nhóm "${selectedGroup?.name}"?`)) {
            return
        }

        try {
            const commentIds = currentComments.map(comment => comment.id)
            await apiDeleteMultipleComments(commentIds)
            toast.success('Đã xóa tất cả comments trong nhóm')
            
            // Reload comments
            loadGroupComments(selectedGroup.id)
        } catch (error) {
            console.error('Error clearing group comments:', error)
            toast.error('Không thể xóa comments')
        }
    }

    const getCurrentGroupComments = () => {
        if (!selectedGroup) return []
        return groupComments[selectedGroup.id] || []
    }

    const getTotalCommentsCount = () => {
        return Object.values(groupComments).reduce((total, comments) => total + comments.length, 0)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} className="max-w-4xl">
            <div className="flex flex-col h-[80vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg">
                                <HiOutlineFolder className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Quản lý Group Comments
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Tổng cộng {getTotalCommentsCount()} comments trong {Object.keys(groupComments).length} nhóm
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="default"
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    <div className="p-6 h-full flex flex-col">
                        {/* Group selector and stats */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-48">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Chọn nhóm nội dung
                                    </label>
                                    <Select
                                        instanceId="group-comment-manager-select"
                                        value={contentGroupOptions.find(opt => opt.value === selectedGroup?.id)}
                                        onChange={(option) => {
                                            const group = contentGroups.find(g => g.id === option?.value)
                                            setSelectedGroup(group || null)
                                        }}
                                        options={contentGroupOptions}
                                        isLoading={isLoading}
                                        placeholder="Chọn nhóm..."
                                    />
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {getCurrentGroupComments().length}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        comments
                                    </div>
                                </div>
                            </div>
                            {getCurrentGroupComments().length > 0 && (
                                <Button
                                    variant="default"
                                    onClick={handleClearGroup}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <HiOutlineTrash className="w-4 h-4 mr-2" />
                                    Xóa tất cả
                                </Button>
                            )}
                        </div>

                        {/* Add new comment */}
                        <Card className="p-4 mb-6 bg-gray-50/50 dark:bg-gray-800/50 border-dashed border-2 border-gray-300 dark:border-gray-600">
                            <div className="flex gap-3">
                                <Input
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={`Thêm comment mới vào nhóm "${selectedGroup?.name || 'đã chọn'}"...`}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddComment()
                                        }
                                    }}
                                    className="flex-1"
                                />
                                <Button
                                    variant="solid"
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                >
                                    <HiOutlinePlus className="w-4 h-4 mr-2" />
                                    Thêm
                                </Button>
                            </div>
                        </Card>

                        {/* Comments list */}
                        <div className="flex-1 overflow-hidden">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Comments trong nhóm "{selectedGroup?.name || 'đã chọn'}"
                                {isLoadingComments && (
                                    <span className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 inline-block"></span>
                                )}
                            </h3>
                            
                            {isLoadingComments ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <div className="animate-pulse">Đang tải comments...</div>
                                </div>
                            ) : getCurrentGroupComments().length > 0 ? (
                                <div className="space-y-3 overflow-y-auto h-full pr-2">
                                    {getCurrentGroupComments().map((comment, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                                        >
                                            {editingIndex === index ? (
                                                <div className="flex-1 flex items-center gap-3">
                                                    <Input
                                                        value={editingComment}
                                                        onChange={(e) => setEditingComment(e.target.value)}
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleSaveEdit()
                                                            } else if (e.key === 'Escape') {
                                                                handleCancelEdit()
                                                            }
                                                        }}
                                                        className="flex-1"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="solid"
                                                            onClick={handleSaveEdit}
                                                            disabled={!editingComment.trim()}
                                                        >
                                                            Lưu
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            Hủy
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-8">
                                                            #{index + 1}
                                                        </span>
                                                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                                                            {extractCommentText(comment)}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => handleEditComment(index)}
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                        >
                                                            <HiOutlinePencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => handleDeleteComment(index)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        >
                                                            <HiOutlineTrash className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <HiOutlineFolder className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium mb-2">
                                            Nhóm này chưa có comment nào
                                        </p>
                                        <p className="text-sm">
                                            Thêm comment đầu tiên để bắt đầu!
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            💡 Tip: Nhấn Enter để thêm comment nhanh, ESC để hủy chỉnh sửa
                        </div>
                        <Button
                            variant="solid"
                            onClick={onClose}
                        >
                            Đóng
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default GroupCommentManager
