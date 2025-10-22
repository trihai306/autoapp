import { auth } from '@/auth'
import appConfig from '@/configs/app.config'
import { redirect } from 'next/navigation'

const Page = async () => {
    const session = await auth()

    if (session) {
        redirect(appConfig.authenticatedEntryPath)
    } else {
        redirect(appConfig.unAuthenticatedEntryPath)
    }
}

export default Page
