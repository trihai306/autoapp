'use client'
import { useMemo, useState } from 'react'
import DataTable from '@/components/shared/DataTable'
import { useRoleListStore } from '../_store/roleListStore'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import dayjs from 'dayjs'
import RoleListTableTools from './RoleListTableTools'
import Tooltip from '@/components/ui/Tooltip'
import { TbPencil, TbTrash } from 'react-icons/tb'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import deleteRoles from '@/server/actions/user/deleteRoles'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useTranslations } from 'next-intl'

const ActionColumn = ({ onEdit, onDelete }) => {
    const t = useTranslations('roleManagement')
    return (
        <div className="flex items-center justify-end gap-3">
            <Tooltip title={t('table.edit')}>
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
                title={t('deleteConfirm.title')}
                content={t('deleteConfirm.content')}
                confirmText={t('deleteConfirm.confirmText')}
            >
                <Tooltip title={t('table.delete')}>
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

const RoleListTable = ({
    roleListTotal,
    page = 1,
    per_page = 10,
}) => {
    const router = useRouter()
    const t = useTranslations('roleManagement.table')
    const allColumns = [
        { header: t('name'), accessorKey: 'name' },
        { header: t('guardName'), accessorKey: 'guard_name' },
        { header: t('createdDate'), accessorKey: 'created_at' },
    ]
    const [visibleColumns, setVisibleColumns] = useState(allColumns.map(c => c.accessorKey))
    const roleList = useRoleListStore((state) => state.roleList)
    const isInitialLoading = useRoleListStore((state) => state.initialLoading)
    const selectedRole = useRoleListStore((state) => state.selectedRole)
    const setSelectedRole = useRoleListStore((state) => state.setSelectedRole)
    const setSelectAllRole = useRoleListStore((state) => state.setSelectAllRole)
    const { onAppendQueryParams } = useAppendQueryParams()

    const openForm = useRoleListStore((state) => state.openForm)
    const handleEdit = (role) => {
        openForm('edit', role)
    }

    const handleDelete = async (role) => {
        const result = await deleteRoles([role.id])
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
        [visibleColumns, handleEdit, handleDelete],
    )

    const handlePaginationChange = (page) => onAppendQueryParams({ page: String(page) })
    const handleSelectChange = (value) => onAppendQueryParams({ per_page: String(value), page: '1' })
    const handleSort = (sort) => onAppendQueryParams({ sort: (sort.order === 'desc' ? '-' : '') + sort.key })
    const handleRowSelect = (checked, row) => setSelectedRole(checked, row)
    const handleAllRowSelect = (checked, rows) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllRole(originalRows)
        } else {
            setSelectAllRole([])
        }
    }

    return (
        <div>
            <RoleListTableTools columns={columns} selectableColumns={allColumns} onColumnToggle={onColumnToggle} />
            <DataTable
                selectable
                columns={columns}
                data={roleList}
                noData={roleList.length === 0}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
                loading={isInitialLoading}
                pagingData={{
                    total: roleListTotal,
                    pageIndex: page,
                    pageSize: per_page,
                }}
                checkboxChecked={(row) => selectedRole.some((selected) => selected.id === row.id)}
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
                onCheckBoxChange={handleRowSelect}
                onIndeterminateCheckBoxChange={handleAllRowSelect}
            />
        </div>
    )
}

export default RoleListTable
