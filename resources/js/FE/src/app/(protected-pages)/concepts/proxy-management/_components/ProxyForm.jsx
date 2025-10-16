'use client'
import { Form, FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select, { Option } from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import createProxy from '@/server/actions/proxy/createProxy'
import updateProxy from '@/server/actions/proxy/updateProxy'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'

const validationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    host: z.string().min(1, 'Host is required'),
    port: z.number().min(1, 'Port must be at least 1').max(65535, 'Port must be at most 65535'),
    type: z.string().min(1, 'Type is required'),
    status: z.string().min(1, 'Status is required'),
});

const ProxyForm = ({ mode = 'add', proxy, onClose }) => {
    const router = useRouter()
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            name: '',
            host: '',
            port: 8080,
            username: '',
            password: '',
            type: 'http',
            status: 'active',
            country: '',
            city: '',
            notes: ''
        },
        resolver: zodResolver(validationSchema),
    })

    useEffect(() => {
        if (mode === 'edit' && proxy) {
            reset({
                name: proxy.name,
                host: proxy.host,
                port: proxy.port,
                username: proxy.username || '',
                password: proxy.password || '',
                type: proxy.type,
                status: proxy.status,
                country: proxy.country || '',
                city: proxy.city || '',
                notes: proxy.notes || ''
            })
        } else {
            reset({
                name: '',
                host: '',
                port: 8080,
                username: '',
                password: '',
                type: 'http',
                status: 'active',
                country: '',
                city: '',
                notes: ''
            })
        }
    }, [mode, proxy, reset])

    const onSubmit = async (values) => {
        try {
            let result
            if (mode === 'add') {
                result = await createProxy(values)
            } else {
                result = await updateProxy(proxy.id, values)
            }
            if (result.success) {
                toast.push(
                    <Notification title="Thành công" type="success" closable>
                        {result.message}
                    </Notification>
                )
                onClose()
                router.refresh()
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger" closable>
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

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <FormContainer>
                <h5 className="mb-4">{mode === 'add' ? 'Tạo Proxy mới' : 'Chỉnh sửa Proxy'}</h5>

                <FormItem label={'Tên'} invalid={Boolean(errors.name)} errorMessage={errors.name?.message}>
                    <Controller name="name" control={control} render={({ field }) => <Input placeholder={'Nhập tên proxy'} {...field} />} />
                </FormItem>

                <div className="grid grid-cols-2 gap-4">
                    <FormItem label={'Host'} invalid={Boolean(errors.host)} errorMessage={errors.host?.message}>
                        <Controller name="host" control={control} render={({ field }) => <Input placeholder={'Nhập địa chỉ host'} {...field} />} />
                    </FormItem>
                    <FormItem label={'Port'} invalid={Boolean(errors.port)} errorMessage={errors.port?.message}>
                        <Controller
                            name="port"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="number"
                                    placeholder={'Nhập số port'}
                                    min="1"
                                    max="65535"
                                    step="1"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormItem label={'Tên đăng nhập'}>
                        <Controller name="username" control={control} render={({ field }) => <Input placeholder={'Nhập tên đăng nhập (tùy chọn)'} {...field} />} />
                    </FormItem>
                    <FormItem label={'Mật khẩu'}>
                        <Controller name="password" control={control} render={({ field }) => <Input placeholder={'Nhập mật khẩu (tùy chọn)'} {...field} />} />
                    </FormItem>
                </div>

                {/* Removed username & password to simplify form */}

                <div>
                    <FormItem label={'Loại'} invalid={Boolean(errors.type)} errorMessage={errors.type?.message}>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => {
                                const options = [
                                    { value: 'http', label: 'HTTP' },
                                    { value: 'https', label: 'HTTPS' },
                                    { value: 'socks4', label: 'SOCKS4' },
                                    { value: 'socks5', label: 'SOCKS5' },
                                ]
                                const selected = options.find(o => o.value === field.value) || null
                                return (
                                    <Select
                                        value={selected}
                                        onChange={(opt) => field.onChange(opt?.value)}
                                        options={options}
                                        placeholder={'Loại'}
                                    />
                                )
                            }}
                        />
                    </FormItem>
                </div>

                {/* Removed country, city, and notes to simplify form */}

                <div className="text-right mt-4">
                    <Button
                        type="button"
                        className="mr-2"
                        onClick={onClose}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="solid"
                        type="submit"
                        loading={isSubmitting}
                    >
                        {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                </div>
            </FormContainer>
        </Form>
    )
}

export default ProxyForm
