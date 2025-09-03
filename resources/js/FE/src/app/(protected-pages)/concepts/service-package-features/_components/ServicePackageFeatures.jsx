'use client'

import { useState, useEffect } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { getServicePackages } from '@/server/actions/service-package'
import { usePermission } from '@/utils/hooks/usePermission'
import { toast } from 'react-hot-toast'
import ServicePackageFeaturesManagement from './ServicePackageFeaturesManagement'

const ServicePackageFeatures = () => {
    const [packages, setPackages] = useState([])
    const [selectedPackageId, setSelectedPackageId] = useState('')
    const [selectedPackage, setSelectedPackage] = useState(null)
    const [loading, setLoading] = useState(false)

    // Permission checks
    const canView = usePermission('service-package-features.view')
    const canCreate = usePermission('service-package-features.create')
    const canEdit = usePermission('service-package-features.edit')
    const canDelete = usePermission('service-package-features.delete')

    // Load packages
    const loadPackages = async () => {
        try {
            setLoading(true)
            const result = await getServicePackages({ per_page: 100 })
            
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

    // Handle package selection
    const handlePackageSelect = (packageId) => {
        setSelectedPackageId(packageId)
        const selectedPkg = packages.find(pkg => pkg.id.toString() === packageId)
        setSelectedPackage(selectedPkg)
    }

    if (!canView) {
        return (
            <Container>
                <AdaptiveCard>
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🔒</div>
                        <h3 className="text-lg font-semibold mb-2">Không có quyền truy cập</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Bạn không có quyền xem tính năng gói dịch vụ
                        </p>
                    </div>
                </AdaptiveCard>
            </Container>
        )
    }

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Quản lý tính năng gói dịch vụ</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Chọn gói dịch vụ để quản lý tính năng
                        </p>
                    </div>
                </div>

                {/* Package Selection */}
                <AdaptiveCard>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">
                                Chọn gói dịch vụ
                            </label>
                            <Select
                                value={selectedPackageId}
                                onChange={handlePackageSelect}
                                placeholder="Chọn gói dịch vụ..."
                                options={packages.map(pkg => ({
                                    value: pkg.id.toString(),
                                    label: pkg.name
                                }))}
                                loading={loading}
                            />
                        </div>
                    </div>
                </AdaptiveCard>

                {/* Features Management */}
                {selectedPackage && (
                    <ServicePackageFeaturesManagement
                        packageId={selectedPackage.id}
                        packageName={selectedPackage.name}
                        canCreate={canCreate}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                )}

                {/* Empty State */}
                {!selectedPackage && (
                    <AdaptiveCard>
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📦</div>
                            <h3 className="text-lg font-semibold mb-2">Chọn gói dịch vụ</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Vui lòng chọn một gói dịch vụ để quản lý tính năng
                            </p>
                        </div>
                    </AdaptiveCard>
                )}
            </div>
        </Container>
    )
}

export default ServicePackageFeatures
