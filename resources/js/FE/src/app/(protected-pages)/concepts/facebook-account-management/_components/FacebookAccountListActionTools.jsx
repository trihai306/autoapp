'use client'
import React, { useState } from 'react'
import Button from '@/components/ui/Button'
import { TbUpload, TbRefresh } from 'react-icons/tb'
import FacebookImportAccountsModal from './FacebookImportAccountsModal'
import FacebookAccountTableFilter from './FacebookAccountTableFilter'
import FacebookAccountListSearch from './FacebookAccountListSearch'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'

const FacebookAccountListActionTools = ({ onRefresh }) => {
    const [openImport, setOpenImport] = useState(false)
    const { onAppendQueryParams } = useAppendQueryParams()

    const handleInputChange = (query) => {
        onAppendQueryParams({
            search: query,
        })
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
                <FacebookAccountListSearch onInputChange={handleInputChange} />
            </div>
            <div className="flex items-center gap-2">
                <FacebookAccountTableFilter />
                <Button variant="outline" size="sm" onClick={onRefresh} className="flex items-center gap-2">
                    <TbRefresh className="w-4 h-4" />
                    <span>Làm mới</span>
                </Button>
                <Button variant="outline" size="sm" onClick={()=>setOpenImport(true)} className="flex items-center gap-2">
                    <TbUpload className="w-4 h-4" />
                    <span>Nhập tài khoản</span>
                </Button>
            </div>
            <FacebookImportAccountsModal isOpen={openImport} onClose={()=>setOpenImport(false)} onSuccess={onRefresh} />
        </div>
    )
}

export default FacebookAccountListActionTools


