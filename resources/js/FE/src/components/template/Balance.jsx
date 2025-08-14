'use client'
import { NumericFormat } from 'react-number-format'
import React from 'react'

const Balance = ({ balance }) => {
    return (
        <div className="flex items-center gap-2 me-2">
            <span className="font-semibold">Balance:</span>
            <NumericFormat
                displayType="text"
                value={balance || 0}
                prefix={'$'}
                thousandSeparator={true}
            />
        </div>
    )
}

export default Balance
