'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import { NumericFormat } from 'react-number-format'

// Minimal inline QR using Google Chart API placeholder (can swap to local lib)
const buildQrUrl = (text) => `https://chart.googleapis.com/chart?cht=qr&chs=280x280&chld=M|0&chl=${encodeURIComponent(text)}`

export default function Page() {
    const params = useSearchParams()
    const router = useRouter()
    const amount = Number(params.get('amount') || 0)
    const note = params.get('note') || ''

    const transferText = `VCB|0123456789|CONG TY ABC|${amount}|${note || 'NAPTIEN'}`

    return (
        <Container>
            <AdaptiveCard>
                <div className="max-w-xl mx-auto text-center space-y-6">
                    <div>
                        <h3 className="mb-2">Quét QR để nạp tiền</h3>
                        <p className="text-gray-600 dark:text-gray-400">Sử dụng ứng dụng ngân hàng quét mã hoặc lưu ảnh mã QR để thanh toán.</p>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-600 p-5 inline-block bg-white dark:bg-gray-800">
                        <img
                            src={buildQrUrl(transferText)}
                            alt="QR Code"
                            width={280}
                            height={280}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-gray-500">Số tiền</div>
                        <div className="text-2xl font-bold heading-text">
                            <NumericFormat displayType="text" value={amount} thousandSeparator suffix=" đ" />
                        </div>
                        {note && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">Nội dung: <span className="font-semibold">{note}</span></div>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        <Button onClick={() => router.back()}>Quay lại</Button>
                        <Button variant="solid" onClick={() => router.push('/concepts/topup')}>Trang nạp tiền</Button>
                    </div>
                </div>
            </AdaptiveCard>
        </Container>
    )
}


