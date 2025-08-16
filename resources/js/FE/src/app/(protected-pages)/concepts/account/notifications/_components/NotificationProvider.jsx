'use client'
import { useEffect } from 'react'
import { useNotification } from '../_store/notificationStore'

const NotificationProvider = ({ data, loadable, children }) => {
    const setData = useNotification((state) => state.setData)
    const setLoadable = useNotification((state) => state.setLoadable)
    const setInitialLoading = useNotification((state) => state.setInitialLoading)

    useEffect(() => {
        setData(data)
        setLoadable(loadable)
        setInitialLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, loadable])

    return <>{children}</>
}

export default NotificationProvider
