'use client'
import { useState } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Loading from '@/components/shared/Loading'
import NotificationItem from './NotificationItem'
import NotificationAction from './NotificationAction'
import getNotifications from '@/server/actions/notification/getNotifications'
import { useTranslations } from 'next-intl'
import { useNotification } from '../_store/notificationStore'

const NotificationList = () => {
    const t = useTranslations('account.settings.notifications')
    const [isLoading, setIsLoading] = useState(false)
    const [notificationIndex, setNotificationIndex] = useState(1)
    const [showUnreadOnly, setShowUnreadOnly] = useState(false)
    const [selectedType, setSelectedType] = useState([])

    const notifications = useNotification((state) => state.data)
    const setNotifications = useNotification((state) => state.setData)
    const loadable = useNotification((state) => state.loadable)
    const setLoadable = useNotification((state) => state.setLoadable)
    const initialLoading = useNotification((state) => state.initialLoading)

    const fetchNotifications = async (index) => {
        setIsLoading(true)
        const result = await getNotifications({ page: index, per_page: 15, sort: '-created_at' });
        if (result.success && result.data) {
            setNotifications([...notifications, ...result.data]);
            setLoadable(result.loadable);
        }
        setIsLoading(false)
    }

    const handleFilterChange = (selected) => {
        if (selectedType.includes(selected)) {
            setSelectedType((prevData) =>
                prevData.filter((prev) => prev !== selected),
            )
        } else {
            setSelectedType((prevData) => [...prevData, ...[selected]])
        }
    }

    const handleLoadMore = () => {
        const nextIndex = notificationIndex + 1;
        setNotificationIndex(nextIndex);
        fetchNotifications(nextIndex);
    }

    const handleCheckboxChange = (bool) => {
        setShowUnreadOnly(bool)
        if (bool) {
            setSelectedType(['unread'])
        } else {
            setSelectedType([])
        }
    }

    const filteredNotifications = notifications.filter(notification => {
        if (showUnreadOnly && notification.read_at) return false;
        if (selectedType.length > 0 && !selectedType.includes(notification.type)) return false;
        return true;
    });

    return (
        <AdaptiveCard className="h-full" bodyClass="h-full">
            <div className="max-w-[800px] mx-auto h-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3>{t('title')}</h3>
                    <NotificationAction
                        selectedType={selectedType}
                        showUnreadOnly={showUnreadOnly}
                        onFilterChange={handleFilterChange}
                        onCheckboxChange={handleCheckboxChange}
                    />
                </div>
                {initialLoading ? (
                    <div className="flex flex-col justify-center h-full">
                        <Loading loading={true} />
                    </div>
                ) : (
                    <div>
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification, index) => (
                                <NotificationItem
                                    key={notification.id + index}
                                    notification={notification}
                                />
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                {t('noNotifications')}
                            </div>
                        )}
                        
                        <div className="text-center mt-6">
                            {loadable ? (
                                <button
                                    className="btn btn-primary"
                                    loading={isLoading}
                                    onClick={handleLoadMore}
                                >
                                    {t('loadMore')}
                                </button>
                            ) : (
                                <span className="text-gray-500">{t('noMoreNotifications')}</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdaptiveCard>
    )
}

export default NotificationList
