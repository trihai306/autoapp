'use client'
import { useMemo } from 'react'
import Dropdown from '@/components/ui/Dropdown'
import Switcher from '@/components/ui/Switcher'
import Button from '@/components/ui/Button'
import { TbFilter, TbCheck, TbCheckAll, TbTrash } from 'react-icons/tb'
import { useTranslations } from 'next-intl'
import { markAllNotificationsAsRead, deleteMultipleNotifications } from '@/server/actions/notification/notificationActions'
import { useNotification } from '../_store/notificationStore'

const NotificationAction = ({
    showUnreadOnly,
    selectedType = [],
    onFilterChange,
    onCheckboxChange,
}) => {
    const t = useTranslations('account.settings.notifications')
    const notifications = useNotification((state) => state.data)

    const filterItems = useMemo(() => [
        { label: t('filter.deposit'), value: 'App\\Notifications\\NewDeposit' },
        { label: t('filter.taskCompleted'), value: 'App\\Notifications\\TaskCompleted' },
        { label: t('filter.taskFailed'), value: 'App\\Notifications\\TaskFailed' },
        { label: t('filter.general'), value: 'general' },
    ], [t])

    const allUnchecked = useMemo(() => {
        return !selectedType.some((type) =>
            filterItems.map((item) => item.value).includes(type),
        )
    }, [selectedType, filterItems])

    const unreadCount = notifications.filter(n => !n.read_at).length

    const handleMarkAllAsRead = async () => {
        try {
            const result = await markAllNotificationsAsRead()
            if (result.success) {
                window.location.reload()
            } else {
                console.error('Failed to mark all as read:', result.message)
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
        }
    }

    const handleDeleteAll = async () => {
        if (confirm(t('confirmDeleteAll'))) {
            try {
                const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id)
                if (unreadIds.length > 0) {
                    const result = await deleteMultipleNotifications(unreadIds)
                    if (result.success) {
                        window.location.reload()
                    } else {
                        console.error('Failed to delete all:', result.message)
                    }
                }
            } catch (error) {
                console.error('Error deleting all notifications:', error)
            }
        }
    }

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <span className="font-semibold">
                    {showUnreadOnly
                        ? t('showAllNotifications')
                        : t('showUnreadOnly')}
                </span>
                <Switcher
                    checked={showUnreadOnly}
                    onChange={onCheckboxChange}
                />
                {unreadCount > 0 && (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {unreadCount} {t('unread')}
                    </span>
                )}
            </div>
            
            <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                    <>
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<TbCheckAll />}
                            onClick={handleMarkAllAsRead}
                            title={t('markAllAsRead')}
                        />
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<TbTrash />}
                            onClick={handleDeleteAll}
                            title={t('deleteAll')}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        />
                    </>
                )}
                
                <Dropdown
                    placement="bottom-end"
                    renderTitle={
                        <button
                            className="close-button p-2.5! button-press-feedback"
                            type="button"
                        >
                            <TbFilter />
                        </button>
                    }
                >
                    {filterItems.map((item) => (
                        <Dropdown.Item
                            key={item.value}
                            eventKey={item.value}
                            onClick={() => onFilterChange(item.value)}
                        >
                            {!allUnchecked && (
                                <div className="flex justify-center w-[20px]">
                                    {selectedType.includes(item.value) && (
                                        <TbCheck className="text-primary text-lg" />
                                    )}
                                </div>
                            )}
                            <span>{item.label}</span>
                        </Dropdown.Item>
                    ))}
                </Dropdown>
            </div>
        </div>
    )
}

export default NotificationAction
