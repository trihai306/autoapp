'use client'
import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Tag from '@/components/ui/Tag'
import DataTable from '@/components/shared/DataTable'
import { useTransactionListStore } from '../_store/transactionListStore'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useRouter } from 'next/navigation'
import TransactionsListTableTools from './TransactionsListTableTools'
import dayjs from 'dayjs'
import cloneDeep from 'lodash/cloneDeep'
import { FaCheck, FaTimes } from 'react-icons/fa'
import Dialog from '@/components/ui/Dialog'
import { useTranslations } from 'next-intl'
import updateTransactionStatus from '@/server/actions/transaction/updateTransactionStatus'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const transactionStatusColor = {
    pending: 'bg-yellow-200 dark:bg-yellow-200 text-gray-900 dark:text-gray-900',
    completed: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    failed: 'bg-rose-200 dark:bg-rose-200 text-gray-900 dark:text-gray-900',
}

const typeColor = {
    deposit: 'bg-emerald-200 dark:bg-emerald-200 text-gray-900 dark:text-gray-900',
    withdrawal: 'bg-amber-200 dark:bg-amber-200 text-gray-900 dark:text-gray-900',
}

const TransactionListTable = ({
    transactionListTotal,
    page = 1,
    per_page = 10,
}) => {
    const transactionList = useTransactionListStore((state) => state.transactionList)
    const selectedTransaction = useTransactionListStore((state) => state.selectedTransaction)
    const isInitialLoading = useTransactionListStore((state) => state.initialLoading)
    const setSelectedTransaction = useTransactionListStore((state) => state.setSelectedTransaction)
    const setSelectAllTransaction = useTransactionListStore((state) => state.setSelectAllTransaction)
    const t = useTranslations('transactionManagement.table')
    const tAction = useTranslations('transactionManagement.actionConfirm')
    const router = useRouter()

    const [dialogIsOpen, setDialogIsOpen] = useState(false)
    const [confirmAction, setConfirmAction] = useState(null)
    const [currentRow, setCurrentRow] = useState(null)

    const { onAppendQueryParams } = useAppendQueryParams()

    const onDialogClose = () => {
        setDialogIsOpen(false)
        setConfirmAction(null)
        setCurrentRow(null)
    }

    const handleAction = async () => {
        if (confirmAction && currentRow) {
            const action = confirmAction.toLowerCase()
            const result = await updateTransactionStatus(currentRow.id, action)

            if (result.success) {
                toast.push(
                    <Notification title="Success" type="success" closable>
                        {result.message}
                    </Notification>
                )
                router.refresh() // Re-fetch data
            } else {
                toast.push(
                    <Notification title="Error" type="danger" closable>
                        {result.message}
                    </Notification>
                )
            }
        }
        onDialogClose()
    }

    const columns = useMemo(
        () => [
            {
                header: t('transactionId'),
                accessorKey: 'id',
            },
            {
                header: t('user'),
                accessorKey: 'user.full_name',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center">
                            <Avatar size={28} shape="circle" src={row.user?.avatar} />
                            <span className="ml-2 rtl:mr-2 font-semibold">
                                {row.user?.full_name}
                            </span>
                        </div>
                    )
                }
            },
            {
                header: t('type'),
                accessorKey: 'type',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center">
                            <Tag className={typeColor[row.type]}>
                                <span className="capitalize">{row.type}</span>
                            </Tag>
                        </div>
                    )
                },
            },
            {
                header: t('amount'),
                accessorKey: 'amount',
                cell: (props) => {
                    const amount = parseFloat(props.row.original.amount)
                    return <span>${!isNaN(amount) ? amount.toFixed(2) : '0.00'}</span>
                }
            },
            {
                header: t('description'),
                accessorKey: 'description',
            },
            {
                header: t('status'),
                accessorKey: 'status',
                cell: (props) => {
                    const { status } = props.row.original
                    return (
                        <div className="flex items-center">
                            <Tag className={transactionStatusColor[status]}>
                                <span className="capitalize">{status}</span>
                            </Tag>
                        </div>
                    )
                },
            },
            {
                header: t('date'),
                accessorKey: 'created_at',
                cell: (props) => {
                    return <span>{dayjs(props.row.original.created_at).format('DD/MM/YYYY')}</span>
                }
            },
            {
                header: t('actions'),
                accessorKey: 'actions',
                cell: (props) => {
                    const row = props.row.original
                    if (row.status !== 'pending') {
                        return null
                    }
                    return (
                        <div className="flex items-center space-x-2">
                            <Button
                                shape="circle"
                                size="sm"
                                variant="solid"
                                className="bg-green-500 hover:bg-green-600"
                                icon={<FaCheck />}
                                onClick={() => {
                                    setDialogIsOpen(true)
                                    setConfirmAction('Approve')
                                    setCurrentRow(row)
                                }}
                            />
                            <Button
                                shape="circle"
                                size="sm"
                                variant="solid"
                                className="bg-red-500 hover:bg-red-600"
                                icon={<FaTimes />}
                                onClick={() => {
                                    setDialogIsOpen(true)
                                    setConfirmAction('Reject')
                                    setCurrentRow(row)
                                }}
                            />
                        </div>
                    )
                }
            }
        ],
        [],
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
        onAppendQueryParams({
            sort: (sort.order === 'desc' ? '-' : '') + sort.key,
        })
    }

    const handleRowSelect = (checked, row) => {
        setSelectedTransaction(checked, row)
    }

    const handleAllRowSelect = (checked, rows) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllTransaction(originalRows)
        } else {
            setSelectAllTransaction([])
        }
    }

    return (
        <div>
            <TransactionsListTableTools />
            <DataTable
                selectable
                columns={columns}
                data={transactionList}
                noData={transactionList.length === 0}
                skeletonAvatarColumns={[1]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
                loading={isInitialLoading}
                pagingData={{
                    total: transactionListTotal,
                    pageIndex: page,
                    pageSize: per_page,
                }}
                checkboxChecked={(row) =>
                    selectedTransaction.some((selected) => selected.id === row.id)
                }
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
                onCheckBoxChange={handleRowSelect}
                onIndeterminateCheckBoxChange={handleAllRowSelect}
            />
            <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h5 className="mb-4">{tAction('title')}</h5>
                <p>
                    {tAction('content', { action: confirmAction?.toLowerCase() })}
                </p>
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        variant="plain"
                        onClick={onDialogClose}
                    >
                        {tAction('cancel')}
                    </Button>
                    <Button variant="solid" onClick={handleAction}>
                        {tAction('confirm')}
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default TransactionListTable
