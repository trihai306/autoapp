import ActivityLogProvider from './_components/ActivityLogProvider'
import ActivityLog from './_components/ActivityLog'
import getLogs from '@/server/actions/log/getLogs'

export default async function Page() {
    const resp = await getLogs()

    return (
        <ActivityLogProvider data={resp.data} loadable={resp.loadable}>
            <ActivityLog />
        </ActivityLogProvider>
    )
}
