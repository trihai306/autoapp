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
    getServicePackageCategories,
    createServicePackageCategory,
    updateServicePackageCategory,
    deleteServicePackageCategory
} from '@/server/actions/service-package'
import { toast } from 'react-hot-toast'

const CategoriesManagement = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedItems, setSelectedItems] = useState([])
    
    // Dialog states
    const [createDialog, setCreateDialog] = useState(false)
    const [editDialog, setEditDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false)
    const [currentItem, setCurrentItem] = useState(null)
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
        color: '#3B82F6',
        is_active: true,
        sort_order: 0
    })

    // Load categories
    const loadCategories = async () => {
        try {
            setLoading(true)
            const params = {
                page: currentPage,
                per_page: perPage,
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined
            }
            
            const result = await getServicePackageCategories(params)
            
            if (result.success) {
                // API trả về result.data.data (pagination) và result.data.total
                const categoriesData = result.data?.data || result.data || []
                const totalCount = result.data?.total || result.total || 0
                
                setCategories(categoriesData)
                setTotal(totalCount)
            } else {
                toast.error(result.message || 'Không thể tải danh sách danh mục')
            }
        } catch (error) {
            console.error('Error loading categories:', error)
            toast.error('Có lỗi xảy ra khi tải dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCategories()
    }, [currentPage, perPage, searchQuery, statusFilter])

    // Search and filter handlers
    const handleSearch = (value) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }

    const handleStatusFilter = (value) => {
        setStatusFilter(value)
        setCurrentPage(1)
    }

    // Selection handlers
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedItems(Array.isArray(categories) ? categories.map(item => item.id) : [])
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
            name: '',
            description: '',
            icon: '',
            color: '#3B82F6',
            is_active: true,
            sort_order: 0
        })
        setCreateDialog(true)
    }

    const handleEdit = (item) => {
        setFormData({
            name: item.name || '',
            description: item.description || '',
            icon: item.icon || '',
            color: item.color || '#3B82F6',
            is_active: item.is_active ?? true,
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
        
        try {
            setLoading(true)
            let result
            
            if (createDialog) {
                result = await createServicePackageCategory(formData)
            } else {
                result = await updateServicePackageCategory(currentItem.id, formData)
            }
            
            if (result.success) {
                toast.success(result.message)
                setCreateDialog(false)
                setEditDialog(false)
                
                // Reset filters để hiển thị danh mục mới
                setStatusFilter('all')
                setSearchQuery('')
                setCurrentPage(1)
                
                // Load lại danh sách
                await loadCategories()
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
            const result = await deleteServicePackageCategory(currentItem.id)
            
            if (result.success) {
                toast.success(result.message)
                setDeleteDialog(false)
                loadCategories()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Error deleting category:', error)
            toast.error('Có lỗi xảy ra khi xóa dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    // Bulk delete handler
    const handleBulkDelete = () => {
        if (selectedItems.length === 0) {
            toast.error('Vui lòng chọn ít nhất một danh mục để xóa')
            return
        }
        
        // Gọi trực tiếp handleBulkDeleteConfirm
        handleBulkDeleteConfirm()
    }

    // Bulk delete confirm handler
    const handleBulkDeleteConfirm = async () => {
        try {
            setLoading(true)
            const deletePromises = selectedItems.map(id => deleteServicePackageCategory(id))
            const results = await Promise.all(deletePromises)
            
            const successCount = results.filter(result => result.success).length
            const failCount = results.length - successCount
            
            if (successCount > 0) {
                toast.success(`Đã xóa thành công ${successCount} danh mục`)
                setSelectedItems([])
                loadCategories()
            }
            
            if (failCount > 0) {
                toast.error(`${failCount} danh mục xóa thất bại`)
            }
            
            setBulkDeleteDialog(false)
        } catch (error) {
            console.error('Error bulk deleting categories:', error)
            toast.error('Có lỗi xảy ra khi xóa nhiều danh mục')
        } finally {
            setLoading(false)
        }
    }

    // Table columns
    const columns = [
        {
            id: 'name',
            header: 'Tên danh mục',
            cell: ({ row }) => {
                const record = row.original
                return (
                    <div className="flex items-center gap-3">
                        {record.icon && (
                            <span className="text-lg">{record.icon}</span>
                        )}
                        <div>
                            <div className="font-medium">{record.name}</div>
                            {record.description && (
                                <div className="text-sm text-gray-500">{record.description}</div>
                            )}
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
                        <h1 className="text-2xl font-bold">Quản lý danh mục gói dịch vụ</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Quản lý các danh mục chính như Facebook, Instagram, TikTok...
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        + Thêm danh mục
                    </Button>
                </div>

                {/* Filters */}
                <AdaptiveCard>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm kiếm danh mục..."
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
                        {selectedItems.length > 0 && (
                            <div className="flex items-center">
                                <Button
                                    variant="outline"
                                    onClick={handleBulkDelete}
                                    loading={loading}
                                    className="text-red-600 border-red-300 hover:bg-red-50"
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
                        data={categories}
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
                                <div className="text-6xl mb-4">📁</div>
                                <h3 className="text-xl font-semibold mb-2">Chưa có danh mục nào</h3>
                                <p className="text-gray-600 mb-4">
                                    Hãy tạo danh mục đầu tiên để bắt đầu
                                </p>
                                <Button onClick={handleCreate}>
                                    + Tạo danh mục đầu tiên
                                </Button>
                            </div>
                        }
                        noData={Array.isArray(categories) && categories.length === 0}
                        pageSizes={[10, 25, 50, 100]}
                        instanceId="categories-table"
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
                    width={500}
                >
                    <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold">
                            {createDialog ? 'Thêm danh mục' : 'Sửa danh mục'}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Tên danh mục *
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Ví dụ: Facebook Marketing"
                                    required
                                />
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
                                    placeholder="Mô tả về danh mục này..."
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
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
                            
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                    className="rounded border-gray-300"
                                />
                                <span className="text-sm">Hoạt động</span>
                            </div>
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
                            Bạn có chắc chắn muốn xóa danh mục "{currentItem?.name}"?
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

export default CategoriesManagement
