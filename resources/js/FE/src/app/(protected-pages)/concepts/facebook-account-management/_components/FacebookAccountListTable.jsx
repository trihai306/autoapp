'use client'
import React, { useMemo, useRef } from 'react'
import DataTable from '@/components/shared/DataTable'
import FacebookConnectionTypeToggle from './FacebookConnectionTypeToggle'
import Select from '@/components/ui/Select'
import updateFacebookAccountProxy from '@/server/actions/facebook-account/updateFacebookAccountProxy'
import { useState } from 'react'
import { useFacebookAccountData } from './FacebookAccountDataManager'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { TbEye, TbEdit, TbTrash, TbPlayerPlay, TbPlayerStop, TbList, TbSettings, TbDeviceMobile } from 'react-icons/tb'
import FacebookAccountViewModal from './FacebookAccountViewModal'
import FacebookAccountEditModal from './FacebookAccountEditModal'
import FacebookAccountTasksModal from './FacebookAccountTasksModal'
import FacebookAccountScenarioModal from './FacebookAccountScenarioModal'
import FacebookAccountStatusToggle from './FacebookAccountStatusToggle'
import FacebookAccountStatusDisplayOptimized from './FacebookAccountStatusDisplayOptimized'
import deleteFacebookAccount from '@/server/actions/facebook-account/deleteFacebookAccount'
import FacebookAccountBulkActionBar from './FacebookAccountBulkActionBar'
import { useFacebookAccountListStore } from '../_store'

