'use client'
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import { useTranslations } from 'next-intl'

const PermissionListSearch = (props) => {
    const { onInputChange } = props
    const t = useTranslations('permissionManagement')

    return (
        <DebouceInput
            placeholder={t('searchPlaceholder')}
            suffix={<TbSearch className="text-lg" />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default PermissionListSearch
