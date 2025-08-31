'use client'
import React from 'react'
import Balance from './Balance'
import ZaloIcon from './ZaloIcon'

const HeaderBalanceSection = ({ className = '' }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <Balance />
            <ZaloIcon />
        </div>
    )
}

export default HeaderBalanceSection
