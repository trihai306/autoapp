'use client'
import { useState, useRef, useEffect } from 'react'
import classNames from 'classnames'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Dropdown from '@/components/ui/Dropdown'
import ScrollBar from '@/components/ui/ScrollBar'
import Spinner from '@/components/ui/Spinner'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import NotificationAvatar from './NotificationAvatar'
import NotificationToggle from './NotificationToggle'
import useSWR from 'swr'
import { useSession } from 'next-auth/react' // Use the official hook
import {
    apiGetNotifications,
    apiMarkNotificationAsRead,
    apiMarkAllNotificationsAsRead,
} from '@/services/notification/NotificationService'
import isLastChild from '@/utils/isLastChild'
import useResponsive from '@/utils/hooks/useResponsive'
import { useRouter } from 'next/navigation'
import { HiOutlineMailOpen } from 'react-icons/hi'
import dayjs from 'dayjs'
import { useNotifications } from '@/utils/hooks/useRealtime'
import { toast } from 'react-hot-toast'

const notificationHeight = 'h-[280px]'

// This component will only render on the client side after mounting
const ClientTime = ({ time }) => {
    const [hasMounted, setHasMounted] = useState(false)

    useEffect(() => {
        setHasMounted(true)
    }, [])

    if (!hasMounted) {
        return null // Or a placeholder
    }

    return <span className="text-xs">{dayjs(time).fromNow()}</span>
}

