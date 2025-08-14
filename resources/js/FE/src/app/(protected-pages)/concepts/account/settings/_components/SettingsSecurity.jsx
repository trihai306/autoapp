'use client'
import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Form, FormItem } from '@/components/ui/Form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import changePassword from '@/server/actions/auth/changePassword'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useTranslations } from 'next-intl'

const validationSchema = z
    .object({
        current_password: z
            .string()
            .min(1, { message: 'Please enter your current password!' }),
        password: z
            .string()
            .min(1, { message: 'Please enter your new password!' }),
        password_confirmation: z
            .string()
            .min(1, { message: 'Please confirm your new password!' }),
    })
    .refine((data) => data.password_confirmation === data.password, {
        message: 'Password not match',
        path: ['password_confirmation'],
    })

const SettingsSecurity = () => {
    const t = useTranslations('account.settings.security')
    const { session } = useCurrentSession()
    const [confirmationOpen, setConfirmationOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const formRef = useRef(null)

    const {
        reset,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm({
        resolver: zodResolver(validationSchema),
    })

    const handlePostSubmit = async (values) => {
        setIsSubmitting(true)
        const result = await changePassword(values)
        if (result.success) {
            setConfirmationOpen(false)
            toast.push(
                <Notification type="success">
                    Password updated successfully!
                </Notification>,
            )
            reset()
        } else {
            toast.push(
                <Notification title="Error" type="danger">
                    {result.message}
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
        }
        setIsSubmitting(false)
    }

    const onSubmit = async (values) => {
        setConfirmationOpen(true)
    }

    return (
        <div>
            <div className="mb-8">
                <h4>{t('title')}</h4>
                <p>
                    {t('description')}
                </p>
            </div>
            <Form
                ref={formRef}
                className="mb-8"
                onSubmit={handleSubmit(handlePostSubmit)}
            >
                <FormItem
                    label={t('currentPassword')}
                    invalid={Boolean(errors.current_password)}
                    errorMessage={errors.current_password?.message}
                >
                    <Controller
                        name="current_password"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder="•••••••••"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label={t('newPassword')}
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder="•••••••••"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label={t('confirmNewPassword')}
                    invalid={Boolean(errors.password_confirmation)}
                    errorMessage={errors.password_confirmation?.message}
                >
                    <Controller
                        name="password_confirmation"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder="•••••••••"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <div className="flex justify-end">
                    <Button variant="solid" type="submit" loading={isSubmitting}>
                        {t('update')}
                    </Button>
                </div>
            </Form>
            <ConfirmDialog
                isOpen={confirmationOpen}
                type="warning"
                title={t('updatePassword')}
                confirmButtonProps={{
                    loading: isSubmitting,
                    onClick: handleSubmit(handlePostSubmit),
                }}
                onClose={() => setConfirmationOpen(false)}
                onRequestClose={() => setConfirmationOpen(false)}
                onCancel={() => setConfirmationOpen(false)}
            >
                <p>{t('updatePasswordConfirmation')}</p>
            </ConfirmDialog>
        </div>
    )
}

export default SettingsSecurity
