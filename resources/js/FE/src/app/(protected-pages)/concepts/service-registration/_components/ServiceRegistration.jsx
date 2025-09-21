'use client'

import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Badge from '@/components/ui/Badge'
import { useState, useEffect } from 'react'
import TransactionService from '@/services/transaction/TransactionService'
import { 
    apiGetServicePackages, 
    apiGetServicePackageCategories,
    apiGetServicePackageTiersByPackage,
    apiGetServicePackagesByCategory,
    apiGetServicePackagesWithTiersByCategory,
    ServicePackageHelpers 
} from '@/services/service-package/ServicePackageService'
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
    HiOutlineBadgeCheck as Crown,
    HiOutlineX as X,
    HiOutlineDeviceMobile as Phone,
    HiOutlineDesktopComputer as Desktop,
    HiOutlineServer as Server,
    HiOutlineGlobe as Globe
} from 'react-icons/hi'

// Software Card Component
const SoftwareCard = ({ category, onClick }) => {
    const getSoftwareInfo = (name) => {
        const lowerName = name.toLowerCase()
        if (lowerName.includes('facebook')) {
            return {
                title: 'Facebook Automation',
                subtitle: 'Lionsoftware',
                requirement: 'Phone ROM LineageOS + LSPosed',
                linkApp: 'Facebook',
                linkColor: 'bg-blue-600 hover:bg-blue-700',
                icon: (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                ),
                features: [
                    'Quản lý đồng thời nhiều tài khoản',
                    'Tăng tương tác trên trang cá nhân hoặc fanpage',
                    'Kiếm tiền Traodoituongtac.com'
                ],
                comingSoon: true
            }
        }
        if (lowerName.includes('tiktok')) {
            return {
                title: 'TikTok Automation',
                subtitle: 'Lionsoftware',
                requirement: 'Phone ROM gốc',
                linkApp: 'TikTok',
                linkColor: 'bg-black hover:bg-gray-800',
                icon: (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                ),
                features: [
                    'Quản lý đồng thời nhiều tài khoản',
                    'Tăng tương tác trên trang cá nhân hoặc fanpage',
                    'Kiếm tiền Traodoituongtac.com'
                ],
                comingSoon: false
            }
        }
        if (lowerName.includes('instagram')) {
            return {
                title: 'Instagram Automation',
                subtitle: 'Lionsoftware',
                requirement: 'Phone ROM LineageOS + LSPosed',
                linkApp: 'Instagram',
                linkColor: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
                icon: (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                ),
                features: [
                    'Quản lý đồng thời nhiều tài khoản',
                    'Tăng tương tác trên trang cá nhân hoặc fanpage',
                    'Kiếm tiền Traodoituongtac.com'
                ],
                comingSoon: true
            }
        }
        return {
            title: `${name} Automation`,
            subtitle: 'Lionsoftware',
            requirement: 'Phone ROM gốc',
            linkApp: name,
            linkColor: 'bg-gray-600 hover:bg-gray-700',
            icon: <Cube className="w-8 h-8" />,
            features: [
                'Quản lý đồng thời nhiều tài khoản',
                'Tăng tương tác trên trang cá nhân hoặc fanpage',
                'Kiếm tiền Traodoituongtac.com'
            ],
            comingSoon: false
        }
    }

    const softwareInfo = getSoftwareInfo(category.name)

    return (
        <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 p-6">
            {/* Header */}
            <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-4">
                    Yêu cầu: {softwareInfo.requirement}
                </p>
            </div>

            {/* Icon and Title */}
            <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-50 text-gray-600">
                    {softwareInfo.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {softwareInfo.title}
                </h3>
                <p className="text-sm text-gray-500">
                    {softwareInfo.subtitle}
                </p>
            </div>

            {/* Link App Button */}
            <div className="text-center mb-6">
                <button className={`${softwareInfo.linkColor} text-white px-6 py-2 rounded-lg font-medium transition-colors`}>
                    {softwareInfo.linkApp}
                </button>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
                {softwareInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">
                            {feature}
                            {index === 2 && softwareInfo.comingSoon && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    COMING SOON
                                </span>
                            )}
                        </span>
                    </div>
                ))}
            </div>

            {/* Order Button */}
            <button 
                onClick={onClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
                Đặt hàng ngay
            </button>
        </div>
    )
}

