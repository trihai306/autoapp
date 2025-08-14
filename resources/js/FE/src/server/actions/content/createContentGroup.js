'use server'

import { apiCreateContentGroup } from '@/services/content/ContentGroupService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

const createContentGroup = async (data) => {
    return withAuthCheck(async () => {
        try {
            if (!data.name || !data.name.trim()) {
                return {
                    success: false,
                    message: 'Tên nhóm content không được để trống'
                }
            }

            const response = await apiCreateContentGroup(data)
            
            revalidatePath('/concepts/content-management')
            
            return {
                success: true,
                data: response,
                message: 'Tạo nhóm content thành công'
            }
        } catch (error) {
            console.error('Error creating content group:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi tạo nhóm content'
            }
        }
    })
}

export default createContentGroup
