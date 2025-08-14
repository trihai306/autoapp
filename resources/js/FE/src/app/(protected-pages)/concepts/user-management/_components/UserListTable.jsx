'use client'
import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import { useUserListStore } from '../_store/userListStore'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { TbPencil, TbEye } from 'react-icons/tb'
import UsersListTableTools from './UsersListTableTools'
import dayjs from 'dayjs'
import Dialog from '@/components/ui/Dialog'
import UserDetail from './UserDetail'
import { useTranslations } from 'next-intl'

const statusColor = {
    active: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    locked: 'bg-red-200 dark:bg-red-200 text-gray-900 dark:text-gray-900',
}

const NameColumn = ({ row, onViewDetail }) => {
    return (
        <div className="flex items-center">
            <Avatar size={40} shape="circle" src={row.avatar} />
            <div
                className={`hover:text-primary ml-2 rtl:mr-2 font-semibold text-gray-900 dark:text-gray-100 cursor-pointer`}
                onClick={() => onViewDetail(row)}
            >
                {row.full_name}
            </div>
        </div>
    )
}

const ActionColumn = ({ onEdit, onViewDetail }) => {
    const t = useTranslations('userManagement.table')
    return (
        <div className="flex items-center gap-3">
            <Tooltip title={t('edit')}>
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={onEdit}
                >
                    <TbPencil />
                </div>
            </Tooltip>
            <Tooltip title={t('view')}>
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={onViewDetail}
                >
                    <TbEye />
                </div>
            </Tooltip>
        </div>
    )
}

const UserListTable = ({
    userListTotal,
    page = 1,
    per_page = 10,
}) => {
    const router = useRouter()
    const t = useTranslations('userManagement.table')
    const tDetail = useTranslations('userManagement.detail')
    const allColumns = [
        { header: t('name'), accessorKey: 'full_name' },
        { header: t('email'), accessorKey: 'email' },
        { header: t('phone'), accessorKey: 'phone_number' },
        { header: t('roles'), accessorKey: 'roles' },
        { header: t('balance'), accessorKey: 'balance' },
        { header: t('createdDate'), accessorKey: 'created_at' },
        { header: t('status'), accessorKey: 'status' },
    ]

    const [visibleColumns, setVisibleColumns] = useState(allColumns.map(c => c.accessorKey))
    const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)
    const [selectedUserForDetail, setSelectedUserForDetail] = useState(null)

    const userList = useUserListStore((state) => state.userList)
    const selectedUser = useUserListStore((state) => state.selectedUser)
    const isInitialLoading = useUserListStore((state) => state.initialLoading)
    const setSelectedUser = useUserListStore((state) => state.setSelectedUser)
    const setSelectAllUser = useUserListStore((state) => state.setSelectAllUser)

    const { onAppendQueryParams } = useAppendQueryParams()

    const handleEdit = (user) => {
        router.push(`/concepts/user-management/user-edit/${user.id}`)
    }

    const handleViewDetails = (user) => {
        setSelectedUserForDetail(user)
        setIsDetailViewOpen(true)
    }

    const handleCloseDetailView = () => {
        setIsDetailViewOpen(false)
        setSelectedUserForDetail(null)
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
                {
                    header: t('name'),
                    accessorKey: 'full_name',
                    sortable: true,
                    sortKey: 'name', // Use name for sorting
                    cell: (props) => {
                        const row = props.row.original
                        return <NameColumn row={row} onViewDetail={() => handleViewDetails(row)} />
                    },
                },
                {
                    header: t('email'),
                    accessorKey: 'email',
                },
                {
                    header: t('phone'),
                    accessorKey: 'phone_number',
                },
                {
                    header: t('roles'),
                    accessorKey: 'roles',
                    cell: (props) => {
                        const roles = props.row.original.roles
                        return (
                            <div className="flex flex-wrap gap-2">
                                {roles?.map((role) => (
                                    <Tag key={role.id} className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100">
                                        {role.name}
                                    </Tag>
                                ))}
                            </div>
                        )
                    }
                },
                {
                    header: t('balance'),
                    accessorKey: 'balance',
                },
                {
                    header: t('createdDate'),
                    accessorKey: 'created_at',
                    cell: (props) => {
                        return <span>{dayjs(props.row.original.created_at).format('DD/MM/YYYY')}</span>
                    }
                },
                {
                    header: t('status'),
                    accessorKey: 'status',
                    cell: (props) => {
                        const row = props.row.original
                        return (
                            <div className="flex items-center">
                                <Tag className={statusColor[row.status]}>
                                    <span className="capitalize">{row.status}</span>
                                </Tag>
                            </div>
                        )
                    },
                },
            ]
            
            const actionColumn = {
                header: '',
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        onEdit={() => handleEdit(props.row.original)}
                        onViewDetail={() =>
                            handleViewDetails(props.row.original)
                        }
                    />
                ),
            }

            return [...baseColumns.filter(col => visibleColumns.includes(col.accessorKey)), actionColumn]
        }, 
        [visibleColumns],
    )

    const handlePaginationChange = (page) => {
        onAppendQueryParams({
            page: String(page),
        })
    }

    const handleSelectChange = (value) => {
        onAppendQueryParams({
            per_page: String(value),
            page: '1',
        })
    }

    const handleSort = (sort) => {
        const sortKey = sort.column?.sortKey || sort.key
        onAppendQueryParams({
            sort: (sort.order === 'desc' ? '-' : '') + sortKey,
        })
    }

    const handleRowSelect = (checked, row) => {
        setSelectedUser(checked, row)
    }

    const handleAllRowSelect = (checked, rows) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllUser(originalRows)
        } else {
            setSelectAllUser([])
        }
    }

    return (
        <div>
            <UsersListTableTools columns={columns} selectableColumns={allColumns} onColumnToggle={onColumnToggle} />
            <DataTable
                selectable
                columns={columns}
                data={userList}
                noData={userList.length === 0}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
                loading={isInitialLoading}
                pagingData={{
                    total: userListTotal,
                    pageIndex: page,
                    pageSize: per_page,
                }}
                checkboxChecked={(row) =>
                    selectedUser.some((selected) => selected.id === row.id)
                }
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
                onCheckBoxChange={handleRowSelect}
                onIndeterminateCheckBoxChange={handleAllRowSelect}
            />
            <Dialog
                isOpen={isDetailViewOpen}
                onClose={handleCloseDetailView}
                onRequestClose={handleCloseDetailView}
            >
                {selectedUserForDetail && (
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                            <h5 className="font-bold">{tDetail('title')}</h5>
                        </div>
                        <div className="p-4 overflow-y-auto">
                           <UserDetail user={selectedUserForDetail} />
                        </div>
                        <div className="p-4 text-right border-t border-gray-200 dark:border-gray-600">
                            <Button
                                icon={<TbPencil />}
                                onClick={() => handleEdit(selectedUserForDetail)}
                            >
                                {tDetail('edit')}
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    )
}

export default UserListTable
