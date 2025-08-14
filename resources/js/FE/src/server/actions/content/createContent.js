'use server'

import { apiCreateContent } from '@/services/content/ContentService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

const createContent = async (data) => {
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

            if (!data.content_group_id) {
                return {
                    success: false,
                    message: 'Vui lòng chọn nhóm content'
                }
            }

            const response = await apiCreateContent(data)
            
            revalidatePath('/concepts/content-management')
            
            return {
                success: true,
                data: response,
                message: 'Tạo content thành công'
            }
        } catch (error) {
            console.error('Error creating content:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi tạo content'
            }
        }
    })
}

export default createContent
