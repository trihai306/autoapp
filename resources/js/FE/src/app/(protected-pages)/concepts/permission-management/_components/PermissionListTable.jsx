'use client'
import { useMemo, useState } from 'react'
import DataTable from '@/components/shared/DataTable'
import { usePermissionListStore } from '../_store/permissionListStore'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import dayjs from 'dayjs'
import PermissionListTableTools from './PermissionListTableTools'
import Tooltip from '@/components/ui/Tooltip'
import { TbPencil, TbTrash } from 'react-icons/tb'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import deletePermissions from '@/server/actions/user/deletePermissions'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useTranslations } from 'next-intl'

const ActionColumn = ({ onEdit, onDelete }) => {
    const t = useTranslations('permissionManagement.table')
    const t_delete = useTranslations('permissionManagement.deleteConfirm')
    return (
        <div className="flex items-center justify-end gap-3">
            <Tooltip title={t('edit')}>
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={onEdit}
                >
                    <TbPencil />
                </div>
            </Tooltip>
            <ConfirmDialog
                onConfirm={onDelete}
                title={t_delete('title')}
                content={t_delete('content')}
                confirmText={t_delete('confirmText')}
            >
                <Tooltip title={t('delete')}>
                    <div
                        className={`text-xl cursor-pointer select-none font-semibold text-red-500`}
                        role="button"
                    >
                        <TbTrash />
                    </div>
                </Tooltip>
            </ConfirmDialog>
        </div>
    )
}

const PermissionListTable = ({
    permissionListTotal,
    page = 1,
    per_page = 10,
}) => {
    const router = useRouter()
    const t = useTranslations('permissionManagement.table')
    const allColumns = [
        { header: t('name'), accessorKey: 'name' },
        { header: t('guardName'), accessorKey: 'guard_name' },
        { header: t('createdDate'), accessorKey: 'created_at' },
    ]
    const [visibleColumns, setVisibleColumns] = useState(allColumns.map(c => c.accessorKey))
    const permissionList = usePermissionListStore((state) => state.permissionList)
    const isInitialLoading = usePermissionListStore((state) => state.initialLoading)
    const selectedPermission = usePermissionListStore((state) => state.selectedPermission)
    const setSelectedPermission = usePermissionListStore((state) => state.setSelectedPermission)
    const setSelectAllPermission = usePermissionListStore((state) => state.setSelectAllPermission)
    const { onAppendQueryParams } = useAppendQueryParams()

    const openForm = usePermissionListStore((state) => state.openForm)
    const handleEdit = (permission) => {
        openForm('edit', permission)
    }

    const handleDelete = async (permission) => {
        const result = await deletePermissions([permission.id])
        if (result.success) {
            toast.push(
                <Notification title="Success" type="success" closable>
                    {result.message}
                </Notification>
            )
            router.refresh()
        } else {
            toast.push(
                <Notification title="Error" type="danger" closable>
                    {result.message}
                </Notification>
            )
        }
    }

    const onColumnToggle = (accessorKey) => {
        if (visibleColumns.includes(accessorKey)) {
            setVisibleColumns(visibleColumns.filter(key => key !== accessorKey))
        } else {
            setVisibleColumns([...visibleColumns, accessorKey])
        }
    }
    
    const columns = useMemo(
        () => {
            const baseColumns = [
                { header: t('name'), accessorKey: 'name' },
                { header: t('guardName'), accessorKey: 'guard_name' },
                {
                    header: t('createdDate'),
                    accessorKey: 'created_at',
                    cell: (props) => <span>{dayjs(props.row.original.created_at).format('DD/MM/YYYY')}</span>
                },
            ]
            
            const actionColumn = {
                header: '',
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        onEdit={() => handleEdit(props.row.original)}
                        onDelete={() => handleDelete(props.row.original)}
                    />
                ),
            }

            return [...baseColumns.filter(col => visibleColumns.includes(col.accessorKey)), actionColumn]
        }, 
        [visibleColumns],
    )

    const handlePaginationChange = (page) => onAppendQueryParams({ page: String(page) })
    const handleSelectChange = (value) => onAppendQueryParams({ per_page: String(value), page: '1' })
    const handleSort = (sort) => onAppendQueryParams({ sort: (sort.order === 'desc' ? '-' : '') + sort.key })
    const handleRowSelect = (checked, row) => setSelectedPermission(checked, row)
    const handleAllRowSelect = (checked, rows) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllPermission(originalRows)
        } else {
            setSelectAllPermission([])
        }
    }

    return (
        <div>
            <PermissionListTableTools columns={columns} selectableColumns={allColumns} onColumnToggle={onColumnToggle} />
            <DataTable
                selectable
                columns={columns}
                data={permissionList}
                noData={permissionList.length === 0}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
                loading={isInitialLoading}
                pagingData={{
                    total: permissionListTotal,
                    pageIndex: page,
                    pageSize: per_page,
                }}
                checkboxChecked={(row) => selectedPermission.some((selected) => selected.id === row.id)}
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
                onCheckBoxChange={handleRowSelect}
                onIndeterminateCheckBoxChange={handleAllRowSelect}
            />
        </div>
    )
}

export default PermissionListTable
