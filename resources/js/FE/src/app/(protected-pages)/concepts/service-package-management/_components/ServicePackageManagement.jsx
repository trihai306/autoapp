'use client'

import { useState, useEffect } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DataTable from '@/components/shared/DataTable'
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

const ServicePackageManagement = () => {
    console.log('🚀 [ServicePackageManagement] Component mounted')
    
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedPackages, setSelectedPackages] = useState([])
    
    console.log('📊 [ServicePackageManagement] Initial state:', {
        packages: packages.length,
        loading,
        total,
        currentPage,
        perPage,
        searchQuery,
        statusFilter,
        selectedPackages: selectedPackages.length
    })
    
    // Permission checks - all set to true
    const canCreate = true
    const canEdit = true
    const canDelete = true
    const canUpdateStatus = true
    
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
            console.log('🔄 [loadPackages] Starting to load packages...')
            console.log('📋 [loadPackages] Params:', {
                page: currentPage,
                per_page: perPage,
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined
            })
            
            setLoading(true)
            const params = {
                page: currentPage,
                per_page: perPage,
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined
            }
            
            console.log('📡 [loadPackages] Calling getServicePackages with params:', params)
            const result = await getServicePackages(params)
            console.log('✅ [loadPackages] API Response:', result)
            
            if (result.success) {
                console.log('🎯 [loadPackages] Success! Data:', result.data)
                console.log('📊 [loadPackages] Total:', result.total)
                setPackages(result.data || [])
                setTotal(result.total || 0)
            } else {
                console.error('❌ [loadPackages] API returned error:', result.message)
                toast.error(result.message || 'Không thể tải danh sách gói dịch vụ')
            }
        } catch (error) {
            console.error('💥 [loadPackages] Exception occurred:', error)
            console.error('💥 [loadPackages] Error stack:', error.stack)
            toast.error('Có lỗi xảy ra khi tải dữ liệu')
        } finally {
            console.log('🏁 [loadPackages] Finally block - setting loading to false')
            setLoading(false)
        }
    }

    useEffect(() => {
        console.log('🔄 [useEffect] loadPackages triggered with dependencies:', {
            currentPage,
            perPage,
            searchQuery,
            statusFilter
        })
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
        setCurrentPackage(pkg)
        setDeleteDialog(true)
    }

    // Handle bulk delete
    const handleBulkDelete = () => {
        if (selectedPackages.length === 0) {
            toast.error('Vui lòng chọn ít nhất một gói dịch vụ')
            return
        }
        setDeleteDialog(true)
    }

    // Handle status update
    const handleStatusUpdate = async (status) => {
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
            id: 'name',
            header: 'Tên gói',
            cell: ({ row }) => {
                const record = row.original
                return (
                <div className="flex items-center gap-3">
                    {record.icon && (
                        <span className="text-lg">{record.icon}</span>
                    )}
                    <div>
                            <div className="font-medium">{record.name}</div>
                        {record.is_popular && (
                            <Badge variant="solid" color="yellow" size="sm">
                                Phổ biến
                            </Badge>
                        )}
                    </div>
                </div>
            )
            }
        },
        {
            id: 'price',
            header: 'Giá',
            cell: ({ row }) => {
                const record = row.original
                return (
                <div>
                    <div className="font-medium">
                            {ServicePackageHelpers.formatPrice(record.price, record.currency)}
                    </div>
                    <div className="text-sm text-gray-500">
                        {ServicePackageHelpers.getDurationText(record)}
                    </div>
                </div>
            )
            }
        },
        {
            id: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => {
                const isActive = row.original.is_active
                return (
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                            isActive 
                                ? 'bg-emerald-500 shadow-emerald-500/50' 
                                : 'bg-red-500 shadow-red-500/50'
                        } shadow-lg animate-pulse`}></div>
                        <span className={`text-sm font-medium ${
                            isActive 
                                ? 'text-emerald-700 dark:text-emerald-400' 
                                : 'text-red-700 dark:text-red-400'
                        }`}>
                    {isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                    </div>
                )
            }
        },
        {
            id: 'sort_order',
            header: 'Thứ tự',
            cell: ({ row }) => row.original.sort_order
        },
        {
            id: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => {
                const record = row.original
                return (
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
        }
    ]

    console.log('🎨 [ServicePackageManagement] Rendering with state:', {
        packages: packages.length,
        loading,
        total,
        currentPage,
        perPage,
        searchQuery,
        statusFilter,
        selectedPackages: selectedPackages.length
    })

    // Render loading state
    if (loading) {
        return (
            <Container>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </Container>
        )
    }

    console.log('📊 [ServicePackageManagement] Rendering table with packages:', packages)
    console.log('📊 [ServicePackageManagement] Packages structure:', packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        is_active: pkg.is_active
    })))

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
                            <Button onClick={handleCreate}>
                                + Thêm gói dịch vụ
                            </Button>
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
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        color="red"
                                        onClick={handleBulkDelete}
                                    >
                                        Xóa
                                    </Button>
                            </div>
                        </div>
                    </AdaptiveCard>
                )}

                {/* Table */}
                <AdaptiveCard>
                    <DataTable
                        sorting={{
                            order: 'asc',
                            key: 'name'
                        }}
                        onSort={({ order, key }) => {
                            console.log('Sorting:', { order, key })
                            // Handle sorting logic here if needed
                        }}
                        onPaginationChange={(page) => setCurrentPage(page)}
                        onSelectChange={(size) => {
                            console.log('Page size changed to:', size)
                            setPerPage(size)
                            setCurrentPage(1)
                        }}
                        onCheckBoxChange={(checked, row) => {
                            const packageId = row.original?.id || row.id
                            handleSelectPackage(packageId, checked)
                        }}
                        onIndeterminateCheckBoxChange={(checked, rows) => {
                            if (checked) {
                                const newSelected = rows.map(row => row.original?.id || row.id)
                                setSelectedPackages(newSelected)
                            } else {
                                setSelectedPackages([])
                            }
                        }}
                        checkboxChecked={(row) => {
                            const packageId = row.original?.id || row.id
                            return selectedPackages.includes(packageId)
                        }}
                        indeterminateCheckboxChecked={(rows) => {
                            const selectedCount = rows.filter(row => {
                                const packageId = row.original?.id || row.id
                                return selectedPackages.includes(packageId)
                            }).length
                            return selectedCount > 0 && selectedCount < rows.length
                        }}
                        skeletonAvatarColumns={[1]} // Icon column
                        skeletonAvatarProps={{
                            size: 'md',
                            className: 'rounded-lg'
                        }}
                        customNoDataIcon={
                            <div className="text-center">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold mb-2">Không có gói dịch vụ</h3>
                                <p className="text-gray-600 mb-4">
                                    Hiện tại không có gói dịch vụ nào phù hợp với bộ lọc của bạn
                                </p>
                                <Button onClick={handleCreate}>
                                    + Thêm gói dịch vụ đầu tiên
                                </Button>
                            </div>
                        }
                        noData={packages.length === 0}
                        loading={loading}
                        columns={columns}
                        data={packages}
                        selectable={true}
                        pagingData={{
                            total: total,
                            pageIndex: currentPage,
                            pageSize: perPage,
                        }}
                        pageSizes={[10, 25, 50, 100]}
                        instanceId="service-package-table"
                        className="min-h-[400px]"
                        compact={false}
                        hoverable={true}
                        cellBorder={false}
                        overflow={true}
                        asElement="table"
                        ref={null}
                        rowSelection={selectedPackages}
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
                        {...{}} // Spread any additional props if needed
                    >
                        {/* Custom table content can be added here if needed */}
                    </DataTable>
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
