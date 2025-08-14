'use server'

import { apiDeleteContents } from '@/services/content/ContentService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

const deleteContents = async (ids) => {
    return withAuthCheck(async () => {
        try {
            if (!ids || ids.length === 0) {
                return {
                    success: false,
                    message: 'Không có content nào được chọn để xóa'
                }
            }

            const response = await apiDeleteContents({ ids })
            
            revalidatePath('/concepts/content-management')
            
            return {
                success: true,
                data: response,
                message: `Đã xóa ${ids.length} content thành công`
            }
        } catch (error) {
            console.error('Error deleting contents:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi xóa content'
            }
        }
    })
}

export default deleteContents
