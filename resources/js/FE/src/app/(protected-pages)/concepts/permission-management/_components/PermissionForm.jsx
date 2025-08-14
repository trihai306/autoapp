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
        if (mode === 'edit' && permission) {
            reset({ name: permission.name })
        } else {
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
