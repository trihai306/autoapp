'use client'
import React, { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import FacebookConnectionTypeToggle from './FacebookConnectionTypeToggle'
import Select from '@/components/ui/Select'
import updateFacebookAccountProxy from '@/server/actions/facebook-account/updateFacebookAccountProxy'
import { useState } from 'react'
import { useFacebookAccountData } from './FacebookAccountDataManager'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { TbEye, TbEdit, TbTrash, TbPlayerPlay, TbPlayerStop, TbList } from 'react-icons/tb'
import FacebookAccountViewModal from './FacebookAccountViewModal'
import FacebookAccountEditModal from './FacebookAccountEditModal'
import FacebookAccountTasksModal from './FacebookAccountTasksModal'
import FacebookAccountStatusToggle from './FacebookAccountStatusToggle'
import FacebookAccountStatusDisplayOptimized from './FacebookAccountStatusDisplayOptimized'

const FacebookAccountListTable = ({ list = [], total = 0, page = 1, per_page = 10 }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { getProxyOptions } = useFacebookAccountData()
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [tasksModalOpen, setTasksModalOpen] = useState(false)

    const proxyOptions = getProxyOptions()

    const statusConfig = {
        active: {
            color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
            label: 'Hoạt động',
        },
        inactive: {
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
            label: 'Tạm dừng',
        },
        suspended: {
            color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            label: 'Đình chỉ',
        },
        running: {
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            label: 'Đang chạy',
        },
        error: {
            color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            label: 'Lỗi',
        },
    }

    const columns = useMemo(() => [
        {
            header: 'Username',
            accessorKey: 'username',
            enableSorting: true,
            cell: ({ row }) => (
                <span className="text-gray-900 dark:text-gray-100">{row.original.username}</span>
            ),
        },
        {
            header: 'Email',
            accessorKey: 'email',
            enableSorting: true,
            cell: ({ row }) => (
                <span className="text-gray-700 dark:text-gray-300">{row.original.email || '-'}</span>
            ),
        },
        {
            header: 'Trạng thái',
            accessorKey: 'status',
            enableSorting: true,
            cell: ({ row }) => {
                const raw = String(row.original.status || '').toLowerCase()
                const conf = statusConfig[raw] || {
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
                    label: row.original.status || 'Không xác định',
                }
                return (
                    <span className={`px-2 py-0.5 rounded text-xs ${conf.color}`}>{conf.label}</span>
                )
            },
        },
        {
            header: 'Kết nối',
            accessorKey: 'connection',
            minSize: 280,
            enableSorting: false,
            cell: ({ row }) => {
                const account = row.original
                return <ConnectionCell account={account} proxies={proxyOptions} loading={false} />
            },
        },
        {
            header: 'Đang làm gì',
            accessorKey: 'current_activity',
            minSize: 200,
            enableSorting: false,
            cell: ({ row }) => <FacebookAccountStatusDisplayOptimized account={row.original} />,
        },
        {
            header: 'Thao tác',
            id: 'actions',
            enableSorting: false,
            cell: ({ row }) => {
                const account = row.original

                const onView = () => {
                    setSelectedAccount(account)
                    setViewModalOpen(true)
                }
                const onEdit = () => {
                    setSelectedAccount(account)
                    setEditModalOpen(true)
                }
                const onTasks = () => {
                    setSelectedAccount(account)
                    setTasksModalOpen(true)
                }
                const handleStatusChange = () => {
                    router.refresh()
                }
                const onDelete = () => {
                    toast.push(<Notification title="Thông báo" type="warning">Xóa tài khoản sẽ sớm có</Notification>)
                }

                return (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="p-1" onClick={onView}>
                            <TbEye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="p-1" onClick={onEdit}>
                            <TbEdit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="p-1" onClick={onTasks}>
                            <TbList className="w-4 h-4" />
                        </Button>
                        <FacebookAccountStatusToggle
                            account={account}
                            onStatusChange={handleStatusChange}
                        />
                        <Button variant="outline" size="sm" className="p-1" onClick={onDelete}>
                            <TbTrash className="w-4 h-4" />
                        </Button>
                    </div>
                )
            },
        },
    ], [])

    const handlePaginationChange = (nextPage) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(nextPage))
        params.set('per_page', String(per_page))
        router.push(`?${params.toString()}`)
    }

    const handleSelectChange = (nextPerPage) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', '1')
        params.set('per_page', String(nextPerPage))
        router.push(`?${params.toString()}`)
    }

    return (
        <>
            <DataTable
                columns={columns}
                data={list}
                pagingData={{ pageIndex: Number(page), pageSize: Number(per_page), total: Number(total) }}
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                noData={list.length === 0}
                className="min-w-full"
                selectable
            />

            {/* View Modal */}
            <FacebookAccountViewModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                account={selectedAccount}
            />

            {/* Edit Modal */}
            <FacebookAccountEditModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                account={selectedAccount}
                onSuccess={() => {
                    setEditModalOpen(false)
                    router.refresh()
                }}
            />

            {/* Tasks Modal */}
            <FacebookAccountTasksModal
                isOpen={tasksModalOpen}
                onClose={() => setTasksModalOpen(false)}
                account={selectedAccount}
            />
        </>
    )
}

export default FacebookAccountListTable

const ConnectionCell = ({ account, proxies = [], loading = false }) => {
    const [saving, setSaving] = useState(false)
    const [currentType, setCurrentType] = useState(account?.connection_type || 'wifi')
    const currentProxyId = account?.proxy?.id ? String(account.proxy.id) : ''

    const onChangeProxy = async (val) => {
        if (saving) return
        if (String(val) === currentProxyId) return
        setSaving(true)
        try {
            const res = await updateFacebookAccountProxy(account.id, val)
            if (res?.success) {
                toast.push(<Notification title="Thành công" type="success">Đã cập nhật proxy</Notification>)
            } else {
                toast.push(<Notification title="Lỗi" type="danger">{res?.message || 'Không thể cập nhật proxy'}</Notification>)
            }
        } catch (e) {
            toast.push(<Notification title="Lỗi" type="danger">{e.message}</Notification>)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex items-center gap-3">
            <FacebookConnectionTypeToggle account={account} onUpdate={(_, type)=>setCurrentType(type)} />
            {currentType !== '4g' && (
                <div className="w-56">
                    <Select
                        size="sm"
                        placeholder="Chọn proxy"
                        loading={loading}
                        options={proxies}
                        value={currentProxyId ? { value: currentProxyId, label: proxies.find(p=>p.value===currentProxyId)?.label || 'Đang tải...' } : null}
                        onChange={(opt) => onChangeProxy(opt?.value || '')}
                        disabled={saving}
                    />
                </div>
            )}
        </div>
    )
}

