'use client'
import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'

const validationSchema = z
    .object({
        first_name: z.string({ required_error: 'Please enter your first name' }),
        last_name: z.string({ required_error: 'Please enter your last name' }),
        email: z
            .string({ required_error: 'Please enter your email' })
            .email('Invalid email format'),
        phone_number: z.string({
            required_error: 'Please enter your phone number',
        }),
        password: z
            .string({ required_error: 'Password Required' })
            .min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string({
            required_error: 'Confirm Password Required',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Password not match',
        path: ['confirmPassword'],
    })

const SignUpForm = (props) => {
    const { onSignUp, className, setMessage } = props
    const t = useTranslations('signUp')

    const [isSubmitting, setSubmitting] = useState(false)

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm({
        resolver: zodResolver(validationSchema),
    })

    const handleSignUp = async (values) => {
        if (onSignUp) {
            onSignUp({ values, setSubmitting, setMessage })
        }
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(handleSignUp)}>
                <div className="flex gap-4">
                    <FormItem
                        label={t('firstName')}
                        invalid={Boolean(errors.first_name)}
                        errorMessage={errors.first_name?.message}
                        className="w-1/2"
                    >
                        <Controller
                            name="first_name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder={t('firstName')}
                                    autoComplete="off"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label={t('lastName')}
                        invalid={Boolean(errors.last_name)}
                        errorMessage={errors.last_name?.message}
                        className="w-1/2"
                    >
                        <Controller
                            name="last_name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder={t('lastName')}
                                    autoComplete="off"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </div>
                <FormItem
                    label={t('email')}
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                placeholder={t('email')}
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label={t('phoneNumber')}
                    invalid={Boolean(errors.phone_number)}
                    errorMessage={errors.phone_number?.message}
                >
                    <Controller
                        name="phone_number"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                placeholder={t('phoneNumber')}
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem
                    label={t('password')}
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
                                placeholder={t('password')}
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
                            <Input
                                type="password"
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
                    {isSubmitting ? t('creatingAccount') : t('signUp')}
                </Button>
            </Form>
        </div>
    )
}

export default SignUpForm
