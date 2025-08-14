'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import SettingsMenu from './SettingsMenu'
import SettingMobileMenu from './SettingMobileMenu'
import Profile from './SettingsProfile'
import Security from './SettingsSecurity'
import Notification from './SettingsNotification'
import Billing from './SettingsBilling'
import NotificationList from './SettingsNotificationList'
import { useSettingsStore } from '../_store/settingsStore'

const Settings = ({ profileData, settingsData, billingData, transactionData, notificationData }) => {
    const { currentView } = useSettingsStore()

    return (
        <AdaptiveCard className="h-full">
            <div className="flex flex-auto h-full">
                <div className="w-[200px] xl:w-[280px] hidden lg:block">
                    <SettingsMenu />
                </div>
                <div className="xl:ltr:pl-6 xl:rtl:pr-6 flex-1 py-2">
                    <div className="mb-6 lg:hidden">
                        <SettingMobileMenu />
                    </div>
                    <div>
                        {currentView === 'profile' && <Profile data={profileData} />}
                        {currentView === 'security' && <Security />}
                        {currentView === 'notification' && <Notification data={settingsData} />}
                        {currentView === 'notificationList' && <NotificationList data={notificationData} />}
                        {currentView === 'billing' && <Billing billingData={billingData} transactionData={transactionData} />}
                    </div>
                </div>
            </div>
        </AdaptiveCard>
    )
}

export default Settings
