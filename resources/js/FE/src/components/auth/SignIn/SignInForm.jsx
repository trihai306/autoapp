'use client'
import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import classNames from '@/utils/classNames'
import { useTranslations } from 'next-intl'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const validationSchema = z.object({
    login: z
        .string({ required_error: 'Please enter your email or phone number' })
        .min(1, { message: 'Please enter your email or phone number' }),
    password: z
        .string({ required_error: 'Please enter your password' })
        .min(1, { message: 'Please enter your password' }),
})

const SignInForm = (props) => {
    const [isSubmitting, setSubmitting] = useState(false)
    const t = useTranslations('signIn')

    const { className, setMessage, onSignIn, passwordHint } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm({
        defaultValues: {
            login: 'admin@example.com',
            password: 'password',
        },
        resolver: zodResolver(validationSchema),
    })

    const handleSignIn = async (values) => {
        if (onSignIn) {
            onSignIn({ values, setSubmitting, setMessage })
        }
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(handleSignIn)}>
                <FormItem
                    label={t('emailOrPhone')}
                    invalid={Boolean(errors.login)}
                    errorMessage={errors.login?.message}
                >
                    <Controller
                        name="login"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="text"
                                placeholder={t('emailOrPhone')}
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
                    className={classNames(
                        passwordHint ? 'mb-0' : '',
                        errors.password?.message ? 'mb-8' : '',
                    )}
                >
                    <Controller
                        name="password"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <PasswordInput
                                type="text"
                                placeholder={t('password')}
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                {passwordHint}
                <Button
                    block
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                >
                    {isSubmitting ? t('signingIn') : t('signIn')}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
