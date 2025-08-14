'use client'
import Button from '@/components/ui/Button'
import { TbPlus } from 'react-icons/tb'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

const PermissionListActionTools = ({ onAddNew }) => {
    const t = useTranslations('permissionManagement')
    return (
        <div className="flex flex-col md:flex-row gap-3">
            <Button
                variant="solid"
                icon={<TbPlus />}
                onClick={onAddNew}
            >
                {t('addNew')}
            </Button>
        </div>
    )
}

export default PermissionListActionTools
