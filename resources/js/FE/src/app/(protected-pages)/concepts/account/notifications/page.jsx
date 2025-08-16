import NotificationProvider from './_components/NotificationProvider'
import NotificationList from './_components/NotificationList'
import getNotifications from '@/server/actions/notification/getNotifications'

export default async function Page() {
    const resp = await getNotifications({ page: 1, per_page: 15, sort: '-created_at' })

    return (
        <NotificationProvider data={resp.success ? resp.data : []} loadable={resp.success ? resp.loadable : false}>
            <NotificationList />
        </NotificationProvider>
    )
}
