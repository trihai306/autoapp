'use client'
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'

const ProxyListSearch = (props) => {
    const { onInputChange } = props

    return (
        <DebouceInput
            placeholder={'Tìm kiếm nhanh...'}
            suffix={<TbSearch className="text-lg" />}
            onChange={(e) => onInputChange(e.target.value)}
        />
    )
}

export default ProxyListSearch
