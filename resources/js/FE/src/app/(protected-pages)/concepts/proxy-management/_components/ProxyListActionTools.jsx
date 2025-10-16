'use client'
import Button from '@/components/ui/Button'
import { TbPlus, TbUpload } from 'react-icons/tb'

const ProxyListActionTools = ({ onAddNew, onImport }) => {
    return (
        <div className="flex flex-col md:flex-row gap-3">
            <Button
                variant="solid"
                icon={<TbPlus />}
                onClick={onAddNew}
            >
                Thêm mới
            </Button>
            <Button
                variant="default"
                icon={<TbUpload />}
                onClick={onImport}
            >
                Import
            </Button>
        </div>
    )
}

export default ProxyListActionTools
