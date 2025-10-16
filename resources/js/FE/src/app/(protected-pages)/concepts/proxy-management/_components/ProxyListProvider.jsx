'use client'
import { useEffect } from 'react'
import { useProxyListStore } from '../_store/proxyListStore'

const ProxyListProvider = ({ proxyList, stats, children }) => {
    const setProxyList = useProxyListStore(
        (state) => state.setProxyList,
    )
    const setStats = useProxyListStore(
        (state) => state.setStats,
    )
    const setInitialLoading = useProxyListStore(
        (state) => state.setInitialLoading,
    )

    useEffect(() => {
        setProxyList(proxyList)
        setStats(stats)
        setInitialLoading(false)
    }, [proxyList, stats])

    return <>{children}</>
}

export default ProxyListProvider
