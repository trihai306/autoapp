'use server'

import { apiGetContentGroups } from '@/services/content/ContentGroupService'
import { withAuthCheck } from '@/utils/withAuthCheck'

const getContentGroups = async (params = {}) => {
    return withAuthCheck(async () => {
        try {
            const response = await apiGetContentGroups(params)
            
            return {
                success: true,
                data: response,
                message: 'Lấy danh sách content groups thành công'
            }
        } catch (error) {
            console.error('Error fetching content groups:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách content groups',
                data: null
            }
        }
    })
}

export default getContentGroups
