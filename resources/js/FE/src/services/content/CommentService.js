import ApiService from '../ApiService'

/**
 * Comment Service for managing comments through Content API
 * Comments are stored as content with specific structure
 */

// Comment content structure:
// {
//   title: "Comment for {group_name}",
//   content: {
//     type: "comment",
//     text: "Comment text here",
//     group_type: "entertainment|education|lifestyle",
//     created_at: "2024-01-01T00:00:00Z"
//   }
// }

/**
 * Get all comment groups (content groups that contain comments)
 */
export const apiGetCommentGroups = async () => {
    try {
        const response = await ApiService.fetchDataWithAxios({
            url: '/content-groups',
            method: 'get',
            params: {
                per_page: 100, // Get all groups
                sort: 'name'
            }
        })
        return response
    } catch (error) {
        console.error('Error fetching comment groups:', error)
        throw error
    }
}

/**
 * Get comments by group ID
 * @param {number} groupId - Content group ID
 */
export const apiGetCommentsByGroup = async (groupId) => {
    try {
        const response = await ApiService.fetchDataWithAxios({
            url: `/content-groups/${groupId}/contents`,
            method: 'get',
            params: {
                per_page: 100,
                sort: '-created_at'
            }
        })
        
        // Filter only comment-type contents
        const comments = response.data?.filter(content => 
            content.content?.type === 'comment'
        ) || []
        
        return {
            ...response,
            data: comments
        }
    } catch (error) {
        console.error('Error fetching comments by group:', error)
        throw error
    }
}

/**
 * Create a new comment in a specific group
 * @param {number} contentGroupId - Content group ID
 * @param {string} commentText - Comment text
 * @param {string} groupType - Group type (entertainment, education, lifestyle)
 */
export const apiCreateComment = async (contentGroupId, commentText, groupType = 'general') => {
    try {
        const response = await ApiService.fetchDataWithAxios({
            url: '/contents',
            method: 'post',
            data: {
                content_group_id: contentGroupId,
                title: `Comment for group ${contentGroupId}`,
                content: {
                    type: 'comment',
                    text: commentText,
                    group_type: groupType,
                    created_at: new Date().toISOString()
                }
            }
        })
        return response
    } catch (error) {
        console.error('Error creating comment:', error)
        throw error
    }
}

/**
 * Update a comment
 * @param {number} commentId - Comment content ID
 * @param {string} commentText - New comment text
 */
export const apiUpdateComment = async (commentId, commentText) => {
    try {
        const response = await ApiService.fetchDataWithAxios({
            url: `/contents/${commentId}`,
            method: 'put',
            data: {
                content: {
                    type: 'comment',
                    text: commentText,
                    updated_at: new Date().toISOString()
                }
            }
        })
        return response
    } catch (error) {
        console.error('Error updating comment:', error)
        throw error
    }
}

/**
 * Delete a comment
 * @param {number} commentId - Comment content ID
 */
export const apiDeleteComment = async (commentId) => {
    try {
        const response = await ApiService.fetchDataWithAxios({
            url: `/contents/${commentId}`,
            method: 'delete'
        })
        return response
    } catch (error) {
        console.error('Error deleting comment:', error)
        throw error
    }
}

/**
 * Delete multiple comments
 * @param {number[]} commentIds - Array of comment content IDs
 */
export const apiDeleteMultipleComments = async (commentIds) => {
    try {
        const response = await ApiService.fetchDataWithAxios({
            url: '/contents/bulk-delete',
            method: 'post',
            data: {
                ids: commentIds
            }
        })
        return response
    } catch (error) {
        console.error('Error deleting multiple comments:', error)
        throw error
    }
}

/**
 * Get all comments across all groups (for statistics)
 */
export const apiGetAllComments = async () => {
    try {
        const response = await ApiService.fetchDataWithAxios({
            url: '/contents',
            method: 'get',
            params: {
                per_page: 1000,
                sort: '-created_at'
            }
        })
        
        // Filter only comment-type contents
        const comments = response.data?.filter(content => 
            content.content?.type === 'comment'
        ) || []
        
        return {
            ...response,
            data: comments
        }
    } catch (error) {
        console.error('Error fetching all comments:', error)
        throw error
    }
}

/**
 * Create a new content group for comments
 * @param {string} groupName - Group name
 */
export const apiCreateCommentGroup = async (groupName) => {
    try {
        const response = await ApiService.fetchDataWithAxios({
            url: '/content-groups',
            method: 'post',
            data: {
                name: groupName
            }
        })
        return response
    } catch (error) {
        console.error('Error creating comment group:', error)
        throw error
    }
}

/**
 * Delete a content group and all its comments
 * @param {number} groupId - Content group ID
 */
export const apiDeleteCommentGroup = async (groupId) => {
    try {
        const response = await ApiService.fetchDataWithAxios({
            url: `/content-groups/${groupId}`,
            method: 'delete'
        })
        return response
    } catch (error) {
        console.error('Error deleting comment group:', error)
        throw error
    }
}

/**
 * Helper function to extract comment text from content structure
 * @param {Object} content - Content object
 * @returns {string} - Comment text
 */
export const extractCommentText = (content) => {
    if (content?.content?.type === 'comment') {
        return content.content.text || ''
    }
    return ''
}

/**
 * Helper function to get group type from content
 * @param {Object} content - Content object
 * @returns {string} - Group type
 */
export const getCommentGroupType = (content) => {
    if (content?.content?.type === 'comment') {
        return content.content.group_type || 'general'
    }
    return 'general'
}