const FacebookAccountListTable = ({
    list = [],
    total = 0,
    page = 1,
    per_page = 10,
    proxyOptions = [{ value: '', label: 'Không sử dụng proxy' }],
    loadingProxies = false
}) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [tasksModalOpen, setTasksModalOpen] = useState(false)
    const [scenarioModalOpen, setScenarioModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deletingAccount, setDeletingAccount] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Proxy options are now passed from parent component

    const dataTableRef = useRef(null)

    const selectedFacebookAccount = useFacebookAccountListStore((state) => state.selectedFacebookAccount)
    const setSelectedFacebookAccount = useFacebookAccountListStore((state) => state.setSelectedFacebookAccount)
    const setSelectAllFacebookAccount = useFacebookAccountListStore((state) => state.setSelectAllFacebookAccount)

    const checkboxChecked = (row) => selectedFacebookAccount.some((i) => i.id === row.id)
    const indeterminateCheckboxChecked = (rows) => {
        if (!Array.isArray(rows)) return false
        if (rows.length === 0) return false
        const all = rows.every((r) => selectedFacebookAccount.some((i) => i.id === r.original.id))
        return all
    }

    const handleRowCheckBoxChange = (checked, row) => {
        setSelectedFacebookAccount(checked, row)
    }

    const handleHeaderIndeterminateChange = (checked, rows) => {
        const payload = checked ? rows.map((r) => r.original) : []
        setSelectAllFacebookAccount(payload)
    }

    const handleDeleteAccount = async () => {
        if (!deletingAccount) return

        setIsDeleting(true)
        try {
            const result = await deleteFacebookAccount(deletingAccount.id)
            if (result.success) {
                toast.push(
                    <Notification title="Thành công" type="success">
                        {result.message}
                    </Notification>
                )
                setDeleteModalOpen(false)
                setDeletingAccount(null)
                router.refresh()
            } else {
                toast.push(
                    <Notification title="Lỗi" type="danger">
                        {result.message}
                    </Notification>
                )
            }
        } catch (error) {
            toast.push(
                <Notification title="Lỗi" type="danger">
                    {error.message || 'Có lỗi xảy ra khi xóa tài khoản'}
                </Notification>
            )
        } finally {
            setIsDeleting(false)
        }
    }

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
            header: 'Tài khoản',
            accessorKey: 'username',
            enableSorting: true,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-gray-100 font-medium">{row.original.username}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{row.original.email || '-'}</span>
                </div>
            ),
        },
        {
            header: 'Thiết bị & Kịch bản',
            accessorKey: 'device_scenario',
            minSize: 240,
            enableSorting: false,
            cell: ({ row }) => {
                const account = row.original
                const deviceName = account.device?.name || account.device?.device_name || '-'
                const scenarioName = account.interaction_scenario?.name || account.interactionScenario?.name || '-'
                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <TbDeviceMobile className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{deviceName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TbSettings className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                                {scenarioName}
                            </span>
                        </div>
                    </div>
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
                return <ConnectionCell account={account} proxies={proxyOptions} loading={loadingProxies} />
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
                const onScenario = () => {
                    setSelectedAccount(account)
                    setScenarioModalOpen(true)
                }
                const handleStatusChange = () => {
                    router.refresh()
                }
                const onDelete = () => {
                    setDeletingAccount(account)
                    setDeleteModalOpen(true)
                }

                return (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="p-1" onClick={onView} title="Xem chi tiết">
                            <TbEye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="p-1" onClick={onEdit} title="Chỉnh sửa">
                            <TbEdit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="p-1" onClick={onTasks} title="Xem tasks">
                            <TbList className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="p-1" onClick={onScenario} title="Kịch bản">
                            <TbSettings className="w-4 h-4" />
                        </Button>
                        <FacebookAccountStatusToggle
                            account={account}
                            onStatusChange={handleStatusChange}
                        />
                        <Button variant="outline" size="sm" className="p-1" onClick={onDelete} title="Xóa">
                            <TbTrash className="w-4 h-4" />
                        </Button>
                    </div>
                )
            },
        },
    ], [proxyOptions])

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
            {selectedFacebookAccount.length > 0 && (
                <FacebookAccountBulkActionBar
                    selected={selectedFacebookAccount}
                    onDone={() => {
                        // reset selection sau khi thao tác
                        setSelectAllFacebookAccount([])
                        dataTableRef.current?.resetSelected?.()
                        router.refresh()
                    }}
                />
            )}
            <DataTable
                ref={dataTableRef}
                columns={columns}
                data={list}
                pagingData={{ pageIndex: Number(page), pageSize: Number(per_page), total: Number(total) }}
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                noData={list.length === 0}
                className="min-w-full"
                selectable
                checkboxChecked={checkboxChecked}
                onCheckBoxChange={handleRowCheckBoxChange}
                indeterminateCheckboxChecked={indeterminateCheckboxChecked}
                onIndeterminateCheckBoxChange={handleHeaderIndeterminateChange}
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

            {/* Scenario Modal */}
            <FacebookAccountScenarioModal
                isOpen={scenarioModalOpen}
                onClose={() => setScenarioModalOpen(false)}
                account={selectedAccount}
                onDataChange={() => router.refresh()}
            />


            {/* Delete Confirmation Modal */}
            <Dialog
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onRequestClose={() => setDeleteModalOpen(false)}
                width={500}
                className="z-[70]"
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <TbTrash className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Xác nhận xóa tài khoản
                        </h3>
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Bạn có chắc chắn muốn xóa tài khoản Facebook <strong>"{deletingAccount?.username}"</strong>?
                        </p>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <TbTrash className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Cảnh báo</h4>
                                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                                        <li>• Tất cả tasks đang chạy sẽ bị dừng</li>
                                        <li>• Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn</li>
                                        <li>• Hành động này không thể hoàn tác</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteModalOpen(false)
                                setDeletingAccount(null)
                            }}
                            disabled={isDeleting}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="solid"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDeleteAccount}
                            loading={isDeleting}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xóa tài khoản'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default FacebookAccountListTable

const ConnectionCell = ({ account, proxies = [], loading = false }) => {
    const [saving, setSaving] = useState(false)
    const [currentType, setCurrentType] = useState(account?.connection_type || 'wifi')
    const [currentProxyId, setCurrentProxyId] = useState(account?.proxy?.id ? String(account.proxy.id) : '')

    // ConnectionCell component for managing account connection settings
    console.log('🔍 ConnectionCell received proxies:', proxies.length, proxies)

    const onChangeProxy = async (val) => {
        if (saving) return
        if (String(val) === currentProxyId) return
        setSaving(true)
        try {
            const res = await updateFacebookAccountProxy(account.id, val)
            if (res?.success || (res?.id && res?.username)) {
                setCurrentProxyId(String(val))
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
                    {console.log('🔍 Select props:', { loading, proxiesCount: proxies.length, currentProxyId })}
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

