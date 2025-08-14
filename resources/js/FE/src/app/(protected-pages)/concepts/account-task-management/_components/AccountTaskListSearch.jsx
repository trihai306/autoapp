'use client'
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import { useTranslations } from 'next-intl'

const AccountTaskListSearch = (props) => {
    const { onInputChange, ref } = props
    const t = useTranslations('accountTaskManagement')

    return (
        <DebouceInput
            ref={ref}
            placeholder={t('quickSearch')}
            suffix={<TbSearch className="text-lg" />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default AccountTaskListSearch
