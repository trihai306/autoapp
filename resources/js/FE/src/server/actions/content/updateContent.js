'use server'

import { apiUpdateContent } from '@/services/content/ContentService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

const updateContent = async (id, data) => {
    return withAuthCheck(async () => {
        try {
            if (!data.title || !data.title.trim()) {
                return {
                    success: false,
                    message: 'Tiêu đề content không được để trống'
                }
            }

            if (!data.content || !data.content.trim()) {
                return {
                    success: false,
                    message: 'Nội dung content không được để trống'
                }
            }

            const response = await apiUpdateContent(id, data)
            
            revalidatePath('/concepts/content-management')
            
            return {
                success: true,
                data: response,
                message: 'Cập nhật content thành công'
            }
        } catch (error) {
            console.error('Error updating content:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật content'
            }
        }
    })
}

export default updateContent