const _Notification = ({ className }) => {
    const { data: session, status } = useSession() // Get session and status
    const [loading, setLoading] = useState(false)
    const [realtimeNotifications, setRealtimeNotifications] = useState([])
    const { larger } = useResponsive()
    const router = useRouter()

    // Real-time notifications hook
    const { 
        listenToGeneralNotifications, 
        listenToUserNotifications, 
        stopListeningToNotifications 
    } = useNotifications(session?.user?.id)

    // Fetch only when authenticated
    const canFetch = status === 'authenticated'

    const {
        data: notifications,
        mutate: mutateNotifications,
    } = useSWR(
        canFetch ? '/api/notifications' : null,
        () => apiGetNotifications({}, session.accessToken),
        { revalidateOnFocus: false },
    )

    const { data: unreadCountData, mutate: mutateUnreadCount } = useSWR(
        canFetch ? '/api/notifications/unread-count' : null,
        () =>
            apiGetNotifications({ 'filter[read_at]': 'null' }, session.accessToken),
        { revalidateOnFocus: false }, // Add this line
    )

    // Combine database notifications with real-time notifications
    const allNotifications = [
        ...realtimeNotifications,
        ...(notifications?.data || [])
    ]

    const unreadCount = (unreadCountData?.data?.length || 0) + realtimeNotifications.length

    // Set up real-time listeners
    useEffect(() => {
        // Vẫn lắng nghe thông báo chung ngay cả khi chưa đăng nhập

        const setupListeners = async () => {
            // Listen to general notifications (public channel)
            const generalListener = await listenToGeneralNotifications((notification) => {
                // console.log('📢 General notification received in header:', notification)
                
                // Add to real-time notifications list
                const newNotification = {
                    id: `realtime-${notification.id}`,
                    type: notification.type || 'info',
                    data: {
                        message: notification.message,
                        title: notification.title,
                    },
                    created_at: notification.timestamp,
                    read_at: null,
                    isRealtime: true,
                }
                
                setRealtimeNotifications(prev => [newNotification, ...prev.slice(0, 9)])
                
                // Show toast notification
                toast.success(notification.message, {
                    duration: 4000,
                    position: 'top-right',
                })
            })

            // Listen to user-specific notifications (chỉ khi có user id)
            const userListener = session?.user?.id
                ? await listenToUserNotifications((notification) => {
                // console.log('👤 User notification received in header:', notification)
                
                // Add to real-time notifications list
                const newNotification = {
                    id: `realtime-user-${notification.id}`,
                    type: notification.type || 'info',
                    data: {
                        message: notification.message,
                        title: notification.title,
                    },
                    created_at: notification.timestamp,
                    read_at: null,
                    isRealtime: true,
                }
                
                setRealtimeNotifications(prev => [newNotification, ...prev.slice(0, 9)])
                
                // Show toast notification with different style for user-specific
                toast.success(notification.message, {
                    duration: 5000,
                    position: 'top-right',
                    style: {
                        background: '#3B82F6',
                        color: 'white',
                    },
                })

                // Refresh unread count from server
                mutateUnreadCount()
                })
                : null

            return () => {
                stopListeningToNotifications()
            }
        }

        setupListeners()
    }, [session?.user?.id, listenToGeneralNotifications, listenToUserNotifications, stopListeningToNotifications, mutateUnreadCount])

    const onMarkAllAsRead = async () => {
        if (!session) return
        try {
            await apiMarkAllNotificationsAsRead(session.accessToken)
            mutateNotifications()
            mutateUnreadCount()
            // Clear real-time notifications
            setRealtimeNotifications([])
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    const onMarkAsRead = async (id) => {
        if (!session) return
        
        // Check if it's a real-time notification
        if (id.startsWith('realtime-')) {
            // Remove from real-time notifications
            setRealtimeNotifications(prev => prev.filter(notif => notif.id !== id))
            return
        }
        
        try {
            await apiMarkNotificationAsRead(id, session.accessToken)
            mutateNotifications()
            mutateUnreadCount()
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    const notificationDropdownRef = useRef(null)

    const handleViewAllActivity = () => {
        router.push('/concepts/account/activity-log')
        if (notificationDropdownRef.current) {
            notificationDropdownRef.current.handleDropdownClose()
        }
    }

    return (
        <Dropdown
            ref={notificationDropdownRef}
            renderTitle={
                <NotificationToggle
                    dot={unreadCount > 0}
                    className={className}
                    count={unreadCount}
                />
            }
            menuClass="min-w-[280px] md:min-w-[340px]"
            placement={larger.md ? 'bottom-end' : 'bottom'}
        >
            <Dropdown.Item variant="header">
                <div className="dark:border-gray-700 px-2 flex items-center justify-between mb-1">
                    <h6>Notifications</h6>
                    <Button
                        variant="plain"
                        shape="circle"
                        size="sm"
                        icon={<HiOutlineMailOpen className="text-xl" />}
                        title="Mark all as read"
                        onClick={onMarkAllAsRead}
                    />
                </div>
            </Dropdown.Item>
            <ScrollBar className={classNames('overflow-y-auto', notificationHeight)}>
                {(status === 'loading' || loading) && (
                     <div className={classNames('flex items-center justify-center', notificationHeight)}>
                        <Spinner size={40} />
                    </div>
                )}

                {status === 'authenticated' && allNotifications && allNotifications.length > 0 ? (
                    allNotifications.map((item, index) => (
                        <div key={item.id}>
                            <div
                                className={`relative rounded-xl flex px-4 py-3 cursor-pointer hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-gray-700 ${
                                    item.isRealtime ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                                }`}
                                onClick={() => onMarkAsRead(item.id)}
                            >
                                <NotificationAvatar type={item.type} />
                                <div className="mx-3 flex-1">
                                    {item.data.title && (
                                        <div className="font-medium text-sm mb-1">
                                            {item.data.title}
                                        </div>
                                    )}
                                    <div 
                                        className={item.isRealtime ? 'text-sm' : ''}
                                        dangerouslySetInnerHTML={{ __html: item.data.message }}
                                    />
                                    <div className="flex items-center gap-2 mt-1">
                                        <ClientTime time={item.created_at} />
                                        {item.isRealtime && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                Real-time
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Badge
                                    className="absolute top-4 ltr:right-4 rtl:left-4 mt-1.5"
                                    innerClass={!item.read_at ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}
                                />
                            </div>
                            {!isLastChild(allNotifications, index) && (
                                <div className="border-b border-gray-200 dark:border-gray-700 my-2" />
                            )}
                        </div>
                    ))
                ) : (
                    status === 'authenticated' && (
                        <div className={classNames('flex items-center justify-center', notificationHeight)}>
                            <div className="text-center">
                                <img
                                    className="mx-auto mb-2 max-w-[150px]"
                                    src="/img/others/no-notification.png"
                                    alt="no-notification"
                                />
                                <h6 className="font-semibold">No notifications!</h6>
                                <p className="mt-1">Please Try again later</p>
                            </div>
                        </div>
                    )
                )}
            </ScrollBar>
            <Dropdown.Item variant="header">
                <div className="pt-4">
                    <Button
                        block
                        variant="solid"
                        onClick={handleViewAllActivity}
                    >
                        View All Activity
                    </Button>
                </div>
            </Dropdown.Item>
        </Dropdown>
    )
}

const Notification = withHeaderItem(_Notification)

export default Notification