// Tier Card Component
const TierCard = ({ tier, onPurchase, isPurchased }) => {
    const isPopular = tier.is_popular
    const isActive = tier.is_active
    
    return (
        <div className={`relative overflow-hidden rounded-xl border-2 p-6 bg-gradient-to-br transition-all duration-300 hover:scale-105 ${
            isPopular 
                ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' 
                : 'border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900'
        } ${!isActive ? 'opacity-60 grayscale' : ''}`}>
            
            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute -top-2 -right-2 z-10">
                    <Badge variant="solid" color="yellow" size="sm" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg">
                            <Star className="w-3 h-3 mr-1" />
                            Phổ biến
                    </Badge>
                </div>
            )}
            
            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold w-fit mb-4 ${
                isActive 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                {isActive ? 'Hoạt động' : 'Tạm dừng'}
            </div>
            
            {/* Tier Info */}
            <div className="mb-4">
                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
                    {tier.name}
                </h4>
                
                {tier.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {tier.description}
                    </p>
                )}
                
                {/* Device Limit */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <Phone className="w-4 h-4" />
                    <span>
                        {tier.device_limit === -1 ? 'Không giới hạn thiết bị' : `${tier.device_limit} thiết bị`}
                            </span>
                </div>
            </div>
            
            {/* Price */}
            <div className="text-center py-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm border border-white/20 mb-4">
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                    {tier.price ? new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: tier.currency || 'VND'
                    }).format(tier.price) : 'Liên hệ'}
                </div>
                {tier.price === 0 && (
                    <div className="inline-flex items-center gap-1 text-sm text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full mt-2">
                        <Gift className="w-4 h-4" />
                        Miễn phí
                    </div>
                )}
            </div>
            
            {/* Purchase Button */}
                    <Button 
                        variant="solid" 
                onClick={() => onPurchase(tier)}
                disabled={!isActive || isPurchased}
                className={`w-full h-10 text-sm font-bold rounded-lg transition-all duration-300 ${
                    isPurchased
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white cursor-not-allowed'
                        : isPopular 
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-yellow-500/25' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25'
                        } ${
                    !isActive ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                {isPurchased ? (
                            <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Đã mua
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                        <Lightning className="w-4 h-4" />
                        Mua ngay
                            </span>
                        )}
                </Button>
        </div>
    )
}

const ServiceRegistration = () => {
    // State management
    const [categories, setCategories] = useState([])
    const [packages, setPackages] = useState([])
    const [tiers, setTiers] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedPackage, setSelectedPackage] = useState(null)
    const [activeTab, setActiveTab] = useState(0) // 0: monthly, 1: yearly
    const [purchaseLoading, setPurchaseLoading] = useState(false)
    const [purchasedTiers, setPurchasedTiers] = useState(new Set())
    const [pricingData, setPricingData] = useState([])
    const { refreshBalance } = useBalance()
    
    // Load categories from API
    const loadCategories = async () => {
        try {
            setLoading(true)
            console.log('🔄 Loading categories...')
            
            const result = await apiGetServicePackageCategories({ 
                per_page: 50,
                active: true 
            })
            
            console.log('✅ Categories API Response:', result)
            
            if (result && result.data) {
                // Check if data is nested in result.data.data (like packages)
                const categoriesData = result.data?.data || result.data || []
                console.log('📦 Categories data:', categoriesData)
                setCategories(categoriesData)
            } else {
                console.log('⚠️ No categories data received')
                setCategories([])
            }
        } catch (error) {
            console.error('❌ Error loading categories:', error)
            toast.error('Không thể tải danh sách danh mục', {
                duration: 4000,
                icon: '⚠️'
            })
            setCategories([])
        } finally {
            setLoading(false)
        }
    }
    
    // Load packages for selected category
    const loadPackagesForCategory = async (categoryId) => {
        try {
            console.log('🔄 Loading packages for category:', categoryId)
            
            const result = await apiGetServicePackagesByCategory(categoryId, {
                per_page: 50,
                active: true,
                sort_by: 'sort_order',
                sort_direction: 'asc'
            })
            
            console.log('✅ Packages API Response:', result)
            
            if (result && result.data) {
                const packages = result.data
                setPackages(packages)
                
                // Reset selected package and tiers when loading new category
                setSelectedPackage(null)
                setTiers([])
            } else {
                setPackages([])
                setSelectedPackage(null)
                setTiers([])
            }
        } catch (error) {
            console.error('❌ Error loading packages:', error)
            toast.error('Không thể tải danh sách gói dịch vụ', {
                duration: 4000,
                icon: '⚠️'
            })
            setPackages([])
            setSelectedPackage(null)
            setTiers([])
        }
    }
    
    // Load tiers for selected package
    const loadTiersForPackage = async (packageId) => {
        try {
            console.log('🔄 Loading tiers for package:', packageId)
            
            // Try alternative API endpoint
            const result = await apiGetServicePackageTiersByPackage(packageId, {
                per_page: 50,
                active: true,
                sort_by: 'sort_order',
                sort_direction: 'asc'
            })
            
            console.log('✅ Tiers API Response:', result)
            
            if (result && result.data) {
                setTiers(result.data)
            } else {
                setTiers([])
            }
        } catch (error) {
            console.error('❌ Error loading tiers:', error)
            
            // Fallback: create mock tiers for testing
            console.log('🔄 Creating mock tiers for testing...')
            const mockTiers = [
                {
                    id: 1,
                    name: 'Basic',
                    description: 'Gói cơ bản cho người mới bắt đầu',
                    device_limit: 5,
                    price: 100000,
                    currency: 'VND',
                    is_popular: false,
                    is_active: true,
                    sort_order: 1
                },
                {
                    id: 2,
                    name: 'Pro',
                    description: 'Gói chuyên nghiệp với nhiều tính năng',
                    device_limit: 20,
                    price: 300000,
                    currency: 'VND',
                    is_popular: true,
                    is_active: true,
                    sort_order: 2
                },
                {
                    id: 3,
                    name: 'Enterprise',
                    description: 'Gói doanh nghiệp không giới hạn',
                    device_limit: -1,
                    price: 500000,
                    currency: 'VND',
                    is_popular: false,
                    is_active: true,
                    sort_order: 3
                }
            ]
            
            setTiers(mockTiers)
            
            toast.error('Không thể tải cấp độ từ server, hiển thị dữ liệu mẫu', {
                duration: 4000,
                icon: '⚠️'
            })
        }
    }
    
    useEffect(() => {
        loadCategories()
    }, [])

    // Handle category click
    const handleCategoryClick = async (category) => {
        setSelectedCategory(category)
        setModalOpen(true)
        await loadPackagesForCategory(category.id)
    }

    
    // Handle package tab click
    const handlePackageTabClick = async (pkg) => {
        setSelectedPackage(pkg)
        await loadTiersForPackage(pkg.id)
    }
    
    // Handle tier purchase
    const handleTierPurchase = async (tier) => {
        try {
            setPurchaseLoading(true)
            console.log('💰 Starting tier purchase:', tier)
            
            const paymentData = {
                service_package_id: selectedPackage.id,
                tier_id: tier.id,
                price: parseFloat(tier.price) || 0,
                payment_method: 'balance',
                notes: `Mua cấp độ ${tier.device_limit === -1 ? 'Không giới hạn' : `${tier.device_limit} thiết bị`} cho gói ${selectedPackage.name}`
            }
            
            console.log('📡 Calling purchaseServicePackage with data:', paymentData)
            
            const result = await purchaseServicePackage(paymentData)
            
            console.log('✅ Purchase result:', result)
            
            if (result.success) {
                toast.success('🎉 Mua cấp độ thành công! Bạn có thể sử dụng ngay.', {
                    duration: 5000,
                    icon: '✅'
                })
                
                // Add to purchased tiers
                setPurchasedTiers(prev => new Set([...prev, tier.id]))
                
                // Refresh balance
                await refreshBalance()
                
                // Reload tiers to update status
                await loadTiersForPackage(selectedPackage.id)
                
            } else {
                toast.error(result.message || 'Không thể mua cấp độ', {
                    duration: 4000,
                    icon: '❌'
                })
            }
        } catch (error) {
            console.error('💥 Purchase error:', error)
            toast.error('Có lỗi xảy ra khi mua cấp độ', {
                duration: 5000,
                icon: '⚠️'
            })
        } finally {
            setPurchaseLoading(false)
        }
    }
    
    // Close modal
    const handleCloseModal = () => {
        setModalOpen(false)
        setSelectedCategory(null)
        setSelectedPackage(null)
        setActiveTab(0)
        setPackages([])
        setTiers([])
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
                            Danh sách phần mềm
                    </h1>
                            
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
                            Lionsoftware là giải pháp phù hợp cho cá nhân hoặc doanh nghiệp muốn xây dựng hệ thống tự động hóa để tiếp cận khách hàng trên các nền tảng mạng xã hội.
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
                        <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">Đang tải danh mục dịch vụ...</p>
                        </div>
                    )}

                {/* Software Cards Grid */}
            {!loading && Array.isArray(categories) && categories.length > 0 && (
                        <div className="relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categories.map((category, index) => (
                                    <div 
                                    key={category.id}
                                    className="animate-fade-in-up"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                    <SoftwareCard
                                        category={category}
                                        onClick={() => handleCategoryClick(category)}
                                        />
                                    </div>
                            ))}
                            </div>
                        </div>
                )}

                {/* No Categories */}
                {!loading && Array.isArray(categories) && categories.length === 0 && (
                        <div className="text-center py-20">
                            <div className="relative">
                                <div className="w-32 h-32 mx-auto mb-8 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full"></div>
                                    <div className="absolute inset-4 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center">
                                        <Gift className="w-16 h-16 text-gray-400" />
                                    </div>
                                </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Không có danh mục</h3>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                                Hiện tại không có danh mục dịch vụ nào khả dụng. Vui lòng quay lại sau.
                                </p>
                                <Button 
                                onClick={loadCategories}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                                >
                                    Thử lại
                                </Button>
                            </div>
                        </div>
                )}
            </div>

            {/* Service Modal */}
            <Dialog isOpen={modalOpen} onClose={handleCloseModal} width="95vw" maxWidth="1400px" className="z-[100]">
                <div className="relative overflow-hidden max-h-[90vh]">
                    {/* Background */}
                    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900"></div>
                    
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {selectedCategory?.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {selectedCategory?.description}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleCloseModal}
                                className="p-2"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Package Tabs */}
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Chọn gói dịch vụ
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Tiền tệ:</span>
                                    <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                        <option value="VND">VND</option>
                                        <option value="USD">USD</option>
                                    </select>
                                            </div>
                                    </div>
                            
                            {packages.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {packages.map((pkg, index) => (
                                        <button
                                            key={pkg.id}
                                            onClick={() => handlePackageTabClick(pkg)}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                selectedPackage?.id === pkg.id
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {pkg.name}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500 dark:text-gray-400">Không có gói dịch vụ nào</p>
                                        </div>
                                )}
                            </div>
                            
                        {/* Tiers Display */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {selectedPackage ? (
                                        <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="text-2xl">
                                            {selectedPackage.icon || <Cube className="w-8 h-8" />}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {selectedPackage.name}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {selectedPackage.description}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {tiers.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {tiers.map((tier, index) => {
                                                // Calculate sale percentage (mock for now)
                                                const salePercentage = [5, 10, 20, 20][index % 4]
                                                
                                                return (
                                                    <div key={tier.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 relative hover:shadow-lg transition-shadow">
                                                        {salePercentage > 0 && (
                                                            <div className="absolute -top-3 -left-3">
                                                                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                                    Sale {salePercentage}%
                                        </span>
                            </div>
                                                        )}
                                                        
                                                        <div className="text-center mb-6">
                                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                                {tier.name}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                                                {ServicePackageHelpers.getDurationText(tier)}
                                                            </p>
                                                            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                                {ServicePackageHelpers.formatPrice(tier.price, tier.currency)}
                                                            </div>
                                </div>
                                
                                                        <div className="space-y-3 mb-6">
                                                            <div className="flex items-center gap-3">
                                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                    {tier.device_limit === -1 ? 'Không giới hạn' : `${tier.device_limit} thiết bị`}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">Hỗ trợ chat 24/7</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">Tính năng không giới hạn</span>
                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">Cập nhật tính năng hàng ngày</span>
                                    </div>
                                </div>
                                
                                                        <button 
                                                            onClick={() => handleTierPurchase(tier)}
                                                            disabled={purchaseLoading || purchasedTiers.has(tier.id)}
                                                            className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                                                                purchasedTiers.has(tier.id)
                                                                    ? 'bg-green-600 text-white cursor-not-allowed'
                                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                            }`}
                                                        >
                                                            {purchasedTiers.has(tier.id) ? 'Đã mua' : 'Đặt hàng ngay'}
                                                        </button>
                                        </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="text-gray-400 mb-4">
                                                <Cube className="w-16 h-16 mx-auto" />
                                        </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                Không có cấp độ nào
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Gói dịch vụ này chưa có cấp độ nào
                                            </p>
                                        </div>
                                    )}
                                        </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 mb-4">
                                        <Cube className="w-16 h-16 mx-auto" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        Chọn gói dịch vụ
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Vui lòng chọn một gói dịch vụ để xem các cấp độ
                                    </p>
                            </div>
                        )}
                        </div>
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



