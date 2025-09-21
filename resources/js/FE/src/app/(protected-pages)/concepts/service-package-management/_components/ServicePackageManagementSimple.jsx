'use client'

import { useState } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import CategoriesManagement from './CategoriesManagement'
import PackagesManagement from './PackagesManagement'
import TiersManagement from './TiersManagement'

const ServicePackageManagement = () => {
    const [activeTab, setActiveTab] = useState('categories')

    const tabs = [
        { 
            key: 'categories', 
            label: 'Danh mục', 
            description: 'Quản lý danh mục chính (Facebook, Instagram, TikTok...)',
            icon: '📁'
        },
        { 
            key: 'packages', 
            label: 'Gói dịch vụ', 
            description: 'Quản lý gói theo thời hạn (3 tháng, 6 tháng, 1 năm...)',
            icon: '📦'
        },
        { 
            key: 'tiers', 
            label: 'Cấp độ', 
            description: 'Quản lý cấp độ theo số thiết bị (Basic, Pro, Enterprise...)',
            icon: '⭐'
        }
    ]

    const renderContent = () => {
        switch (activeTab) {
            case 'categories':
                return <CategoriesManagement />
            case 'packages':
                return <PackagesManagement />
            case 'tiers':
                return <TiersManagement />
            default:
                return <CategoriesManagement />
        }
    }

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Quản lý gói dịch vụ</h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Quản lý hệ thống gói dịch vụ với cấu trúc đơn giản và dễ sử dụng
                    </p>
                </div>

                {/* Navigation Tabs */}
                <AdaptiveCard>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`p-6 rounded-lg border-2 transition-all text-left ${
                                    activeTab === tab.key
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">{tab.icon}</span>
                                    <h3 className={`text-lg font-semibold ${
                                        activeTab === tab.key
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-900 dark:text-gray-100'
                                    }`}>
                                        {tab.label}
                                    </h3>
                                </div>
                                <p className={`text-sm ${
                                    activeTab === tab.key
                                        ? 'text-blue-700 dark:text-blue-300'
                                        : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                    {tab.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </AdaptiveCard>

                {/* Content */}
                {renderContent()}
            </div>
        </Container>
    )
}

export default ServicePackageManagement
