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

const validationSchema = z.object({
    proxyList: z.string().min(1, 'Proxy list is required'),
});

const ImportForm = ({ onClose }) => {
    const router = useRouter()
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
                    <Notification title="Thành công" type="success" closable>
                        {`Import thành công ${result.data?.length || 0} proxy`}
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
                    <Notification title="Lỗi" type="danger" closable>
                        Lỗi khi import
                    </Notification>
                )
        }
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <FormContainer>
                <h5 className="mb-4">Import Proxy</h5>

                <FormItem
                    label="Import Proxy"
                    invalid={Boolean(errors.proxyList)}
                    errorMessage={errors.proxyList?.message}
                    extra="Nhập danh sách proxy theo định dạng: host:port:username:password (mỗi proxy một dòng)"
                >
                    <Controller
                        name="proxyList"
                        control={control}
                        render={({ field }) => (
                            <Input
                                textArea
                                rows={10}
                                placeholder={"192.168.1.1:8080:user:pass\n192.168.1.2:8080\n192.168.1.3:8080:user2:pass2"}
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
                        Hủy
                    </Button>
                    <Button
                        variant="solid"
                        type="submit"
                        loading={isSubmitting}
                    >
                        {isSubmitting ? 'Đang import...' : 'Import'}
                    </Button>
                </div>
            </FormContainer>
        </Form>
    )
}

export default ImportForm
