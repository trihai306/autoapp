'use client'
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import { useTranslations } from 'next-intl'

const TransactionListSearch = (props) => {
    const { onInputChange, ref } = props
    const t = useTranslations('transactionManagement')

    return (
        <DebouceInput
            ref={ref}
            placeholder={t('quickSearch')}
            suffix={<TbSearch className="text-lg" />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default TransactionListSearch
