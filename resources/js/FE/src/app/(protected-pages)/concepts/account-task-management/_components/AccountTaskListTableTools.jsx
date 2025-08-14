'use client'
import AccountTaskListSearch from './AccountTaskListSearch'
import AccountTaskTableFilter from './AccountTaskTableFilter'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useAccountTaskListStore } from '../_store/accountTaskListStore'
import Button from '@/components/ui/Button'
import { TbTrash, TbX } from 'react-icons/tb'
import Dialog from '@/components/ui/Dialog'
import { useState } from 'react'
import deleteAccountTasks from '@/server/actions/account/deleteAccountTasks'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

const AccountTaskListBulkActionTools = () => {
    const router = useRouter()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const t = useTranslations('accountTaskManagement.bulkAction')
    const tConfirm = useTranslations('accountTaskManagement.deleteConfirm')

    const selectedTasks = useAccountTaskListStore((state) => state.selectedTasks)
    const setSelectAllTasks = useAccountTaskListStore((state) => state.setSelectAllTasks)

    const onBulkDelete = () => {
        setShowDeleteConfirmation(true)
    }

    const onClearSelection = () => {
        setSelectAllTasks([])
    }

    const handleDeleteConfirm = async () => {
        const taskIds = selectedTasks.map((task) => task.id)
        const result = await deleteAccountTasks(taskIds)

        if (result.success) {
            toast.push(
                <Notification title="Success" type="success" closable>
                    {result.message}
                </Notification>
            )
            setSelectAllTasks([])
            router.refresh()
        } else {
            toast.push(
                <Notification title="Error" type="danger" closable>
                    {result.message}
                </Notification>
            )
        }
        setShowDeleteConfirmation(false)
    }

    return (
        <>
            <div className="flex flex-col items-start md:flex-row md:items-center gap-3">
                <span className="font-semibold leading-9">
                    {t('selected', { count: selectedTasks.length })}
                </span>
                <Button
                    size="sm"
                    variant="solid"
                    className="bg-red-500 hover:bg-red-400"
                    icon={<TbTrash />}
                    onClick={onBulkDelete}
                >
                    {t('delete')}
                </Button>
                <Button
                    size="sm"
                    variant="default"
                    icon={<TbX />}
                    onClick={onClearSelection}
                >
                    {t('clear')}
                </Button>
            </div>
            <Dialog
                isOpen={showDeleteConfirmation}
                onClose={() => setShowDeleteConfirmation(false)}
                onRequestClose={() => setShowDeleteConfirmation(false)}
            >
                <h5 className="mb-4">{tConfirm('title')}</h5>
                <p>
                    {tConfirm('content', { count: selectedTasks.length })}
                </p>
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        onClick={() => setShowDeleteConfirmation(false)}
                    >
                        {tConfirm('cancel')}
                    </Button>
                    <Button
                        variant="solid"
                        color="red-600"
                        onClick={handleDeleteConfirm}
                    >
                        {tConfirm('delete')}
                    </Button>
                </div>
            </Dialog>
        </>
    )
}

const AccountTaskListTableTools = () => {
    const { onAppendQueryParams } = useAppendQueryParams()
    const selectedTasks = useAccountTaskListStore((state) => state.selectedTasks)

    const handleInputChange = (query) => {
        onAppendQueryParams({
            search: query,
        })
    }

    if (selectedTasks.length > 0) {
        return <AccountTaskListBulkActionTools />
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <AccountTaskListSearch onInputChange={handleInputChange} />
            <div className="flex items-center gap-2">
                <AccountTaskTableFilter />
            </div>
        </div>
    )
}

export default AccountTaskListTableTools
