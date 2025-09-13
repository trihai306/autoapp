'use client'

import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Badge from '@/components/ui/Badge'
import { useState, useEffect } from 'react'
import TransactionService from '@/services/transaction/TransactionService'
import { apiGetServicePackages, ServicePackageHelpers } from '@/services/service-package/ServicePackageService'
import purchaseServicePackage from '@/server/actions/service-package/purchaseServicePackage'
import { toast } from 'react-hot-toast'
import useBalance from '@/utils/hooks/useBalance'
import { apiGetProfile } from '@/services/auth/AuthService'
import { 
    HiOutlineSparkles as Sparkles,
    HiOutlineCheckCircle as CheckCircle,
    HiOutlineStar as Star,
    HiOutlineClock as Clock,
    HiOutlineShieldCheck as Shield,
    HiOutlineLightningBolt as Lightning,
    HiOutlineTrendingUp as Trending,
    HiOutlineUsers as Users,
    HiOutlineCog as Settings,
    HiOutlineHeart as Heart,
    HiOutlineGift as Gift,
    HiOutlineCube as Cube,
    HiOutlineRocketLaunch as Rocket,
    HiOutlineFire as Fire,
    HiOutlineBadgeCheck as Crown
} from 'react-icons/hi'

const ServiceCard = ({ pkg, onOrder, index }) => {
    if (!pkg) return null
    
    const isActive = ServicePackageHelpers.isActive(pkg)
    const isPopular = ServicePackageHelpers.isPopular(pkg)
    const isFree = ServicePackageHelpers.isFree(pkg)
    
    // Kiểm tra xem user đã mua gói này chưa (từ API)
    const hasPurchased = pkg.is_purchased || false
    const currentSubscription = pkg.user_subscription || null
    
    const getCardGradient = () => {
        if (isPopular) return 'from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20'
        if (isFree) return 'from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/20'
        return 'from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20'
    }
    
    const getBorderColor = () => {
        if (isPopular) return 'border-yellow-200 dark:border-yellow-700'
        if (isFree) return 'border-emerald-200 dark:border-emerald-700'
        return 'border-blue-200 dark:border-blue-700'
    }
    
    return (
        <div className={`group relative overflow-hidden rounded-3xl border-2 p-8 flex flex-col h-full bg-gradient-to-br ${getCardGradient()} ${getBorderColor()} transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 ${
            !isActive ? 'opacity-60 grayscale' : ''
        }`}>
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            
            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute -top-3 -right-3 z-10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-sm"></div>
                        <Badge variant="solid" color="yellow" size="sm" className="relative bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg animate-pulse">
                            <Star className="w-3 h-3 mr-1" />
                            Phổ biến
                    </Badge>
                    </div>
                </div>
            )}
            
            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold w-fit ${
                isActive 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                {isActive ? 'Đang hoạt động' : 'Tạm dừng'}
            </div>
            
            {/* Package Icon & Info */}
            <div className="flex items-start gap-6 mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-white/90 to-white/60 dark:from-gray-800/90 dark:to-gray-800/60 flex items-center justify-center shadow-xl backdrop-blur-sm border border-white/30 flex-shrink-0 relative overflow-hidden ${
                    isPopular ? 'animate-bounce' : ''
                }`}>
                    {/* Background Pattern */}
                    <div className={`absolute inset-0 rounded-2xl ${
                        isPopular 
                            ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10' 
                            : isFree 
                            ? 'bg-gradient-to-br from-emerald-500/10 to-green-500/10'
                            : 'bg-gradient-to-br from-blue-500/10 to-purple-500/10'
                    }`}></div>
                    
                    {/* Icon with better styling */}
                    <div className="relative z-10">
                        {pkg.icon ? (
                            <div className="text-2xl">{pkg.icon}</div>
                        ) : (
                            <div className="relative">
                                {isPopular ? (
                                    <div className="relative">
                                        <Crown className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                                    </div>
                                ) : isFree ? (
                                    <div className="relative">
                                        <Gift className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse"></div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Cube className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-60"></div>
                    <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-40"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-2xl text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {pkg.name}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Thời hạn:</span>
                        <span className="px-3 py-1 rounded-full bg-white/60 dark:bg-gray-800/60 text-sm font-medium backdrop-blur-sm">
                            {pkg ? ServicePackageHelpers.getDurationText(pkg) : 'Không xác định'}
                        </span>
                        {hasPurchased && currentSubscription && (
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-medium">
                                <CheckCircle className="w-3 h-3 mr-1 inline" />
                                Hết hạn: {new Date(currentSubscription.expires_at).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Price Section */}
            <div className="text-center py-6 bg-white/40 dark:bg-gray-800/40 rounded-2xl backdrop-blur-sm border border-white/20">
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2">
                    {pkg ? ServicePackageHelpers.formatPrice(pkg.price, pkg.currency) : '0 ₫'}
                </div>
                {isFree && (
                    <div className="inline-flex items-center gap-1 text-sm text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                        <Gift className="w-4 h-4" />
                        Miễn phí
                    </div>
                )}
            </div>
            
            {/* Content Section - Flexible height */}
            <div className="flex-1 flex flex-col">
            {/* Description */}
            {pkg.description && (
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3">
                    {pkg.description}
                </div>
            )}
            
            {/* Features */}
            {pkg.features && pkg.features.length > 0 && (
                    <div className="space-y-3 flex-1">
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            Tính năng nổi bật
                        </h5>
                        <div className="space-y-2">
                            {pkg.features.slice(0, 4).map((feature, i) => (
                                <div key={i} className="flex items-start gap-3 group/feature">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover/feature:text-gray-900 dark:group-hover/feature:text-gray-100 transition-colors line-clamp-2">
                                        {feature.name || feature}
                                    </span>
                                </div>
                            ))}
                            {pkg.features.length > 4 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 ml-8">
                                    +{pkg.features.length - 4} tính năng khác
                                </div>
                            )}
                        </div>
                </div>
            )}
            </div>
            
            {/* Order Button */}
            <div className="mt-auto">
                {hasPurchased ? (
                    <Button 
                        variant="solid" 
                        disabled
                        className="w-full h-12 text-lg font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white cursor-not-allowed shadow-lg animate-pulse"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5 animate-bounce" />
                            <span className="animate-pulse">Đã mua dịch vụ</span>
                        </span>
                    </Button>
                ) : (
                <Button 
                    variant="solid" 
                    onClick={() => onOrder(pkg)}
                    disabled={!isActive}
                        className={`w-full h-12 text-lg font-bold rounded-xl transition-all duration-300 ${
                            isPopular 
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-yellow-500/25' 
                                : isFree
                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-emerald-500/25'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25'
                        } ${
                            !isActive ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                        }`}
                    >
                        {isActive ? (
                            <span className="flex items-center justify-center gap-2">
                                <Lightning className="w-5 h-5" />
                                Đặt hàng ngay
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <Settings className="w-5 h-5" />
                                Tạm dừng
                            </span>
                        )}
                </Button>
                )}
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
    const { refreshBalance } = useBalance()
    
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
            const errorMessage = error.message || 'Không thể tải danh sách gói dịch vụ'
            toast.error(`❌ ${errorMessage}`, {
                duration: 4000,
                icon: '⚠️'
            })
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
            console.log('💰 [DEBUG] Starting payment process...')
            console.log('📦 [DEBUG] Order dialog service:', orderDialog.service)
            
            setQrLoading(true)
            
            const paymentData = {
                service_package_id: orderDialog.service.id,
                payment_method: 'balance',
                notes: `Mua gói dịch vụ: ${orderDialog.service.name}`
            }
            
            console.log('📡 [DEBUG] Calling purchaseServicePackage with data:', paymentData)
            
            // Sử dụng server action để mua gói dịch vụ
            const result = await purchaseServicePackage(paymentData)
            
            console.log('✅ [DEBUG] purchaseServicePackage result:', result)
            
            if (result.success) {
                console.log('🎉 [DEBUG] Payment successful!')
                toast.success('🎉 Mua gói dịch vụ thành công! Bạn có thể sử dụng ngay.', {
                    duration: 5000,
                    icon: '✅'
                })
                setOrderDialog({ open: false, service: null })
                setQrPayload(null)
                
                // Cập nhật balance trước khi reload packages
                console.log('💰 [DEBUG] Refreshing balance...')
                await refreshBalance()
                
                // Reload packages để cập nhật trạng thái
                console.log('📦 [DEBUG] Reloading packages...')
                await loadPackages()
                
                console.log('✅ [DEBUG] All updates completed!')
            } else {
                console.log('❌ [DEBUG] Payment failed:', result.message)
                toast.error(result.message || 'Không thể mua gói dịch vụ', {
                    duration: 4000,
                    icon: '❌'
                })
            }
        } catch (e) {
            console.error('💥 [DEBUG] Payment error:', e)
            const errorMessage = e.message || 'Có lỗi xảy ra khi thanh toán'
            toast.error(`❌ ${errorMessage}`, {
                duration: 5000,
                icon: '⚠️'
            })
        } finally {
            setQrLoading(false)
        }
    }

    return (
        <Container>
            <div className="space-y-12 py-8">
                    {/* Hero Section */}
                    <div className="text-center relative">
                        {/* Background Elements */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl"></div>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 shadow-lg mb-6">
                                <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dịch vụ chuyên nghiệp</span>
                            </div>
                            
                            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 mb-6 leading-tight">
                        Đăng ký gói dịch vụ
                    </h1>
                            
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                                Chọn gói dịch vụ phù hợp với nhu cầu của bạn và trải nghiệm những tính năng tuyệt vời
                            </p>
                            
                            {/* Stats */}
                            <div className="flex flex-wrap justify-center gap-8 mt-8">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">1000+ người dùng</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                                    <Shield className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bảo mật cao</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                                    <Trending className="w-5 h-5 text-purple-500" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hiệu suất tối ưu</span>
                                </div>
                            </div>
                        </div>
                </div>

                {/* Loading State */}
                {loading && (
                        <div className="text-center py-20">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400 mx-auto"></div>
                                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400 mx-auto"></div>
                            </div>
                            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">Đang tải gói dịch vụ...</p>
                        </div>
                    )}

                    {/* Packages Grid */}
                    {!loading && packages.length > 0 && (
                        <div className="relative">
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
                                {packages.map((pkg, index) => (
                                    <div 
                                        key={pkg.id}
                                        className="animate-fade-in-up flex"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <ServiceCard
                                            pkg={pkg}
                                            onOrder={handleOrder}
                                            index={index}
                                        />
                                    </div>
                            ))}
                            </div>
                        </div>
                )}

                    {/* No Packages */}
                    {!loading && packages.length === 0 && (
                        <div className="text-center py-20">
                            <div className="relative">
                                <div className="w-32 h-32 mx-auto mb-8 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full"></div>
                                    <div className="absolute inset-4 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center">
                                        <Gift className="w-16 h-16 text-gray-400" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Không có gói dịch vụ</h3>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                                    Hiện tại không có gói dịch vụ nào khả dụng. Vui lòng quay lại sau.
                                </p>
                                <Button 
                                    onClick={() => {
                                        loadPackages()
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                                >
                                    Thử lại
                                </Button>
                            </div>
                        </div>
                )}
            </div>

            <Dialog isOpen={orderDialog.open} onClose={handleClose} width={600} className="z-[100]">
                <div className="relative overflow-hidden">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"></div>
                    
                    <div className="relative z-10 p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-4">
                                <Heart className="w-4 h-4" />
                                Xác nhận đặt hàng
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Bạn đang chọn gói
                            </h4>
                            <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold">
                                {orderDialog.service?.name}
                            </p>
                        </div>

                    {!qrPayload && (
                        <>
                            {/* Package Info */}
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-6 shadow-lg">
                                    <div className="flex items-start gap-4 mb-4">
                                    {orderDialog.service?.icon && (
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center text-2xl shadow-md">
                                            {orderDialog.service.icon}
                                        </div>
                                    )}
                                        <div className="flex-1">
                                            <div className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-2">
                                                {orderDialog.service?.name}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                <span>
                                            {orderDialog.service ? ServicePackageHelpers.getDurationText(orderDialog.service) : 'Không xác định'}
                                                </span>
                                            </div>
                                    </div>
                                </div>
                                
                                {orderDialog.service?.description && (
                                        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        {orderDialog.service.description}
                                    </p>
                                )}
                                
                                {orderDialog.service?.features && orderDialog.service.features.length > 0 && (
                                        <div className="space-y-2">
                                            <h5 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-blue-500" />
                                                Tính năng bao gồm
                                            </h5>
                                            <div className="grid grid-cols-1 gap-2">
                                                {orderDialog.service.features.slice(0, 6).map((feature, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                            {feature.name || feature}
                                                        </span>
                                                    </div>
                                                ))}
                                                {orderDialog.service.features.length > 6 && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                                                        +{orderDialog.service.features.length - 6} tính năng khác
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                )}
                            </div>
                            
                            {/* Price Display */}
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mb-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm opacity-90">Tổng thanh toán</div>
                                            <div className="text-3xl font-black">
                                    {orderDialog.service ? ServicePackageHelpers.formatPrice(orderDialog.service.price || 0, orderDialog.service.currency || 'VND') : '0 ₫'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm opacity-90">Phương thức</div>
                                            <div className="text-lg font-semibold">Số dư tài khoản</div>
                                        </div>
                                    </div>
                            </div>
                            
                                <div className="flex items-center justify-end gap-3">
                                    <Button 
                                        variant="outline" 
                                        onClick={handleClose}
                                        className="px-6 py-2"
                                    >
                                        Hủy bỏ
                                    </Button>
                                <Button 
                                    variant="solid" 
                                    loading={qrLoading} 
                                    onClick={handleCreatePayment}
                                        className="px-8 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                                >
                                        <span className="flex items-center gap-2">
                                            <Lightning className="w-4 h-4" />
                                            Thanh toán ngay
                                        </span>
                                </Button>
                            </div>
                        </>
                    )}

                    {qrPayload && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        Quét mã QR để thanh toán
                                    </h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Sử dụng ứng dụng ngân hàng để quét mã QR bên dưới
                                    </p>
                                </div>
                                
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-sm"></div>
                                        <div className="relative bg-white p-4 rounded-2xl">
                                <img
                                    src={buildQrUrl(qrPayload.qr_text || '')}
                                    alt="QR Thanh toán"
                                    className="w-64 h-64"
                                />
                            </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                                    <h6 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-500" />
                                        Thông tin thanh toán
                                    </h6>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Ngân hàng:</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{qrPayload.bank?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Chủ TK:</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{qrPayload.bank?.account_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Số TK:</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">{qrPayload.bank?.account_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Số tiền:</span>
                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                {(qrPayload.amount || amount).toLocaleString('vi-VN')}đ
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Nội dung:</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">{qrPayload.note}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-center">
                                    <Button 
                                        onClick={handleClose}
                                        className="px-8 py-2"
                                    >
                                        Đóng
                                    </Button>
                            </div>
                            </div>
                        )}
                        </div>
                </div>
            </Dialog>
        </Container>
    )
}

export default ServiceRegistration

// Add CSS animations
const styles = `
@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
    opacity: 0;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
`

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
}



