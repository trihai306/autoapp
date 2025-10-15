'use client'
import React, { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Form, FormItem } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import updateFacebookAccount from '@/server/actions/facebook-account/updateFacebookAccount'
import { useFacebookAccountData } from './FacebookAccountDataManager'
import getFacebookAccount from '@/server/actions/facebook-account/getFacebookAccount'

const validationSchema = z.object({
    username: z.string().min(1, 'Username là bắt buộc'),
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    phone_number: z.string().optional(),
    status: z.string().min(1, 'Trạng thái là bắt buộc'),
    connection_type: z.string().min(1, 'Loại kết nối là bắt buộc'),
    proxy_id: z.string().optional(),
    notes: z.string().optional(),
})

const FacebookAccountEditModal = ({ isOpen, onClose, account, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [accountData, setAccountData] = useState(null)
    const [loadingAccount, setLoadingAccount] = useState(false)
    const { getProxyOptions } = useFacebookAccountData()

    const { handleSubmit, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            username: account?.username || '',
            email: account?.email || '',
            phone_number: account?.phone_number || '',
            status: account?.status || 'active',
            connection_type: account?.connection_type || 'wifi',
            proxy_id: account?.proxy?.id ? String(account.proxy.id) : '',
            notes: account?.notes || '',
        }
    })

    // Load account data when modal opens
    useEffect(() => {
        if (isOpen && account?.id) {
            loadAccountData()
        }
    }, [isOpen, account?.id])

    const loadAccountData = async () => {
        if (!account?.id) return

        setLoadingAccount(true)
        try {
            const res = await getFacebookAccount(account.id)
            if (res.success) {
                setAccountData(res.data)
                // Reset form with fresh data
                reset({
                    username: res.data.username || '',
                    email: res.data.email || '',
                    phone_number: res.data.phone_number || '',
                    status: res.data.status || 'active',
                    connection_type: res.data.connection_type || 'wifi',
                    proxy_id: res.data.proxy?.id ? String(res.data.proxy.id) : '',
                    notes: res.data.notes || '',
                })
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger">
                        Không thể tải thông tin tài khoản
                    </Notification>
                )
            }
        } catch (error) {
            toast.push(
                <Notification title="Lỗi" type="danger">
                    {error.message || 'Không thể tải thông tin tài khoản'}
                </Notification>
            )
        } finally {
            setLoadingAccount(false)
        }
    }

    const proxyOptions = getProxyOptions()

    const onSubmit = async (data) => {
        if (!accountData) return

        setIsLoading(true)
        try {
            const result = await updateFacebookAccount(accountData.id, {
                username: data.username,
                email: data.email || null,
                phone_number: data.phone_number || null,
                status: data.status,
                connection_type: data.connection_type,
                proxy_id: data.proxy_id ? parseInt(data.proxy_id) : null,
                notes: data.notes || null,
            })

            if (result.success) {
                toast.push(
                    <Notification title="Thành công" type="success">
                        Đã cập nhật tài khoản {data.username}
                    </Notification>
                )
                onSuccess?.()
            } else {
                throw new Error(result.message || 'Cập nhật thất bại')
            }
        } catch (error) {
            toast.push(
                <Notification title="Lỗi" type="danger">
                    {error.message || 'Không thể cập nhật tài khoản'}
                </Notification>
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    if (!account || !accountData) return null

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} onRequestClose={handleClose} width={700}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Chỉnh sửa tài khoản Facebook
                    </h3>
                    <Button variant="outline" size="sm" onClick={handleClose}>
                        Đóng
                    </Button>
                </div>

                {loadingAccount ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin tài khoản...</p>
                        </div>
                    </div>
                ) : (
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem label="Username" required>
                                <Controller
                                    name="username"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            placeholder="Nhập username"
                                            {...field}
                                            error={errors.username?.message}
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem label="Email">
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            placeholder="Nhập email"
                                            {...field}
                                            error={errors.email?.message}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem label="Số điện thoại">
                                <Controller
                                    name="phone_number"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            placeholder="Nhập số điện thoại"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem label="Trạng thái" required>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            placeholder="Chọn trạng thái"
                                            options={[
                                                { value: 'active', label: 'Hoạt động' },
                                                { value: 'inactive', label: 'Tạm dừng' },
                                                { value: 'suspended', label: 'Đình chỉ' },
                                                { value: 'running', label: 'Đang chạy' },
                                                { value: 'error', label: 'Lỗi' }
                                            ]}
                                            value={field.value ? {
                                                value: field.value,
                                                label: field.value === 'active' ? 'Hoạt động' :
                                                       field.value === 'inactive' ? 'Tạm dừng' :
                                                       field.value === 'suspended' ? 'Đình chỉ' :
                                                       field.value === 'running' ? 'Đang chạy' :
                                                       field.value === 'error' ? 'Lỗi' : field.value
                                            } : null}
                                            onChange={(option) => field.onChange(option?.value || '')}
                                            error={errors.status?.message}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem label="Loại kết nối" required>
                                <Controller
                                    name="connection_type"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            placeholder="Chọn loại kết nối"
                                            options={[
                                                { value: 'wifi', label: 'WiFi' },
                                                { value: '4g', label: '4G' }
                                            ]}
                                            value={field.value ? {
                                                value: field.value,
                                                label: field.value === 'wifi' ? 'WiFi' : '4G'
                                            } : null}
                                            onChange={(option) => field.onChange(option?.value || '')}
                                            error={errors.connection_type?.message}
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem label="Proxy">
                                <Controller
                                    name="proxy_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            placeholder="Chọn proxy"
                                            options={proxyOptions}
                                            value={field.value ? {
                                                value: field.value,
                                                label: proxyOptions.find(p => p.value === field.value)?.label || 'Đang tải...'
                                            } : null}
                                            onChange={(option) => field.onChange(option?.value || '')}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>

                        <FormItem label="Ghi chú">
                            <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        textArea
                                        rows={3}
                                        placeholder="Nhập ghi chú"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="outline" onClick={handleClose}>
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            Cập nhật
                        </Button>
                    </div>
                </Form>
                )}
            </div>
        </Dialog>
    )
}

export default FacebookAccountEditModal
