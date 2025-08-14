'use client'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'

const TiktokAccountListPagination = ({
    tiktokAccountListTotal,
    page = 1,
    per_page = 10,
}) => {
    const { onAppendQueryParams } = useAppendQueryParams()

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

    const pageSizeOptions = [
        { value: 10, label: '10 / trang' },
        { value: 20, label: '20 / trang' },
        { value: 30, label: '30 / trang' },
        { value: 50, label: '50 / trang' },
    ]

    return (
        <div className="flex items-center justify-between mt-6 px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <Pagination
                pageSize={per_page}
                currentPage={page}
                total={tiktokAccountListTotal}
                onChange={handlePaginationChange}
            />
            <div style={{ minWidth: 130 }}>
                <Select
                    size="sm"
                    isSearchable={false}
                    instanceId="tiktok-table-page-size-select"
                    value={pageSizeOptions.find(option => option.value === per_page)}
                    options={pageSizeOptions}
                    onChange={(option) => handleSelectChange(option?.value)}
                />
            </div>
        </div>
    )
}

export default TiktokAccountListPagination
