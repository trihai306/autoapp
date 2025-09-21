'use client'

import { useState } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ServicePackageManagement from './ServicePackageManagement'
import ApiTester from './ApiTester'

const ServicePackageManagementDemo = () => {
    const [viewMode, setViewMode] = useState('demo') // demo, management, api-test

    if (viewMode === 'demo') {
        return (
            <Container>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Service Package Management</h1>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Hệ thống quản lý gói dịch vụ với cấu trúc hierarchical: Categories → Packages → Tiers
                        </p>
                    </div>

                    {/* Demo Info */}
                    <AdaptiveCard>
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Cấu trúc mới</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="text-2xl mb-2">📁</div>
                                    <h3 className="font-semibold text-blue-600 dark:text-blue-400">Categories</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Danh mục chính (Facebook, Instagram, TikTok)
                                    </p>
                                </div>
                                <div className="text-center p-4 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="text-2xl mb-2">📦</div>
                                    <h3 className="font-semibold text-green-600 dark:text-green-400">Packages</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Gói dịch vụ (3 tháng, 6 tháng, 1 năm)
                                    </p>
                                </div>
                                <div className="text-center p-4 border border-purple-200 dark:border-purple-800 rounded-lg">
                                    <div className="text-2xl mb-2">⭐</div>
                                    <h3 className="font-semibold text-purple-600 dark:text-purple-400">Tiers</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Cấp độ (Basic, Pro, Enterprise)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </AdaptiveCard>

                    {/* Features */}
                    <AdaptiveCard>
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Tính năng</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h3 className="font-medium">Navigation</h3>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <li>• Breadcrumb navigation</li>
                                        <li>• Drill-down từ Categories → Packages → Tiers</li>
                                        <li>• Back navigation giữa các levels</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-medium">Management</h3>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <li>• CRUD operations cho từng level</li>
                                        <li>• Search và filter</li>
                                        <li>• Bulk operations</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-medium">Data Structure</h3>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <li>• Hierarchical relationships</li>
                                        <li>• Context-aware forms</li>
                                        <li>• Dynamic column display</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-medium">UX</h3>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <li>• Responsive design</li>
                                        <li>• Loading states</li>
                                        <li>• Error handling</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </AdaptiveCard>

                    {/* Sample Data Structure */}
                    <AdaptiveCard>
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Sample Data Structure</h2>
                            <div className="space-y-3">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="solid" color="blue">Category</Badge>
                                        <span className="font-medium">Facebook Marketing</span>
                                    </div>
                                    <div className="ml-4 space-y-2">
                                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="solid" color="green">Package</Badge>
                                                <span className="font-medium">3 tháng</span>
                                            </div>
                                            <div className="ml-4 space-y-1">
                                                <div className="p-1 bg-purple-50 dark:bg-purple-900/20 rounded text-sm">
                                                    <Badge variant="outline" color="purple">Tier</Badge> Basic - 5 thiết bị - 500k VND
                                                </div>
                                                <div className="p-1 bg-purple-50 dark:bg-purple-900/20 rounded text-sm">
                                                    <Badge variant="outline" color="purple">Tier</Badge> Pro - 10 thiết bị - 800k VND
                                                </div>
                                                <div className="p-1 bg-purple-50 dark:bg-purple-900/20 rounded text-sm">
                                                    <Badge variant="outline" color="purple">Tier</Badge> Enterprise - 20 thiết bị - 1200k VND
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="solid" color="green">Package</Badge>
                                                <span className="font-medium">6 tháng</span>
                                            </div>
                                            <div className="ml-4 space-y-1">
                                                <div className="p-1 bg-purple-50 dark:bg-purple-900/20 rounded text-sm">
                                                    <Badge variant="outline" color="purple">Tier</Badge> Basic - 5 thiết bị - 900k VND
                                                </div>
                                                <div className="p-1 bg-purple-50 dark:bg-purple-900/20 rounded text-sm">
                                                    <Badge variant="outline" color="purple">Tier</Badge> Pro - 10 thiết bị - 1500k VND
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AdaptiveCard>

                    {/* Action Buttons */}
                    <div className="text-center space-y-3">
                        <div className="flex justify-center gap-3">
                            <Button
                                size="lg"
                                onClick={() => setViewMode('management')}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            >
                                🚀 Bắt đầu quản lý
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => setViewMode('api-test')}
                                className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                                🧪 Test API
                            </Button>
                        </div>
                    </div>
                </div>
            </Container>
        )
    }

    if (viewMode === 'api-test') {
        return (
            <div>
                <div className="mb-4">
                    <Button
                        variant="outline"
                        onClick={() => setViewMode('demo')}
                    >
                        ← Quay lại Demo
                    </Button>
                </div>
                <ApiTester />
            </div>
        )
    }

    return (
        <div>
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => setViewMode('demo')}
                >
                    ← Quay lại Demo
                </Button>
            </div>
            <ServicePackageManagement />
        </div>
    )
}

export default ServicePackageManagementDemo
