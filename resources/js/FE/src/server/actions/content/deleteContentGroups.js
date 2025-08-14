'use server'

import { apiDeleteContentGroups } from '@/services/content/ContentGroupService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

const deleteContentGroups = async (ids) => {
    return withAuthCheck(async () => {
        try {
            if (!ids || ids.length === 0) {
                return {
                    success: false,
                    message: 'Không có nhóm content nào được chọn để xóa'
                }
            }

            const response = await apiDeleteContentGroups({ ids })
            
            revalidatePath('/concepts/content-management')
            
            return {
                success: true,
                data: response,
                message: `Đã xóa ${ids.length} nhóm content thành công`
            }
        } catch (error) {
            console.error('Error deleting content groups:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi xóa nhóm content'
            }
        }
    })
}

export default deleteContentGroups
