'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Tooltip from '@/components/ui/Tooltip'
import { Form, FormItem } from '@/components/ui/Form'
import { useDeviceListStore } from '../_store/deviceListStore'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'

const validationSchema = z.object({
    device_name: z.string().optional(),
    device_id: z.string().optional(),
    user_id: z.string().optional(),
    status: z.string().optional(),
    device_type: z.string().optional(),
    platform: z.string().optional(),
    is_online: z.string().optional(),
})

const DrawerFooter = ({ onCancel, onSaveClick, onClear }) => {
    const t = useTranslations('deviceManagement.filterForm')
    return (
        <div className="flex justify-between w-full">
            <Button size="sm" variant="outline" onClick={onClear}>
                {t('clear') || 'Xóa bộ lọc'}
            </Button>
            <div>
                <Button size="sm" className="mr-2" onClick={onCancel}>
                    {t('cancel') || 'Hủy'}
                </Button>
                <Button size="sm" variant="solid" onClick={onSaveClick}>
                    {t('apply') || 'Áp dụng'}
                </Button>
            </div>
        </div>
    )
}

const DeviceTableFilter = () => {
    const [isOpen, setIsOpen] = useState(false)
    const t = useTranslations('deviceManagement')
    const tForm = useTranslations('deviceManagement.filterForm')

    const filterData = useDeviceListStore((state) => state.filterData || {})
    const setFilterData = useDeviceListStore((state) => state.setFilterData)

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
        if (values.device_name) filterParams['filter[device_name]'] = values.device_name
        if (values.device_id) filterParams['filter[device_id]'] = values.device_id
        if (values.user_id) filterParams['filter[user_id]'] = values.user_id
        if (values.status) filterParams['filter[status]'] = values.status
        if (values.device_type) filterParams['filter[device_type]'] = values.device_type
        if (values.platform) filterParams['filter[platform]'] = values.platform
        if (values.is_online) filterParams['filter[is_online]'] = values.is_online

        onAppendQueryParams(filterParams)
        setFilterData(values)
        onDrawerClose()
    }

    const onClear = () => {
        reset({})
        onAppendQueryParams({
            'filter[device_name]': '',
            'filter[device_id]': '',
            'filter[user_id]': '',
            'filter[status]': '',
            'filter[device_type]': '',
            'filter[platform]': '',
            'filter[is_online]': '',
        })
        setFilterData({})
        onDrawerClose()
    }

    const statusOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Tạm dừng' },
        { value: 'blocked', label: 'Chặn' },
    ]

    const deviceTypeOptions = [
        { value: '', label: 'Tất cả loại thiết bị' },
        { value: 'mobile', label: 'Di động' },
        { value: 'desktop', label: 'Máy tính' },
        { value: 'tablet', label: 'Máy tính bảng' },
    ]

    const platformOptions = [
        { value: '', label: 'Tất cả nền tảng' },
        { value: 'android', label: 'Android' },
        { value: 'ios', label: 'iOS' },
        { value: 'windows', label: 'Windows' },
        { value: 'macos', label: 'macOS' },
        { value: 'linux', label: 'Linux' },
    ]

    const onlineOptions = [
        { value: '', label: 'Tất cả' },
        { value: '1', label: 'Online' },
        { value: '0', label: 'Offline' },
    ]

    return (
        <>
            <Tooltip title={t('filter') || 'Bộ lọc'}>
                <Button icon={<TbFilter />} onClick={() => openDrawer()} aria-label={t('filter') || 'Bộ lọc'} className="!px-2">
                </Button>
            </Tooltip>
            <Drawer
                title={t('filter') || 'Bộ lọc thiết bị'}
                isOpen={isOpen}
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
                footer={
                    <DrawerFooter
                        onCancel={onDrawerClose}
                        onSaveClick={handleSubmit(onSubmit)}
                        onClear={onClear}
                    />
                }
            >
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem label={tForm('deviceName') || 'Tên thiết bị'}>
                        <Controller
                            name="device_name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    placeholder="Nhập tên thiết bị..."
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    
                    <FormItem label={tForm('deviceId') || 'ID thiết bị'}>
                        <Controller
                            name="device_id"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    placeholder="Nhập ID thiết bị..."
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    
                    <FormItem label={tForm('userId') || 'ID người dùng'}>
                        <Controller
                            name="user_id"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    placeholder="Nhập ID người dùng..."
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    
                    <FormItem label={tForm('status') || 'Trạng thái'}>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder="Chọn trạng thái..."
                                    options={statusOptions}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    
                    <FormItem label={tForm('deviceType') || 'Loại thiết bị'}>
                        <Controller
                            name="device_type"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder="Chọn loại thiết bị..."
                                    options={deviceTypeOptions}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    
                    <FormItem label={tForm('platform') || 'Nền tảng'}>
                        <Controller
                            name="platform"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder="Chọn nền tảng..."
                                    options={platformOptions}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    
                    <FormItem label={tForm('onlineStatus') || 'Trạng thái online'}>
                        <Controller
                            name="is_online"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder="Chọn trạng thái online..."
                                    options={onlineOptions}
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

export default DeviceTableFilter
