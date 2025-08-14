'use client'
import { useEffect, useRef } from 'react'
import Card from '@/components/ui/Card'
import Loading from '@/components/shared/Loading'
import Chart from '@/components/shared/Chart' 
import { COLORS } from '@/constants/chart.constant'
import useTheme from '@/utils/hooks/useTheme'
import { NumericFormat } from 'react-number-format'
import isEmpty from 'lodash/isEmpty'

const WebAnalytic = ({ data }) => {
    const isFirstRender = useRef(true)

    const sideNavCollapse = useTheme((state) => state.layout.sideNavCollapse)

    useEffect(() => {
        if (!sideNavCollapse && isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        if (!isFirstRender.current) {
            window.dispatchEvent(new Event('resize'))
        }
    }, [sideNavCollapse])

    return (
        <Card className="h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h4>Purchase Statistics</h4>
                <div className="inline-flex items-center gap-6">
                    <div className="flex items-center gap-1.5">
                        <div
                            className="h-3.5 w-3.5 rounded-sm"
                            style={{ backgroundColor: COLORS[0] }}
                        />
                        <div>Purchases</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div
                            className="h-3.5 w-3.5 rounded-sm"
                            style={{ backgroundColor: COLORS[1] }}
                        />
                        <div>Refunds</div>
                    </div>
                </div>
            </div>
            {!isEmpty(data) ? (
                <>
                    <div className="mt-8">
                        <div className="flex items-center gap-10">
                            <div>
                                <div className="mb-2">Total Purchases</div>
                                <div className="flex items-end gap-2">
                                    <h3>
                                        <NumericFormat
                                            displayType="text"
                                            value={data.totalPurchase.value}
                                            prefix={'$'}
                                            thousandSeparator={true}
                                        />
                                    </h3>
                                </div>
                            </div>
                            <div>
                                <div className="mb-2">Total Refunds</div>
                                <div className="flex items-end gap-2">
                                    <h3>
                                         <NumericFormat
                                            displayType="text"
                                            value={data.totalRefund.value}
                                            prefix={'$'}
                                            thousandSeparator={true}
                                        />
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 min-h-[330px]">
                        <Chart
                            type="line"
                            series={data.series}
                            xAxis={data.date}
                            height="330px"
                            customOptions={{
                                legend: { show: false },
                                colors: [COLORS[0], COLORS[1]],
                            }}
                        />
                    </div>
                </>
            ) : (
                <div className="h-[330px] flex items-center justify-center">
                    <Loading loading />
                </div>
            )}
        </Card>
    )
}

export default WebAnalytic
