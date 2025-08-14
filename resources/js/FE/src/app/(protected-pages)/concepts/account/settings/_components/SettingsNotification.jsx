'use client'
import { useState } from 'react'
import Checkbox from '@/components/ui/Checkbox'
import Radio from '@/components/ui/Radio'
import Switcher from '@/components/ui/Switcher'
import { updateSettingsAction } from '@/server/actions/setting/settingsActions'
import cloneDeep from 'lodash/cloneDeep'
import { TbMessageCircleCheck } from 'react-icons/tb'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useTranslations } from 'next-intl'

const SettingsNotification = ({ data }) => {
    const t = useTranslations('account.settings.notification')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const emailNotificationOption = [
        {
            label: t('newsAndUpdate'),
            value: 'newsAndUpdate',
            desc: t('newsAndUpdateDescription'),
        },
        {
            label: t('tipsAndTutorial'),
            value: 'tipsAndTutorial',
            desc: t('tipsAndTutorialDescription'),
        },
        {
            label: t('offerAndPromotion'),
            value: 'offerAndPromotion',
            desc: t('offerAndPromotionDescription'),
        },
        {
            label: t('followUpReminder'),
            value: 'followUpReminder',
            desc: t('followUpReminderDescription'),
        },
    ]
    
    const notifyMeOption = [
        {
            label: t('allNewMessages'),
            value: 'allNewMessage',
            desc: t('allNewMessagesDescription'),
        },
        {
            label: t('mentionsOnly'),
            value: 'mentionsOnly',
            desc: t('mentionsOnlyDescription'),
        },
        {
            label: t('nothing'),
            value: 'nothing',
            desc: t('nothingDescription'),
        },
    ]
    
    const updateSettings = async (newData) => {
        setIsSubmitting(true)
        try {
            const result = await updateSettingsAction(newData)

            if (result.success) {
                toast.push(
                    <Notification type="success">
                        Settings updated successfully.
                    </Notification>,
                )
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            console.error('Update settings error:', error)
            toast.push(
                <Notification title="Error" type="danger">
                    {error.message || 'Failed to update settings.'}
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEmailNotificationOptionChange = (values) => {
        const newData = cloneDeep(data)
        newData.email = values
        updateSettings(newData)
    }

    const handleEmailNotificationOptionCheckAll = (value) => {
        const newData = cloneDeep(data)
        if (value) {
            newData.email = [
                'newsAndUpdate',
                'tipsAndTutorial',
                'offerAndPromotion',
                'followUpReminder',
            ]
        } else {
            newData.email = []
        }

        updateSettings(newData)
    }

    const handleDesktopNotificationCheck = (value) => {
        const newData = cloneDeep(data)
        newData.desktop = value
        updateSettings(newData)
    }

    const handleUnreadMessagebadgeCheck = (value) => {
        const newData = cloneDeep(data)
        newData.unreadMessageBadge = value
        updateSettings(newData)
    }

    const handleNotifyMeChange = (value) => {
        const newData = cloneDeep(data)
        newData.notifymeAbout = value
        updateSettings(newData)
    }

    if (!data) {
        return <div>Loading...</div>
    }

    const settingsData = data || {}

    return (
        <div>
            <h4>{t('title')}</h4>
            <div className="mt-2">
                <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-600">
                    <div>
                        <h5>{t('enableDesktopNotification')}</h5>
                        <p>
                            {t('desktopNotificationDescription')}
                        </p>
                    </div>
                    <div>
                        <Switcher
                            isLoading={isSubmitting}
                            checked={settingsData.desktop}
                            onChange={handleDesktopNotificationCheck}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-600">
                    <div>
                        <h5>{t('enableUnreadNotificationBadge')}</h5>
                        <p>
                            {t('unreadNotificationBadgeDescription')}
                        </p>
                    </div>
                    <div>
                        <Switcher
                            isLoading={isSubmitting}
                            checked={settingsData.unreadMessageBadge}
                            onChange={handleUnreadMessagebadgeCheck}
                        />
                    </div>
                </div>
                <div className="py-6 border-b border-gray-200 dark:border-gray-600">
                    <h5>{t('notifyMeAbout')}</h5>
                    <div className="mt-4">
                        <Radio.Group
                            vertical
                            className="flex flex-col gap-6"
                            value={settingsData.notifymeAbout}
                            onChange={handleNotifyMeChange}
                        >
                            {notifyMeOption.map((option) => (
                                <div key={option.value} className="flex gap-4">
                                    <div className="mt-1.5">
                                        <Radio value={option.value} />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="mt-1">
                                            <TbMessageCircleCheck className="text-lg" />
                                        </div>
                                        <div>
                                            <h6>{option.label}</h6>
                                            <p>{option.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Radio.Group>
                    </div>
                </div>
                <div className="flex items-center justify-between py-6">
                    <div>
                        <h5>{t('emailNotification')}</h5>
                        <p>
                           {t('emailNotificationDescription')}
                        </p>
                    </div>
                    <div>
                        <Switcher
                            isLoading={isSubmitting}
                            checked={
                                settingsData.email &&
                                settingsData.email.length > 0
                            }
                            onChange={handleEmailNotificationOptionCheckAll}
                        />
                    </div>
                </div>
                <Checkbox.Group
                    vertical
                    className="flex flex-col gap-6"
                    value={settingsData.email}
                    onChange={handleEmailNotificationOptionChange}
                >
                    {emailNotificationOption.map((option) => (
                        <div key={option.value} className="flex gap-4">
                            <div className="mt-1.5">
                                <Checkbox value={option.value} />
                            </div>
                            <div>
                                <h6>{option.label}</h6>
                                <p>{option.desc}</p>
                            </div>
                        </div>
                    ))}
                </Checkbox.Group>
            </div>
        </div>
    )
}

export default SettingsNotification
