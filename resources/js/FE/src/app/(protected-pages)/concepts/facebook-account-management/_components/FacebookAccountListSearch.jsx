'use client'
import { useState } from 'react'
import Input from '@/components/ui/Input'
import { TbSearch, TbX } from 'react-icons/tb'

const FacebookAccountListSearch = ({ onInputChange }) => {
    const [searchValue, setSearchValue] = useState('')

    const handleInputChange = (e) => {
        const value = e.target.value
        setSearchValue(value)
        onInputChange(value)
    }

    const handleClear = () => {
        setSearchValue('')
        onInputChange('')
    }

    return (
        <div className="relative">
            <Input
                placeholder="Tìm kiếm theo username, email..."
                value={searchValue}
                onChange={handleInputChange}
                prefix={<TbSearch className="w-4 h-4 text-gray-400" />}
                suffix={
                    searchValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <TbX className="w-4 h-4" />
                        </button>
                    )
                }
            />
        </div>
    )
}

export default FacebookAccountListSearch
