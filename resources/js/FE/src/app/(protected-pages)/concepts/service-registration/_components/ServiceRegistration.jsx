'use client'

import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Badge from '@/components/ui/Badge'
import { useState, useEffect } from 'react'
import TransactionService from '@/services/transaction/TransactionService'
import { apiGetServicePackages, ServicePackageHelpers } from '@/services/service-package/ServicePackageService'
import { toast } from 'react-hot-toast'

const ServiceCard = ({ pkg, onOrder }) => {
    if (!pkg) return null
    
    const isActive = ServicePackageHelpers.isActive(pkg)
    const isPopular = ServicePackageHelpers.isPopular(pkg)
    const isFree = ServicePackageHelpers.isFree(pkg)
    
    return (
        <div className={`rounded-2xl border p-6 flex flex-col gap-4 bg-white dark:bg-gray-800 relative ${
            isActive ? 'border-gray-200 dark:border-gray-700' : 'border-gray-300 dark:border-gray-600 opacity-75'
        }`}>
            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute -top-2 -right-2">
                    <Badge variant="solid" color="yellow" size="sm">
                        ⭐ Phổ biến
                    </Badge>
                </div>
            )}
            
            {/* Status Badge */}
            <div className={`text-sm font-semibold ${
                isActive ? 'text-emerald-600' : 'text-red-500'
            }`}>
                {isActive ? '✅ Đang hoạt động' : '❌ Tạm dừng'}
            </div>
            
            {/* Package Info */}
            <div className="flex items-center gap-4">
                {pkg.icon && (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center text-2xl shadow-sm">
                        {pkg.icon}
                    </div>
                )}
                <div className="flex-1">
                    <h4 className="font-bold text-lg">{pkg.name}</h4>
                    <div className="mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Thời hạn:</span>
                        <span className="ml-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm">
                            {pkg ? ServicePackageHelpers.getDurationText(pkg) : 'Không xác định'}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Price */}
            <div className="text-center py-4 border-t border-b border-gray-200 dark:border-gray-700">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {pkg ? ServicePackageHelpers.formatPrice(pkg.price, pkg.currency) : '0 ₫'}
                </div>
                {isFree && (
                    <div className="text-sm text-emerald-600 font-medium mt-1">Miễn phí</div>
                )}
            </div>
            
            {/* Description */}
            {pkg.description && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {pkg.description}
                </div>
            )}
            
            {/* Features */}
            {pkg.features && pkg.features.length > 0 && (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {pkg.features.map((feature, i) => (
                        <div key={i} className="py-2 flex items-start gap-2">
                            <span className="text-emerald-500">✓</span>
                            <span className="text-sm">{feature.name || feature}</span>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Order Button */}
            <div className="mt-auto">
                <Button 
                    variant="solid" 
                    onClick={() => onOrder(pkg)}
                    disabled={!isActive}
                    className={`w-full ${
                        !isActive ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {isActive ? '🛒 Đặt hàng ngay' : '⏸️ Tạm dừng'}
                </Button>
            </div>
        </div>
    )
}

const ServiceRegistration = () => {
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(false)
    const [orderDialog, setOrderDialog] = useState({ open: false, service: null })
    const [amount, setAmount] = useState(200000)
    const [qrLoading, setQrLoading] = useState(false)
    const [qrPayload, setQrPayload] = useState(null)
    
    // Load service packages from API
    const loadPackages = async () => {
        try {
            setLoading(true)
            console.log('🔄 Loading packages...')
            
            const params = {
                per_page: 50, // Load all packages
                active: true, // Only show active packages
                sort_by: 'sort_order', // Sort by sort_order
                sort_direction: 'asc' // Ascending order
            }
            
            console.log('📡 Calling API with params:', params)
            const result = await apiGetServicePackages(params)
            console.log('✅ API Response:', result)
            
            if (result && result.data) {
                // Sort packages: popular first, then by sort_order, then by price
                const sortedPackages = result.data.sort((a, b) => {
                    if (ServicePackageHelpers.isPopular(a) && !ServicePackageHelpers.isPopular(b)) return -1
                    if (!ServicePackageHelpers.isPopular(a) && ServicePackageHelpers.isPopular(b)) return 1
                    
                    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
                    
                    return a.price - b.price
                })
                
                console.log('📦 Sorted packages:', sortedPackages)
                setPackages(sortedPackages)
            } else {
                console.log('⚠️ No data received, setting empty array')
                setPackages([])
            }
        } catch (error) {
            console.error('❌ Error loading packages:', error)
            toast.error('Có lỗi xảy ra khi tải dữ liệu: ' + error.message)
            setPackages([])
        } finally {
            setLoading(false)
        }
    }
    
    useEffect(() => {
        loadPackages()
    }, [])

    const handleOrder = (pkg) => {
        setOrderDialog({ open: true, service: pkg })
        setQrPayload(null)
        setAmount(pkg.price || 200000)
    }
    
    const handleClose = () => {
        setOrderDialog({ open: false, service: null })
        setQrPayload(null)
        setQrLoading(false)
    }

    const buildQrUrl = (text) => `https://chart.googleapis.com/chart?cht=qr&chs=280x280&chld=M|0&chl=${encodeURIComponent(text)}`
    
    const handleCreatePayment = async () => {
        try {
            setQrLoading(true)
            
            // Gọi API mua gói dịch vụ
            const response = await fetch('/api/service-packages/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify({
                    service_package_id: orderDialog.service.id,
                    payment_method: 'balance',
                    notes: `Mua gói dịch vụ: ${orderDialog.service.name}`
                })
            })
            
            const result = await response.json()
            
            if (result.success) {
                toast.success('Mua gói dịch vụ thành công!')
                setOrderDialog({ open: false, service: null })
                setQrPayload(null)
                // Reload packages để cập nhật trạng thái
                loadPackages()
            } else {
                toast.error(result.message || 'Không thể mua gói dịch vụ')
            }
        } catch (e) {
            console.error('Payment error:', e)
            toast.error('Có lỗi xảy ra khi thanh toán')
        } finally {
            setQrLoading(false)
        }
    }

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Đăng ký gói dịch vụ
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Chọn gói dịch vụ phù hợp với nhu cầu của bạn
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Đang tải gói dịch vụ...</p>
                    </div>
                )}

                {/* Packages Grid */}
                {!loading && packages.length > 0 && (
                    <AdaptiveCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {packages.map((pkg) => (
                                <ServiceCard
                                    key={pkg.id}
                                    pkg={pkg}
                                    onOrder={handleOrder}
                                />
                            ))}
                        </div>
                    </AdaptiveCard>
                )}

                {/* No Packages */}
                {!loading && packages.length === 0 && (
                    <AdaptiveCard>
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📦</div>
                            <h3 className="text-xl font-semibold mb-2">Không có gói dịch vụ</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Hiện tại không có gói dịch vụ nào khả dụng
                            </p>
                        </div>
                    </AdaptiveCard>
                )}
            </div>

            <Dialog isOpen={orderDialog.open} onClose={handleClose} width={560}>
                <div className="p-6">
                    <h4 className="mb-2">Đặt hàng dịch vụ</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Bạn đang chọn: <span className="font-semibold">{orderDialog.service?.name}</span>
                    </p>

                    {!qrPayload && (
                        <>
                            {/* Package Info */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    {orderDialog.service?.icon && (
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center text-xl">
                                            {orderDialog.service.icon}
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-semibold">{orderDialog.service?.name}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {orderDialog.service ? ServicePackageHelpers.getDurationText(orderDialog.service) : 'Không xác định'}
                                        </div>
                                    </div>
                                </div>
                                
                                {orderDialog.service?.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {orderDialog.service.description}
                                    </p>
                                )}
                                
                                {orderDialog.service?.features && orderDialog.service.features.length > 0 && (
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        {orderDialog.service.features.map((feature, i) => (
                                            <li key={i}>{feature.name || feature}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            
                            {/* Price Display */}
                            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Giá gói</span>
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {orderDialog.service ? ServicePackageHelpers.formatPrice(orderDialog.service.price || 0, orderDialog.service.currency || 'VND') : '0 ₫'}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-end gap-2">
                                <Button onClick={handleClose}>Đóng</Button>
                                <Button 
                                    variant="solid" 
                                    loading={qrLoading} 
                                    onClick={handleCreatePayment}
                                >
                                    Thanh toán
                                </Button>
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



