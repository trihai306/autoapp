'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import { useUserListStore } from '../_store/userListStore'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'

const validationSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone_number: z.string().optional(),
    status: z.string().optional(),
})

const DrawerFooter = ({ onCancel, onSaveClick }) => {
    const t = useTranslations('userManagement.filterForm')
    return (
        <div className="text-right w-full">
            <Button size="sm" className="mr-2" onClick={onCancel}>
                {t('cancel')}
            </Button>
            <Button size="sm" variant="solid" onClick={onSaveClick}>
                {t('apply')}
            </Button>
        </div>
    )
}

const UserTableFilter = () => {
    const [isOpen, setIsOpen] = useState(false)
    const t = useTranslations('userManagement')
    const tForm = useTranslations('userManagement.filterForm')

    const filterData = useUserListStore((state) => state.filterData)
    const setFilterData = useUserListStore((state) => state.setFilterData)

    const { onAppendQueryParams } = useAppendQueryParams()

    const openDrawer = () => {
        setIsOpen(true)
    }

    const onDrawerClose = () => {
        setIsOpen(false)
    }

    const { handleSubmit, reset, control } = useForm({
        defaultValues: filterData,
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = (values) => {
        const filterParams = {}
        if (values.email) filterParams['filter[email]'] = values.email
        if (values.first_name) filterParams['filter[first_name]'] = values.first_name
        if (values.last_name) filterParams['filter[last_name]'] = values.last_name
        if (values.phone_number) filterParams['filter[phone_number]'] = values.phone_number
        if (values.status) filterParams['filter[status]'] = values.status
        
        onAppendQueryParams(filterParams)
        setFilterData(values)
        onDrawerClose()
    }

    return (
        <>
            <Button icon={<TbFilter />} onClick={() => openDrawer()}>
                {t('filter')}
            </Button>
            <Drawer
                title={t('filter')}
                isOpen={isOpen}
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
                footer={
                    <DrawerFooter
                        onCancel={onDrawerClose}
                        onSaveClick={handleSubmit(onSubmit)}
                    />
                }
            >
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem label={tForm('email')}>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    placeholder={tForm('email')}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label={tForm('firstName')}>
                        <Controller
                            name="first_name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    placeholder={tForm('firstName')}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label={tForm('lastName')}>
                        <Controller
                            name="last_name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    placeholder={tForm('lastName')}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label={tForm('phoneNumber')}>
                        <Controller
                            name="phone_number"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    placeholder={tForm('phoneNumber')}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label={tForm('status')}>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder={tForm('status')}
                                    {...field}
                                >
                                    <Select.Option value="">{tForm('allStatus')}</Select.Option>
                                    <Select.Option value="active">{tForm('active')}</Select.Option>
                                    <Select.Option value="locked">{tForm('locked')}</Select.Option>
                                </Select>
                            )}
                        />
                    </FormItem>
                </Form>
            </Drawer>
        </>
    )
}

export default UserTableFilter
