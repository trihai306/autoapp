'use client'
import React, { useState, useEffect, createContext, useContext } from 'react'
import getFacebookAccountBatchData from '@/server/actions/facebook-account/getFacebookAccountBatchData'

const FacebookAccountDataContext = createContext()

export const useFacebookAccountData = () => {
    const context = useContext(FacebookAccountDataContext)
    if (!context) {
        throw new Error('useFacebookAccountData must be used within FacebookAccountDataProvider')
    }
    return context
}

export const FacebookAccountDataProvider = ({ children }) => {
    const [data, setData] = useState({
        accounts: [],
        stats: {},
        proxies: [],
        statuses: {}
    })
    const [loading, setLoading] = useState(false)
    const [lastFetch, setLastFetch] = useState(null)
    const [error, setError] = useState(null)

    const fetchBatchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await getFacebookAccountBatchData()

            if (response.success && response.data) {
                const { accounts, stats, proxies } = response.data

                // Create status map for quick lookup
                const statusMap = {}
                accounts.forEach(item => {
                    statusMap[item.account.id] = {
                        status: item.status,
                        current_activity: item.current_activity,
                        stats: item.stats
                    }
                })

                setData({
                    accounts: accounts.map(item => item.account),
                    stats,
                    proxies,
                    statuses: statusMap
                })
                setLastFetch(new Date())
            } else {
                setError(response.message || 'Failed to fetch data')
            }
        } catch (error) {
            setError(error.message || 'Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }

    const getAccountStatus = (accountId) => {
        return data.statuses[accountId] || { status: 'idle', current_activity: null, stats: {} }
    }

    const getProxyOptions = () => {
        return [
            { value: '', label: 'Không dùng proxy' },
            ...data.proxies.map(proxy => ({
                value: String(proxy.value),
                label: proxy.label
            }))
        ]
    }

    const refreshData = () => {
        fetchBatchData()
    }

    // Auto-refresh every 30 seconds
    useEffect(() => {
        fetchBatchData()
        const interval = setInterval(fetchBatchData, 30000)
        return () => clearInterval(interval)
    }, [])

    const value = {
        data,
        loading,
        error,
        lastFetch,
        getAccountStatus,
        getProxyOptions,
        refreshData
    }

    return (
        <FacebookAccountDataContext.Provider value={value}>
            {children}
        </FacebookAccountDataContext.Provider>
    )
}
