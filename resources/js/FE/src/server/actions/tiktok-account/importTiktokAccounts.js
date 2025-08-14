'use server'

import { apiImportTiktokAccounts } from '@/services/tiktok-account/TiktokAccountService'
import { revalidatePath } from 'next/cache'
import { withAuthCheck } from '@/utils/withAuthCheck'

const importTiktokAccounts = async (data) => {
    return withAuthCheck(async () => {
        try {

            
            // Kiểm tra accountList có dữ liệu không
            if (!data.accountList || !data.accountList.trim()) {
                return {
                    success: false,
                    message: 'Danh sách tài khoản không được để trống'
                }
            }

            // Chuẩn bị data để gửi API
            const importData = {
                accountList: data.accountList,
                enableRunningStatus: data.enableRunningStatus,
                autoAssign: data.autoAssign,
                format: data.format,
            }

            // Chỉ thêm deviceId và scenarioId nếu có giá trị
            if (data.deviceId && data.deviceId.trim()) {
                importData.deviceId = String(data.deviceId)
            }
            if (data.scenarioId && data.scenarioId.trim()) {
                importData.scenarioId = String(data.scenarioId)
            }


            const response = await apiImportTiktokAccounts(importData)

            
            revalidatePath('/concepts/tiktok-account-management')
            
            return {
                success: response?.success ?? false,
                message: response?.message || (response?.success ? 'Đã nhập thành công' : 'Nhập tài khoản thất bại'),
                data: response?.data ?? null
            }
        } catch (error) {
            console.error('Error importing TikTok accounts:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi nhập tài khoản'
            }
        }
    })
}

export default importTiktokAccounts 