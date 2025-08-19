import ActivityLogProvider from './_components/ActivityLogProvider'
import ActivityLog from './_components/ActivityLog'
import getLogs from '@/server/actions/log/getLogs'
import {
    UPDATE_TICKET,
    COMMENT,
    COMMENT_MENTION,
    ASSIGN_TICKET,
    ADD_TAGS_TO_TICKET,
    ADD_FILES_TO_TICKET,
    CREATE_TICKET,
} from '@/components/view/Activity/constants'

export default async function Page() {
    const defaultFilter = [
        UPDATE_TICKET,
        COMMENT,
        COMMENT_MENTION,
        ASSIGN_TICKET,
        ADD_TAGS_TO_TICKET,
        ADD_FILES_TO_TICKET,
        CREATE_TICKET,
    ]
    const resp = await getLogs(1, defaultFilter)

    return (
        <ActivityLogProvider data={resp.data} loadable={resp.loadable}>
            <ActivityLog />
        </ActivityLogProvider>
    )
}
