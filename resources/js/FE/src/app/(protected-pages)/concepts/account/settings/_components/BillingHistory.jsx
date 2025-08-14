'use client'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table'
import { NumericFormat } from 'react-number-format'
import dayjs from 'dayjs'
import { Spinner } from '@/components/ui'
import { useTranslations } from 'next-intl'

const { Tr, Th, Td, THead, TBody } = Table

const BillingHistory = ({ data = [], loading, ...rest }) => {
    const t = useTranslations('account.settings.billing')

    const statusColor = {
        completed: 'bg-emerald-500',
        pending: 'bg-amber-400',
        failed: 'bg-red-500',
    }
    
    const columnHelper = createColumnHelper()
    
    const columns = [
        columnHelper.accessor('id', {
            header: t('id'),
        }),
        columnHelper.accessor('type', {
            header: t('type'),
            cell: (props) => <span className="capitalize">{props.row.original.type}</span>
        }),
        columnHelper.accessor('description', {
            header: t('description'),
        }),
        columnHelper.accessor('status', {
            header: t('status'),
            cell: (props) => {
                const row = props.row.original
                return (
                    <div className="flex items-center gap-2">
                        <Badge className={statusColor[row.status]} />
                        <span className="heading-text font-bold capitalize">
                            {t(row.status)}
                        </span>
                    </div>
                )
            },
        }),
        columnHelper.accessor('created_at', {
            header: t('date'),
            cell: (props) => {
                const row = props.row.original
                return (
                    <div className="flex items-center">
                        {dayjs(row.created_at).format('MM/DD/YYYY')}
                    </div>
                )
            },
        }),
        columnHelper.accessor('amount', {
            header: t('amount'),
            cell: (props) => {
                const row = props.row.original
                return (
                    <div className="flex items-center">
                        <NumericFormat
                            displayType="text"
                            value={(Math.round(row.amount * 100) / 100).toFixed(2)}
                            prefix={'$'}
                            thousandSeparator={true}
                        />
                    </div>
                )
            },
        }),
    ]
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div {...rest}>
            <Table>
                <THead className="bg-transparent!">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <Th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </Th>
                                )
                            })}
                        </Tr>
                    ))}
                </THead>
                {loading && (
                    <TBody>
                        <Tr>
                            <Td colSpan={columns.length} className="text-center">
                                <Spinner size="lg" />
                            </Td>
                        </Tr>
                    </TBody>
                )}
                {!loading && (
                    <TBody>
                        {table.getRowModel().rows.map((row) => {
                            return (
                                <Tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <Td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </Td>
                                        )
                                    })}
                                </Tr>
                            )
                        })}
                    </TBody>
                )}
            </Table>
        </div>
    )
}

export default BillingHistory
