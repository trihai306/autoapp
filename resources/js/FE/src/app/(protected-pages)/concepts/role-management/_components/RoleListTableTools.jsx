'use client'
import RoleListSearch from './RoleListSearch'
import ColumnSelector from './ColumnSelector'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useRoleListStore } from '../_store/roleListStore'
import Button from '@/components/ui/Button'
import { TbTrash, TbX } from 'react-icons/tb'
import Dialog from '@/components/ui/Dialog'
import { useState } from 'react'
import deleteRoles from '@/server/actions/user/deleteRoles'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

const RoleListBulkActionTools = () => {
    const router = useRouter()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const selectedRole = useRoleListStore((state) => state.selectedRole)
    const setSelectAllRole = useRoleListStore((state) => state.setSelectAllRole)
    const t = useTranslations('roleManagement.bulkAction')
    const tConfirm = useTranslations('roleManagement.bulkDeleteConfirm')

    const onBulkDelete = () => setShowDeleteConfirmation(true)
    const onClearSelection = () => setSelectAllRole([])
    const handleDeleteConfirm = async () => {
        const roleIds = selectedRole.map((p) => p.id)
        const result = await deleteRoles(roleIds)

        if (result.success) {
            toast.push(
                <Notification title="Success" type="success" closable>
                    {result.message}
                </Notification>
            )
            setSelectAllRole([])
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
                    {t('selected', { count: selectedRole.length })}
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
                    {tConfirm('content', { count: selectedRole.length })}
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

const RoleListTableTools = ({ columns, selectableColumns, onColumnToggle }) => {
    const { onAppendQueryParams } = useAppendQueryParams()
    const selectedRole = useRoleListStore((state) => state.selectedRole)
    const handleInputChange = (query) => onAppendQueryParams({ search: query, page: '1' })

    if (selectedRole.length > 0) {
        return <RoleListBulkActionTools />
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <RoleListSearch onInputChange={handleInputChange} />
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

export default RoleListTableTools
