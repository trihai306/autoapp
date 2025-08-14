'use client'
import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { Form, FormItem } from '@/components/ui/Form'
import { useAccountTaskListStore } from '../_store/accountTaskListStore'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Select } from '@/components/ui'
import debounce from 'lodash/debounce'
import { useTranslations } from 'next-intl'
import getTiktokAccounts from '@/server/actions/ai/getTiktokAccounts'

const validationSchema = z.object({
    task_type: z.string().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    tiktok_account_id: z.string().optional(),
})

const DrawerFooter = ({ onCancel, onSaveClick }) => {
    const t = useTranslations('accountTaskManagement.filterForm')
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


const AccountTaskTableFilter = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [accountData, setAccountData] = useState([])
    const [accountLoading, setAccountLoading] = useState(false)
    const t = useTranslations('accountTaskManagement')
    const tForm = useTranslations('accountTaskManagement.filterForm')
    const tStatus = useTranslations('enums.status')
    const tPriority = useTranslations('enums.priority')

    const statusOptions = [
        { value: 'pending', label: tStatus('pending') },
        { value: 'running', label: tStatus('running') },
        { value: 'completed', label: tStatus('completed') },
        { value: 'failed', label: tStatus('failed') },
    ]
    
    const priorityOptions = [
        { value: 'low', label: tPriority('low') },
        { value: 'medium', label: tPriority('medium') },
        { value: 'high', label: tPriority('high') },
    ]

    const taskTypeOptions = [
        { value: 'follow', label: 'Follow' },
        { value: 'unfollow', label: 'Unfollow' },
        { value: 'like', label: 'Like' },
        { value: 'comment', label: 'Comment' },
        { value: 'share', label: 'Share' },
        { value: 'view', label: 'View' },
    ]

    const filterData = useAccountTaskListStore((state) => state.filterData)
    const setFilterData = useAccountTaskListStore((state) => state.setFilterData)

    const { onAppendQueryParams } = useAppendQueryParams()

    const openDrawer = () => setIsOpen(true)
    const onDrawerClose = () => setIsOpen(false)

    const { handleSubmit, control, reset } = useForm({
        defaultValues: filterData,
        resolver: zodResolver(validationSchema),
    })

    useEffect(() => {
        if (isOpen) {
            reset(filterData)
        }
    }, [isOpen, filterData, reset])

    const onSubmit = (values) => {
        const filterParams = {}
        if (values.task_type) filterParams['filter[task_type]'] = values.task_type
        if (values.status) filterParams['filter[status]'] = values.status
        if (values.priority) filterParams['filter[priority]'] = values.priority
        if (values.tiktok_account_id) filterParams['filter[tiktok_account_id]'] = values.tiktok_account_id
        
        onAppendQueryParams(filterParams)
        setFilterData(values)
        onDrawerClose()
    }

    const fetchTiktokAccounts = async (search) => {
        setAccountLoading(true)
        const result = await getTiktokAccounts({ search })
        if (result.success && result.data) {
            const options = result.data.data.map((acc) => ({
                value: acc.id.toString(),
                label: acc.nickname,
            }))
            setAccountData(options)
        }
        setAccountLoading(false)
    }

    const debouncedFetchAccounts = debounce(fetchTiktokAccounts, 500)

    return (
        <>
            <Button icon={<TbFilter />} onClick={openDrawer}>
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
                    <FormItem label={tForm('taskType')}>
                        <Controller
                            name="task_type"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder={tForm('selectTaskType')}
                                    options={taskTypeOptions}
                                    isClearable
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
                                    placeholder={tForm('selectStatus')}
                                    options={statusOptions}
                                    isClearable
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label={tForm('priority')}>
                        <Controller
                            name="priority"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder={tForm('selectPriority')}
                                    options={priorityOptions}
                                    isClearable
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label={tForm('tiktokAccount')}>
                        <Controller
                            name="tiktok_account_id"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder={tForm('searchAccount')}
                                    isClearable
                                    isLoading={accountLoading}
                                    options={accountData}
                                    onInputChange={debouncedFetchAccounts}
                                    {...field}
                                    value={accountData.find(
                                        (option) => option.value === field.value,
                                    )}
                                    onChange={(option) =>
                                        field.onChange(option ? option.value : '')
                                    }
                                />
                            )}
                        />
                    </FormItem>
                </Form>
            </Drawer>
        </>
    )
}

export default AccountTaskTableFilter
