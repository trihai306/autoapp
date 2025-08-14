'use client'
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import { useTranslations } from 'next-intl'

const DeviceListSearch = (props) => {
    const { onInputChange, ref } = props
    const t = useTranslations('deviceManagement')

    return (
        <DebouceInput
            ref={ref}
            placeholder={t('searchPlaceholder') || 'Tìm kiếm thiết bị...'}
            suffix={<TbSearch className="text-lg" />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default DeviceListSearch
