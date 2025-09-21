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
    getServicePackages,
    getServicePackageCategories,
    createServicePackage,
    updateServicePackage,
    deleteServicePackage
} from '@/server/actions/service-package'
import { toast } from 'react-hot-toast'

const PackagesManagement = () => {
    const [packages, setPackages] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [selectedItems, setSelectedItems] = useState([])
    
    // Dialog states
    const [createDialog, setCreateDialog] = useState(false)
    const [editDialog, setEditDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false)
    const [currentItem, setCurrentItem] = useState(null)
    
    // Form state
    const [formData, setFormData] = useState({
        category_id: '',
        name: '',
        description: '',
        duration_type: 'months',
        duration_value: 1,
        platform: '',
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
                status: statusFilter !== 'all' ? statusFilter : undefined,
                category_id: categoryFilter !== 'all' ? categoryFilter : undefined
            }
            
            const result = await getServicePackages(params)
            
            if (result.success) {
                // Check if data is nested in result.data.data (like categories)
                const packagesData = result.data?.data || result.data || []
                const totalData = result.data?.total || result.total || 0
                
                setPackages(packagesData)
                setTotal(totalData)
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

    // Load categories for dropdown
    const loadCategories = async () => {
        try {
            const result = await getServicePackageCategories({ per_page: 100 })
            if (result.success) {
                // Check if data is nested in result.data.data (like packages)
                const categoriesData = result.data?.data || result.data || []
                setCategories(categoriesData)
                console.log('Categories loaded:', categoriesData)
            } else {
                console.error('Failed to load categories:', result.message)
            }
        } catch (error) {
            console.error('Error loading categories:', error)
        }
    }

    useEffect(() => {
        loadPackages()
    }, [currentPage, perPage, searchQuery, statusFilter, categoryFilter])

    useEffect(() => {
        loadCategories()
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

    const handleCategoryFilter = (value) => {
        setCategoryFilter(value)
        setCurrentPage(1)
    }

    // Selection handlers
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedItems(Array.isArray(packages) ? packages.map(item => item.id) : [])
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
            category_id: '',
            name: '',
            description: '',
            duration_type: 'months',
            duration_value: 1,
            platform: '',
            is_active: true,
            is_popular: false,
            sort_order: 0,
            icon: '',
            color: '#3B82F6'
        })
        setCreateDialog(true)
    }

    const handleEdit = (item) => {
        setFormData({
            category_id: item.category_id || '',
            name: item.name || '',
            description: item.description || '',
            duration_type: item.duration_type || 'months',
            duration_value: item.duration_value || 1,
            platform: item.platform || '',
            is_active: item.is_active ?? true,
            is_popular: item.is_popular ?? false,
            sort_order: item.sort_order || 0,
            icon: item.icon || '',
            color: item.color || '#3B82F6'
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
        
        try {
            setLoading(true)
            console.log('Form data being submitted:', formData)
            let result
            
            if (createDialog) {
                result = await createServicePackage(formData)
            } else {
                result = await updateServicePackage(currentItem.id, formData)
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

    // Delete confirm handler
    const handleDeleteConfirm = async () => {
        try {
            setLoading(true)
            const result = await deleteServicePackage(currentItem.id)
            
            if (result.success) {
                toast.success(result.message)
                setDeleteDialog(false)
                loadPackages()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Error deleting package:', error)
            toast.error('Có lỗi xảy ra khi xóa dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    // Bulk delete handler
    const handleBulkDelete = () => {
        if (selectedItems.length === 0) {
            toast.error('Vui lòng chọn ít nhất một gói dịch vụ để xóa')
            return
        }
        
        // Gọi trực tiếp handleBulkDeleteConfirm
        handleBulkDeleteConfirm()
    }

    // Bulk delete confirm handler
    const handleBulkDeleteConfirm = async () => {
        try {
            setLoading(true)
            const deletePromises = selectedItems.map(id => deleteServicePackage(id))
            const results = await Promise.all(deletePromises)
            
            const successCount = results.filter(result => result.success).length
            const failCount = results.length - successCount
            
            if (successCount > 0) {
                toast.success(`Đã xóa thành công ${successCount} gói dịch vụ`)
                setSelectedItems([])
                loadPackages()
            }
            
            if (failCount > 0) {
                toast.error(`${failCount} gói dịch vụ xóa thất bại`)
            }
            
            setBulkDeleteDialog(false)
        } catch (error) {
            console.error('Error bulk deleting packages:', error)
            toast.error('Có lỗi xảy ra khi xóa nhiều gói dịch vụ')
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
            id: 'category',
            header: 'Danh mục',
            cell: ({ row }) => {
                const category = Array.isArray(categories) ? categories.find(cat => cat.id === row.original.category_id) : null
                return category ? category.name : 'N/A'
            }
        },
        {
            id: 'duration',
            header: 'Thời hạn',
            cell: ({ row }) => {
                const record = row.original
                if (record.duration_type === 'years') {
                    return `${record.duration_value} năm`
                } else if (record.duration_type === 'months') {
                    return `${record.duration_value} tháng`
                } else if (record.duration_type === 'days') {
                    return `${record.duration_value} ngày`
                }
                return 'Không giới hạn'
            }
        },
        {
            id: 'platform',
            header: 'Platform',
            cell: ({ row }) => row.original.platform || 'N/A'
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
                        <h1 className="text-2xl font-bold">Quản lý gói dịch vụ</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Quản lý các gói dịch vụ theo thời hạn (3 tháng, 6 tháng, 1 năm...)
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        + Thêm gói dịch vụ
                    </Button>
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
                                value={categoryFilter}
                                onChange={handleCategoryFilter}
                                options={[
                                    { value: 'all', label: 'Tất cả danh mục' },
                                    ...(Array.isArray(categories) ? categories.map(cat => ({
                                        value: cat.id.toString(),
                                        label: cat.name
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
                        data={packages}
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
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold mb-2">Chưa có gói dịch vụ nào</h3>
                                <p className="text-gray-600 mb-4">
                                    Hãy tạo gói dịch vụ đầu tiên để bắt đầu
                                </p>
                                <Button onClick={handleCreate}>
                                    + Tạo gói dịch vụ đầu tiên
                                </Button>
                            </div>
                        }
                        noData={Array.isArray(packages) && packages.length === 0}
                        pageSizes={[10, 25, 50, 100]}
                        instanceId="packages-table"
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
                            {createDialog ? 'Thêm gói dịch vụ' : 'Sửa gói dịch vụ'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Danh mục *
                                </label>
                                <Select
                                    value={formData.category_id ? Array.isArray(categories) ? categories.find(cat => cat.id.toString() === formData.category_id) : null : null}
                                    onChange={(selectedOption) => {
                                        setFormData({...formData, category_id: selectedOption ? selectedOption.id.toString() : ''})
                                    }}
                                    options={Array.isArray(categories) ? categories : []}
                                    getOptionLabel={(option) => option.name}
                                    getOptionValue={(option) => option.id}
                                    placeholder="Chọn danh mục"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Tên gói *
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Ví dụ: 3 tháng"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Loại thời hạn
                                </label>
                                <Select
                                    value={formData.duration_type ? {
                                        value: formData.duration_type,
                                        label: formData.duration_type === 'days' ? 'Ngày' : 
                                               formData.duration_type === 'months' ? 'Tháng' : 
                                               formData.duration_type === 'years' ? 'Năm' : 'Unknown'
                                    } : null}
                                    onChange={(selectedOption) => {
                                        setFormData({...formData, duration_type: selectedOption ? selectedOption.value : 'months'})
                                    }}
                                    options={[
                                        { value: 'days', label: 'Ngày' },
                                        { value: 'months', label: 'Tháng' },
                                        { value: 'years', label: 'Năm' }
                                    ]}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Giá trị thời hạn
                                </label>
                                <Input
                                    type="number"
                                    value={formData.duration_value}
                                    onChange={(e) => setFormData({...formData, duration_value: Number(e.target.value)})}
                                    placeholder="1"
                                    min="1"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Platform
                                </label>
                                <Input
                                    value={formData.platform}
                                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                                    placeholder="facebook, instagram, tiktok"
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
                                    placeholder="📱, 🎯, ⭐"
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
                                placeholder="Mô tả về gói dịch vụ này..."
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
                            Bạn có chắc chắn muốn xóa gói dịch vụ "{currentItem?.name}"?
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

export default PackagesManagement
