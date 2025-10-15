'use client'
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const FacebookAccountListPagination = ({ total = 0, page = 1, per_page = 10 }) => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const lastPage = Math.max(1, Math.ceil(total / per_page))

    const goTo = (p) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(p))
        params.set('per_page', String(per_page))
        router.push(`?${params.toString()}`)
    }

    const onPerPageChange = (val) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', '1')
        params.set('per_page', String(val))
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
                Tổng: {total}
            </div>
            <div className="flex items-center gap-2">
                <button
                    className="px-3 py-1 text-sm rounded border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                    onClick={() => goTo(Math.max(1, Number(page) - 1))}
                    disabled={Number(page) <= 1}
                >
                    Trước
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    Trang {page} / {lastPage}
                </span>
                <button
                    className="px-3 py-1 text-sm rounded border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                    onClick={() => goTo(Math.min(lastPage, Number(page) + 1))}
                    disabled={Number(page) >= lastPage}
                >
                    Sau
                </button>
                <select
                    className="ml-2 px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    value={String(per_page)}
                    onChange={(e) => onPerPageChange(Number(e.target.value))}
                >
                    {[10, 20, 50, 100].map((n) => (
                        <option key={n} value={n}>{n}/trang</option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default FacebookAccountListPagination


