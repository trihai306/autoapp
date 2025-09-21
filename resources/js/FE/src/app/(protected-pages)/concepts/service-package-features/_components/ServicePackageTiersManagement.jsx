'use client'

import { useState, useEffect } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import Dialog from '@/components/ui/Dialog'
import Badge from '@/components/ui/Badge'
import { 
    getServicePackageTiers,
    createServicePackageTier,
    updateServicePackageTier,
    deleteServicePackageTier
} from '@/server/actions/service-package'
import { toast } from 'react-hot-toast'

const ServicePackageTiersManagement = ({ 
    packageId, 
    packageName, 
    canCreate, 
    canEdit, 
    canDelete 
}) => {
    const [tiers, setTiers] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedTiers, setSelectedTiers] = useState([])
    
    // Dialog states
    const [createDialog, setCreateDialog] = useState(false)
    const [editDialog, setEditDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [currentTier, setCurrentTier] = useState(null)
    
    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        device_limit: 5,
        price: 0,
        currency: 'VND',
        is_popular: false,
        is_active: true,
        sort_order: 0,
        features: [],
        limits: []
    })

    // Load tiers
    const loadTiers = async () => {
        if (!packageId) return
        
        try {
            setLoading(true)
            const result = await getServicePackageTiers({ 
                service_package_id: packageId,
                per_page: 100 
            })
            
            if (result.success) {
                setTiers(result.data || [])
            } else {
                toast.error(result.message || 'Không thể tải danh sách cấp độ')
            }
        } catch (error) {
            console.error('Error loading tiers:', error)
            toast.error('Có lỗi xảy ra khi tải dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTiers()
    }, [packageId])

    // Handle selection
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedTiers(tiers.map(tier => tier.id))
        } else {
            setSelectedTiers([])
        }
    }

    const handleSelectTier = (tierId, checked) => {
        if (checked) {
            setSelectedTiers([...selectedTiers, tierId])
        } else {
            setSelectedTiers(selectedTiers.filter(id => id !== tierId))
        }
    }

    // Handle create
    const handleCreate = () => {
        if (!canCreate) {
            toast.error('Bạn không có quyền tạo cấp độ')
            return
        }
        setFormData({
            name: '',
            description: '',
            device_limit: 5,
            price: 0,
            currency: 'VND',
            is_popular: false,
            is_active: true,
            sort_order: 0,
            features: [],
            limits: []
        })
        setCreateDialog(true)
    }

    // Handle edit
    const handleEdit = (tier) => {
        if (!canEdit) {
            toast.error('Bạn không có quyền sửa cấp độ')
            return
        }
        setFormData({
            name: tier.name || '',
            description: tier.description || '',
            device_limit: tier.device_limit || 5,
            price: tier.price || 0,
            currency: tier.currency || 'VND',
            is_popular: tier.is_popular ?? false,
            is_active: tier.is_active ?? true,
            sort_order: tier.sort_order || 0,
            features: tier.features || [],
            limits: tier.limits || []
        })
        setCurrentTier(tier)
        setEditDialog(true)
    }

    // Handle delete
    const handleDelete = (tier) => {
        if (!canDelete) {
            toast.error('Bạn không có quyền xóa cấp độ')
            return
        }
        setCurrentTier(tier)
        setDeleteDialog(true)
    }

    // Handle form submit
    const handleFormSubmit = async (e) => {
        e.preventDefault()
        
        try {
            setLoading(true)
            let result
            
            const submitData = {
                ...formData,
                service_package_id: packageId
            }
            
            if (createDialog) {
                result = await createServicePackageTier(submitData)
            } else {
                result = await updateServicePackageTier(currentTier.id, submitData)
            }
            
            if (result.success) {
                toast.success(result.message)
                setCreateDialog(false)
                setEditDialog(false)
                loadTiers()
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

    // Handle delete confirm
    const handleDeleteConfirm = async () => {
        try {
            setLoading(true)
            const result = await deleteServicePackageTier(currentTier.id)
            
            if (result.success) {
                toast.success(result.message)
                setDeleteDialog(false)
                loadTiers()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Error deleting tier:', error)
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
                    checked={selectedTiers.length === tiers.length && tiers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                />
            ),
            dataIndex: 'id',
            render: (id) => (
                <input
                    type="checkbox"
                    checked={selectedTiers.includes(id)}
                    onChange={(e) => handleSelectTier(id, e.target.checked)}
                    className="rounded border-gray-300"
                />
            )
        },
        {
            key: 'name',
            title: 'Tên cấp độ',
            dataIndex: 'name',
            render: (name, record) => (
                <div className="flex items-center gap-2">
                    <div>
                        <div className="font-medium">{name}</div>
                        {record.is_popular && (
                            <Badge variant="solid" color="yellow" size="sm">
                                Phổ biến
                            </Badge>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'device_limit',
            title: 'Số thiết bị',
            dataIndex: 'device_limit',
            render: (limit) => (
                <div>
                    {limit === -1 ? 'Không giới hạn' : `${limit} thiết bị`}
                </div>
            )
        },
        {
            key: 'price',
            title: 'Giá',
            dataIndex: 'price',
            render: (price, record) => (
                <div>
                    {Number(price).toLocaleString()} {record.currency}
                </div>
            )
        },
        {
            key: 'status',
            title: 'Trạng thái',
            dataIndex: 'is_active',
            render: (isActive) => (
                <Badge 
                    variant="solid" 
                    color={isActive ? 'green' : 'red'}
                >
                    {isActive ? 'Hoạt động' : 'Tạm dừng'}
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
                    {canEdit && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(record)}
                        >
                            Sửa
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            size="sm"
                            variant="outline"
                            color="red"
                            onClick={() => handleDelete(record)}
                        >
                            Xóa
                        </Button>
                    )}
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Cấp độ gói dịch vụ</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Quản lý cấp độ cho gói: <span className="font-semibold">{packageName}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    {canCreate && (
                        <Button onClick={handleCreate}>
                            + Thêm cấp độ
                        </Button>
                    )}
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedTiers.length > 0 && canDelete && (
                <AdaptiveCard>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            Đã chọn {selectedTiers.length} cấp độ
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            color="red"
                            onClick={() => {
                                // Handle bulk delete if needed
                                toast.info('Tính năng xóa hàng loạt sẽ được thêm sau')
                            }}
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
                    data={tiers}
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
                width={600}
            >
                <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold">
                        {createDialog ? 'Thêm cấp độ' : 'Sửa cấp độ'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Tên cấp độ *
                            </label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Basic, Pro, Enterprise"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Số lượng thiết bị *
                            </label>
                            <Input
                                type="number"
                                value={formData.device_limit}
                                onChange={(e) => setFormData({...formData, device_limit: Number(e.target.value)})}
                                placeholder="5"
                                min="1"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Giá (VND) *
                            </label>
                            <Input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Tiền tệ
                            </label>
                            <Select
                                value={formData.currency}
                                onChange={(value) => setFormData({...formData, currency: value})}
                                options={[
                                    { value: 'VND', label: 'VND' },
                                    { value: 'USD', label: 'USD' },
                                    { value: 'EUR', label: 'EUR' }
                                ]}
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
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Mô tả
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Nhập mô tả cấp độ"
                        />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm">Hoạt động</span>
                        </label>
                        
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.is_popular}
                                onChange={(e) => setFormData({...formData, is_popular: e.target.checked})}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm">Phổ biến</span>
                        </label>
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

            {/* Delete Dialog */}
            <Dialog 
                isOpen={deleteDialog} 
                onClose={() => setDeleteDialog(false)}
                width={400}
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Bạn có chắc chắn muốn xóa cấp độ "{currentTier?.name}"?
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
    )
}

export default ServicePackageTiersManagement
