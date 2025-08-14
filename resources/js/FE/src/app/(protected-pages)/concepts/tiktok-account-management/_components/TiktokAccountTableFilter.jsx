'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Input from '@/components/ui/Input'
import { Form, FormItem } from '@/components/ui/Form'
import { useTiktokAccountListStore } from '../_store/tiktokAccountListStore'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'

const validationSchema = z.object({
    username: z.string().optional(),
    email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
    phone_number: z.string().optional(),
    status: z.string().optional(),
})

const DrawerFooter = ({ onCancel, onSaveClick }) => {
    const t = useTranslations('tiktokAccountManagement.filterForm')
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

const TiktokAccountTableFilter = () => {
    const [isOpen, setIsOpen] = useState(false)
    const t = useTranslations('tiktokAccountManagement')
    const tForm = useTranslations('tiktokAccountManagement.filterForm')

    const filterData = useTiktokAccountListStore((state) => state.filterData)
    const setFilterData = useTiktokAccountListStore((state) => state.setFilterData)

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
        // Chỉ gửi các field có giá trị
        const filterParams = {}
        if (values.username) filterParams['filter[username]'] = values.username
        if (values.email) filterParams['filter[email]'] = values.email
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
                    <FormItem label={tForm('username')}>
                        <Controller
                            name="username"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    placeholder={tForm('username')}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
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
                                <Input
                                    placeholder={tForm('status')}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </Form>
            </Drawer>
        </>
    )
}

export default TiktokAccountTableFilter 