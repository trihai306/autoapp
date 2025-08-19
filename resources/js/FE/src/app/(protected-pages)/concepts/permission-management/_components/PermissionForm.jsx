'use client'
import { Form, FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import createPermission from '@/server/actions/user/createPermission'
import updatePermission from '@/server/actions/user/updatePermission'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TbArrowBack, TbTrash } from 'react-icons/tb'
import { useEffect } from 'react'
import AdaptableCard from '@/components/shared/AdaptiveCard'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useTranslations } from 'next-intl'

const validationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

const PermissionForm = ({ mode = 'add', permission, onClose }) => {
    const router = useRouter()
    const t = useTranslations('permissionManagement.form')
    
    console.log('PermissionForm props:', { mode, permission, onClose })
    
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { name: '' },
        resolver: zodResolver(validationSchema),
    })

    useEffect(() => {
        console.log('PermissionForm useEffect - mode:', mode, 'permission:', permission)
        if (mode === 'edit' && permission) {
            console.log('Setting form data for edit:', permission.name)
            reset({ name: permission.name })
        } else {
            console.log('Setting form data for add or no permission')
            reset({ name: '' })
        }
    }, [mode, permission, reset])

    // Thêm useEffect riêng để theo dõi thay đổi của permission
    useEffect(() => {
        console.log('PermissionForm permission changed:', permission)
        if (permission && mode === 'edit') {
            console.log('Resetting form with permission data:', permission.name)
            reset({ name: permission.name })
        }
    }, [permission, mode, reset])

    // Thêm useEffect để theo dõi thay đổi của mode
    useEffect(() => {
        console.log('PermissionForm mode changed:', mode)
        if (mode === 'add') {
            console.log('Resetting form for add mode')
            reset({ name: '' })
        }
    }, [mode, reset])

    // Thêm useEffect để theo dõi thay đổi của isFormOpen
    useEffect(() => {
        console.log('PermissionForm isFormOpen changed, mode:', mode, 'permission:', permission)
        if (mode === 'edit' && permission) {
            console.log('Form opened for edit, setting data:', permission.name)
            reset({ name: permission.name })
        } else if (mode === 'add') {
            console.log('Form opened for add, clearing data')
            reset({ name: '' })
        }
    }, [mode, permission, reset])

    const onSubmit = async (values) => {
        try {
            let result
            if (mode === 'add') {
                result = await createPermission(values)
            } else {
                result = await updatePermission(permission.id, values)
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
                <h5 className="mb-4">{mode === 'add' ? t('createTitle') : t('editTitle')}</h5>
                <FormItem label={t('nameLabel')} invalid={Boolean(errors.name)} errorMessage={errors.name?.message}>
                    <Controller name="name" control={control} render={({ field }) => <Input placeholder={t('namePlaceholder')} {...field} />} />
                </FormItem>
                <div className="text-right mt-4">
                    <Button
                        type="button"
                        className="mr-2"
                        onClick={onClose}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        variant="solid"
                        type="submit"
                        loading={isSubmitting}
                    >
                        {isSubmitting ? t('saving') : t('save')}
                    </Button>
                </div>
            </FormContainer>
        </Form>
    )
}

export default PermissionForm
