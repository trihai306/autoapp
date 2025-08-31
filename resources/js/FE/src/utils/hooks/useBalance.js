'use client'
import { useState, useEffect } from 'react'
import useCurrentSession from './useCurrentSession'
import { apiGetProfile } from '@/services/auth/AuthService'

const useBalance = () => {
    const { session } = useCurrentSession()
    const [balance, setBalance] = useState(session?.balance || 0)
    const [isLoading, setIsLoading] = useState(false)

    // Cập nhật balance khi session thay đổi
    useEffect(() => {
        if (session?.balance !== undefined) {
            setBalance(session.balance)
        }
    }, [session?.balance])

    // Hàm để refresh balance từ API
    const refreshBalance = async () => {
        if (!session?.accessToken) return

        setIsLoading(true)
        try {
            const profile = await apiGetProfile()
            if (profile?.balance !== undefined) {
                setBalance(profile.balance)
            }
        } catch (error) {
            console.error('Failed to refresh balance:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Hàm để cập nhật balance (ví dụ: sau khi thực hiện giao dịch)
    const updateBalance = (newBalance) => {
        setBalance(newBalance)
    }

    return {
        balance,
        isLoading,
        refreshBalance,
        updateBalance
    }
}

export default useBalance
