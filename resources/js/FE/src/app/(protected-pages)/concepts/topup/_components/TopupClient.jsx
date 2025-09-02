'use client'

import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { useEffect, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useTranslations } from 'next-intl'
import TransactionService from '@/services/transaction/TransactionService'
// Inline hiển thị QR, không chuyển trang

const mockHistory = []

const StatusBadge = ({ status }) => {
    const color = status === 'completed'
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
        : status === 'failed'
        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{status}</span>
    )
}

const BankInfo = () => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-300">Ngân hàng</span>
                <strong>Vietcombank</strong>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-300">Tên tài khoản</span>
                <strong>CONG TY ABC</strong>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-300">Số tài khoản</span>
                <strong>0123 456 789</strong>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-300">Nội dung CK</span>
                <strong>NAPTIEN - [SĐT/EMAIL]</strong>
            </div>
        </div>
    )
}

const TopupClient = () => {
    const t = useTranslations('nav')
    const [showQr, setShowQr] = useState(false)
    const [amount, setAmount] = useState(100000)
    const [note, setNote] = useState('')
    const [history, setHistory] = useState(mockHistory)
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [query, setQuery] = useState('')
    const [total, setTotal] = useState(0)
    const [loadingTopup, setLoadingTopup] = useState(false)
    const [qrPayload, setQrPayload] = useState(null)

    useEffect(() => {
        let mounted = true
        const fetchHistory = async () => {
            try {
                setLoadingHistory(true)
                const resp = await TransactionService.getUserTransactions({ page: pageIndex, per_page: pageSize, sort: '-created_at', search: query?.trim() || undefined })
                if (!mounted) return
                const list = resp?.data || resp?.data?.data || resp?.list || []
                const totalItems = resp?.total || resp?.pagination?.total || resp?.meta?.total || 0
                setHistory(Array.isArray(list) ? list : [])
                setTotal(Number(totalItems) || 0)
            } catch (e) {
                console.error('Failed to load topup history', e)
                setHistory([])
                setTotal(0)
            } finally {
                setLoadingHistory(false)
            }
        }
        fetchHistory()
        return () => { mounted = false }
    }, [pageIndex, pageSize, query])

    const buildQrUrl = (text) => `https://chart.googleapis.com/chart?cht=qr&chs=280x280&chld=M|0&chl=${encodeURIComponent(text)}`
    const handleTopup = async () => {
        try {
            setLoadingTopup(true)
            setQrPayload(null)
            const resp = await TransactionService.createTopupIntent({ amount, note })
            setQrPayload(resp)
            setShowQr(true)
            
            // Refresh history to show new transaction
            setPageIndex(1)
            const historyResp = await TransactionService.getUserTransactions({ 
                page: 1, 
                per_page: pageSize, 
                sort: '-created_at', 
                search: query?.trim() || undefined 
            })
            const list = historyResp?.data || historyResp?.data?.data || historyResp?.list || []
            const totalItems = historyResp?.total || historyResp?.pagination?.total || historyResp?.meta?.total || 0
            setHistory(Array.isArray(list) ? list : [])
            setTotal(Number(totalItems) || 0)
        } catch (e) {
            console.error('Create topup intent failed', e)
            alert(e?.response?.data?.message || 'Không thể tạo yêu cầu nạp, vui lòng thử lại')
        } finally {
            setLoadingTopup(false)
        }
    }
    const handleBackFromQr = () => setShowQr(false)

    return (
        <Container>
            <AdaptiveCard>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Left: Topup form + bank info */}
                    <div className="space-y-6">
                        {!showQr && (
                            <>
                                <div>
                                    <h3 className="mb-2">{t('topup')}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Nhập số tiền muốn nạp và chuyển khoản theo thông tin bên dưới.</p>
                                </div>
                                <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-600">
                                    <div className="mb-4">
                                        <label className="block mb-2 font-semibold">Số tiền</label>
                                        <NumericFormat
                                            className="heading-text w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-transparent"
                                            thousandSeparator
                                            allowNegative={false}
                                            value={amount}
                                            onValueChange={(v) => setAmount(v.floatValue || 0)}
                                        />
                                        <div className="text-sm text-gray-500 mt-1">Tối thiểu 50,000đ</div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block mb-2 font-semibold">Ghi chú (tuỳ chọn)</label>
                                        <Input textArea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nội dung thêm cho giao dịch" />
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <Button variant="solid" loading={loadingTopup} onClick={handleTopup}>Tạo yêu cầu nạp</Button>
                                    </div>
                                </div>
                                <div>
                                    <h5 className="mb-3">Thông tin chuyển khoản</h5>
                                    <BankInfo />
                                </div>
                            </>
                        )}

                        {showQr && (
                            <>
                                <div>
                                    <h3 className="mb-2">Quét QR để nạp tiền</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Sử dụng ứng dụng ngân hàng để quét mã QR bên dưới.</p>
                                </div>
                                <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-600 flex flex-col items-center gap-4">
                                    <img
                                        src={qrPayload?.qr_image_base64 || buildQrUrl(qrPayload?.qr_text || `VCB|0123456789|CONG TY ABC|${amount}|${note || 'NAPTIEN'}`)}
                                        alt="QR Code"
                                        width={280}
                                        height={280}
                                    />
                                    <div className="text-center space-y-1">
                                        <div className="text-sm text-gray-500">Số tiền</div>
                                        <div className="text-2xl font-bold heading-text">
                                            <NumericFormat displayType="text" value={qrPayload?.amount || amount} thousandSeparator suffix=" đ" />
                                        </div>
                                        {(qrPayload?.note || note) && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Nội dung: <span className="font-semibold">{qrPayload?.note || note}</span></div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button onClick={handleBackFromQr}>Nhập lại</Button>
                                        <Button variant="solid" onClick={() => setShowQr(false)}>Đổi số tiền</Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: History */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <h5>Lịch sử nạp tiền</h5>
                            <div className="flex items-center gap-2">
                                <input
                                    value={query}
                                    onChange={(e) => { setPageIndex(1); setQuery(e.target.value) }}
                                    placeholder="Tìm theo mã/ghi chú"
                                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent"
                                />
                                <select
                                    value={pageSize}
                                    onChange={(e) => { setPageIndex(1); setPageSize(Number(e.target.value)) }}
                                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent"
                                >
                                    <option value={5}>5 / trang</option>
                                    <option value={10}>10 / trang</option>
                                    <option value={20}>20 / trang</option>
                                </select>
                            </div>
                        </div>
                        <div className="rounded-xl border border-gray-200 dark:border-gray-600 divide-y divide-gray-200 dark:divide-gray-700">
                            {loadingHistory && (
                                <div className="p-6 text-center text-gray-500">Đang tải...</div>
                            )}
                                                               {!loadingHistory && history.map((item) => (
                                       <div key={item.id} className="p-4 flex items-center justify-between">
                                           <div className="flex-1">
                                               <div className="font-semibold">#{item.id}</div>
                                               <div className="text-xs text-gray-500">{item.created_at}</div>
                                               {item.note && (
                                                   <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                       Ghi chú: {item.note}
                                                   </div>
                                               )}
                                           </div>
                                           <div className="flex items-center gap-4">
                                               <div className="font-bold heading-text text-emerald-600">
                                                   <NumericFormat displayType="text" value={item.amount} thousandSeparator suffix=" đ" />
                                               </div>
                                               <StatusBadge status={item.status} />
                                           </div>
                                       </div>
                                   ))}
                            {!loadingHistory && history.length === 0 && (
                                <div className="p-6 text-center text-gray-500">Chưa có giao dịch</div>
                            )}
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <div>
                                Tổng: <span className="font-semibold">{total}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button disabled={pageIndex <= 1} onClick={() => setPageIndex((p) => Math.max(1, p - 1))}>Trước</Button>
                                <span>Trang {pageIndex}</span>
                                <Button disabled={history.length < pageSize || total <= pageIndex * pageSize} onClick={() => setPageIndex((p) => p + 1)}>Sau</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default TopupClient


