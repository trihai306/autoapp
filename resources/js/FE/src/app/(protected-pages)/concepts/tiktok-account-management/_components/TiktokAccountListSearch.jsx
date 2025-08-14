'use client'
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import { useTranslations } from 'next-intl'

const TiktokAccountListSearch = (props) => {
    const { onInputChange, ref } = props
    const t = useTranslations('tiktokAccountManagement')

    return (
        <DebouceInput
            ref={ref}
            placeholder={t('searchPlaceholder')}
            suffix={<TbSearch className="text-lg" />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default TiktokAccountListSearch 