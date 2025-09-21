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
import { 
    getServicePackageTiers,
    getServicePackages,
    createServicePackageTier,
    updateServicePackageTier,
    deleteServicePackageTier
} from '@/server/actions/service-package'
import { toast } from 'react-hot-toast'

const TiersManagement = () => {
    const [tiers, setTiers] = useState([])
    const [packages, setPackages] = useState([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [packageFilter, setPackageFilter] = useState('all')
    const [selectedItems, setSelectedItems] = useState([])
    
    // Dialog states
    const [createDialog, setCreateDialog] = useState(false)
    const [editDialog, setEditDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false)
    const [currentItem, setCurrentItem] = useState(null)
    
    // Form state
    const [formData, setFormData] = useState({
        service_package_id: '',
        name: '',
        description: '',
        device_limit: 5,
        price: 0,
        currency: 'VND',
        is_active: true,
        is_popular: false,
        sort_order: 0
    })

    // Load tiers
    const loadTiers = async () => {
        try {
            setLoading(true)
            const params = {
                page: currentPage,
                per_page: perPage,
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                service_package_id: packageFilter !== 'all' ? packageFilter : undefined
            }
            
            const result = await getServicePackageTiers(params)
            
            if (result.success) {
                // Check if data is nested in result.data.data (like categories)
                const tiersData = result.data?.data || result.data || []
                const totalData = result.data?.total || result.total || 0
                
                setTiers(tiersData)
                setTotal(totalData)
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

    // Load packages for dropdown
    const loadPackages = async () => {
        try {
            const result = await getServicePackages({ per_page: 100 })
            if (result.success) {
                setPackages(result.data || [])
            }
        } catch (error) {
            console.error('Error loading packages:', error)
        }
    }

    useEffect(() => {
        loadTiers()
    }, [currentPage, perPage, searchQuery, statusFilter, packageFilter])

    useEffect(() => {
        loadPackages()
    }, [])

    // Search and filter handlers
    const handleSearch = (value) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }

    const handleStatusFilter = (value) => {
        setStatusFilter(value)
        setCurrentPage(1)
    }

    const handlePackageFilter = (value) => {
        setPackageFilter(value)
        setCurrentPage(1)
    }

    // Selection handlers
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedItems(Array.isArray(tiers) ? tiers.map(item => item.id) : [])
        } else {
            setSelectedItems([])
        }
    }

    const handleSelectItem = (itemId, checked) => {
        if (checked) {
            setSelectedItems([...selectedItems, itemId])
        } else {
            setSelectedItems(selectedItems.filter(id => id !== itemId))
        }
    }

    // CRUD handlers
    const handleCreate = () => {
        setFormData({
            service_package_id: '',
            name: '',
            description: '',
            device_limit: 5,
            price: 0,
            currency: 'VND',
            is_active: true,
            is_popular: false,
            sort_order: 0
        })
        setCreateDialog(true)
    }

    const handleEdit = (item) => {
        setFormData({
            service_package_id: item.service_package_id || '',
            name: item.name || '',
            description: item.description || '',
            device_limit: item.device_limit || 5,
            price: item.price || 0,
            currency: item.currency || 'VND',
            is_active: item.is_active ?? true,
            is_popular: item.is_popular ?? false,
            sort_order: item.sort_order || 0
        })
        setCurrentItem(item)
        setEditDialog(true)
    }

    const handleDelete = (item) => {
        setCurrentItem(item)
        setDeleteDialog(true)
    }

    // Form submit handler
    const handleFormSubmit = async (e) => {
        e.preventDefault()
        
        // Validation
        if (!formData.service_package_id) {
            toast.error('Vui lòng chọn gói dịch vụ')
            return
        }
        
        if (!formData.name || formData.name.trim() === '') {
            toast.error('Vui lòng nhập tên cấp độ')
            return
        }
        
        try {
            setLoading(true)
            console.log('🔍 [TiersManagement] Form data being submitted:', formData)
            let result
            
            if (createDialog) {
                result = await createServicePackageTier(formData)
            } else {
                result = await updateServicePackageTier(currentItem.id, formData)
            }
            
            console.log('🔍 [TiersManagement] API result:', result)
            
            if (result.success) {
                toast.success(result.message)
                setCreateDialog(false)
                setEditDialog(false)
                loadTiers()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('❌ [TiersManagement] Error submitting form:', error)
            toast.error('Có lỗi xảy ra khi lưu dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    // Delete confirm handler
    const handleDeleteConfirm = async () => {
        try {
            setLoading(true)
            const result = await deleteServicePackageTier(currentItem.id)
            
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

    // Bulk delete handler
    const handleBulkDelete = () => {
        if (selectedItems.length === 0) {
            toast.error('Vui lòng chọn ít nhất một cấp độ để xóa')
            return
        }
        
        // Gọi trực tiếp handleBulkDeleteConfirm
        handleBulkDeleteConfirm()
    }

    // Bulk delete confirm handler
    const handleBulkDeleteConfirm = async () => {
        try {
            setLoading(true)
            const deletePromises = selectedItems.map(id => deleteServicePackageTier(id))
            const results = await Promise.all(deletePromises)
            
            const successCount = results.filter(result => result.success).length
            const failCount = results.length - successCount
            
            if (successCount > 0) {
                toast.success(`Đã xóa thành công ${successCount} cấp độ`)
                setSelectedItems([])
                loadTiers()
            }
            
            if (failCount > 0) {
                toast.error(`${failCount} cấp độ xóa thất bại`)
            }
            
            setBulkDeleteDialog(false)
        } catch (error) {
            console.error('Error bulk deleting tiers:', error)
            toast.error('Có lỗi xảy ra khi xóa nhiều cấp độ')
        } finally {
            setLoading(false)
        }
    }

    // Table columns
    const columns = [
        {
            id: 'name',
            header: 'Tên cấp độ',
            cell: ({ row }) => {
                const record = row.original
                return (
                    <div className="flex items-center gap-3">
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
            id: 'package',
            header: 'Gói dịch vụ',
            cell: ({ row }) => {
                const packageItem = Array.isArray(packages) ? packages.find(pkg => pkg.id === row.original.service_package_id) : null
                return packageItem ? packageItem.name : 'N/A'
            }
        },
        {
            id: 'device_limit',
            header: 'Số thiết bị',
            cell: ({ row }) => {
                const limit = row.original.device_limit
                return limit === -1 ? 'Không giới hạn' : `${limit} thiết bị`
            }
        },
        {
            id: 'price',
            header: 'Giá',
            cell: ({ row }) => {
                const record = row.original
                return `${Number(record.price).toLocaleString()} ${record.currency}`
            }
        },
        {
            id: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => {
                const isActive = row.original.is_active
                return (
                    <Badge 
                        variant="solid" 
                        color={isActive ? 'green' : 'red'}
                    >
                        {isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </Badge>
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

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Quản lý cấp độ gói dịch vụ</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Quản lý các cấp độ theo số lượng thiết bị (Basic, Pro, Enterprise...)
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        + Thêm cấp độ
                    </Button>
                </div>

                {/* Filters */}
                <AdaptiveCard>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm kiếm cấp độ..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                value={packageFilter}
                                onChange={handlePackageFilter}
                                options={[
                                    { value: 'all', label: 'Tất cả gói' },
                                    ...(Array.isArray(packages) ? packages.map(pkg => ({
                                        value: pkg.id.toString(),
                                        label: pkg.name
                                    })) : [])
                                ]}
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
                        {selectedItems.length > 0 && (
                            <div className="flex items-center">
                                <Button
                                    color="red"
                                    variant="outline"
                                    onClick={handleBulkDelete}
                                    loading={loading}
                                >
                                    Xóa nhiều ({selectedItems.length})
                                </Button>
                            </div>
                        )}
                    </div>
                </AdaptiveCard>

                {/* Table */}
                <AdaptiveCard>
                    <DataTable
                        columns={columns}
                        data={tiers}
                        loading={loading}
                        selectable={true}
                        pagingData={{
                            total: total,
                            pageIndex: currentPage,
                            pageSize: perPage,
                        }}
                        onPaginationChange={(page) => setCurrentPage(page)}
                        onSelectChange={(size) => {
                            setPerPage(size)
                            setCurrentPage(1)
                        }}
                        onCheckBoxChange={(checked, row) => {
                            const itemId = row.original?.id || row.id
                            handleSelectItem(itemId, checked)
                        }}
                        onIndeterminateCheckBoxChange={(checked, rows) => {
                            if (checked) {
                                const newSelected = rows.map(row => row.original?.id || row.id)
                                setSelectedItems(newSelected)
                            } else {
                                setSelectedItems([])
                            }
                        }}
                        checkboxChecked={(row) => {
                            const itemId = row.original?.id || row.id
                            return selectedItems.includes(itemId)
                        }}
                        indeterminateCheckboxChecked={(rows) => {
                            const selectedCount = rows.filter(row => {
                                const itemId = row.original?.id || row.id
                                return selectedItems.includes(itemId)
                            }).length
                            return selectedCount > 0 && selectedCount < rows.length
                        }}
                        customNoDataIcon={
                            <div className="text-center">
                                <div className="text-6xl mb-4">⭐</div>
                                <h3 className="text-xl font-semibold mb-2">Chưa có cấp độ nào</h3>
                                <p className="text-gray-600 mb-4">
                                    Hãy tạo cấp độ đầu tiên để bắt đầu
                                </p>
                                <Button onClick={handleCreate}>
                                    + Tạo cấp độ đầu tiên
                                </Button>
                            </div>
                        }
                        noData={Array.isArray(tiers) && tiers.length === 0}
                        pageSizes={[10, 25, 50, 100]}
                        instanceId="tiers-table"
                        className="min-h-[400px]"
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
                                    Gói dịch vụ *
                                </label>
                                <Select
                                    value={formData.service_package_id ? {
                                        value: formData.service_package_id,
                                        label: Array.isArray(packages) ? packages.find(pkg => pkg.id.toString() === formData.service_package_id)?.name || 'Unknown' : 'Unknown'
                                    } : null}
                                    onChange={(value) => {
                                        console.log('🔍 [TiersManagement] Selected package value:', value)
                                        // Extract the actual value if it's an object
                                        const packageId = typeof value === 'object' ? value.value : value
                                        setFormData({...formData, service_package_id: packageId})
                                    }}
                                    options={Array.isArray(packages) ? packages.map(pkg => ({
                                        value: pkg.id.toString(),
                                        label: pkg.name
                                    })) : []}
                                    placeholder="Chọn gói dịch vụ"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Tên cấp độ *
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Ví dụ: Basic, Pro, Enterprise"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Số lượng thiết bị
                                </label>
                                <Input
                                    type="number"
                                    value={formData.device_limit}
                                    onChange={(e) => setFormData({...formData, device_limit: Number(e.target.value)})}
                                    placeholder="5"
                                    min="1"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Giá (VND)
                                </label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Tiền tệ
                                </label>
                                <Select
                                    value={formData.currency ? {
                                        value: formData.currency,
                                        label: formData.currency
                                    } : null}
                                    onChange={(value) => {
                                        const currency = typeof value === 'object' ? value.value : value
                                        setFormData({...formData, currency: currency})
                                    }}
                                    options={[
                                        { value: 'VND', label: 'VND' },
                                        { value: 'USD', label: 'USD' },
                                        { value: 'EUR', label: 'EUR' }
                                    ]}
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
                                placeholder="Mô tả về cấp độ này..."
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
                            Bạn có chắc chắn muốn xóa cấp độ "{currentItem?.name}"?
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

export default TiersManagement
