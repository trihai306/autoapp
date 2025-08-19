'use client'
import { Form, FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'

import { useRouter } from 'next/navigation'
import createRole from '@/server/actions/user/createRole'
import updateRole from '@/server/actions/user/updateRole'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import getPermissions from '@/server/actions/user/getPermissions'
import { useTranslations } from 'next-intl'
import { TbUser, TbShieldCheck, TbCheck, TbSearch, TbChevronLeft, TbChevronRight } from 'react-icons/tb'
import { useRoleListStore } from '../_store/roleListStore'

const validationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    permissions: z.array(z.number()).optional(),
});

const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pages = []
        const showPages = 5 // Show 5 page numbers at most
        
        if (totalPages <= showPages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            }
        }
        
        return pages
    }

    return (
        <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
                    currentPage === 1
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white'
                }`}
            >
                <TbChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...'}
                    className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-medium transition-all duration-200 ${
                        page === currentPage
                            ? 'bg-primary text-white'
                            : page === '...'
                            ? 'text-gray-400 dark:text-gray-600 cursor-default'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white'
                    }`}
                >
                    {page}
                </button>
            ))}

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
                    currentPage === totalPages
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white'
                }`}
            >
                <TbChevronRight className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}

const PermissionCard = ({ permission, isSelected, onToggle }) => {
    return (
        <div
            className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                isSelected
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/40 hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50'
            }`}
            onClick={() => onToggle(permission.id)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full transition-colors ${
                            isSelected ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                        }`} />
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                            {permission.name}
                        </h4>
                    </div>
                    {permission.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 ml-4">
                            {permission.description}
                        </p>
                    )}
                </div>
                <div className={`ml-3 transition-all duration-200 ${
                    isSelected 
                        ? 'text-primary scale-110' 
                        : 'text-gray-300 dark:text-gray-600 group-hover:text-primary/60'
                }`}>
                    <TbCheck className="w-4 h-4" />
                </div>
            </div>
            
            {/* Subtle gradient overlay when selected */}
            {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-xl pointer-events-none" />
            )}
        </div>
    )
}

const RoleForm = ({ mode = 'add', role, onClose }) => {
    const router = useRouter()
    const [permissions, setPermissions] = useState([])
    const [allPermissions, setAllPermissions] = useState([]) // Store all permissions for mapping
    const [activeTab, setActiveTab] = useState('basic')
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPermissions, setTotalPermissions] = useState(0)
    const [perPage] = useState(12) // Show 12 permissions per page
    const t = useTranslations('roleManagement.form')
    
    // Get loading state from store
    const isFormLoading = useRoleListStore((state) => state.isFormLoading)


    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { name: '', permissions: [] },
        resolver: zodResolver(validationSchema),
    })

    const selectedPermissions = watch('permissions') || []



    // Force re-render when form values change
    const [forceUpdate, setForceUpdate] = useState(0);
    const triggerUpdate = () => setForceUpdate(prev => prev + 1);

    // Debug when role prop changes
    useEffect(() => {
        console.log('🔍 RoleForm - Role prop changed:', role);
        if (role) {
            console.log('🔍 RoleForm - Role details:', {
                id: role.id,
                name: role.name,
                permissions: role.permissions,
                permissionsCount: role.permissions?.length || 0
            });
        }
    }, [role]);

    // Fetch permissions with pagination
    const fetchPermissions = async (page = 1, search = '') => {
        setIsLoadingPermissions(true)
        try {
            const response = await getPermissions({ 
                per_page: perPage,
                page: page,
                search: search.trim() || undefined
            })
            
            if (response.success) {
                setPermissions(response.list || [])
                setTotalPermissions(response.total || 0)
                // console.log(`Loaded ${response.list?.length || 0} permissions (page ${page}/${Math.ceil((response.total || 0) / perPage)})`)
            } else {
                console.error('Failed to fetch permissions:', response.message)
                setPermissions([])
                setTotalPermissions(0)
            }
        } catch (error) {
            console.error('Error fetching permissions:', error)
            setPermissions([])
            setTotalPermissions(0)
        } finally {
            setIsLoadingPermissions(false)
        }
    }

    // Load all permissions for mapping (only once)
    useEffect(() => {
        const loadAllPermissions = async () => {
            try {
                const response = await getPermissions({ per_page: 1000 }) // Get all permissions
                if (response.success) {
                    setAllPermissions(response.list || [])
                }
            } catch (error) {
                console.error('Error loading all permissions:', error)
            }
        }
        loadAllPermissions()
    }, [])

    // Initial load for pagination
    useEffect(() => {
        fetchPermissions(1, searchQuery)
    }, [])

    // Handle search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1) // Reset to first page when searching
            fetchPermissions(1, searchQuery)
        }, 300) // 300ms debounce

        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    // Handle page change
    useEffect(() => {
        if (currentPage > 1) {
            fetchPermissions(currentPage, searchQuery)
        }
    }, [currentPage])

    useEffect(() => {
        if (role && allPermissions.length > 0) {
            console.log('🔍 RoleForm - Setting form data for role:', role);
            console.log('🔍 RoleForm - Role permissions:', role.permissions);
            console.log('🔍 RoleForm - All permissions loaded:', allPermissions.length);
            
            // Check if role has permissions data
            if (role.permissions && Array.isArray(role.permissions)) {
                const permissionIds = role.permissions.map(p => {
                    // Handle both cases: permission object with id, or just permission name
                    if (typeof p === 'object' && p.id) {
                        console.log('📌 Found permission with ID:', p.id, p.name);
                        return p.id;
                    } else if (typeof p === 'string') {
                        // Find permission by name in allPermissions
                        const found = allPermissions.find(ap => ap.name === p);
                        console.log('📌 Finding permission by name:', p, found ? `Found ID: ${found.id}` : 'Not found');
                        return found?.id;
                    } else if (p.name) {
                        // Permission object with name but no id
                        const found = allPermissions.find(ap => ap.name === p.name);
                        console.log('📌 Finding permission by object name:', p.name, found ? `Found ID: ${found.id}` : 'Not found');
                        return found?.id;
                    }
                    console.log('⚠️ Unknown permission format:', p);
                    return null;
                }).filter(Boolean);
                
                console.log('✅ RoleForm - Mapped permission IDs:', permissionIds);
                console.log('✅ RoleForm - Setting form data:', { name: role.name, permissions: permissionIds });
                
                reset({ 
                    name: role.name, 
                    permissions: permissionIds
                });
                
                // Force update the form values to ensure selectedPermissions is updated
                setTimeout(() => {
                    console.log('🔄 RoleForm - Force updating form after reset');
                    reset({ 
                        name: role.name, 
                        permissions: permissionIds
                    });
                    // Trigger re-render to update selectedPermissions display
                    triggerUpdate();
                }, 100);
            } else {
                console.log('⚠️ RoleForm - No permissions data found in role');
                reset({ 
                    name: role.name, 
                    permissions: []
                });
            }
        } else if (!role) {
            console.log('🔄 RoleForm - Resetting form for new role');
            reset({ name: '', permissions: [] });
        } else {
            console.log('⏳ RoleForm - Waiting for permissions to load...', { 
                hasRole: !!role, 
                allPermissionsCount: allPermissions.length 
            });
        }
    }, [role, allPermissions, reset])

    // Additional effect to ensure form reset when mode changes
    useEffect(() => {
        console.log('🔄 RoleForm - Mode changed:', mode);
        if (mode === 'add') {
            console.log('🔄 RoleForm - Resetting for add mode');
            reset({ name: '', permissions: [] });
        }
    }, [mode, reset]);

    // Effect to reset form when role changes but allPermissions is not ready yet
    useEffect(() => {
        if (mode === 'edit' && role && allPermissions.length === 0) {
            console.log('⏳ RoleForm - Role available but permissions not loaded yet');
        }
    }, [mode, role, allPermissions]);

    // Effect to monitor form values changes
    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'permissions') {
                console.log('🔄 RoleForm - Form permissions field changed:', value.permissions);
                console.log('🔄 RoleForm - New permissions count:', value.permissions?.length || 0);
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const onSubmit = async (values) => {
        try {
            // Ensure all permissions are loaded
            if (allPermissions.length === 0) {
                toast.push(
                    <Notification title="Error" type="danger" closable>
                        Đang tải danh sách quyền, vui lòng thử lại sau ít giây
                    </Notification>
                )
                return
            }

            const data = {
                name: values.name,
                permissions: values.permissions.map(id => allPermissions.find(p => p.id === id)?.name).filter(Boolean)
            };

            // console.log('Submitting role data:', data); // Debug log

            let result
            if (mode === 'add') {
                result = await createRole(data)
            } else {
                result = await updateRole(role.id, data)
            }
            if (result.success) {
                toast.push(
                    <Notification title="Success" type="success" closable>
                        {result.message}
                    </Notification>
                )
                onClose()
                router.refresh()
            } else {
                toast.push(
                    <Notification title="Error" type="danger" closable>
                        {result.message}
                    </Notification>
                )
            }
        } catch (error) {
            toast.push(
                <Notification title="Error" type="danger" closable>
                    An unexpected error occurred.
                </Notification>
            )
        }
    }

    const handlePermissionToggle = (permissionId, currentValue) => {
        const newValue = currentValue.includes(permissionId)
            ? currentValue.filter((id) => id !== permissionId)
            : [...currentValue, permissionId];
        return newValue;
    }

    // Show loading state when form is loading
    if (isFormLoading) {
        return (
            <div className="w-full">
                <div className="mb-6">
                    <h5 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {mode === 'add' ? t('createTitle') : t('editTitle')}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {mode === 'add' 
                            ? 'Tạo vai trò mới và phân quyền cho người dùng'
                            : 'Chỉnh sửa thông tin vai trò và quyền hạn'
                        }
                    </p>
                </div>
                
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Đang tải thông tin vai trò...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="mb-6">
                <h5 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {mode === 'add' ? t('createTitle') : t('editTitle')}
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {mode === 'add' 
                        ? 'Tạo vai trò mới và phân quyền cho người dùng'
                        : 'Chỉnh sửa thông tin vai trò và quyền hạn'
                    }
                </p>
            </div>

        <Form onSubmit={handleSubmit(onSubmit)}>
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.TabList className="mb-6">
                        <Tabs.TabNav value="basic" icon={<TbUser />}>
                            Thông tin cơ bản
                        </Tabs.TabNav>
                        <Tabs.TabNav value="permissions" icon={<TbShieldCheck />}>
                            Phân quyền ({selectedPermissions.length})
                        </Tabs.TabNav>
                    </Tabs.TabList>

                    <div className="min-h-[400px]">
                        <Tabs.TabContent value="basic">
            <FormContainer>
                                <div className="space-y-6">
                                    <FormItem 
                                        label={t('nameLabel')} 
                                        invalid={Boolean(errors.name)} 
                                        errorMessage={errors.name?.message}
                                    >
                                        <Controller 
                                            name="name" 
                                            control={control} 
                                            render={({ field }) => (
                                                <Input 
                                                    placeholder={t('namePlaceholder')} 
                                                    size="lg"
                                                    {...field} 
                                                />
                                            )} 
                                        />
                </FormItem>

                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            Thông tin vai trò
                                        </h6>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            <p>• Tên vai trò phải là duy nhất trong hệ thống</p>
                                            <p>• Vai trò sẽ được sử dụng để phân quyền cho người dùng</p>
                                            <p>• Bạn có thể chỉnh sửa quyền hạn trong tab "Phân quyền"</p>
                                        </div>
                                    </div>
                                </div>
                            </FormContainer>
                        </Tabs.TabContent>

                        <Tabs.TabContent value="permissions">
                            <FormContainer>
                                <div className="space-y-6">
                                        {/* Header Section */}
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <TbShieldCheck className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h6 className="font-semibold text-gray-900 dark:text-gray-100">
                                                            Chọn quyền hạn
                                                        </h6>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {selectedPermissions.length > 0 ? (
                                                                <span className="text-primary font-medium">
                                                                    Đã chọn {selectedPermissions.length} quyền
                                                                </span>
                                                            ) : (
                                                                'Chưa chọn quyền nào'
                                                            )}
                                                            {totalPermissions > 0 && (
                                                                <span className="text-gray-400 ml-1">
                                                                    • {totalPermissions} tổng cộng
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <Controller
                                                    name="permissions"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="default"
                                                                size="sm"
                                                                className="text-xs"
                                                                onClick={() => {
                                                                    const currentPagePermissionIds = permissions.map(p => p.id)
                                                                    const allCurrentPageSelected = currentPagePermissionIds.every(id => 
                                                                        selectedPermissions.includes(id)
                                                                    )
                                                                    
                                                                    if (allCurrentPageSelected) {
                                                                        const newSelection = selectedPermissions.filter(id => 
                                                                            !currentPagePermissionIds.includes(id)
                                                                        )
                                                                        field.onChange(newSelection)
                                                                    } else {
                                                                        const newSelection = [...new Set([...selectedPermissions, ...currentPagePermissionIds])]
                                                                        field.onChange(newSelection)
                                                                    }
                                                                }}
                                                            >
                                                                {permissions.every(p => selectedPermissions.includes(p.id)) ? 'Bỏ chọn trang' : 'Chọn trang'}
                                                            </Button>
                                                            
                                                            {selectedPermissions.length > 0 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="default"
                                                                    size="sm"
                                                                    className="text-xs text-red-600 hover:text-red-700"
                                                                    onClick={() => field.onChange([])}
                                                                >
                                                                    Xóa tất cả
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                />
                                            </div>

                                            {/* Search Input */}
                                            <div className="relative">
                                                <Input
                                                    placeholder="Tìm kiếm quyền theo tên..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600"
                                                />
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                    <TbSearch className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                    <Controller
                        name="permissions"
                        control={control}
                        render={({ field }) => (
                                            <div className="space-y-6">
                                                {isLoadingPermissions ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {[...Array(9)].map((_, index) => (
                                                            <div key={index} className="animate-pulse">
                                                                <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl"></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : permissions.length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                                            <TbShieldCheck className="w-10 h-10 text-gray-400" />
                                                        </div>
                                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                            Không tìm thấy quyền
                                                        </h3>
                                                        <p className="text-gray-500 dark:text-gray-400">
                                                            {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Không có quyền nào trong hệ thống'}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Permissions Grid */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {permissions.map((permission) => (
                                                                <PermissionCard
                                        key={permission.id}
                                                                    permission={permission}
                                                                    isSelected={field.value.includes(permission.id)}
                                                                    onToggle={(permissionId) => {
                                                                        const newValue = handlePermissionToggle(permissionId, field.value);
                                            field.onChange(newValue);
                                        }}
                                                                />
                                                            ))}
                                                        </div>
                                                        
                                                        {/* Pagination */}
                                                        {Math.ceil(totalPermissions / perPage) > 1 && (
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                                {/* Left: Page Info */}
                                                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                                                        <span>Trang {currentPage} / {Math.ceil(totalPermissions / perPage)}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <TbShieldCheck className="w-4 h-4" />
                                                                        <span>{totalPermissions} quyền</span>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Right: Pagination Controls */}
                                                                <div className="flex justify-center sm:justify-end">
                                                                    <CustomPagination
                                                                        currentPage={currentPage}
                                                                        totalPages={Math.ceil(totalPermissions / perPage)}
                                                                        onPageChange={(page) => setCurrentPage(page)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                            </div>
                        )}
                    />
                                </div>
                            </FormContainer>
                        </Tabs.TabContent>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg">
                        <div className="text-sm">
                            {activeTab === 'permissions' && selectedPermissions.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    <span className="text-primary font-medium">
                                        {selectedPermissions.length} quyền đã chọn
                                    </span>
                                </div>
                            )}
                            {allPermissions.length === 0 && (
                                <div className="flex items-center gap-2 text-orange-600">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs">Đang tải danh sách quyền...</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <Button 
                                type="button" 
                                variant="default" 
                                onClick={onClose}
                                className="px-6"
                            >
                        {t('cancel')}
                    </Button>
                                                        <Button 
                                variant="solid" 
                                type="submit" 
                                loading={isSubmitting}
                                disabled={isSubmitting || allPermissions.length === 0}
                                className="px-6 bg-primary hover:bg-primary/90"
                            >
                                {isSubmitting ? t('saving') : t('save')}
                            </Button>
                </div>
                    </div>
                </Tabs>
        </Form>
        </div>
    )
}

export default RoleForm
