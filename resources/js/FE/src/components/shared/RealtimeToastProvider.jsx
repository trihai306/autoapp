'use client'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '@/utils/hooks/useRealtime'
import { toast } from 'react-hot-toast'

const RealtimeToastProvider = ({ children }) => {
    const { data: session } = useSession()
    
    const { 
        listenToGeneralNotifications, 
        listenToUserNotifications, 
        stopListeningToNotifications 
    } = useNotifications(session?.user?.id)

    useEffect(() => {
        if (typeof window === 'undefined' || !session?.user?.id) {
            return
        }

        // Listen to TikTok account updates (optional - can be removed if not needed)
        // const accountListener = listenToAccountUpdates && listenToAccountUpdates((update) => {
        //     toast.success(`TikTok account @${update.account.username} has been updated`, {
        //         duration: 4000,
        //         position: 'top-right',
        //         style: {
        //             background: '#EC4899',
        //             color: 'white',
        //         },
        //     })
        // })

        // Listen to transaction updates (optional - can be removed if not needed)
        // const transactionListener = listenToTransactionUpdates && listenToTransactionUpdates((transaction) => {
        //     const statusColors = {
        //         completed: '#10B981',
        //         pending: '#F59E0B',
        //         failed: '#EF4444',
        //         cancelled: '#6B7280',
        //     }
        //     
        //     toast.success(
        //         `Transaction ${transaction.transaction.type} ${transaction.status_change.to}`, 
        //         {
        //             duration: 5000,
        //             position: 'top-right',
        //             style: {
        //                 background: statusColors[transaction.status_change.to] || '#3B82F6',
        //                 color: 'white',
        //             },
        //         }
        //     )
        // })

        return () => {
            // Cleanup listeners if needed
        }
    }, [session?.user?.id])

    return <>{children}</>
}

export default RealtimeToastProvider
