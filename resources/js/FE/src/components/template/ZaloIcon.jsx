'use client'
import React from 'react'
import { FaPhone } from 'react-icons/fa'
import zaloConfig from '@/configs/zalo.config'

const ZaloIcon = ({ className = '', size = 20, zaloLink = zaloConfig.ZALO_LINK }) => {
    const handleClick = () => {
        window.open(zaloLink, '_blank', 'noopener,noreferrer')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
        }
    }

    return (
        <div 
            className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-indigo-200/60 dark:border-indigo-700/60 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105 ${className}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-label={zaloConfig.ZALO_NAME}
            title={zaloConfig.ZALO_DESCRIPTION}
            role="button"
        >
            <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-lg">
                <FaPhone 
                    size={size} 
                    className="text-indigo-600 dark:text-indigo-400" 
                />
            </div>
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Zalo</span>
        </div>
    )
}

export default ZaloIcon
