'use client'
import { NumericFormat } from 'react-number-format'
import React from 'react'
import { FaWallet, FaSync } from 'react-icons/fa'
import useBalance from '@/utils/hooks/useBalance'

const Balance = ({ className = '', showRefreshButton = true }) => {
    const { balance, isLoading, refreshBalance } = useBalance()

    const handleRefresh = (e) => {
        e.stopPropagation()
        refreshBalance()
    }

    return (
        <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl border border-emerald-200/60 dark:border-emerald-700/60 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg">
                <FaWallet 
                    size={16} 
                    className="text-emerald-600 dark:text-emerald-400" 
                />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium opacity-80">Số dư</span>
                <NumericFormat
                    displayType="text"
                    value={balance || 0}
                    prefix={'$'}
                    thousandSeparator={true}
                    className="text-sm font-bold text-emerald-800 dark:text-emerald-200"
                />
            </div>
            {showRefreshButton && (
                <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="ml-2 p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-800/50 hover:bg-emerald-200 dark:hover:bg-emerald-700/50 transition-all duration-200 disabled:opacity-50"
                    aria-label="Làm mới số dư"
                >
                    <FaSync 
                        size={12} 
                        className={`text-emerald-600 dark:text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} 
                    />
                </button>
            )}
        </div>
    )
}

export default Balance
