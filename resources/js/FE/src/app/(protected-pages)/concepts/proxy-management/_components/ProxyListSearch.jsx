'use client'
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import { useTranslations } from 'next-intl'

const ProxyListSearch = (props) => {
    const { onInputChange } = props
    const t = useTranslations('proxy-management')

    return (
        <DebouceInput
            placeholder={t('quickSearch')}
            suffix={<TbSearch className="text-lg" />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default ProxyListSearch
