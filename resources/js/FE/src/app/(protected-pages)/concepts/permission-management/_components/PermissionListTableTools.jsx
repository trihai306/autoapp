'use client'
import PermissionListSearch from './PermissionListSearch'
import ColumnSelector from './ColumnSelector'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { usePermissionListStore } from '../_store/permissionListStore'
import Button from '@/components/ui/Button'
import { TbTrash, TbX } from 'react-icons/tb'
import Dialog from '@/components/ui/Dialog'
import { useState } from 'react'
import deletePermissions from '@/server/actions/user/deletePermissions'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

const PermissionListBulkActionTools = () => {
    const router = useRouter()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const selectedPermission = usePermissionListStore((state) => state.selectedPermission)
    const setSelectAllPermission = usePermissionListStore((state) => state.setSelectAllPermission)
    const t = useTranslations('permissionManagement.bulkAction')
    const tConfirm = useTranslations('permissionManagement.bulkDeleteConfirm')

    const onBulkDelete = () => setShowDeleteConfirmation(true)
    const onClearSelection = () => setSelectAllPermission([])
    const handleDeleteConfirm = async () => {
        const permissionIds = selectedPermission.map((p) => p.id)
        const result = await deletePermissions(permissionIds)

        if (result.success) {
            toast.push(
                <Notification title="Success" type="success" closable>
                    {result.message}
                </Notification>
            )
            setSelectAllPermission([])
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
                    {t('selected', { count: selectedPermission.length })}
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
                    {tConfirm('content', { count: selectedPermission.length })}
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

const PermissionListTableTools = ({ columns, selectableColumns, onColumnToggle }) => {
    const { onAppendQueryParams } = useAppendQueryParams()
    const selectedPermission = usePermissionListStore((state) => state.selectedPermission)
    const handleInputChange = (query) => onAppendQueryParams({ search: query, page: '1' })

    if (selectedPermission.length > 0) {
        return <PermissionListBulkActionTools />
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <PermissionListSearch onInputChange={handleInputChange} />
            <div className="flex items-center gap-2">
                <ColumnSelector
                    columns={columns}
                    selectableColumns={selectableColumns}
                    onColumnToggle={onColumnToggle}
                />
            </div>
        </div>
    )
}

export default PermissionListTableTools
