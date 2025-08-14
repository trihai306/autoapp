'use client'
import { useState } from 'react'
import AnalyticHeader from './AnalyticHeader'
import WebAnalytic from './AnalyticChart'

const TransactionAnalyticDashboard = ({ data }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('thisMonth')

    if (!data || !data[selectedPeriod]) {
        return <div>Loading...</div>; // Hoặc một component loading khác
    }

    return (
        <div className="flex flex-col gap-4">
            <AnalyticHeader
                selectedPeriod={selectedPeriod}
                onSelectedPeriodChange={setSelectedPeriod}
            />
            <div className="flex flex-col 2xl:grid grid-cols-4 gap-4">
                <div className="col-span-4">
                    <WebAnalytic data={data[selectedPeriod].webAnalytic} />
                </div>
            </div>
        </div>
    )
}

export default TransactionAnalyticDashboard
