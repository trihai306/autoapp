'use client'

import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { useState } from 'react'
import TransactionService from '@/services/transaction/TransactionService'

const ServiceCard = ({ title, app, imgSrc, bullets = [], comingSoon = false, onOrder }) => {
    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4 bg-white dark:bg-gray-800">
            <div className="text-sm font-semibold text-red-500">Yêu cầu: Phone ROM gốc</div>
            <div className="flex items-center gap-4">
                <img src={imgSrc} alt={title} className="w-24 h-24 object-contain" />
                <div>
                    <h4 className="font-bold">{title}</h4>
                    <div className="mt-2">
                        <span className="text-sm mr-2">Link app:</span>
                        <span className="px-3 py-1 rounded-lg bg-black text-white text-sm">{app}</span>
                    </div>
                </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {bullets.map((b, i) => (
                    <div key={i} className="py-3 flex items-start gap-2">
                        <span className="text-emerald-500">✓</span>
                        <span>{b}</span>
                    </div>
                ))}
            </div>
            <div className="mt-2 flex items-center justify-between">
                {comingSoon ? (
                    <span className="text-pink-600 font-semibold">Coming soon</span>
                ) : <span />}
                <Button variant="solid" onClick={onOrder}>
                    🛒 Đặt hàng ngay
                </Button>
            </div>
        </div>
    )
}

const ServiceRegistration = () => {
    const [orderDialog, setOrderDialog] = useState({ open: false, service: null })
    const [amount, setAmount] = useState(200000)
    const [loading, setLoading] = useState(false)
    const [qrPayload, setQrPayload] = useState(null)
    const commonBullets = [
        'Quản lý đồng thời nhiều tài khoản',
        'Tăng tương tác trên trang cá nhân hoặc fanpage',
        'Kiếm tiền Traodoituongtac.com',
    ]

    const handleOrder = (service) => {
        setOrderDialog({ open: true, service })
        setQrPayload(null)
        setAmount(service?.name?.includes('Facebook') ? 300000 : 200000)
    }
    const handleClose = () => {
        setOrderDialog({ open: false, service: null })
        setQrPayload(null)
        setLoading(false)
    }

    const buildQrUrl = (text) => `https://chart.googleapis.com/chart?cht=qr&chs=280x280&chld=M|0&chl=${encodeURIComponent(text)}`
    const handleCreatePayment = async () => {
        try {
            setLoading(true)
            const resp = await TransactionService.createTopupIntent({ amount, note: `SERVICE-${orderDialog.service?.app || 'APP'}` })
            setQrPayload(resp)
        } catch (e) {
            alert(e?.response?.data?.message || 'Không thể tạo yêu cầu thanh toán')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container>
            <AdaptiveCard>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ServiceCard
                        title="Max Cloud TikTok"
                        app="Tiktok"
                        imgSrc="/FE/public/img/products/product-1.jpg"
                        bullets={commonBullets}
                        onOrder={() => handleOrder({ name: 'Max Cloud TikTok', app: 'Tiktok' })}
                    />
                    <ServiceCard
                        title="Max Cloud Facebook"
                        app="Facebook"
                        imgSrc="/FE/public/img/products/product-2.jpg"
                        bullets={commonBullets}
                        onOrder={() => handleOrder({ name: 'Max Cloud Facebook', app: 'Facebook' })}
                        comingSoon
                    />
                </div>
            </AdaptiveCard>

            <Dialog isOpen={orderDialog.open} onClose={handleClose} width={560}>
                <div className="p-6">
                    <h4 className="mb-2">Đặt hàng dịch vụ</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Bạn đang chọn: <span className="font-semibold">{orderDialog.service?.name}</span> ({orderDialog.service?.app})
                    </p>

                    {!qrPayload && (
                        <>
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {commonBullets.map((b, i) => (
                                        <li key={i}>{b}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Giá gói</span>
                                <select
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                >
                                    <option value={200000}>200.000đ / tháng</option>
                                    <option value={300000}>300.000đ / tháng</option>
                                    <option value={500000}>500.000đ / tháng</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <Button onClick={handleClose}>Đóng</Button>
                                <Button variant="solid" loading={loading} onClick={handleCreatePayment}>Thanh toán</Button>
                            </div>
                        </>
                    )}

                    {qrPayload && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center">
                                <img
                                    src={buildQrUrl(qrPayload.qr_text || '')}
                                    alt="QR Thanh toán"
                                    className="w-64 h-64"
                                />
                            </div>
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <div className="text-sm">Ngân hàng: <span className="font-semibold">{qrPayload.bank?.name}</span></div>
                                <div className="text-sm">Chủ TK: <span className="font-semibold">{qrPayload.bank?.account_name}</span></div>
                                <div className="text-sm">Số TK: <span className="font-semibold">{qrPayload.bank?.account_number}</span></div>
                                <div className="text-sm">Số tiền: <span className="font-semibold">{(qrPayload.amount || amount).toLocaleString('vi-VN')}đ</span></div>
                                <div className="text-sm">Nội dung: <span className="font-semibold">{qrPayload.note}</span></div>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <Button onClick={handleClose}>Đóng</Button>
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>
        </Container>
    )
}

export default ServiceRegistration


