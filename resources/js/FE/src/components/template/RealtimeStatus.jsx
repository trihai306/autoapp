'use client'
import { useState, useEffect } from 'react'
import { useRealtime } from '@/utils/hooks/useRealtime'
import { HiWifi, HiX } from 'react-icons/hi'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Tooltip from '@/components/ui/Tooltip'

const _RealtimeStatus = ({ className }) => {
    const { isConnected } = useRealtime()
    const [connectionStatus, setConnectionStatus] = useState('disconnected')

    useEffect(() => {
        const checkConnection = () => {
            const connected = isConnected()
            setConnectionStatus(connected ? 'connected' : 'disconnected')
        }

        // Check immediately
        checkConnection()

        // Check every 5 seconds
        const interval = setInterval(checkConnection, 5000)
        return () => clearInterval(interval)
    }, [isConnected])

    const isConnectedStatus = connectionStatus === 'connected'

    return (
        <Tooltip title={`Real-time: ${isConnectedStatus ? 'Connected' : 'Disconnected'}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${className}`}>
                {isConnectedStatus ? (
                    <HiWifi className="w-5 h-5 text-green-500" />
                ) : (
                    <div className="relative">
                        <HiWifi className="w-5 h-5 text-gray-400" />
                        <HiX className="w-3 h-3 text-red-500 absolute -top-1 -right-1" />
                    </div>
                )}
            </div>
        </Tooltip>
    )
}

const RealtimeStatus = withHeaderItem(_RealtimeStatus)

export default RealtimeStatus
