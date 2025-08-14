'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { TbUpload } from 'react-icons/tb'
import { useRouter } from 'next/navigation'
import ImportAccountsModal from './ImportAccountsModal'
import { useTranslations } from 'next-intl'

const TiktokAccountListActionTools = () => {
    const router = useRouter()
    const t = useTranslations('tiktokAccountManagement')
    const [showImportModal, setShowImportModal] = useState(false)
    
    const handleImportSuccess = () => {
        // Refresh trang sau khi import thành công
        router.refresh()
    }

    return (
        <>
            <div className="flex flex-col md:flex-row gap-3">
                <Button
                    variant="solid"
                    color="green-500"
                    icon={<TbUpload className="text-xl" />}
                    onClick={() => setShowImportModal(true)}
                >
                    {t('importAccounts')}
                </Button>
            </div>

            <ImportAccountsModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={handleImportSuccess}
            />
        </>
    )
}

export default TiktokAccountListActionTools 