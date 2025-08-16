'use client'
import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import { useTranslations } from 'next-intl'
import dayjs from 'dayjs'
import { 
    HiOutlineBell, 
    HiOutlineCheck, 
    HiOutlineTrash,
    HiOutlineEye,
    HiOutlineEyeOff
} from 'react-icons/hi'
import { markNotificationAsRead, deleteNotification } from '@/server/actions/notification/notificationActions'

const NotificationItem = ({ notification }) => {
    const t = useTranslations('account.settings.notifications')
    const [isMarking, setIsMarking] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isRead, setIsRead] = useState(!!notification.read_at)

    const handleMarkAsRead = async () => {
        if (isRead) return
        setIsMarking(true)
        try {
            const result = await markNotificationAsRead(notification.id)
            if (result.success) {
                setIsRead(true)
            } else {
                console.error('Failed to mark as read:', result.message)
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
        } finally {
            setIsMarking(false)
        }
    }

    const handleDelete = async () => {
        if (confirm(t('confirmDelete'))) {
            setIsDeleting(true)
            try {
                const result = await deleteNotification(notification.id)
                if (result.success) {
                    // Remove from local state instead of reloading
                    window.location.reload()
                } else {
                    console.error('Failed to delete:', result.message)
                }
            } catch (error) {
                console.error('Error deleting notification:', error)
            } finally {
                setIsDeleting(false)
            }
        }
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'App\\Notifications\\NewDeposit':
                return '💰'
            case 'App\\Notifications\\TaskCompleted':
                return '✅'
            case 'App\\Notifications\\TaskFailed':
                return '❌'
            default:
                return '🔔'
        }
    }

    const getNotificationTypeLabel = (type) => {
        switch (type) {
            case 'App\\Notifications\\NewDeposit':
                return t('types.deposit')
            case 'App\\Notifications\\TaskCompleted':
                return t('types.taskCompleted')
            case 'App\\Notifications\\TaskFailed':
                return t('types.taskFailed')
            default:
                return t('types.general')
        }
    }

    return (
        <div className={`border rounded-lg p-4 mb-4 transition-all duration-200 ${
            isRead 
                ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                : 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-700 shadow-sm'
        }`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <Avatar 
                        size={40} 
                        shape="circle" 
                        className="bg-blue-100 dark:bg-blue-900"
                    >
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    </Avatar>
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Tag className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                    {getNotificationTypeLabel(notification.type)}
                                </Tag>
                                {!isRead && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                            </div>
                            
                            <h4 className={`font-medium mb-1 ${
                                isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                            }`}>
                                {notification.data?.title || t('defaultTitle')}
                            </h4>
                            
                            <p className={`text-sm ${
                                isRead ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                                {notification.data?.message || notification.data?.body || t('defaultMessage')}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-500">
                                <span>
                                    {dayjs(notification.created_at).format('DD/MM/YYYY HH:mm')}
                                </span>
                                {notification.read_at && (
                                    <span>
                                        {t('readAt')}: {dayjs(notification.read_at).format('DD/MM/YYYY HH:mm')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col gap-2">
                    {!isRead && (
                        <Button
                            size="sm"
                            variant="plain"
                            icon={<HiOutlineCheck />}
                            loading={isMarking}
                            onClick={handleMarkAsRead}
                            title={t('markAsRead')}
                        />
                    )}
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<HiOutlineTrash />}
                        loading={isDeleting}
                        onClick={handleDelete}
                        title={t('delete')}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    />
                </div>
            </div>
        </div>
    )
}

export default NotificationItem
