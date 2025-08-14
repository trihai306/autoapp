'use client'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Upload from '@/components/ui/Upload'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import { Form, FormItem } from '@/components/ui/Form'
import getProfile from '@/server/actions/auth/getProfile'
import updateProfile from '@/server/actions/auth/updateProfile'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { HiOutlineUser } from 'react-icons/hi'
import { TbPlus } from 'react-icons/tb'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { useTranslations } from 'next-intl'

const validationSchema = z.object({
    first_name: z.string().min(1, { message: 'First name required' }),
    last_name: z.string().min(1, { message: 'Last name required' }),
    email: z
        .string()
        .min(1, { message: 'Email required' })
        .email({ message: 'Invalid email' }),
    phone_number: z
        .string()
        .min(1, { message: 'Please input your mobile number' }),
    avatar: z.string(),
})

const SettingsProfile = ({ data }) => {
    const t = useTranslations('account.settings.profile')

    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        control,
    } = useForm({
        resolver: zodResolver(validationSchema),
        defaultValues: data,
    })

    useEffect(() => {
        if (data) {
            reset(data)
        }
    }, [data, reset])

    const beforeUpload = (files) => {
        let valid = true
        const allowedFileType = ['image/jpeg', 'image/png']
        if (files) {
            const fileArray = Array.from(files)
            for (const file of fileArray) {
                if (!allowedFileType.includes(file.type)) {
                    valid = 'Please upload a .jpeg or .png file!'
                }
            }
        }
        return valid
    }

    const onSubmit = async (values) => {
        const result = await updateProfile(values);
        if (result.success) {
            // Handle success (e.g., show a toast notification)
            // console.log('Profile updated successfully');
        } else {
            // Handle error
            console.error('Failed to update profile:', result.message);
        }
    }
    
    if (!data) {
        return <div>Loading...</div>
    }

    return (
        <>
            <h4 className="mb-8">{t('title')}</h4>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-8">
                    <Controller
                        name="avatar"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center gap-4">
                                <Avatar
                                    size={90}
                                    className="border-4 border-white bg-gray-100 text-gray-300 shadow-lg"
                                    icon={<HiOutlineUser />}
                                    src={field.value}
                                />
                                <div className="flex items-center gap-2">
                                    <Upload
                                        showList={false}
                                        uploadLimit={1}
                                        beforeUpload={beforeUpload}
                                        onChange={(files) => {
                                            if (files.length > 0) {
                                                field.onChange(
                                                    URL.createObjectURL(files[0]),
                                                )
                                            }
                                        }}
                                    >
                                        <Button
                                            variant="solid"
                                            size="sm"
                                            type="button"
                                            icon={<TbPlus />}
                                        >
                                            {t('uploadImage')}
                                        </Button>
                                    </Upload>
                                    <Button
                                        size="sm"
                                        type="button"
                                        onClick={() => {
                                            field.onChange('')
                                        }}
                                    >
                                        {t('remove')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormItem
                        label={t('firstName')}
                        invalid={Boolean(errors.first_name)}
                        errorMessage={errors.first_name?.message}
                    >
                        <Controller
                            name="first_name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder={t('firstName')}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label={t('lastName')}
                        invalid={Boolean(errors.last_name)}
                        errorMessage={errors.last_name?.message}
                    >
                        <Controller
                            name="last_name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder={t('lastName')}
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
                                autoComplete="off"
                                placeholder={t('email')}
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
                                autoComplete="off"
                                placeholder={t('phoneNumber')}
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <div className="flex justify-end">
                    <Button
                        variant="solid"
                        type="submit"
                        loading={isSubmitting}
                    >
                        {t('save')}
                    </Button>
                </div>
            </Form>
        </>
    )
}

export default SettingsProfile
