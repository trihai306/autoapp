'use client'

import { useState, useEffect } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import getServicePackages from '@/server/actions/service-package/getServicePackages'
import { ServicePackageHelpers } from '@/services/service-package/ServicePackageService'
import { toast } from 'react-hot-toast'

const ServicePackageCard = ({ pkg, onSelect }) => {
    const isPopular = ServicePackageHelpers.isPopular(pkg)
    const isActive = ServicePackageHelpers.isActive(pkg)
    const isFree = ServicePackageHelpers.isFree(pkg)
    const durationText = ServicePackageHelpers.getDurationText(pkg)
    const formattedPrice = ServicePackageHelpers.formatPrice(pkg.price, pkg.currency)

    return (
        <div className={`rounded-2xl border p-6 flex flex-col gap-4 bg-white dark:bg-gray-800 relative ${
            isPopular ? 'border-yellow-400 ring-2 ring-yellow-100 dark:ring-yellow-900' : 'border-gray-200 dark:border-gray-700'
        }`}>
            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="solid" color="yellow" size="sm">
                        Phổ biến nhất
                    </Badge>
                </div>
            )}

            {/* Status Badge */}
            {!isActive && (
                <div className="absolute top-4 right-4">
                    <Badge variant="solid" color="red" size="sm">
                        Tạm dừng
                    </Badge>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4">
                {pkg.icon && (
                    <div 
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: pkg.color + '20', color: pkg.color }}
                    >
                        <span>{pkg.icon}</span>
                    </div>
                )}
                <div className="flex-1">
                    <h4 className="font-bold text-lg">{pkg.name}</h4>
                    {pkg.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {pkg.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Price */}
            <div className="text-center py-4 border-t border-b border-gray-200 dark:border-gray-700">
                <div className="text-3xl font-bold text-primary">
                    {isFree ? 'Miễn phí' : formattedPrice}
                </div>
                {!isFree && durationText !== 'Không giới hạn' && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        / {durationText}
                    </div>
                )}
            </div>

            {/* Features */}
            {pkg.features && pkg.features.length > 0 && (
                <div className="space-y-2">
                    {pkg.features.slice(0, 5).map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">✓</span>
                            <span className="text-sm">{feature.name}</span>
                        </div>
                    ))}
                    {pkg.features.length > 5 && (
                        <div className="text-sm text-gray-500 text-center">
                            +{pkg.features.length - 5} tính năng khác
                        </div>
                    )}
                </div>
            )}

            {/* Action Button */}
            <div className="mt-auto">
                <Button 
                    variant="solid" 
                    className="w-full"
                    disabled={!isActive}
                    onClick={() => onSelect(pkg)}
                >
                    {isActive ? 'Chọn gói này' : 'Tạm dừng'}
                </Button>
            </div>
        </div>
    )
}

const ServicePackageCards = ({ onPackageSelect }) => {
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState('all') // all, free, paid, popular

    // Load packages
    const loadPackages = async () => {
        try {
            setLoading(true)
            const params = {
                per_page: 50, // Load more packages for cards view
                active: true // Only show active packages
            }
            
            const result = await getServicePackages(params)
            
            if (result.success) {
                setPackages(result.data || [])
            } else {
                toast.error(result.message || 'Không thể tải danh sách gói dịch vụ')
            }
        } catch (error) {
            console.error('Error loading packages:', error)
            toast.error('Có lỗi xảy ra khi tải dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPackages()
    }, [])

    // Filter packages
    const filteredPackages = packages.filter(pkg => {
        switch (filter) {
            case 'free':
                return ServicePackageHelpers.isFree(pkg)
            case 'paid':
                return !ServicePackageHelpers.isFree(pkg)
            case 'popular':
                return ServicePackageHelpers.isPopular(pkg)
            default:
                return true
        }
    })

    // Sort packages: popular first, then by sort_order, then by price
    const sortedPackages = filteredPackages.sort((a, b) => {
        if (ServicePackageHelpers.isPopular(a) && !ServicePackageHelpers.isPopular(b)) return -1
        if (!ServicePackageHelpers.isPopular(a) && ServicePackageHelpers.isPopular(b)) return 1
        
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
        
        return a.price - b.price
    })

    if (loading) {
        return (
            <Container>
                <AdaptiveCard>
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </AdaptiveCard>
            </Container>
        )
    }

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Chọn gói dịch vụ phù hợp</h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Chúng tôi cung cấp các gói dịch vụ linh hoạt để đáp ứng nhu cầu của bạn
                    </p>
                </div>

                {/* Filters */}
                <div className="flex justify-center">
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        {[
                            { value: 'all', label: 'Tất cả' },
                            { value: 'free', label: 'Miễn phí' },
                            { value: 'paid', label: 'Trả phí' },
                            { value: 'popular', label: 'Phổ biến' }
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setFilter(option.value)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    filter === option.value
                                        ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Packages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedPackages.map((pkg) => (
                        <ServicePackageCard
                            key={pkg.id}
                            pkg={pkg}
                            onSelect={onPackageSelect}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {sortedPackages.length === 0 && (
                    <AdaptiveCard>
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📦</div>
                            <h3 className="text-lg font-semibold mb-2">Không có gói dịch vụ</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Hiện tại không có gói dịch vụ nào phù hợp với bộ lọc của bạn
                            </p>
                        </div>
                    </AdaptiveCard>
                )}

                {/* Stats */}
                {packages.length > 0 && (
                    <AdaptiveCard>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-primary">
                                    {packages.length}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Tổng gói dịch vụ
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {packages.filter(pkg => ServicePackageHelpers.isFree(pkg)).length}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Gói miễn phí
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {packages.filter(pkg => !ServicePackageHelpers.isFree(pkg)).length}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Gói trả phí
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {packages.filter(pkg => ServicePackageHelpers.isPopular(pkg)).length}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Gói phổ biến
                                </div>
                            </div>
                        </div>
                    </AdaptiveCard>
                )}
            </div>
        </Container>
    )
}

export default ServicePackageCards
