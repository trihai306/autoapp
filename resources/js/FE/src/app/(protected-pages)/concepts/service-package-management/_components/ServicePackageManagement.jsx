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
import Tabs from '@/components/ui/Tabs'
import { 
    getServicePackages,
    getServicePackageCategories,
    getServicePackageTiers,
    createServicePackage,
    updateServicePackage,
    deleteServicePackage,
    createServicePackageCategory,
    updateServicePackageCategory,
    deleteServicePackageCategory,
    createServicePackageTier,
    updateServicePackageTier,
    deleteServicePackageTier
} from '@/server/actions/service-package'
import { toast } from 'react-hot-toast'

const ServicePackageManagement = () => {
    const [activeTab, setActiveTab] = useState('packages')
    const [packages, setPackages] = useState([])
    const [categories, setCategories] = useState([])
    const [tiers, setTiers] = useState([])
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
    const [currentItem, setCurrentItem] = useState(null)
    
    // Form states
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

    // Load data based on active tab
    const loadData = async () => {
        try {
            setLoading(true)
            let result
            
            const params = {
                page: currentPage,
                per_page: perPage,
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined
            }
            
            switch (activeTab) {
                case 'packages':
                    result = await getServicePackages(params)
                    break
                case 'categories':
                    result = await getServicePackageCategories(params)
                    break
                case 'tiers':
                    result = await getServicePackageTiers(params)
                    break
                default:
                    return
            }
            
            if (result.success) {
                setPackages(result.data || [])
                setTotal(result.total || 0)
            } else {
                toast.error(result.message || 'Không thể tải dữ liệu')
            }
        } catch (error) {
            console.error('Error loading data:', error)
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
                setCategories(result.data || [])
            }
        } catch (error) {
            console.error('Error loading categories:', error)
        }
    }

    useEffect(() => {
        loadData()
    }, [activeTab, currentPage, perPage, searchQuery, statusFilter])

    useEffect(() => {
        loadCategories()
    }, [])

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
            setSelectedItems(packages.map(item => item.id))
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

    // Handle create
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

    // Handle edit
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

    // Handle delete
    const handleDelete = (item) => {
        setCurrentItem(item)
        setDeleteDialog(true)
    }

    // Handle form submit
    const handleFormSubmit = async (e) => {
        e.preventDefault()
        
        try {
            setLoading(true)
            let result
            
            if (createDialog) {
                switch (activeTab) {
                    case 'packages':
                        result = await createServicePackage(formData)
                        break
                    case 'categories':
                        result = await createServicePackageCategory(formData)
                        break
                    case 'tiers':
                        result = await createServicePackageTier(formData)
                        break
                    default:
                        return
                }
            } else {
                switch (activeTab) {
                    case 'packages':
                        result = await updateServicePackage(currentItem.id, formData)
                        break
                    case 'categories':
                        result = await updateServicePackageCategory(currentItem.id, formData)
                        break
                    case 'tiers':
                        result = await updateServicePackageTier(currentItem.id, formData)
                        break
                    default:
                        return
                }
            }
            
            if (result.success) {
                toast.success(result.message)
                setCreateDialog(false)
                setEditDialog(false)
                loadData()
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
            
            switch (activeTab) {
                case 'packages':
                    result = await deleteServicePackage(currentItem.id)
                    break
                case 'categories':
                    result = await deleteServicePackageCategory(currentItem.id)
                    break
                case 'tiers':
                    result = await deleteServicePackageTier(currentItem.id)
                    break
                default:
                    return
            }
            
            if (result.success) {
                toast.success(result.message)
                setDeleteDialog(false)
                loadData()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error('Error deleting item:', error)
            toast.error('Có lỗi xảy ra khi xóa dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    // Get columns based on active tab
    const getColumns = () => {
        const baseColumns = [
            {
                id: 'name',
                header: 'Tên',
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

        if (activeTab === 'packages') {
            return [
                ...baseColumns.slice(0, 1), // name
                {
                    id: 'category',
                    header: 'Danh mục',
                    cell: ({ row }) => {
                        const category = categories.find(cat => cat.id === row.original.category_id)
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
                ...baseColumns.slice(1) // status, sort_order, actions
            ]
        }

        if (activeTab === 'tiers') {
            return [
                ...baseColumns.slice(0, 1), // name
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
                ...baseColumns.slice(1) // status, sort_order, actions
            ]
        }

        return baseColumns
    }

    const tabs = [
        { key: 'packages', label: 'Gói dịch vụ' },
        { key: 'categories', label: 'Danh mục' },
        { key: 'tiers', label: 'Cấp độ' }
    ]

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Quản lý gói dịch vụ</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Quản lý danh mục, gói dịch vụ và cấp độ
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleCreate}>
                            + Thêm {activeTab === 'packages' ? 'gói dịch vụ' : activeTab === 'categories' ? 'danh mục' : 'cấp độ'}
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onChange={setActiveTab}
                    tabs={tabs}
                />

                {/* Filters */}
                <AdaptiveCard>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder={`Tìm kiếm ${activeTab === 'packages' ? 'gói dịch vụ' : activeTab === 'categories' ? 'danh mục' : 'cấp độ'}...`}
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

                {/* Table */}
                <AdaptiveCard>
                    <DataTable
                        columns={getColumns()}
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
                                <h3 className="text-xl font-semibold mb-2">Không có dữ liệu</h3>
                                <p className="text-gray-600 mb-4">
                                    Hiện tại không có dữ liệu nào phù hợp với bộ lọc của bạn
                                </p>
                                <Button onClick={handleCreate}>
                                    + Thêm {activeTab === 'packages' ? 'gói dịch vụ' : activeTab === 'categories' ? 'danh mục' : 'cấp độ'} đầu tiên
                                </Button>
                            </div>
                        }
                        noData={packages.length === 0}
                        pageSizes={[10, 25, 50, 100]}
                        instanceId={`${activeTab}-table`}
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
                            {createDialog ? `Thêm ${activeTab === 'packages' ? 'gói dịch vụ' : activeTab === 'categories' ? 'danh mục' : 'cấp độ'}` : `Sửa ${activeTab === 'packages' ? 'gói dịch vụ' : activeTab === 'categories' ? 'danh mục' : 'cấp độ'}`}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeTab === 'packages' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Danh mục *
                                    </label>
                                    <Select
                                        value={formData.category_id}
                                        onChange={(value) => setFormData({...formData, category_id: value})}
                                        options={categories.map(cat => ({
                                            value: cat.id.toString(),
                                            label: cat.name
                                        }))}
                                        placeholder="Chọn danh mục"
                                        required
                                    />
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Tên *
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Nhập tên"
                                    required
                                />
                            </div>
                            
                            {activeTab === 'packages' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Loại thời hạn
                                        </label>
                                        <Select
                                            value={formData.duration_type}
                                            onChange={(value) => setFormData({...formData, duration_type: value})}
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
                                </>
                            )}
                            
                            {activeTab === 'tiers' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Số lượng thiết bị
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.device_limit || ''}
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
                                            value={formData.price || ''}
                                            onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                </>
                            )}
                            
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
                                placeholder="Nhập mô tả"
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
                            Bạn có chắc chắn muốn xóa {activeTab === 'packages' ? 'gói dịch vụ' : activeTab === 'categories' ? 'danh mục' : 'cấp độ'} "{currentItem?.name}"?
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