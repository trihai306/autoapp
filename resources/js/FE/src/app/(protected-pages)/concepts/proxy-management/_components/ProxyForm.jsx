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
import { useTranslations } from 'next-intl'

const validationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    host: z.string().min(1, 'Host is required'),
    port: z.number().min(1, 'Port is required'),
    type: z.string().min(1, 'Type is required'),
    status: z.string().min(1, 'Status is required'),
});

const ProxyForm = ({ mode = 'add', proxy, onClose }) => {
    const router = useRouter()
    const t = useTranslations('proxy-management')
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

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <FormContainer>
                <h5 className="mb-4">{mode === 'add' ? t('form.createTitle') : t('form.editTitle')}</h5>
                
                <FormItem label={t('form.nameLabel')} invalid={Boolean(errors.name)} errorMessage={errors.name?.message}>
                    <Controller name="name" control={control} render={({ field }) => <Input placeholder={t('form.namePlaceholder')} {...field} />} />
                </FormItem>

                <div className="grid grid-cols-2 gap-4">
                    <FormItem label={t('form.hostLabel')} invalid={Boolean(errors.host)} errorMessage={errors.host?.message}>
                        <Controller name="host" control={control} render={({ field }) => <Input placeholder={t('form.hostPlaceholder')} {...field} />} />
                    </FormItem>
                    <FormItem label={t('form.portLabel')} invalid={Boolean(errors.port)} errorMessage={errors.port?.message}>
                        <Controller name="port" control={control} render={({ field }) => <Input type="number" placeholder={t('form.portPlaceholder')} {...field} />} />
                    </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormItem label={t('form.usernameLabel')}>
                        <Controller name="username" control={control} render={({ field }) => <Input placeholder={t('form.usernamePlaceholder')} {...field} />} />
                    </FormItem>
                    <FormItem label={t('form.passwordLabel')}>
                        <Controller name="password" control={control} render={({ field }) => <Input placeholder={t('form.passwordPlaceholder')} {...field} />} />
                    </FormItem>
                </div>

                {/* Removed username & password to simplify form */}

                <div>
                    <FormItem label={t('form.typeLabel')} invalid={Boolean(errors.type)} errorMessage={errors.type?.message}>
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
                                        placeholder={t('form.typeLabel')}
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
                        {t('form.cancel')}
                    </Button>
                    <Button
                        variant="solid"
                        type="submit"
                        loading={isSubmitting}
                    >
                        {isSubmitting ? t('form.saving') : t('form.save')}
                    </Button>
                </div>
            </FormContainer>
        </Form>
    )
}

export default ProxyForm
