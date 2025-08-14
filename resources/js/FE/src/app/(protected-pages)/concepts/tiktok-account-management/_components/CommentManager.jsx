'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Select, Card } from '@/components/ui'
import { HiOutlinePlus, HiOutlineTrash, HiOutlineDocumentText, HiOutlineFolder, HiOutlineCog } from 'react-icons/hi'
import { toast } from 'react-hot-toast'
import GroupCommentManager from './GroupCommentManager'
import { 
    apiGetCommentGroups, 
    apiGetCommentsByGroup, 
    extractCommentText 
} from '@/services/content/CommentService'

const CommentManager = ({ 
    selectedContentGroup, 
    selectedContentTopic, 
    commentContents = [], 
    onCommentContentsChange,
    contentGroupOptions = [],
    contentTopicOptions = []
}) => {
    const [localComments, setLocalComments] = useState(commentContents)
    const [newComment, setNewComment] = useState('')
    const [isAddingComment, setIsAddingComment] = useState(false)
    const [isGroupManagerOpen, setIsGroupManagerOpen] = useState(false)
    const [groupComments, setGroupComments] = useState({})
    const [contentGroups, setContentGroups] = useState([])
    const [isLoadingGroupComments, setIsLoadingGroupComments] = useState(false)

    // Sync with parent when commentContents changes
    useEffect(() => {
        setLocalComments(commentContents)
    }, [commentContents])

    // Load content groups on mount
    useEffect(() => {
        loadContentGroups()
    }, [])

    // Load group comments when selectedContentGroup changes
    useEffect(() => {
        if (selectedContentGroup) {
            loadGroupComments(selectedContentGroup)
        }
    }, [selectedContentGroup])

    const loadContentGroups = async () => {
        try {
            const response = await apiGetCommentGroups()
            setContentGroups(response.data || [])
        } catch (error) {
            console.error('Error loading content groups:', error)
            toast.error('Không thể tải danh sách nhóm content')
        }
    }

    const loadGroupComments = async (groupId) => {
        if (!groupId) return
        
        setIsLoadingGroupComments(true)
        try {
            const response = await apiGetCommentsByGroup(groupId)
            const comments = response.data?.map(content => extractCommentText(content)).filter(Boolean) || []
            
            setGroupComments(prev => ({
                ...prev,
                [groupId]: comments
            }))
        } catch (error) {
            console.error('Error loading group comments:', error)
            toast.error('Không thể tải comments từ nhóm')
        } finally {
            setIsLoadingGroupComments(false)
        }
    }

    const handleAddComment = () => {
        if (!newComment.trim()) {
            toast.error('Vui lòng nhập nội dung comment')
            return
        }

        const updatedComments = [...localComments, newComment.trim()]
        setLocalComments(updatedComments)
        onCommentContentsChange(updatedComments)
        setNewComment('')
        setIsAddingComment(false)
        toast.success('Đã thêm comment')
    }

    const handleDeleteComment = (index) => {
        const updatedComments = localComments.filter((_, i) => i !== index)
        setLocalComments(updatedComments)
        onCommentContentsChange(updatedComments)
        toast.success('Đã xóa comment')
    }

    const handleAddFromGroup = (comment) => {
        if (localComments.includes(comment)) {
            toast.error('Comment này đã tồn tại')
            return
        }

        const updatedComments = [...localComments, comment]
        setLocalComments(updatedComments)
        onCommentContentsChange(updatedComments)
        toast.success('Đã thêm comment từ nhóm')
    }

    const handleClearAllComments = () => {
        if (localComments.length === 0) {
            toast.error('Không có comment nào để xóa')
            return
        }

        if (confirm('Bạn có chắc chắn muốn xóa tất cả comments?')) {
            setLocalComments([])
            onCommentContentsChange([])
            toast.success('Đã xóa tất cả comments')
        }
    }

    const getGroupCommentsForSelected = () => {
        if (!selectedContentGroup || !groupComments[selectedContentGroup]) {
            return []
        }
        return groupComments[selectedContentGroup]
    }

    const getSelectedGroupName = () => {
        if (!selectedContentGroup) return ''
        
        // First try to find from contentGroupOptions (passed from parent)
        const fromOptions = contentGroupOptions.find(opt => opt.value === selectedContentGroup)
        if (fromOptions) return fromOptions.label
        
        // Then try to find from loaded contentGroups
        const fromGroups = contentGroups.find(group => group.id.toString() === selectedContentGroup.toString())
        if (fromGroups) return fromGroups.name
        
        return `Nhóm ${selectedContentGroup}`
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HiOutlineDocumentText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        Quản lý Comments ({localComments.length})
                    </h4>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="default"
                        onClick={() => setIsGroupManagerOpen(true)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                        <HiOutlineCog className="w-4 h-4 mr-1" />
                        Quản lý nhóm
                    </Button>
                    {localComments.length > 0 && (
                        <Button
                            size="sm"
                            variant="default"
                            onClick={handleClearAllComments}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <HiOutlineTrash className="w-4 h-4 mr-1" />
                            Xóa tất cả
                        </Button>
                    )}
                </div>
            </div>

            {/* Add new comment */}
            <Card className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-dashed border-2 border-gray-300 dark:border-gray-600">
                {!isAddingComment ? (
                    <Button
                        variant="default"
                        onClick={() => setIsAddingComment(true)}
                        className="w-full justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                        <HiOutlinePlus className="w-4 h-4 mr-2" />
                        Thêm comment mới
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <Input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Nhập nội dung comment..."
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddComment()
                                }
                            }}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="solid"
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                            >
                                Thêm
                            </Button>
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                    setIsAddingComment(false)
                                    setNewComment('')
                                }}
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Current comments list */}
            {localComments.length > 0 && (
                <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Comments đã thêm:
                    </h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {localComments.map((comment, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                            >
                                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 mr-3">
                                    {comment}
                                </span>
                                <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleDeleteComment(index)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <HiOutlineTrash className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Group comments suggestions */}
            {selectedContentGroup && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <HiOutlineFolder className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Comments từ nhóm "{getSelectedGroupName()}":
                        </h5>
                        {isLoadingGroupComments && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        )}
                    </div>
                    
                    {isLoadingGroupComments ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            <div className="animate-pulse">Đang tải comments...</div>
                        </div>
                    ) : getGroupCommentsForSelected().length > 0 ? (
                        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                            {getGroupCommentsForSelected().map((comment, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50 group hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                >
                                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 mr-3">
                                        {comment}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => handleAddFromGroup(comment)}
                                        disabled={localComments.includes(comment)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <HiOutlinePlus className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                            Nhóm này chưa có comment nào
                        </div>
                    )}
                </div>
            )}

            {/* Empty state */}
            {localComments.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <HiOutlineDocumentText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                        Chưa có comment nào. Thêm comment để bắt đầu!
                    </p>
                </div>
            )}

            {/* Group Comment Manager Modal */}
            <GroupCommentManager
                isOpen={isGroupManagerOpen}
                onClose={() => setIsGroupManagerOpen(false)}
            />
        </div>
    )
}

export default CommentManager
