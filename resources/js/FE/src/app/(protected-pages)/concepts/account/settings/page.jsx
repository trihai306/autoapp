// resources/js/FE/src/app/(protected-pages)/concepts/account/settings/page.jsx
import Settings from './_components/Settings'
import getProfile from '@/server/actions/auth/getProfile'
import getSettings from '@/server/actions/setting/getSettings'
import getSettingsBilling from '@/server/actions/account/getSettingsBilling'
import getUserTransactions from '@/server/actions/transaction/getUserTransactions'
import getNotifications from '@/server/actions/notification/getNotifications'

const Page = async () => {
    // Fetch all necessary data in parallel using server actions
    const [
        profileResponse, 
        settingsResponse, 
        billingResponse, 
        transactionResponse, 
        notificationResponse
    ] = await Promise.all([
        getProfile(),
        getSettings(),
        getSettingsBilling(),
        getUserTransactions({ page: 1, per_page: 10 }), // Default params
        getNotifications({ page: 1, per_page: 5 }) // Default params
    ]);

    // Pass the data to the client component
    // The client component will handle the case where data might be missing due to errors
    return (
        <Settings
            profileData={profileResponse.data}
            settingsData={settingsResponse.data}
            billingData={billingResponse.data}
            transactionData={transactionResponse}
            notificationData={notificationResponse.data}
        />
    )
}

export default Page
