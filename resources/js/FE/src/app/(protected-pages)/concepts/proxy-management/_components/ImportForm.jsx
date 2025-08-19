'use client'
import { Form, FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import importProxies from '@/server/actions/proxy/importProxies'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'

const validationSchema = z.object({
    proxyList: z.string().min(1, 'Proxy list is required'),
});

const ImportForm = ({ onClose }) => {
    const router = useRouter()
    const t = useTranslations('proxy-management')
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { 
            proxyList: ''
        },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (values) => {
        try {
            const proxyList = values.proxyList.split('\n').filter(line => line.trim()).map(line => {
                const parts = line.split(':')
                return {
                    host: parts[0]?.trim(),
                    port: parseInt(parts[1]?.trim()) || 8080,
                    username: parts[2]?.trim() || null,
                    password: parts[3]?.trim() || null,
                    type: 'http',
                    status: 'active',
                }
            })

            const result = await importProxies({ proxies: proxyList })
            if (result.success) {
                toast.push(
                    <Notification title="Success" type="success" closable>
                        {t('import.success', { count: result.data?.length || 0 })}
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
                        {t('import.error')}
                    </Notification>
                )
        }
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <FormContainer>
                <h5 className="mb-4">{t('import.title')}</h5>
                
                <FormItem 
                    label={t('import.title')} 
                    invalid={Boolean(errors.proxyList)} 
                    errorMessage={errors.proxyList?.message}
                    extra={t('import.description')}
                >
                    <Controller 
                        name="proxyList" 
                        control={control} 
                        render={({ field }) => (
                            <Input.TextArea 
                                rows={10} 
                                placeholder={t('import.placeholder')} 
                                {...field} 
                            />
                        )} 
                    />
                </FormItem>

                <div className="text-right mt-4">
                    <Button
                        type="button"
                        className="mr-2"
                        onClick={onClose}
                    >
                        {t('import.cancel')}
                    </Button>
                    <Button
                        variant="solid"
                        type="submit"
                        loading={isSubmitting}
                    >
                        {isSubmitting ? t('import.importing') : t('import.import')}
                    </Button>
                </div>
            </FormContainer>
        </Form>
    )
}

export default ImportForm
