'use client'
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'

import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import importTiktokAccounts from '@/server/actions/tiktok-account/importTiktokAccounts'
import getDevices from '@/server/actions/device/getDevices'
import getInteractionScenarios from '@/server/actions/interaction-scenario/getInteractionScenarios'
import { useTranslations } from 'next-intl'
import { 
    TbAlertCircle, 
    TbCircleCheck, 
    TbInfoCircle, 
    TbX,
    TbFileText,
    TbUsers,
    TbUser,
    TbMail,
    TbKey,
    TbPhone
} from 'react-icons/tb'

const ImportAccountsModal = ({ isOpen, onClose, onSuccess }) => {
    const t = useTranslations('tiktokAccountManagement.importModal')
    const [accountCount, setAccountCount] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [devices, setDevices] = useState([])
    const [scenarios, setScenarios] = useState([])
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [menuPortalTarget, setMenuPortalTarget] = useState(null)
    const [deviceMenuOpen, setDeviceMenuOpen] = useState(false)
    const [scenarioMenuOpen, setScenarioMenuOpen] = useState(false)
    
    // Enhanced validation states
    const [validationResults, setValidationResults] = useState({
        valid: [],
        invalid: [],
        duplicates: [],
        errors: []
    })
    const [showValidation, setShowValidation] = useState(false)
    const [isValidating, setIsValidating] = useState(false)

    useEffect(() => {
        setMenuPortalTarget(document.body)
    }, [])

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoadingData(true)
                const [devicesResponse, scenariosResponse] = await Promise.all([
                    getDevices({ per_page: 1000, page: 1 }), // Lấy tối đa 1000 devices
                    getInteractionScenarios({ per_page: 1000, page: 1 }) // Lấy tối đa 1000 scenarios
                ])



                if (devicesResponse.success) {
                    // Handle multiple possible data structures
                    let deviceData = []
                    
                    if (devicesResponse.data?.data && Array.isArray(devicesResponse.data.data)) {
                        deviceData = devicesResponse.data.data
                    } else if (devicesResponse.data && Array.isArray(devicesResponse.data)) {
                        deviceData = devicesResponse.data
                    } else if (devicesResponse.data?.list && Array.isArray(devicesResponse.data.list)) {
                        deviceData = devicesResponse.data.list
                    } else if (devicesResponse.data?.devices && Array.isArray(devicesResponse.data.devices)) {
                        deviceData = devicesResponse.data.devices
                    }
                    

                    setDevices(deviceData)
                } else {
                    console.error('❌ [ImportAccountsModal] Failed to load devices:', devicesResponse)
                    toast.push(
                        <Notification title="Lỗi" type="warning">
                            Không thể tải danh sách thiết bị: {devicesResponse.message || 'Lỗi không xác định'}
                        </Notification>
                    )
                }

                if (scenariosResponse.success) {
                    // Handle multiple possible data structures
                    let scenarioData = []
                    
                    if (scenariosResponse.data?.data && Array.isArray(scenariosResponse.data.data)) {
                        scenarioData = scenariosResponse.data.data
                    } else if (scenariosResponse.data && Array.isArray(scenariosResponse.data)) {
                        scenarioData = scenariosResponse.data
                    } else if (scenariosResponse.data?.list && Array.isArray(scenariosResponse.data.list)) {
                        scenarioData = scenariosResponse.data.list
                    } else if (scenariosResponse.data?.scenarios && Array.isArray(scenariosResponse.data.scenarios)) {
                        scenarioData = scenariosResponse.data.scenarios
                    }
                    

                    setScenarios(scenarioData)
                } else {
                    console.error('❌ [ImportAccountsModal] Failed to load scenarios:', scenariosResponse)
                    toast.push(
                        <Notification title="Lỗi" type="warning">
                            Không thể tải danh sách kịch bản: {scenariosResponse.message || 'Lỗi không xác định'}
                        </Notification>
                    )
                }
            } catch (error) {
                console.error('Error loading data:', error)
                toast.push(
                    <Notification title="Lỗi" type="danger">
                        Không thể tải dữ liệu thiết bị và kịch bản
                    </Notification>
                )
            } finally {
                setIsLoadingData(false)
            }
        }

        if (isOpen) {
            loadData()
        }
    }, [isOpen])
    
    // Form state
    const [formData, setFormData] = useState({
        accountList: '',
        enableRunningStatus: true,
        autoAssign: false,
        deviceId: '',
        scenarioId: '',
        format: 'new', // Default to new format: UID|PASS|2FA|MAIL
    })

    // Enhanced validation functions
    const validateAccountFormat = (line) => {
        const parts = line.split('|')
        const errors = []
        const format = formData.format || 'new'
        
        if (format === 'new') {
            // New format: UID|PASS|2FA|MAIL
            if (parts.length < 2) {
                errors.push('Định dạng không đúng. Cần: UID|PASS|2FA|MAIL (2FA và MAIL tùy chọn)')
                return { valid: false, errors, data: null }
            }
            
            const [uid, password, twoFa, email] = parts.map(p => p.trim())
            
            // Validate UID
            if (!uid || uid.length < 3) {
                errors.push('UID phải có ít nhất 3 ký tự')
            }
            if (!/^[a-zA-Z0-9._]+$/.test(uid)) {
                errors.push('UID chỉ được chứa chữ cái, số, dấu chấm và gạch dưới')
            }
            
            // Validate password
            if (!password || password.length < 6) {
                errors.push('Password phải có ít nhất 6 ký tự')
            }
            
            // Validate email if provided
            const finalEmail = email || `${uid}@tiktok.com`
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (email && !emailRegex.test(email)) {
                errors.push('Email không hợp lệ')
            }
            
            return {
                valid: errors.length === 0,
                errors,
                data: { 
                    username: uid, 
                    email: finalEmail, 
                    password, 
                    two_fa: twoFa || null,
                    phone_number: null 
                }
            }
        } else {
            // Legacy format: username|email|password|phone_number (phone_number optional)
            if (parts.length < 3 || parts.length > 4) {
                errors.push('Định dạng không đúng. Cần: username|email|password|phone_number (phone_number tùy chọn)')
                return { valid: false, errors, data: null }
            }
            
            const [username, email, password, phone_number] = parts.map(p => p.trim())
            
            // Validate username
            if (!username || username.length < 3) {
                errors.push('Username phải có ít nhất 3 ký tự')
            }
            if (!/^[a-zA-Z0-9._]+$/.test(username)) {
                errors.push('Username chỉ được chứa chữ cái, số, dấu chấm và gạch dưới')
            }
            
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!email || !emailRegex.test(email)) {
                errors.push('Email không hợp lệ')
            }
            
            // Validate password
            if (!password || password.length < 6) {
                errors.push('Mật khẩu phải có ít nhất 6 ký tự')
            }
            
            // Validate phone number (optional)
            if (phone_number) {
                const phoneRegex = /^[0-9+\-\s()]+$/
                if (!phoneRegex.test(phone_number)) {
                    errors.push('Số điện thoại không hợp lệ')
                }
            }
            
            return {
                valid: errors.length === 0,
                errors,
                data: { username, email, password, phone_number: phone_number || null, two_fa: null }
            }
        }
    }
    
    const validateAccountList = async (accountList) => {
        setIsValidating(true)
        const lines = accountList.split('\n').filter(line => line.trim() !== '')
        const results = {
            valid: [],
            invalid: [],
            duplicates: [],
            errors: []
        }
        
        const seenUsernames = new Set()
        const seenEmails = new Set()
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue
            
            const validation = validateAccountFormat(line)
            const lineNumber = i + 1
            
            if (!validation.valid) {
                results.invalid.push({
                    line: lineNumber,
                    content: line,
                    errors: validation.errors
                })
                continue
            }
            
            const { username, email } = validation.data
            
            // Check for duplicates
            const duplicateErrors = []
            if (seenUsernames.has(username)) {
                duplicateErrors.push(`Username "${username}" đã tồn tại trong danh sách`)
            }
            if (seenEmails.has(email)) {
                duplicateErrors.push(`Email "${email}" đã tồn tại trong danh sách`)
            }
            
            if (duplicateErrors.length > 0) {
                results.duplicates.push({
                    line: lineNumber,
                    content: line,
                    errors: duplicateErrors,
                    data: validation.data
                })
            } else {
                results.valid.push({
                    line: lineNumber,
                    content: line,
                    data: validation.data
                })
                seenUsernames.add(username)
                seenEmails.add(email)
            }
        }
        
        setValidationResults(results)
        setIsValidating(false)
        return results
    }

    // Đếm số tài khoản khi người dùng nhập
    const handleAccountListChange = async (value) => {
        const lines = value.split('\n').filter(line => line.trim() !== '')
        setAccountCount(lines.length)
        setFormData(prev => ({ ...prev, accountList: value }))
        
        // Auto-validate if there's content
        if (value.trim()) {
            await validateAccountList(value)
            setShowValidation(true)
        } else {
            setShowValidation(false)
            setValidationResults({ valid: [], invalid: [], duplicates: [], errors: [] })
        }
    }

    const handleInputChange = (field, value) => {
        // Convert deviceId và scenarioId thành string
        if (field === 'deviceId' || field === 'scenarioId') {
            value = value ? String(value) : ''
        }
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleCheckboxChange = (field, checked) => {
        setFormData(prev => ({ ...prev, [field]: checked }))
    }

    const onSubmit = async () => {
        if (!formData.accountList.trim()) {
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    Danh sách tài khoản không được để trống
                </Notification>
            )
            return
        }

        // Validate before submitting
        const validation = await validateAccountList(formData.accountList)
        
        if (validation.invalid.length > 0 || validation.duplicates.length > 0) {
            toast.push(
                <Notification title="Lỗi validation" type="danger" closable>
                    Vui lòng sửa các lỗi trong danh sách tài khoản trước khi tiếp tục
                </Notification>
            )
            setShowValidation(true)
            return
        }
        
        if (validation.valid.length === 0) {
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    Không có tài khoản hợp lệ nào để import
                </Notification>
            )
            return
        }

        setIsSubmitting(true)
        try {
            const result = await importTiktokAccounts(formData)
            
            if (result.success) {
                toast.push(
                    <Notification title="Thành công" type="success" closable>
                        {result.message || `Đã import thành công ${validation.valid.length} tài khoản`}
                    </Notification>
                )
                
                handleClose()
                if (onSuccess) {
                    onSuccess()
                }
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger" closable>
                        {result.message}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Error submitting import form:', error)
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
                    Có lỗi xảy ra khi nhập tài khoản
                </Notification>
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setFormData({
            accountList: '',
            enableRunningStatus: true,
            autoAssign: false,
            deviceId: '',
            scenarioId: '',
            format: 'new',
        })
        setAccountCount(0)
        setValidationResults({ valid: [], invalid: [], duplicates: [], errors: [] })
        setShowValidation(false)
        onClose()
    }

    const handleRedo = () => {
        setFormData({
            accountList: '',
            enableRunningStatus: true,
            autoAssign: false,
            deviceId: '',
            scenarioId: '',
            format: 'new',
        })
        setAccountCount(0)
        setValidationResults({ valid: [], invalid: [], duplicates: [], errors: [] })
        setShowValidation(false)
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            onRequestClose={handleClose}
            width={800}
            height="90vh"
            className="z-50"
        >
            <div className="flex flex-col h-full max-h-[90vh] relative">
                <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                    <h5 className="font-bold">{t('title')}</h5>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto min-h-0 relative">
                    <div className="space-y-6">
                        {/* Danh sách tài khoản */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="form-label">
                                    {t('accountListLabel', { count: accountCount })}
                                </label>
                                {isValidating && (
                                    <div className="flex items-center gap-2 text-sm text-blue-600">
                                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                        Đang kiểm tra...
                                    </div>
                                )}
                            </div>
                            <Input
                                textArea
                                placeholder={
                                    formData.format === 'new' 
                                        ? "user1|password123|ABCD1234|user1@example.com\nuser2|password456|EFGH5678|user2@example.com\nuser3|password789|IJKL9012"
                                        : "user1|user1@example.com|password123|0987654321\nuser2|user2@example.com|password456|0123456789"
                                }
                                rows={8}
                                value={formData.accountList}
                                onChange={(e) => handleAccountListChange(e.target.value)}
                                className={`${
                                    showValidation && validationResults.invalid.length > 0 
                                        ? 'border-red-300 focus:border-red-500' 
                                        : showValidation && validationResults.valid.length > 0
                                        ? 'border-green-300 focus:border-green-500'
                                        : ''
                                }`}
                            />
                            
                            {/* Validation Summary */}
                            {showValidation && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center gap-4 text-sm">
                                        {validationResults.valid.length > 0 && (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                                                <TbCircleCheck className="w-3 h-3" />
                                                {validationResults.valid.length} hợp lệ
                                            </Badge>
                                        )}
                                        {validationResults.invalid.length > 0 && (
                                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                                                <TbAlertCircle className="w-3 h-3" />
                                                {validationResults.invalid.length} lỗi
                                            </Badge>
                                        )}
                                        {validationResults.duplicates.length > 0 && (
                                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 flex items-center gap-1">
                                                <TbAlertCircle className="w-3 h-3" />
                                                {validationResults.duplicates.length} trùng lặp
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Detailed Validation Results */}
                        {showValidation && (validationResults.invalid.length > 0 || validationResults.duplicates.length > 0) && (
                            <div className="space-y-3">
                                <h6 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <TbAlertCircle className="w-4 h-4 text-red-500" />
                                    Chi tiết lỗi
                                </h6>
                                
                                <div className="max-h-32 overflow-y-auto space-y-2 bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-200 dark:border-red-800">
                                    {/* Invalid entries */}
                                    {validationResults.invalid.map((item, index) => (
                                        <div key={`invalid-${index}`} className="text-sm">
                                            <div className="font-medium text-red-800 dark:text-red-400">
                                                Dòng {item.line}: {item.content}
                                            </div>
                                            <ul className="ml-4 text-red-600 dark:text-red-300 text-xs">
                                                {item.errors.map((error, errorIndex) => (
                                                    <li key={errorIndex}>• {error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                    
                                    {/* Duplicate entries */}
                                    {validationResults.duplicates.map((item, index) => (
                                        <div key={`duplicate-${index}`} className="text-sm">
                                            <div className="font-medium text-yellow-800 dark:text-yellow-400">
                                                Dòng {item.line}: {item.content}
                                            </div>
                                            <ul className="ml-4 text-yellow-600 dark:text-yellow-300 text-xs">
                                                {item.errors.map((error, errorIndex) => (
                                                    <li key={errorIndex}>• {error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Format Selection */}
                        <div>
                            <label className="form-label">Chọn định dạng nhập</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div 
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                        formData.format === 'new' 
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`}
                                    onClick={() => handleInputChange('format', 'new')}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <input 
                                            type="radio" 
                                            checked={formData.format === 'new'} 
                                            onChange={() => handleInputChange('format', 'new')}
                                            className="text-blue-600"
                                        />
                                        <span className="font-medium">Định dạng mới (Khuyến nghị)</span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs mb-2">
                                            UID|PASS|2FA|MAIL
                                        </div>
                                        <div className="space-y-1">
                                            <div>• UID: Tên tài khoản TikTok</div>
                                            <div>• PASS: Mật khẩu</div>
                                            <div>• 2FA: Mã xác thực 2 bước (tùy chọn)</div>
                                            <div>• MAIL: Email (tùy chọn, tự động tạo nếu không có)</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div 
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                        formData.format === 'legacy' 
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`}
                                    onClick={() => handleInputChange('format', 'legacy')}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <input 
                                            type="radio" 
                                            checked={formData.format === 'legacy'} 
                                            onChange={() => handleInputChange('format', 'legacy')}
                                            className="text-blue-600"
                                        />
                                        <span className="font-medium">Định dạng cũ</span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs mb-2">
                                            username|email|password|phone
                                        </div>
                                        <div className="space-y-1">
                                            <div>• Username: Tên người dùng</div>
                                            <div>• Email: Địa chỉ email</div>
                                            <div>• Password: Mật khẩu</div>
                                            <div>• Phone: Số điện thoại (tùy chọn)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Checkbox
                                    checked={formData.enableRunningStatus}
                                    onChange={(checked) => handleCheckboxChange('enableRunningStatus', checked)}
                                >
                                    {t('enableRunningStatus')}
                                </Checkbox>
                            </div>
                            
                            <div>
                                <Checkbox
                                    checked={formData.autoAssign}
                                    onChange={(checked) => handleCheckboxChange('autoAssign', checked)}
                                >
                                    {t('autoAssign')}
                                </Checkbox>
                            </div>
                        </div>



                        {/* Dropdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="form-label">
                                        {t('selectDevice')} 
                                        {!isLoadingData && (
                                            <span className="text-xs text-gray-500 ml-2">
                                                ({devices.length} thiết bị)
                                            </span>
                                        )}
                                    </label>
                                    {devices.length === 0 && !isLoadingData && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsLoadingData(true)
                                                const loadData = async () => {
                                                    try {
                                                        const devicesResponse = await getDevices({ per_page: 1000, page: 1 })
                                                        if (devicesResponse.success) {
                                                            let deviceData = []
                                                            if (devicesResponse.data?.data && Array.isArray(devicesResponse.data.data)) {
                                                                deviceData = devicesResponse.data.data
                                                            } else if (devicesResponse.data && Array.isArray(devicesResponse.data)) {
                                                                deviceData = devicesResponse.data
                                                            }
                                                            setDevices(deviceData)
                                                        }
                                                    } catch (error) {
                                                        console.error('Error reloading devices:', error)
                                                    } finally {
                                                        setIsLoadingData(false)
                                                    }
                                                }
                                                loadData()
                                            }}
                                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                                        >
                                            Tải lại
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Select
                                        instanceId="import-accounts-device-select"
                                        placeholder={
                                            isLoadingData 
                                                ? "Đang tải..." 
                                                : devices.length === 0 
                                                    ? "Không có thiết bị nào"
                                                    : t('selectDevicePlaceholder')
                                        }
                                        value={formData.deviceId ? { value: formData.deviceId, label: (Array.isArray(devices) ? devices.find(d => d.id == formData.deviceId)?.device_name : '') || '' } : null}
                                        onChange={(option) => handleInputChange('deviceId', option?.value || '')}
                                        options={(Array.isArray(devices) ? devices : []).map(device => ({
                                            value: device.id,
                                            label: device.device_name
                                        }))}
                                        isDisabled={isLoadingData}
                                        menuIsOpen={deviceMenuOpen}
                                        onMenuOpen={() => setDeviceMenuOpen(true)}
                                        onMenuClose={() => setDeviceMenuOpen(false)}
                                        menuPortalTarget={menuPortalTarget}
                                        menuPosition="fixed"
                                        menuPlacement="auto"
                                        menuShouldBlockScroll={true}
                                        menuShouldScrollIntoView={true}
                                        styles={{
                                            menuPortal: (base) => ({
                                                ...base,
                                                zIndex: 9999
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                zIndex: 9999
                                            })
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="form-label">
                                        {t('selectScenario')}
                                        {!isLoadingData && (
                                            <span className="text-xs text-gray-500 ml-2">
                                                ({scenarios.length} kịch bản)
                                            </span>
                                        )}
                                    </label>
                                    {scenarios.length === 0 && !isLoadingData && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsLoadingData(true)
                                                const loadData = async () => {
                                                    try {
                                                        const scenariosResponse = await getInteractionScenarios({ per_page: 1000, page: 1 })
                                                        if (scenariosResponse.success) {
                                                            let scenarioData = []
                                                            if (scenariosResponse.data?.data && Array.isArray(scenariosResponse.data.data)) {
                                                                scenarioData = scenariosResponse.data.data
                                                            } else if (scenariosResponse.data && Array.isArray(scenariosResponse.data)) {
                                                                scenarioData = scenariosResponse.data
                                                            }
                                                            setScenarios(scenarioData)
                                                        }
                                                    } catch (error) {
                                                        console.error('Error reloading scenarios:', error)
                                                    } finally {
                                                        setIsLoadingData(false)
                                                    }
                                                }
                                                loadData()
                                            }}
                                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                                        >
                                            Tải lại
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Select
                                        instanceId="import-accounts-scenario-select"
                                        placeholder={
                                            isLoadingData 
                                                ? "Đang tải..." 
                                                : scenarios.length === 0 
                                                    ? "Không có kịch bản nào"
                                                    : t('selectScenarioPlaceholder')
                                        }
                                        value={formData.scenarioId ? { value: formData.scenarioId, label: (Array.isArray(scenarios) ? scenarios.find(s => s.id == formData.scenarioId)?.name : '') || '' } : null}
                                        onChange={(option) => handleInputChange('scenarioId', option?.value || '')}
                                        options={(Array.isArray(scenarios) ? scenarios : []).map(scenario => ({
                                            value: scenario.id,
                                            label: scenario.name
                                        }))}
                                        isDisabled={isLoadingData}
                                        menuIsOpen={scenarioMenuOpen}
                                        onMenuOpen={() => setScenarioMenuOpen(true)}
                                        onMenuClose={() => setScenarioMenuOpen(false)}
                                        menuPortalTarget={menuPortalTarget}
                                        menuPosition="fixed"
                                        menuPlacement="auto"
                                        menuShouldBlockScroll={true}
                                        menuShouldScrollIntoView={true}
                                        styles={{
                                            menuPortal: (base) => ({
                                                ...base,
                                                zIndex: 9999
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                zIndex: 9999
                                            })
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Always visible */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex-shrink-0 bg-white dark:bg-gray-800">
                    {/* Validation Status Bar */}
                    {showValidation && (
                        <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    {validationResults.valid.length > 0 && (
                                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                            <TbCircleCheck className="w-4 h-4" />
                                            <span className="text-sm font-medium">{validationResults.valid.length} tài khoản hợp lệ</span>
                                        </div>
                                    )}
                                    {(validationResults.invalid.length > 0 || validationResults.duplicates.length > 0) && (
                                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                            <TbAlertCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {validationResults.invalid.length + validationResults.duplicates.length} lỗi cần sửa
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {validationResults.valid.length > 0 && validationResults.invalid.length === 0 && validationResults.duplicates.length === 0 && (
                                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                        <TbCircleCheck className="w-4 h-4" />
                                        <span className="text-sm font-medium">Sẵn sàng import</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button
                            type="button"
                            variant="default"
                            onClick={handleRedo}
                            className="w-full sm:w-auto"
                        >
                            {t('redo')}
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            onClick={handleClose}
                            className="w-full sm:w-auto"
                        >
                            {t('exit')}
                        </Button>
                        <Button
                            type="button"
                            variant="solid"
                            loading={isSubmitting}
                            onClick={onSubmit}
                            disabled={
                                isSubmitting || 
                                !formData.accountList.trim() ||
                                (showValidation && (validationResults.invalid.length > 0 || validationResults.duplicates.length > 0)) ||
                                (showValidation && validationResults.valid.length === 0)
                            }
                            className="w-full sm:w-auto"
                        >
                            {isSubmitting ? t('saving') : t('save')}
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default ImportAccountsModal 