'use client'
import { useMemo, useState } from 'react'
import DataTable from '@/components/shared/DataTable'
import { useProxyListStore } from '../_store/proxyListStore'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import dayjs from 'dayjs'
import ProxyListTableTools from './ProxyListTableTools'
import Tooltip from '@/components/ui/Tooltip'
import { TbPencil, TbTrash, TbPlayerPlay } from 'react-icons/tb'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import deleteProxy from '@/server/actions/proxy/deleteProxy'
import testProxyConnection from '@/server/actions/proxy/testProxyConnection'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useTranslations } from 'next-intl'
import Badge from '@/components/ui/Badge'
import { PiCheckCircleDuotone, PiWarningCircleDuotone, PiXCircleDuotone } from 'react-icons/pi'

const ActionColumn = ({ onEdit, onDelete, onTest }) => {
    const t = useTranslations('proxy-management')
    const t_delete = useTranslations('proxy-management')
    const t_test = useTranslations('proxy-management')
    
    return (
        <div className="flex items-center justify-end gap-3">
            <Tooltip title={t_test('test.title')}>
                <div
                    className={`text-xl cursor-pointer select-none font-semibold text-blue-500`}
                    role="button"
                    onClick={onTest}
                >
                    <TbPlayerPlay />
                </div>
            </Tooltip>
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
                title={t_delete('deleteConfirm.title')}
                content={t_delete('deleteConfirm.content')}
                confirmText={t_delete('deleteConfirm.confirmText')}
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

const ProxyListTable = ({
    proxyListTotal,
    page = 1,
    per_page = 10,
}) => {
    const router = useRouter()
    const t = useTranslations('proxy-management.table')
    const tStatus = useTranslations('proxy-management.status')
    const allColumns = [
        { header: t('name'), accessorKey: 'name' },
        { header: t('host'), accessorKey: 'host' },
        { header: t('status'), accessorKey: 'status' },
        { header: t('lastUsed'), accessorKey: 'last_used_at' },
    ]
    const [visibleColumns, setVisibleColumns] = useState(allColumns.map(c => c.accessorKey))
    const proxyList = useProxyListStore((state) => state.proxyList)
    const isInitialLoading = useProxyListStore((state) => state.initialLoading)
    const selectedProxy = useProxyListStore((state) => state.selectedProxy)
    const setSelectedProxy = useProxyListStore((state) => state.setSelectedProxy)
    const setSelectAllProxy = useProxyListStore((state) => state.setSelectAllProxy)
    const { onAppendQueryParams } = useAppendQueryParams()

    const openForm = useProxyListStore((state) => state.openForm)
    const handleEdit = (proxy) => {
        openForm('edit', proxy)
    }

    const handleDelete = async (proxy) => {
        const result = await deleteProxy(proxy.id)
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

    const handleTest = async (proxy) => {
        const result = await testProxyConnection(proxy.id)
        if (result.success) {
            if (result.data.success) {
                toast.push(
                    <Notification title="Success" type="success" closable>
                        {t('test.success')}
                    </Notification>
                )
            } else {
                toast.push(
                    <Notification title="Error" type="danger" closable>
                        {t('test.error')}
                    </Notification>
                )
            }
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
                { 
                    header: t('host'), 
                    accessorKey: 'host',
                    cell: (props) => (
                        <div>
                            <div>{props.row.original.host}:{props.row.original.port}</div>
                            <small className="text-gray-500">{props.row.original.type.toUpperCase()}</small>
                        </div>
                    )
                },
                {
                    header: t('status'),
                    accessorKey: 'status',
                    cell: (props) => {
                        const status = props.row.original.status
                        const statusConfig = {
                            active: { color: 'green', icon: <PiCheckCircleDuotone /> },
                            inactive: { color: 'orange', icon: <PiWarningCircleDuotone /> },
                            error: { color: 'red', icon: <PiXCircleDuotone /> },
                        }
                        const config = statusConfig[status] || statusConfig.inactive
                        return (
                            <Badge 
                                color={config.color} 
                                content={
                                    <span className="flex items-center gap-1">
                                        {config.icon}
                                        {tStatus(status)}
                                    </span>
                                } 
                            />
                        )
                    }
                },
                {
                    header: t('lastUsed'),
                    accessorKey: 'last_used_at',
                    cell: (props) => {
                        const date = props.row.original.last_used_at
                        return date ? dayjs(date).format('DD/MM/YYYY') : 'Never'
                    }
                },
            ]
            
            const actionColumn = {
                header: '',
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        onEdit={() => handleEdit(props.row.original)}
                        onDelete={() => handleDelete(props.row.original)}
                        onTest={() => handleTest(props.row.original)}
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
    const handleRowSelect = (checked, row) => setSelectedProxy(checked, row)
    const handleAllRowSelect = (checked, rows) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllProxy(originalRows)
        } else {
            setSelectAllProxy([])
        }
    }

    return (
        <div>
            <ProxyListTableTools columns={columns} selectableColumns={allColumns} onColumnToggle={onColumnToggle} />
            <DataTable
                selectable
                columns={columns}
                data={proxyList}
                noData={proxyList.length === 0}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
                loading={isInitialLoading}
                pagingData={{
                    total: proxyListTotal,
                    pageIndex: page,
                    pageSize: per_page,
                }}
                checkboxChecked={(row) => selectedProxy.some((selected) => selected.id === row.id)}
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
                onCheckBoxChange={handleRowSelect}
                onIndeterminateCheckBoxChange={handleAllRowSelect}
            />
        </div>
    )
}

export default ProxyListTable
