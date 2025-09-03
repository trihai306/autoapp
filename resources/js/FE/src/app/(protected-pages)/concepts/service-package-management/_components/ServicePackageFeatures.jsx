'use client'

import { useState, useEffect } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import Badge from '@/components/ui/Badge'
import { 
    getServicePackageFeatures,
    createServicePackageFeature,
    updateServicePackageFeature,
    deleteServicePackageFeature,
    bulkCreateServicePackageFeatures,
    bulkDeleteServicePackageFeatures
} from '@/server/actions/service-package'
import { ServicePackageFeatureHelpers } from '@/services/service-package/ServicePackageFeatureService'
import { toast } from 'react-hot-toast'

const ServicePackageFeatures = ({ packageId, packageName }) => {
    const [features, setFeatures] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedFeatures, setSelectedFeatures] = useState([])
    
    // Dialog states
    const [createDialog, setCreateDialog] = useState(false)
    const [editDialog, setEditDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [bulkCreateDialog, setBulkCreateDialog] = useState(false)
    const [currentFeature, setCurrentFeature] = useState(null)
    
    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'feature',
        value: '',
        unit: '',
        is_included: true,
        sort_order: 0,
        icon: ''
    })

    // Bulk create form
    const [bulkFeatures, setBulkFeatures] = useState('')

    // Load features
    const loadFeatures = async () => {
        if (!packageId) return
        
        try {
            setLoading(true)
            const result = await getServicePackageFeatures(packageId)
            
            if (result.success) {
                setFeatures(result.data || [])
            } else {
                toast.error(result.message || 'Không thể tải danh sách tính năng')
            }
        } catch (error) {
            console.error('Error loading features:', error)
            toast.error('Có lỗi xảy ra khi tải dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadFeatures()
    }, [packageId])

    // Handle selection
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedFeatures(features.map(feature => feature.id))
        } else {
            setSelectedFeatures([])
        }
    }

    const handleSelectFeature = (featureId, checked) => {
        if (checked) {
            setSelectedFeatures([...selectedFeatures, featureId])
        } else {
            setSelectedFeatures(selectedFeatures.filter(id => id !== featureId))
        }
    }

    // Handle create
    const handleCreate = () => {
        setFormData({
            name: '',
            description: '',
            type: 'feature',
            value: '',
            unit: '',
            is_included: true,
            sort_order: 0,
            icon: ''
        })
        setCreateDialog(true)
    }

    // Handle edit
    const handleEdit = (feature) => {
        setFormData({
            name: feature.name || '',
            description: feature.description || '',
            type: feature.type || 'feature',
            value: feature.value || '',
            unit: feature.unit || '',
            is_included: feature.is_included ?? true,
            sort_order: feature.sort_order || 0,
            icon: feature.icon || ''
        })
        setCurrentFeature(feature)
        setEditDialog(true)
    }

    // Handle delete
    const handleDelete = (feature) => {
        setCurrentFeature(feature)
        setDeleteDialog(true)
    }

    // Handle bulk delete
    const handleBulkDelete = () => {
        if (selectedFeatures.length === 0) {
            toast.error('Vui lòng chọn ít nhất một tính năng')
            return
        }
        setDeleteDialog(true)
    }

    // Handle form submit
    const handleFormSubmit = async (e) => {
        e.preventDefault()
        
        try {
            setLoading(true)
            let result
            
            if (createDialog) {
                result = await createServicePackageFeature(packageId, formData)
            } else {
                result = await updateServicePackageFeature(currentFeature.id, formData)
            }
            
            if (result.success) {
                toast.success(result.message)
                setCreateDialog(false)
                setEditDialog(false)
                loadFeatures()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            toast.error('Có lỗi xảy ra khi lưu dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    // Handle bulk create
    const handleBulkCreate = async () => {
        if (!bulkFeatures.trim()) {
            toast.error('Vui lòng nhập danh sách tính năng')
            return
        }

        try {
            setLoading(true)
            
            // Parse bulk features (one per line)
            const featureLines = bulkFeatures.split('\n').filter(line => line.trim())
            const features = featureLines.map((line, index) => {
                const [name, value, unit] = line.split('|').map(s => s.trim())
                return {
                    name: name || line,
                    value: value || '',
                    unit: unit || '',
                    type: 'feature',
                    is_included: true,
                    sort_order: index
                }
            })

            const result = await bulkCreateServicePackageFeatures(packageId, features)
            
            if (result.success) {
                toast.success(result.message)
                setBulkCreateDialog(false)
                setBulkFeatures('')
                loadFeatures()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Error bulk creating features:', error)
            toast.error('Có lỗi xảy ra khi tạo tính năng')
        } finally {
            setLoading(false)
        }
    }

    // Handle delete confirm
    const handleDeleteConfirm = async () => {
        try {
            setLoading(true)
            let result
            
            if (selectedFeatures.length > 0) {
                result = await bulkDeleteServicePackageFeatures(selectedFeatures)
            } else {
                result = await deleteServicePackageFeature(currentFeature.id)
            }
            
            if (result.success) {
                toast.success(result.message)
                setDeleteDialog(false)
                setSelectedFeatures([])
                loadFeatures()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Error deleting features:', error)
            toast.error('Có lỗi xảy ra khi xóa dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    // Table columns
    const columns = [
        {
            key: 'select',
            title: (
                <input
                    type="checkbox"
                    checked={selectedFeatures.length === features.length && features.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                />
            ),
            dataIndex: 'id',
            render: (id) => (
                <input
                    type="checkbox"
                    checked={selectedFeatures.includes(id)}
                    onChange={(e) => handleSelectFeature(id, e.target.checked)}
                    className="rounded border-gray-300"
                />
            )
        },
        {
            key: 'name',
            title: 'Tên tính năng',
            dataIndex: 'name',
            render: (name, record) => (
                <div className="flex items-center gap-2">
                    {record.icon && <span>{record.icon}</span>}
                    <div>
                        <div className="font-medium">{name}</div>
                        {record.description && (
                            <div className="text-sm text-gray-500">{record.description}</div>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'type',
            title: 'Loại',
            dataIndex: 'type',
            render: (type) => (
                <Badge variant="outline" color="blue">
                    {ServicePackageFeatureHelpers.getFeatureTypeDisplayName(type)}
                </Badge>
            )
        },
        {
            key: 'value',
            title: 'Giá trị',
            dataIndex: 'value',
            render: (value, record) => (
                <div>
                    {ServicePackageFeatureHelpers.formatFeatureValue(record)}
                </div>
            )
        },
        {
            key: 'included',
            title: 'Bao gồm',
            dataIndex: 'is_included',
            render: (isIncluded) => (
                <Badge 
                    variant="solid" 
                    color={isIncluded ? 'green' : 'red'}
                >
                    {isIncluded ? 'Có' : 'Không'}
                </Badge>
            )
        },
        {
            key: 'sort_order',
            title: 'Thứ tự',
            dataIndex: 'sort_order'
        },
        {
            key: 'actions',
            title: 'Thao tác',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        color="red"
                        onClick={() => handleDelete(record)}
                    >
                        Xóa
                    </Button>
                </div>
            )
        }
    ]

    if (!packageId) {
        return (
            <Container>
                <AdaptiveCard>
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-lg font-semibold mb-2">Chọn gói dịch vụ</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Vui lòng chọn một gói dịch vụ để quản lý tính năng
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
                        <h1 className="text-2xl font-bold">Tính năng gói dịch vụ</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Quản lý tính năng cho gói: <span className="font-semibold">{packageName}</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setBulkCreateDialog(true)}
                        >
                            Tạo hàng loạt
                        </Button>
                        <Button onClick={handleCreate}>
                            + Thêm tính năng
                        </Button>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedFeatures.length > 0 && (
                    <AdaptiveCard>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Đã chọn {selectedFeatures.length} tính năng
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                color="red"
                                onClick={handleBulkDelete}
                            >
                                Xóa
                            </Button>
                        </div>
                    </AdaptiveCard>
                )}

                {/* Table */}
                <AdaptiveCard>
                    <Table
                        columns={columns}
                        data={features}
                        loading={loading}
                        pagination={false}
                    />
                </AdaptiveCard>

                {/* Create/Edit Dialog */}
                <Dialog 
                    isOpen={createDialog || editDialog} 
                    onClose={() => {
                        setCreateDialog(false)
                        setEditDialog(false)
                    }}
                    width={500}
                >
                    <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold">
                            {createDialog ? 'Thêm tính năng' : 'Sửa tính năng'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Tên tính năng *
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Nhập tên tính năng"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Loại
                                </label>
                                <Select
                                    value={formData.type}
                                    onChange={(value) => setFormData({...formData, type: value})}
                                    options={[
                                        { value: 'feature', label: 'Tính năng' },
                                        { value: 'limit', label: 'Giới hạn' },
                                        { value: 'benefit', label: 'Lợi ích' },
                                        { value: 'restriction', label: 'Hạn chế' },
                                        { value: 'addon', label: 'Bổ sung' }
                                    ]}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Giá trị
                                </label>
                                <Input
                                    value={formData.value}
                                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                                    placeholder="100, unlimited, etc."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Đơn vị
                                </label>
                                <Input
                                    value={formData.unit}
                                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                    placeholder="accounts, GB, times"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Thứ tự
                                </label>
                                <Input
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({...formData, sort_order: Number(e.target.value)})}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Icon
                                </label>
                                <Input
                                    value={formData.icon}
                                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                    placeholder="✓, ✗, ⭐"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Mô tả
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                                rows="2"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Nhập mô tả tính năng"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.is_included}
                                onChange={(e) => setFormData({...formData, is_included: e.target.checked})}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm">Bao gồm trong gói</span>
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setCreateDialog(false)
                                    setEditDialog(false)
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                loading={loading}
                            >
                                {createDialog ? 'Tạo' : 'Cập nhật'}
                            </Button>
                        </div>
                    </form>
                </Dialog>

                {/* Bulk Create Dialog */}
                <Dialog 
                    isOpen={bulkCreateDialog} 
                    onClose={() => setBulkCreateDialog(false)}
                    width={600}
                >
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Tạo tính năng hàng loạt</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Nhập danh sách tính năng, mỗi dòng một tính năng. Format: Tên tính năng | Giá trị | Đơn vị
                        </p>
                        
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                            rows="10"
                            value={bulkFeatures}
                            onChange={(e) => setBulkFeatures(e.target.value)}
                            placeholder={`Quản lý tài khoản | 10 | accounts
Lưu trữ | 5 | GB
Hỗ trợ 24/7 | unlimited | 
API access | 1000 | requests/day`}
                        />
                        
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setBulkCreateDialog(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                loading={loading}
                                onClick={handleBulkCreate}
                            >
                                Tạo tính năng
                            </Button>
                        </div>
                    </div>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog 
                    isOpen={deleteDialog} 
                    onClose={() => setDeleteDialog(false)}
                    width={400}
                >
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {selectedFeatures.length > 0 
                                ? `Bạn có chắc chắn muốn xóa ${selectedFeatures.length} tính năng đã chọn?`
                                : `Bạn có chắc chắn muốn xóa tính năng "${currentFeature?.name}"?`
                            }
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeleteDialog(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                color="red"
                                loading={loading}
                                onClick={handleDeleteConfirm}
                            >
                                Xóa
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </div>
        </Container>
    )
}

export default ServicePackageFeatures
