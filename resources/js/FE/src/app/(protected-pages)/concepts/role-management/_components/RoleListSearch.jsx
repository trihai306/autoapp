'use client'
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import { useTranslations } from 'next-intl'

const RoleListSearch = (props) => {
    const { onInputChange } = props
    const t = useTranslations('roleManagement')

    return (
        <DebouceInput
            placeholder={t('searchPlaceholder')}
            suffix={<TbSearch className="text-lg" />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default RoleListSearch
