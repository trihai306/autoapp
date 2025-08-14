'use client'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { Form, FormItem } from '@/components/ui/Form'
import { useTransactionListStore } from '../_store/transactionListStore'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Select } from '@/components/ui'
import getUsers from '@/server/actions/user/getUsers'
import debounce from 'lodash/debounce'
import { useTranslations } from 'next-intl'

const validationSchema = z.object({
    type: z.string().optional(),
    user_id: z.string().optional(),
    status: z.string().optional(),
})

const DrawerFooter = ({ onCancel, onSaveClick }) => {
    const t = useTranslations('transactionManagement.filterForm')
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

const transactionTypeOptions = [
    { value: 'deposit', label: 'Deposit' },
    { value: 'withdrawal', label: 'Withdrawal' },
]

const transactionStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
]

const UserTableFilter = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [userData, setUserData] = useState([])
    const [userLoading, setUserLoading] = useState(false)
    const t = useTranslations('transactionManagement')
    const tForm = useTranslations('transactionManagement.filterForm')

    const filterData = useTransactionListStore((state) => state.filterData)
    const setFilterData = useTransactionListStore((state) => state.setFilterData)

    const { onAppendQueryParams } = useAppendQueryParams()

    const openDrawer = () => {
        setIsOpen(true)
    }

    const onDrawerClose = () => {
        setIsOpen(false)
    }

    const { handleSubmit, control, reset } = useForm({
        defaultValues: filterData,
        resolver: zodResolver(validationSchema),
    })

    useEffect(() => {
        if(isOpen) {
            reset(filterData)
        }
    }, [isOpen, filterData, reset])

    const onSubmit = (values) => {
        const filterParams = {}
        if (values.type) filterParams['filter[type]'] = values.type
        if (values.user_id) filterParams['filter[user_id]'] = values.user_id
        if (values.status) filterParams['filter[status]'] = values.status
        
        onAppendQueryParams(filterParams)
        setFilterData(values)
        onDrawerClose()
    }

    const fetchUsers = async (search) => {
        setUserLoading(true);
        const res = await getUsers({ search });
        if (res.success) {
            const options = res.list.map(user => ({ value: user.id.toString(), label: `${user.full_name} (${user.email})` }))
            setUserData(options);
        }
        setUserLoading(false);
    };

    const debouncedFetchUsers = debounce(fetchUsers, 500);

    return (
        <>
            <Button icon={<TbFilter />} onClick={() => openDrawer()}>
                {t('filter')}
            </Button>
            <Drawer
                title={tForm('title')}
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
                    <FormItem label={tForm('transactionType')}>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder={tForm('selectType')}
                                    options={transactionTypeOptions}
                                    isClearable
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label={tForm('user')}>
                        <Controller
                            name="user_id"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder={tForm('searchUser')}
                                    isClearable
                                    isLoading={userLoading}
                                    options={userData}
                                    onInputChange={debouncedFetchUsers}
                                    {...field}
                                    value={userData.find(option => option.value === field.value)}
                                    onChange={(option) => field.onChange(option ? option.value : '')}
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
                                    placeholder={tForm('selectStatus')}
                                    options={transactionStatusOptions}
                                    isClearable
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

export default UserTableFilter
