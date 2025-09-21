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
import Breadcrumb from '@/components/ui/Breadcrumb'
import { 
    getServicePackageCategories,
    getServicePackages,
    getServicePackageTiers,
    createServicePackageCategory,
    updateServicePackageCategory,
    deleteServicePackageCategory,
    createServicePackage,
    updateServicePackage,
    deleteServicePackage,
    createServicePackageTier,
    updateServicePackageTier,
    deleteServicePackageTier
} from '@/server/actions/service-package'
import { toast } from 'react-hot-toast'

const ServicePackageManagement = () => {
    // Navigation state
    const [currentView, setCurrentView] = useState('categories') // categories, packages, tiers
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedPackage, setSelectedPackage] = useState(null)
    
    // Data state
    const [categories, setCategories] = useState([])
    const [packages, setPackages] = useState([])
    const [tiers, setTiers] = useState([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    
    // Selection state
    const [selectedItems, setSelectedItems] = useState([])
    
    // Dialog states
    const [createDialog, setCreateDialog] = useState(false)
    const [editDialog, setEditDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [currentItem, setCurrentItem] = useState(null)
    
    // Form states
    const [formData, setFormData] = useState({
        // Category fields
        name: '',
        description: '',
        icon: '',
        color: '#3B82F6',
        is_active: true,
        sort_order: 0,
        settings: {},
        
        // Package fields
        category_id: '',
        duration_type: 'months',
        duration_value: 1,
        platform: '',
        platform_settings: {},
        is_popular: false,
        features: [],
        limits: [],
        
        // Tier fields
        service_package_id: '',
        device_limit: 5,
        price: 0,
        currency: 'VND',
        features: [],
        limits: []
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
                setCategories(result.data || [])
                setTotal(result.total || 0)
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

    // Load packages for selected category
    const loadPackages = async () => {
        if (!selectedCategory) return
        
        try {
            setLoading(true)
            const params = {
                page: currentPage,
                per_page: perPage,
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                category_id: selectedCategory.id
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

    // Load tiers for selected package
    const loadTiers = async () => {
        if (!selectedPackage) return
        
        try {
            setLoading(true)
            const params = {
                page: currentPage,
                per_page: perPage,
                search: searchQuery || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                service_package_id: selectedPackage.id
            }
            
            const result = await getServicePackageTiers(params)
            
            if (result.success) {
                setTiers(result.data || [])
                setTotal(result.total || 0)
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

    // Load data based on current view
    const loadData = async () => {
        switch (currentView) {
            case 'categories':
                await loadCategories()
                break
            case 'packages':
                await loadPackages()
                break
            case 'tiers':
                await loadTiers()
                break
        }
    }

    useEffect(() => {
        loadData()
    }, [currentView, currentPage, perPage, searchQuery, statusFilter, selectedCategory, selectedPackage])

    // Navigation handlers
    const handleCategorySelect = (category) => {
        setSelectedCategory(category)
        setSelectedPackage(null)
        setCurrentView('packages')
        setCurrentPage(1)
        setSearchQuery('')
    }

    const handlePackageSelect = (packageItem) => {
        setSelectedPackage(packageItem)
        setCurrentView('tiers')
        setCurrentPage(1)
        setSearchQuery('')
    }

    const handleBackToCategories = () => {
        setSelectedCategory(null)
        setSelectedPackage(null)
        setCurrentView('categories')
        setCurrentPage(1)
        setSearchQuery('')
    }

    const handleBackToPackages = () => {
        setSelectedPackage(null)
        setCurrentView('packages')
        setCurrentPage(1)
        setSearchQuery('')
    }

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
        const currentData = getCurrentData()
        if (checked) {
            setSelectedItems(Array.isArray(currentData) ? currentData.map(item => item.id) : [])
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

    // Get current data based on view
    const getCurrentData = () => {
        switch (currentView) {
            case 'categories':
                return categories
            case 'packages':
                return packages
            case 'tiers':
                return tiers
            default:
                return []
        }
    }

    // CRUD handlers
    const handleCreate = () => {
        const defaultFormData = {
            name: '',
            description: '',
            icon: '',
            color: '#3B82F6',
            is_active: true,
            sort_order: 0,
            settings: {},
            category_id: selectedCategory?.id || '',
            duration_type: 'months',
            duration_value: 1,
            platform: '',
            platform_settings: {},
            is_popular: false,
            features: [],
            limits: [],
            service_package_id: selectedPackage?.id || '',
            device_limit: 5,
            price: 0,
            currency: 'VND'
        }
        
        setFormData(defaultFormData)
        setCreateDialog(true)
    }

    const handleEdit = (item) => {
        setFormData({
            name: item.name || '',
            description: item.description || '',
            icon: item.icon || '',
            color: item.color || '#3B82F6',
            is_active: item.is_active ?? true,
            sort_order: item.sort_order || 0,
            settings: item.settings || {},
            category_id: item.category_id || selectedCategory?.id || '',
            duration_type: item.duration_type || 'months',
            duration_value: item.duration_value || 1,
            platform: item.platform || '',
            platform_settings: item.platform_settings || {},
            is_popular: item.is_popular ?? false,
            features: item.features || [],
            limits: item.limits || [],
            service_package_id: item.service_package_id || selectedPackage?.id || '',
            device_limit: item.device_limit || 5,
            price: item.price || 0,
            currency: item.currency || 'VND'
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
                switch (currentView) {
                    case 'categories':
                        result = await createServicePackageCategory(formData)
                        break
                    case 'packages':
                        result = await createServicePackage(formData)
                        break
                    case 'tiers':
                        result = await createServicePackageTier(formData)
                        break
                    default:
                        return
                }
            } else {
                switch (currentView) {
                    case 'categories':
                        result = await updateServicePackageCategory(currentItem.id, formData)
                        break
                    case 'packages':
                        result = await updateServicePackage(currentItem.id, formData)
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

    // Delete confirm handler
    const handleDeleteConfirm = async () => {
        try {
            setLoading(true)
            let result
            
            switch (currentView) {
                case 'categories':
                    result = await deleteServicePackageCategory(currentItem.id)
                    break
                case 'packages':
                    result = await deleteServicePackage(currentItem.id)
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

    // Get columns based on current view
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
                            {currentView === 'categories' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCategorySelect(record)}
                                >
                                    Xem gói
                                </Button>
                            )}
                            {currentView === 'packages' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePackageSelect(record)}
                                >
                                    Xem cấp độ
                                </Button>
                            )}
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

        if (currentView === 'packages') {
            return [
                ...baseColumns.slice(0, 1), // name
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
                ...baseColumns.slice(1) // status, sort_order, actions
            ]
        }

        if (currentView === 'tiers') {
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

    // Get breadcrumb items
    const getBreadcrumbItems = () => {
        const items = [
            { label: 'Danh mục', onClick: handleBackToCategories }
        ]
        
        if (selectedCategory) {
            items.push({ 
                label: selectedCategory.name, 
                onClick: currentView === 'tiers' ? handleBackToPackages : undefined 
            })
        }
        
        if (selectedPackage) {
            items.push({ label: selectedPackage.name })
        }
        
        return items
    }

    // Get current title
    const getCurrentTitle = () => {
        switch (currentView) {
            case 'categories':
                return 'Quản lý danh mục gói dịch vụ'
            case 'packages':
                return `Gói dịch vụ - ${selectedCategory?.name || ''}`
            case 'tiers':
                return `Cấp độ - ${selectedPackage?.name || ''}`
            default:
                return 'Quản lý gói dịch vụ'
        }
    }

    // Get current description
    const getCurrentDescription = () => {
        switch (currentView) {
            case 'categories':
                return 'Quản lý các danh mục gói dịch vụ (Facebook, Instagram, TikTok, ...)'
            case 'packages':
                return `Quản lý các gói dịch vụ trong danh mục ${selectedCategory?.name || ''}`
            case 'tiers':
                return `Quản lý các cấp độ trong gói ${selectedPackage?.name || ''}`
            default:
                return 'Quản lý hệ thống gói dịch vụ'
        }
    }

    // Get add button text
    const getAddButtonText = () => {
        switch (currentView) {
            case 'categories':
                return '+ Thêm danh mục'
            case 'packages':
                return '+ Thêm gói dịch vụ'
            case 'tiers':
                return '+ Thêm cấp độ'
            default:
                return '+ Thêm'
        }
    }

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{getCurrentTitle()}</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {getCurrentDescription()}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {(currentView === 'packages' || currentView === 'tiers') && (
                            <Button
                                variant="outline"
                                onClick={currentView === 'tiers' ? handleBackToPackages : handleBackToCategories}
                            >
                                ← Quay lại
                            </Button>
                        )}
                        <Button onClick={handleCreate}>
                            {getAddButtonText()}
                        </Button>
                    </div>
                </div>

                {/* Breadcrumb */}
                <Breadcrumb items={getBreadcrumbItems()} />

                {/* Filters */}
                <AdaptiveCard>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder={`Tìm kiếm ${currentView === 'categories' ? 'danh mục' : currentView === 'packages' ? 'gói dịch vụ' : 'cấp độ'}...`}
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
                        data={getCurrentData()}
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
                                    + Thêm {currentView === 'categories' ? 'danh mục' : currentView === 'packages' ? 'gói dịch vụ' : 'cấp độ'} đầu tiên
                                </Button>
                            </div>
                        }
                        noData={Array.isArray(getCurrentData()) && getCurrentData().length === 0}
                        pageSizes={[10, 25, 50, 100]}
                        instanceId={`${currentView}-table`}
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
                            {createDialog ? `Thêm ${currentView === 'categories' ? 'danh mục' : currentView === 'packages' ? 'gói dịch vụ' : 'cấp độ'}` : `Sửa ${currentView === 'categories' ? 'danh mục' : currentView === 'packages' ? 'gói dịch vụ' : 'cấp độ'}`}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Common fields */}
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

                            {/* Package specific fields */}
                            {currentView === 'packages' && (
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

                            {/* Tier specific fields */}
                            {currentView === 'tiers' && (
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
                                </>
                            )}
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
                            
                            {(currentView === 'packages' || currentView === 'tiers') && (
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_popular}
                                        onChange={(e) => setFormData({...formData, is_popular: e.target.checked})}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Phổ biến</span>
                                </label>
                            )}
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
                            Bạn có chắc chắn muốn xóa {currentView === 'categories' ? 'danh mục' : currentView === 'packages' ? 'gói dịch vụ' : 'cấp độ'} "{currentItem?.name}"?
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