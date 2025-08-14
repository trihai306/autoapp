'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import appConfig from '@/configs/app.config'
import { disconnectEcho } from '@/utils/echo'

const ForceSignOut = () => {
    useEffect(() => {
        // Disconnect Echo trước khi logout
        if (typeof window !== 'undefined') {
            disconnectEcho()
        }
        signOut({ callbackUrl: appConfig.unAuthenticatedEntryPath })
    }, [])

    return null // Component này không render gì cả
}

export default ForceSignOut
