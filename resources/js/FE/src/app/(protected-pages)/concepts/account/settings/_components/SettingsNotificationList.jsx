'use client'
import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import Pagination from '@/components/ui/Pagination'
import getNotifications from '@/server/actions/notification/getNotifications'
import { markAllAsReadAction } from '@/server/actions/notification/notificationActions'
import useSWR from 'swr'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

dayjs.extend(relativeTime)

const { TabList, TabNav } = Tabs

const NotificationItem = ({ notification }) => {
    let notificationData = { title: 'Notification', message: '...' }
    try {
        if (typeof notification.data === 'string') {
            notificationData = JSON.parse(notification.data)
        } else {
            notificationData = notification.data
        }
    } catch (error) {
        console.error('Failed to parse notification data:', error)
    }

    return (
        <Card key={notification.id} className="p-4">
            <div className="flex justify-between">
                <p className={`font-semibold ${!notification.read_at ? 'text-blue-500' : ''}`}>
                    {notificationData.title}
                </p>
                <p className="text-sm text-gray-500">
                    {dayjs(notification.created_at).fromNow()}
                </p>
            </div>
            <p className="mt-2">{notificationData.message}</p>
        </Card>
    )
}

const SettingsNotificationList = ({ data: initialData }) => {
    const [page, setPage] = useState(1)
    const [filter, setFilter] = useState('all') // 'all', 'read', 'unread'

    const filters = {
        all: {},
        read: { 'filter[read_at]': 'not-null' },
        unread: { 'filter[read_at]': 'null' },
    }

    // SWR for paginated and filtered notifications
    const fetcher = async () => {
        const result = await getNotifications({ page, per_page: 5, ...filters[filter] });
        if (result.success) return result.data;
        throw new Error(result.message);
    };
    const { data, mutate } = useSWR(
        ['/notifications', page, filter],
        fetcher,
        {
            fallbackData: initialData,
        }
    );

    // SWR to get unread count
    const unreadFetcher = async () => {
        const result = await getNotifications({ 'filter[read_at]': 'null', per_page: 1 });
        if (result.success) return result.data;
        return { total: 0 }; // Return a default structure on failure
    };
    const { data: unreadData, mutate: mutateUnreadCount } = useSWR('/notifications/unread-count', unreadFetcher);
    const unreadCount = unreadData?.total || 0

    const handleMarkAllRead = async () => {
        try {
            const result = await markAllAsReadAction();
            if (result.success) {
                toast.push(<Notification type="success">All notifications marked as read.</Notification>)
                mutate() // Revalidate current view
                mutateUnreadCount() // Revalidate unread count
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            toast.push(<Notification type="danger" title="Error">{error.message}</Notification>)
        }
    }
    
    const notifications = data?.data || []
    const pagination = {
        page,
        per_page: data?.per_page,
        total: data?.total,
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4>Danh sách thông báo</h4>
                {unreadCount > 0 && (
                     <Button size="sm" onClick={handleMarkAllRead}>
                        Đánh dấu tất cả là đã đọc ({unreadCount})
                    </Button>
                )}
            </div>

            <Tabs defaultValue="all" onChange={(val) => { setFilter(val); setPage(1); }}>
                <TabList>
                    <TabNav value="all">Tất cả</TabNav>
                    <TabNav value="read">Đã đọc</TabNav>
                    <TabNav value="unread">Chưa đọc</TabNav>
                </TabList>
            </Tabs>

            <div className="mt-4 flex flex-col gap-4">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                        />
                    ))
                ) : (
                    <p>Không có thông báo nào.</p>
                )}
            </div>
            <div className="mt-4 flex justify-center">
                <Pagination
                    currentPage={pagination.page}
                    pageSize={pagination.per_page}
                    total={pagination.total}
                    onChange={(newPage) => setPage(newPage)}
                />
            </div>
        </div>
    )
}

export default SettingsNotificationList