'use client'

import { useState } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from 'react-hot-toast'

const ApiTester = () => {
    const [testData, setTestData] = useState({
        category: {
            name: 'Facebook Marketing',
            description: 'Gói dịch vụ marketing cho Facebook',
            icon: '📱',
            color: '#1877F2',
            is_active: true,
            sort_order: 1
        },
        package: {
            name: '3 tháng',
            description: 'Gói dịch vụ 3 tháng',
            duration_type: 'months',
            duration_value: 3,
            platform: 'facebook',
            is_active: true,
            is_popular: true,
            sort_order: 1
        },
        tier: {
            name: 'Basic',
            description: 'Gói cơ bản',
            device_limit: 5,
            price: 500000,
            currency: 'VND',
            is_active: true,
            is_popular: false,
            sort_order: 1
        }
    })

    const [results, setResults] = useState({})
    const [loading, setLoading] = useState(false)

    const testApiCall = async (apiName, apiFunction, data) => {
        try {
            setLoading(true)
            console.log(`🧪 Testing ${apiName}:`, data)
            
            const result = await apiFunction(data)
            console.log(`✅ ${apiName} result:`, result)
            
            setResults(prev => ({
                ...prev,
                [apiName]: result
            }))
            
            if (result.success) {
                toast.success(`${apiName} thành công!`)
            } else {
                toast.error(`${apiName} thất bại: ${result.message}`)
            }
        } catch (error) {
            console.error(`❌ ${apiName} error:`, error)
            toast.error(`${apiName} lỗi: ${error.message}`)
            
            setResults(prev => ({
                ...prev,
                [apiName]: { success: false, error: error.message }
            }))
        } finally {
            setLoading(false)
        }
    }

    const testCreateCategory = () => {
        testApiCall('Create Category', async () => {
            const { createServicePackageCategory } = await import('@/server/actions/service-package')
            return await createServicePackageCategory(testData.category)
        }, testData.category)
    }

    const testCreatePackage = () => {
        testApiCall('Create Package', async () => {
            const { createServicePackage } = await import('@/server/actions/service-package')
            return await createServicePackage({
                ...testData.package,
                category_id: 1 // Assuming category ID 1 exists
            })
        }, testData.package)
    }

    const testCreateTier = () => {
        testApiCall('Create Tier', async () => {
            const { createServicePackageTier } = await import('@/server/actions/service-package')
            return await createServicePackageTier({
                ...testData.tier,
                service_package_id: 1 // Assuming package ID 1 exists
            })
        }, testData.tier)
    }

    const testGetCategories = () => {
        testApiCall('Get Categories', async () => {
            const { getServicePackageCategories } = await import('@/server/actions/service-package')
            return await getServicePackageCategories({ per_page: 10 })
        }, {})
    }

    const testGetPackages = () => {
        testApiCall('Get Packages', async () => {
            const { getServicePackages } = await import('@/server/actions/service-package')
            return await getServicePackages({ per_page: 10 })
        }, {})
    }

    const testGetTiers = () => {
        testApiCall('Get Tiers', async () => {
            const { getServicePackageTiers } = await import('@/server/actions/service-package')
            return await getServicePackageTiers({ per_page: 10 })
        }, {})
    }

    return (
        <Container>
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">API Tester</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Test các API calls cho Service Package Management
                    </p>
                </div>

                {/* Test Data */}
                <AdaptiveCard>
                    <h2 className="text-lg font-semibold mb-4">Test Data</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h3 className="font-medium mb-2">Category</h3>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Name"
                                    value={testData.category.name}
                                    onChange={(e) => setTestData({
                                        ...testData,
                                        category: { ...testData.category, name: e.target.value }
                                    })}
                                />
                                <Input
                                    placeholder="Description"
                                    value={testData.category.description}
                                    onChange={(e) => setTestData({
                                        ...testData,
                                        category: { ...testData.category, description: e.target.value }
                                    })}
                                />
                                <Input
                                    placeholder="Icon"
                                    value={testData.category.icon}
                                    onChange={(e) => setTestData({
                                        ...testData,
                                        category: { ...testData.category, icon: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">Package</h3>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Name"
                                    value={testData.package.name}
                                    onChange={(e) => setTestData({
                                        ...testData,
                                        package: { ...testData.package, name: e.target.value }
                                    })}
                                />
                                <Input
                                    placeholder="Duration Type"
                                    value={testData.package.duration_type}
                                    onChange={(e) => setTestData({
                                        ...testData,
                                        package: { ...testData.package, duration_type: e.target.value }
                                    })}
                                />
                                <Input
                                    type="number"
                                    placeholder="Duration Value"
                                    value={testData.package.duration_value}
                                    onChange={(e) => setTestData({
                                        ...testData,
                                        package: { ...testData.package, duration_value: Number(e.target.value) }
                                    })}
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">Tier</h3>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Name"
                                    value={testData.tier.name}
                                    onChange={(e) => setTestData({
                                        ...testData,
                                        tier: { ...testData.tier, name: e.target.value }
                                    })}
                                />
                                <Input
                                    type="number"
                                    placeholder="Device Limit"
                                    value={testData.tier.device_limit}
                                    onChange={(e) => setTestData({
                                        ...testData,
                                        tier: { ...testData.tier, device_limit: Number(e.target.value) }
                                    })}
                                />
                                <Input
                                    type="number"
                                    placeholder="Price"
                                    value={testData.tier.price}
                                    onChange={(e) => setTestData({
                                        ...testData,
                                        tier: { ...testData.tier, price: Number(e.target.value) }
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                </AdaptiveCard>

                {/* API Tests */}
                <AdaptiveCard>
                    <h2 className="text-lg font-semibold mb-4">API Tests</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Button
                            onClick={testCreateCategory}
                            loading={loading}
                            variant="outline"
                        >
                            Create Category
                        </Button>
                        <Button
                            onClick={testCreatePackage}
                            loading={loading}
                            variant="outline"
                        >
                            Create Package
                        </Button>
                        <Button
                            onClick={testCreateTier}
                            loading={loading}
                            variant="outline"
                        >
                            Create Tier
                        </Button>
                        <Button
                            onClick={testGetCategories}
                            loading={loading}
                            variant="outline"
                        >
                            Get Categories
                        </Button>
                        <Button
                            onClick={testGetPackages}
                            loading={loading}
                            variant="outline"
                        >
                            Get Packages
                        </Button>
                        <Button
                            onClick={testGetTiers}
                            loading={loading}
                            variant="outline"
                        >
                            Get Tiers
                        </Button>
                    </div>
                </AdaptiveCard>

                {/* Results */}
                {Object.keys(results).length > 0 && (
                    <AdaptiveCard>
                        <h2 className="text-lg font-semibold mb-4">Results</h2>
                        <div className="space-y-3">
                            {Object.entries(results).map(([key, result]) => (
                                <div key={key} className="p-3 border rounded-lg">
                                    <h3 className="font-medium mb-2">{key}</h3>
                                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                                        {JSON.stringify(result, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </AdaptiveCard>
                )}
            </div>
        </Container>
    )
}

export default ApiTester
