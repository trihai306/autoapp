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
import Badge from '@/components/ui/Badge'
import { PiCheckCircleDuotone, PiWarningCircleDuotone, PiXCircleDuotone } from 'react-icons/pi'

const ActionColumn = ({ onEdit, onDelete, onTest }) => {
    return (
        <div className="flex items-center justify-end gap-2 min-w-[140px]">
            <Tooltip title={'Kiểm tra kết nối'}>
                <button
                    className={`text-xl cursor-pointer select-none font-semibold text-blue-500 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50`}
                    onClick={onTest}
                >
                    <TbPlayerPlay />
                </button>
            </Tooltip>
            <Tooltip title={'Chỉnh sửa'}>
                <button
                    className={`text-xl cursor-pointer select-none font-semibold hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-50`}
                    onClick={onEdit}
                >
                    <TbPencil />
                </button>
            </Tooltip>
            <Tooltip title={'Xóa'}>
                <button
                    className={`text-xl cursor-pointer select-none font-semibold text-red-500 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50`}
                    onClick={onDelete}
                >
                    <TbTrash />
                </button>
            </Tooltip>
        </div>
    )
}

const ProxyListTable = ({
    proxyListTotal,
    page = 1,
    per_page = 10,
}) => {
    const router = useRouter()
    const t = { name: 'Tên', host: 'Host', status: 'Trạng thái', lastUsed: 'Lần cuối sử dụng' }
    const tStatus = (key) => ({ active: 'Hoạt động', inactive: 'Không hoạt động', error: 'Lỗi' }[key] || key)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const allColumns = [
        { header: t.name, accessorKey: 'name' },
        { header: t.host, accessorKey: 'host' },
        { header: t.status, accessorKey: 'status' },
        { header: t.lastUsed, accessorKey: 'last_used_at' },
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
        setDeleteConfirm(proxy)
    }

    const confirmDelete = async () => {
        if (!deleteConfirm) return

        const result = await deleteProxy(deleteConfirm.id)
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
        setDeleteConfirm(null)
    }

    const handleTest = async (proxy) => {
        const result = await testProxyConnection(proxy.id)
        if (result.success) {
            if (result.data.success) {
                toast.push(
                    <Notification title="Thành công" type="success" closable>
                        Kiểm tra kết nối thành công
                    </Notification>
                )
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger" closable>
                        Kiểm tra kết nối thất bại
                    </Notification>
                )
            }
            router.refresh()
        } else {
            toast.push(
                <Notification title="Lỗi" type="danger" closable>
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
                { header: t.name, accessorKey: 'name' },
                {
                    header: t.host,
                    accessorKey: 'host',
                    cell: (props) => (
                        <div>
                            <div>{props.row.original.host}:{props.row.original.port}</div>
                            <small className="text-gray-500">{props.row.original.type.toUpperCase()}</small>
                        </div>
                    )
                },
                {
                    header: t.status,
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
                    header: t.lastUsed,
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
                enableSorting: false,
                enableHiding: false,
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
            <style jsx>{`
                .proxy-table :global(.action-column) {
                    min-width: 140px !important;
                    width: 140px !important;
                }
                .proxy-table :global(th:last-child),
                .proxy-table :global(td:last-child) {
                    min-width: 140px !important;
                    width: 140px !important;
                    text-align: right !important;
                }
            `}</style>
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
                className="proxy-table"
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!deleteConfirm}
                type="danger"
                title="Xác nhận xóa"
                onClose={() => setDeleteConfirm(null)}
                onRequestClose={() => setDeleteConfirm(null)}
                onCancel={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                cancelText="Hủy"
                confirmText="Xóa"
                confirmButtonProps={{
                    color: 'red-600'
                }}
            >
                <p className="text-gray-600">
                    Bạn có chắc chắn muốn xóa proxy "{deleteConfirm?.name}" không? Hành động này không thể hoàn tác.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default ProxyListTable
