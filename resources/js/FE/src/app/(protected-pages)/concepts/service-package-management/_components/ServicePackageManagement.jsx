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
import getServicePackages from '@/server/actions/service-package/getServicePackages'
import deleteServicePackages from '@/server/actions/service-package/deleteServicePackages'
import updateServicePackageStatus from '@/server/actions/service-package/updateServicePackageStatus'
import createServicePackage from '@/server/actions/service-package/createServicePackage'
import updateServicePackage from '@/server/actions/service-package/updateServicePackage'
import deleteServicePackage from '@/server/actions/service-package/deleteServicePackage'
import { ServicePackageHelpers } from '@/services/service-package/ServicePackageService'
import { toast } from 'react-hot-toast'
import ServicePackageCards from './ServicePackageCards'
import { usePermission } from '@/utils/hooks/usePermission'

const ServicePackageManagement = () => {
    const [viewMode, setViewMode] = useState('table') // 'table' or 'cards'
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedPackages, setSelectedPackages] = useState([])
    
    // Permission checks
    const canCreate = usePermission('service-packages.create')
    const canEdit = usePermission('service-packages.edit')
    const canDelete = usePermission('service-packages.delete')
    const canUpdateStatus = usePermission('service-packages.update-status')
    
    // Dialog states
    const [createDialog, setCreateDialog] = useState(false)
    const [editDialog, setEditDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [currentPackage, setCurrentPackage] = useState(null)
    
    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        currency: 'VND',
        duration_days: null,
        duration_months: null,
        duration_years: null,
        is_active: true,
        is_popular: false,
        sort_order: 0,
        icon: '',
        color: '#3B82F6'
    })

    // Load packages
    const loadPackages = async () => {
        try {
            setLoading(true)
            const params = {
                page: currentPage,
                per_page: perPage,
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined
            }
            
            const result = await getServicePackages(params)
            
            if (result.success) {
                setPackages(result.data || [])
                setTotal(result.total || 0)
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
    }, [currentPage, perPage, searchQuery, statusFilter])

    // Handle search
    const handleSearch = (value) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }

    // Handle status filter
    const handleStatusFilter = (value) => {
        setStatusFilter(value)
        setCurrentPage(1)
    }

    // Handle selection
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedPackages(packages.map(pkg => pkg.id))
        } else {
            setSelectedPackages([])
        }
    }

    const handleSelectPackage = (packageId, checked) => {
        if (checked) {
            setSelectedPackages([...selectedPackages, packageId])
        } else {
            setSelectedPackages(selectedPackages.filter(id => id !== packageId))
        }
    }

    // Handle create
    const handleCreate = () => {
        if (!canCreate) {
            toast.error('Bạn không có quyền tạo gói dịch vụ')
            return
        }
        setFormData({
            name: '',
            description: '',
            price: 0,
            currency: 'VND',
            duration_days: null,
            duration_months: null,
            duration_years: null,
            is_active: true,
            is_popular: false,
            sort_order: 0,
            icon: '',
            color: '#3B82F6'
        })
        setCreateDialog(true)
    }

    // Handle edit
    const handleEdit = (pkg) => {
        if (!canEdit) {
            toast.error('Bạn không có quyền sửa gói dịch vụ')
            return
        }
        setFormData({
            name: pkg.name || '',
            description: pkg.description || '',
            price: pkg.price || 0,
            currency: pkg.currency || 'VND',
            duration_days: pkg.duration_days || null,
            duration_months: pkg.duration_months || null,
            duration_years: pkg.duration_years || null,
            is_active: pkg.is_active ?? true,
            is_popular: pkg.is_popular ?? false,
            sort_order: pkg.sort_order || 0,
            icon: pkg.icon || '',
            color: pkg.color || '#3B82F6'
        })
        setCurrentPackage(pkg)
        setEditDialog(true)
    }

    // Handle delete
    const handleDelete = (pkg) => {
        if (!canDelete) {
            toast.error('Bạn không có quyền xóa gói dịch vụ')
            return
        }
        setCurrentPackage(pkg)
        setDeleteDialog(true)
    }

    // Handle bulk delete
    const handleBulkDelete = () => {
        if (!canDelete) {
            toast.error('Bạn không có quyền xóa gói dịch vụ')
            return
        }
        if (selectedPackages.length === 0) {
            toast.error('Vui lòng chọn ít nhất một gói dịch vụ')
            return
        }
        setDeleteDialog(true)
    }

    // Handle status update
    const handleStatusUpdate = async (status) => {
        if (!canUpdateStatus) {
            toast.error('Bạn không có quyền cập nhật trạng thái gói dịch vụ')
            return
        }
        if (selectedPackages.length === 0) {
            toast.error('Vui lòng chọn ít nhất một gói dịch vụ')
            return
        }

        try {
            setLoading(true)
            const result = await updateServicePackageStatus(selectedPackages, status)
            
            if (result.success) {
                toast.success(result.message)
                setSelectedPackages([])
                loadPackages()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
        } finally {
            setLoading(false)
        }
    }

    // Handle form submit
    const handleFormSubmit = async (e) => {
        e.preventDefault()
        
        try {
            setLoading(true)
            let result
            
            if (createDialog) {
                result = await createServicePackage(formData)
            } else {
                result = await updateServicePackage(currentPackage.id, formData)
            }
            
            if (result.success) {
                toast.success(result.message)
                setCreateDialog(false)
                setEditDialog(false)
                loadPackages()
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
            let result
            
            if (selectedPackages.length > 0) {
                result = await deleteServicePackages(selectedPackages)
            } else {
                result = await deleteServicePackage(currentPackage.id)
            }
            
            if (result.success) {
                toast.success(result.message)
                setDeleteDialog(false)
                setSelectedPackages([])
                loadPackages()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Error deleting packages:', error)
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
                    checked={selectedPackages.length === packages.length && packages.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                />
            ),
            dataIndex: 'id',
            render: (id) => (
                <input
                    type="checkbox"
                    checked={selectedPackages.includes(id)}
                    onChange={(e) => handleSelectPackage(id, e.target.checked)}
                    className="rounded border-gray-300"
                />
            )
        },
        {
            key: 'name',
            title: 'Tên gói',
            dataIndex: 'name',
            render: (name, record) => (
                <div className="flex items-center gap-3">
                    {record.icon && (
                        <span className="text-lg">{record.icon}</span>
                    )}
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
            key: 'price',
            title: 'Giá',
            dataIndex: 'price',
            render: (price, record) => (
                <div>
                    <div className="font-medium">
                        {ServicePackageHelpers.formatPrice(price, record.currency)}
                    </div>
                    <div className="text-sm text-gray-500">
                        {ServicePackageHelpers.getDurationText(record)}
                    </div>
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

    // Handle package selection from cards view
    const handlePackageSelect = (pkg) => {
        toast.success(`Bạn đã chọn gói "${pkg.name}"`)
        // Here you can add logic to handle package selection
        // For example, redirect to payment or show package details
    }

    // If cards view is selected, render the cards component
    if (viewMode === 'cards') {
        return <ServicePackageCards onPackageSelect={handlePackageSelect} />
    }

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Quản lý gói dịch vụ</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Quản lý các gói dịch vụ và tính năng của hệ thống
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'table'
                                        ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                Bảng
                            </button>
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'cards'
                                        ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                Thẻ
                            </button>
                        </div>
                        {canCreate && (
                            <Button onClick={handleCreate}>
                                + Thêm gói dịch vụ
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <AdaptiveCard>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm kiếm gói dịch vụ..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                value={statusFilter}
                                onChange={handleStatusFilter}
                                options={[
                                    { value: 'all', label: 'Tất cả trạng thái' },
                                    { value: 'active', label: 'Hoạt động' },
                                    { value: 'inactive', label: 'Tạm dừng' }
                                ]}
                            />
                        </div>
                    </div>
                </AdaptiveCard>

                {/* Bulk Actions */}
                {selectedPackages.length > 0 && (
                    <AdaptiveCard>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Đã chọn {selectedPackages.length} gói dịch vụ
                            </span>
                            <div className="flex gap-2">
                                {canUpdateStatus && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleStatusUpdate('active')}
                                        >
                                            Kích hoạt
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleStatusUpdate('inactive')}
                                        >
                                            Tạm dừng
                                        </Button>
                                    </>
                                )}
                                {canDelete && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        color="red"
                                        onClick={handleBulkDelete}
                                    >
                                        Xóa
                                    </Button>
                                )}
                            </div>
                        </div>
                    </AdaptiveCard>
                )}

                {/* Table */}
                <AdaptiveCard>
                    <Table
                        columns={columns}
                        data={packages}
                        loading={loading}
                        pagination={{
                            current: currentPage,
                            pageSize: perPage,
                            total: total,
                            onChange: setCurrentPage,
                            showSizeChanger: true,
                            onShowSizeChange: (current, size) => {
                                setPerPage(size)
                                setCurrentPage(1)
                            }
                        }}
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
                            {createDialog ? 'Thêm gói dịch vụ' : 'Sửa gói dịch vụ'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Tên gói dịch vụ *
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Nhập tên gói dịch vụ"
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
                                    Thời hạn (tháng)
                                </label>
                                <Input
                                    type="number"
                                    value={formData.duration_months || ''}
                                    onChange={(e) => setFormData({...formData, duration_months: e.target.value ? Number(e.target.value) : null})}
                                    placeholder="1"
                                    min="1"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Thứ tự sắp xếp
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
                                    placeholder="fas fa-star"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Màu sắc
                                </label>
                                <Input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({...formData, color: e.target.value})}
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
                                placeholder="Nhập mô tả gói dịch vụ"
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
                            {selectedPackages.length > 0 
                                ? `Bạn có chắc chắn muốn xóa ${selectedPackages.length} gói dịch vụ đã chọn?`
                                : `Bạn có chắc chắn muốn xóa gói dịch vụ "${currentPackage?.name}"?`
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

export default ServicePackageManagement
