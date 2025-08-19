'use client'
import Button from '@/components/ui/Button'
import { TbPlus, TbUpload } from 'react-icons/tb'
import { useTranslations } from 'next-intl'

const ProxyListActionTools = ({ onAddNew, onImport }) => {
    const t = useTranslations('proxy-management')
    return (
        <div className="flex flex-col md:flex-row gap-3">
            <Button
                variant="solid"
                icon={<TbPlus />}
                onClick={onAddNew}
            >
                {t('addNew')}
            </Button>
            <Button
                variant="default"
                icon={<TbUpload />}
                onClick={onImport}
            >
                {t('import.import')}
            </Button>
        </div>
    )
}

export default ProxyListActionTools
