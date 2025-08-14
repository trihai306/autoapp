'use server'

import { apiGetContentsByGroup } from '@/services/content/ContentService'
import { withAuthCheck } from '@/utils/withAuthCheck'

const getContentsByGroup = async (groupId, params = {}) => {
    return withAuthCheck(async () => {
        try {
            if (!groupId) {
                return {
                    success: false,
                    message: 'ID nhóm content không hợp lệ',
                    data: []
                }
            }

            const response = await apiGetContentsByGroup(groupId, params)
            
            return {
                success: true,
                data: response,
                message: 'Lấy danh sách contents thành công'
            }
        } catch (error) {
            console.error('Error fetching contents by group:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách contents',
                data: []
            }
        }
    })
}

export default getContentsByGroup
