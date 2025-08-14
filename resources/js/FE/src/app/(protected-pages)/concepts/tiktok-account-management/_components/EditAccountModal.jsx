'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import Select from '@/components/ui/Select'
import Tabs from '@/components/ui/Tabs'
// Removed API imports - now handled by parent component
import { 
    HiOutlineUser as User,
    HiOutlineMail as Mail,
    HiOutlinePhone as Phone,
    HiOutlineKey as Key,
    HiOutlineGlobe as Globe,
    HiOutlineLocationMarker as MapPin,
    HiOutlineX as X,
    HiOutlineExclamationCircle as AlertCircle,
    HiOutlineDesktopComputer as Device,
    HiOutlineTemplate as Scenario
} from 'react-icons/hi'

const EditAccountModal = ({ 
    isOpen, 
    onClose, 
    account, 
    onSave,
    devices = [],
    scenarios = [],
    loadingDevices = false,
    loadingScenarios = false,
    onLoadDevices,
    onLoadScenarios
}) => {
    const t = useTranslations('tiktokAccountManagement.editAccountModal')
    const [formData, setFormData] = useState({
        username: '',
        display_name: '',
        nickname: '',
        email: '',
        phone_number: '',
        password: '',
        status: 'inactive',
        two_factor_enabled: false,
        two_factor_backup_codes: [],
        notes: '',
        proxy_ip: '',
        proxy_port: '',
        proxy_username: '',
        proxy_password: '',
        device_info: '',
        device_id: '',
        scenario_id: '',
        tags: []
    })
    
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)

    // Initialize form data when account changes
    useEffect(() => {
        if (account) {
            setFormData({
                username: account.username || '',
                display_name: account.display_name || account.displayName || '',
                nickname: account.nickname || '',
                email: account.email || '',
                phone_number: account.phone_number || '',
                password: '', // Don't pre-fill password for security
                status: account.status || 'inactive',
                two_factor_enabled: account.two_factor_enabled || false,
                two_factor_backup_codes: account.two_factor_backup_codes || [],
                notes: account.notes || '',
                proxy_ip: account.proxy_ip || '',
                proxy_port: account.proxy_port || '',
                proxy_username: account.proxy_username || '',
                proxy_password: '', // Don't pre-fill proxy password for security
                device_info: account.device_info || '',
                device_id: account.device_id !== undefined && account.device_id !== null ? String(account.device_id) : '',
                scenario_id: account.scenario_id !== undefined && account.scenario_id !== null ? String(account.scenario_id) : '',
                tags: account.tags || []
            })
            setErrors({})
        }
    }, [account])

    // Load devices and scenarios when modal opens (emit to parent)
    useEffect(() => {
        if (isOpen && onLoadDevices && devices.length === 0) {
            onLoadDevices()
        }
    }, [isOpen, onLoadDevices, devices.length])

    useEffect(() => {
        if (isOpen && onLoadScenarios && scenarios.length === 0) {
            onLoadScenarios()
        }
    }, [isOpen, onLoadScenarios, scenarios.length])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }))
        }
    }

    const handleCheckboxChange = (field, checked) => {
        setFormData(prev => ({
            ...prev,
            [field]: checked
        }))
    }

    const validateForm = () => {
        const newErrors = {}
        
        // Required fields validation
        if (!formData.username.trim()) {
            newErrors.username = t('validation.usernameRequired')
        } else if (!/^[a-zA-Z0-9._]+$/.test(formData.username)) {
            newErrors.username = t('validation.usernameInvalid')
        }
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('validation.emailInvalid')
        }
        
        if (formData.phone_number && !/^\+?[\d\s-()]+$/.test(formData.phone_number)) {
            newErrors.phone_number = t('validation.phoneInvalid')
        }
        
        if (formData.proxy_port && (isNaN(formData.proxy_port) || formData.proxy_port < 1 || formData.proxy_port > 65535)) {
            newErrors.proxy_port = t('validation.portInvalid')
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) {
            return
        }
        
        if (onSave && !isLoading) {
            setIsLoading(true)
            try {
                // Prepare data for saving - only include non-empty fields
                const saveData = {}
                
                // Always include username as it's required
                if (formData.username && formData.username.trim()) {
                    saveData.username = formData.username.trim()
                }
                
                // Only include other fields if they have values
                if (formData.display_name && formData.display_name.trim()) {
                    saveData.display_name = formData.display_name.trim()
                }
                if (formData.nickname && formData.nickname.trim()) {
                    saveData.nickname = formData.nickname.trim()
                }
                if (formData.email && formData.email.trim()) {
                    saveData.email = formData.email.trim()
                }
                if (formData.phone_number && formData.phone_number.trim()) {
                    saveData.phone_number = formData.phone_number.trim()
                }
                if (formData.password && formData.password.trim()) {
                    saveData.password = formData.password.trim()
                }
                if (formData.status) {
                    saveData.status = formData.status
                }
                if (formData.notes && formData.notes.trim()) {
                    saveData.notes = formData.notes.trim()
                }
                if (formData.proxy_ip && formData.proxy_ip.trim()) {
                    saveData.proxy_ip = formData.proxy_ip.trim()
                }
                if (formData.proxy_port && formData.proxy_port.toString().trim()) {
                    saveData.proxy_port = parseInt(formData.proxy_port)
                }
                if (formData.proxy_username && formData.proxy_username.trim()) {
                    saveData.proxy_username = formData.proxy_username.trim()
                }
                if (formData.proxy_password && formData.proxy_password.trim()) {
                    saveData.proxy_password = formData.proxy_password.trim()
                }
                if (formData.device_info && formData.device_info.trim()) {
                    saveData.device_info = formData.device_info.trim()
                }
                if (formData.device_id && formData.device_id.toString().trim()) {
                    saveData.device_id = parseInt(formData.device_id)
                }
                if (formData.scenario_id && formData.scenario_id.toString().trim()) {
                    saveData.scenario_id = parseInt(formData.scenario_id)
                }
                
                // Handle boolean fields
                saveData.two_factor_enabled = formData.two_factor_enabled
                
                // Handle array fields
                if (formData.two_factor_backup_codes && Array.isArray(formData.two_factor_backup_codes) && formData.two_factor_backup_codes.length > 0) {
                    saveData.two_factor_backup_codes = formData.two_factor_backup_codes.filter(code => code && code.trim())
                }
                if (formData.tags && Array.isArray(formData.tags) && formData.tags.length > 0) {
                    saveData.tags = formData.tags.filter(tag => tag && tag.trim())
                }
                
                // // console.log('Prepared save data:', saveData)
                await onSave(account.id, saveData)
                // onClose() will be called from parent component after successful save
            } catch (error) {
                console.error('Error saving account:', error)
                // Handle error (could show toast notification)
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleClose = () => {
        setFormData({
            username: '',
            display_name: '',
            nickname: '',
            email: '',
            phone_number: '',
            password: '',
            status: 'inactive',
            two_factor_enabled: false,
            two_factor_backup_codes: [],
            notes: '',
            proxy_ip: '',
            proxy_port: '',
            proxy_username: '',
            proxy_password: '',
            device_info: '',
            device_id: '',
            scenario_id: '',
            tags: []
        })
        setErrors({})
        onClose()
    }

    if (!account) return null

    const statusOptions = [
        { value: 'active', label: t('status.active') },
        { value: 'inactive', label: t('status.inactive') },
        { value: 'suspended', label: t('status.suspended') },
        { value: 'running', label: t('status.running') },
        { value: 'error', label: t('status.error') }
    ]

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            onRequestClose={handleClose}
            width={1100}
            className="z-[70] my-6 md:my-10"
            closable={false}
        >
            <div className="flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {t('title')}
                    </h2>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleClose}
                        className="p-2"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 pb-32 overflow-y-auto bg-gray-50 dark:bg-gray-900 min-h-0 max-h-[calc(90vh-140px)]">
                    <Tabs defaultValue="account" variant="pill" className="w-full">
                        <Tabs.TabList className="mb-4 flex flex-wrap items-center gap-2">
                            <Tabs.TabNav
                                value="account"
                                icon={<User className="w-3 h-3" />}
                                className="flex items-center gap-1.5 text-[11px] md:text-xs whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">{t('sections.accountInfo')}</span>
                            </Tabs.TabNav>
                            <Tabs.TabNav
                                value="proxy"
                                icon={<Globe className="w-3 h-3" />}
                                className="flex items-center gap-1.5 text-[11px] md:text-xs whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">{t('sections.proxySettings')}</span>
                            </Tabs.TabNav>
                            <Tabs.TabNav
                                value="device"
                                icon={<Device className="w-3 h-3" />}
                                className="flex items-center gap-1.5 text-[11px] md:text-xs whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">{t('sections.deviceScenarioSettings')}</span>
                            </Tabs.TabNav>
                            <Tabs.TabNav
                                value="security"
                                icon={<Key className="w-3 h-3" />}
                                className="flex items-center gap-1.5 text-[11px] md:text-xs whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">{t('sections.securitySettings')}</span>
                            </Tabs.TabNav>
                        </Tabs.TabList>

                        <Tabs.TabContent value="account">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-blue-500" />
                                    {t('sections.accountInfo')}
                                </h3>
                                <div className="space-y-4">
                                    {/* Account basics */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.username')} <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            value={formData.username}
                                            onChange={(e) => handleInputChange('username', e.target.value)}
                                            placeholder={t('placeholders.username')}
                                            className={`border-gray-300 dark:border-gray-600 ${errors.username ? 'border-red-500' : ''}`}
                                        />
                                        {errors.username && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                {errors.username}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.displayName')}
                                        </label>
                                        <Input
                                            value={formData.display_name}
                                            onChange={(e) => handleInputChange('display_name', e.target.value)}
                                            placeholder={t('placeholders.displayName')}
                                            className="border-gray-300 dark:border-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.nickname')}
                                        </label>
                                        <Input
                                            value={formData.nickname}
                                            onChange={(e) => handleInputChange('nickname', e.target.value)}
                                            placeholder={t('placeholders.nickname')}
                                            className="border-gray-300 dark:border-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.status')}
                                        </label>
                                        <Select
                                            value={statusOptions.find(opt => opt.value === formData.status) || null}
                                            onChange={(opt) => handleInputChange('status', opt?.value ?? '')}
                                            options={statusOptions}
                                            className="border-gray-300 dark:border-gray-600"
                                        />
                                    </div>

                                    {/* Contact info merged */}
                                    <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700" />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.email')}
                                        </label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder={t('placeholders.email')}
                                            className={`border-gray-300 dark:border-gray-600 ${errors.email ? 'border-red-500' : ''}`}
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.phoneNumber')}
                                        </label>
                                        <Input
                                            type="tel"
                                            value={formData.phone_number}
                                            onChange={(e) => handleInputChange('phone_number', e.target.value)}
                                            placeholder={t('placeholders.phoneNumber')}
                                            className={`border-gray-300 dark:border-gray-600 ${errors.phone_number ? 'border-red-500' : ''}`}
                                        />
                                        {errors.phone_number && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                {errors.phone_number}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.password')}
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                placeholder={t('placeholders.password')}
                                                className="border-gray-300 dark:border-gray-600 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? '👁️' : '👁️‍🗨️'}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {t('hints.passwordHint')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Tabs.TabContent>



                        <Tabs.TabContent value="proxy">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                    <Globe className="w-5 h-5 mr-2 text-purple-500" />
                                    {t('sections.proxySettings')}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.proxyIp')}
                                        </label>
                                        <Input
                                            value={formData.proxy_ip}
                                            onChange={(e) => handleInputChange('proxy_ip', e.target.value)}
                                            placeholder={t('placeholders.proxyIp')}
                                            className="border-gray-300 dark:border-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.proxyPort')}
                                        </label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="65535"
                                            value={formData.proxy_port}
                                            onChange={(e) => handleInputChange('proxy_port', e.target.value)}
                                            placeholder={t('placeholders.proxyPort')}
                                            className={`border-gray-300 dark:border-gray-600 ${errors.proxy_port ? 'border-red-500' : ''}`}
                                        />
                                        {errors.proxy_port && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                {errors.proxy_port}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.proxyUsername')}
                                        </label>
                                        <Input
                                            value={formData.proxy_username}
                                            onChange={(e) => handleInputChange('proxy_username', e.target.value)}
                                            placeholder={t('placeholders.proxyUsername')}
                                            className="border-gray-300 dark:border-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.proxyPassword')}
                                        </label>
                                        <Input
                                            type="password"
                                            value={formData.proxy_password}
                                            onChange={(e) => handleInputChange('proxy_password', e.target.value)}
                                            placeholder={t('placeholders.proxyPassword')}
                                            className="border-gray-300 dark:border-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Tabs.TabContent>

                        <Tabs.TabContent value="device">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                    <Device className="w-5 h-5 mr-2 text-indigo-500" />
                                    {t('sections.deviceScenarioSettings')}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.device')}
                                        </label>
                                        <Select
                                            value={devices.find(opt => opt.value === formData.device_id) || null}
                                            onChange={(opt) => handleInputChange('device_id', opt?.value ?? '')}
                                            options={devices}
                                            isLoading={loadingDevices}
                                            className="border-gray-300 dark:border-gray-600"
                                            placeholder={t('placeholders.selectDevice')}
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {t('hints.deviceHint')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.scenario')}
                                        </label>
                                        <Select
                                            value={scenarios.find(opt => opt.value === formData.scenario_id) || null}
                                            onChange={(opt) => handleInputChange('scenario_id', opt?.value ?? '')}
                                            options={scenarios}
                                            isLoading={loadingScenarios}
                                            className="border-gray-300 dark:border-gray-600"
                                            placeholder={t('placeholders.selectScenario')}
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {t('hints.scenarioHint')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Tabs.TabContent>

                        <Tabs.TabContent value="security">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                    <Key className="w-5 h-5 mr-2 text-orange-500" />
                                    {t('sections.securitySettings')}
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-4">
                                        <div>
                                            <Checkbox
                                                checked={formData.two_factor_enabled}
                                                onChange={(checked) => handleCheckboxChange('two_factor_enabled', checked)}
                                            >
                                                {t('fields.twoFactorEnabled')}
                                            </Checkbox>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {t('hints.twoFactorHint')}
                                            </p>
                                        </div>
                                        
                                        {formData.two_factor_enabled && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Mã dự phòng 2FA
                                                    </label>
                                                    <textarea
                                                        value={Array.isArray(formData.two_factor_backup_codes) 
                                                            ? formData.two_factor_backup_codes.join(', ') 
                                                            : formData.two_factor_backup_codes || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value
                                                            const codes = value.split(/[,\s]+/).filter(code => code.trim())
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                two_factor_backup_codes: codes
                                                            }))
                                                        }}
                                                        placeholder="Nhập các mã dự phòng, cách nhau bằng dấu phẩy hoặc xuống dòng..."
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                                                        rows={3}
                                                    />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Hiện có {Array.isArray(formData.two_factor_backup_codes) 
                                                            ? formData.two_factor_backup_codes.length 
                                                            : 0} mã dự phòng
                                                    </p>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            // Generate sample backup codes
                                                            const sampleCodes = []
                                                            for (let i = 0; i < 8; i++) {
                                                                sampleCodes.push(Math.random().toString(36).substr(2, 8).toUpperCase())
                                                            }
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                two_factor_backup_codes: sampleCodes
                                                            }))
                                                        }}
                                                    >
                                                        Tạo mã mẫu
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                two_factor_backup_codes: []
                                                            }))
                                                        }}
                                                    >
                                                        Xóa tất cả
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.deviceInfo')}
                                        </label>
                                        <Input
                                            value={formData.device_info}
                                            onChange={(e) => handleInputChange('device_info', e.target.value)}
                                            placeholder={t('placeholders.deviceInfo')}
                                            className="border-gray-300 dark:border-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('fields.notes')}
                                        </label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => handleInputChange('notes', e.target.value)}
                                            placeholder={t('placeholders.notes')}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Tabs.TabContent>
                    </Tabs>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="default"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            {t('buttons.cancel')}
                        </Button>
                        <Button
                            type="button"
                            variant="solid"
                            color="blue-500"
                            onClick={handleSave}
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            {t('buttons.save')}
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default EditAccountModal
