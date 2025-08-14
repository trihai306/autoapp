'use server'

import { apiUpdateContentGroup } from '@/services/content/ContentGroupService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

const updateContentGroup = async (id, data) => {
    return withAuthCheck(async () => {
        try {
            if (!data.name || !data.name.trim()) {
                return {
                    success: false,
                    message: 'Tên nhóm content không được để trống'
                }
            }

            const response = await apiUpdateContentGroup(id, data)
            
            revalidatePath('/concepts/content-management')
            
            return {
                success: true,
                data: response,
                message: 'Cập nhật nhóm content thành công'
            }
        } catch (error) {
            console.error('Error updating content group:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật nhóm content'
            }
        }
    })
}

export default updateContentGroup
