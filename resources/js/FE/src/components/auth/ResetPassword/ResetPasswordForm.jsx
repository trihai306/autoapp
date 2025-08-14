'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'

const validationSchema = z
    .object({
        newPassword: z.string({ required_error: 'Please enter your password' }),
        confirmPassword: z.string({
            required_error: 'Confirm Password Required',
        }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Your passwords do not match',
        path: ['confirmPassword'],
    })

const ResetPasswordForm = (props) => {
    const [isSubmitting, setSubmitting] = useState(false)
    const t = useTranslations('resetPassword')

    const {
        className,
        setMessage,
        setResetComplete,
        resetComplete,
        onResetPasswordSubmit,
        children,
    } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm({
        resolver: zodResolver(validationSchema),
    })

    const handleResetPassword = async (values) => {
        if (onResetPasswordSubmit) {
            onResetPasswordSubmit({
                values,
                setSubmitting,
                setMessage,
                setResetComplete,
            })
        }
    }

    return (
        <div className={className}>
            {!resetComplete ? (
                <Form onSubmit={handleSubmit(handleResetPassword)}>
                    <FormItem
                        label={t('newPassword')}
                        invalid={Boolean(errors.newPassword)}
                        errorMessage={errors.newPassword?.message}
                    >
                        <Controller
                            name="newPassword"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    autoComplete="off"
                                    placeholder="••••••••••••"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label={t('confirmPassword')}
                        invalid={Boolean(errors.confirmPassword)}
                        errorMessage={errors.confirmPassword?.message}
                    >
                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    autoComplete="off"
                                    placeholder={t('confirmPassword')}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <Button
                        block
                        loading={isSubmitting}
                        variant="solid"
                        type="submit"
                    >
                        {isSubmitting ? t('submitting') : t('submit')}
                    </Button>
                </Form>
            ) : (
                <>{children}</>
            )}
        </div>
    )
}

export default ResetPasswordForm
