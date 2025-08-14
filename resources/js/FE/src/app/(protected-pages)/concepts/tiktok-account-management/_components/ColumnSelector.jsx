'use client'
import { useMemo } from 'react'
import Dropdown from '@/components/ui/Dropdown'
import Checkbox from '@/components/ui/Checkbox'
import { TbColumnInsertLeft, TbColumnInsertRight } from 'react-icons/tb'
import { useTranslations } from 'next-intl'

const ColumnSelector = ({ columns = [], selectableColumns = [], onColumnToggle }) => {
    const t = useTranslations('tiktokAccountManagement')
    
    const selectableColumn = useMemo(() => {
        return selectableColumns.map(column => ({
            ...column,
            checked: columns.some(c => c.accessorKey === column.accessorKey)
        }))
    }, [columns, selectableColumns])

    return (
        <Dropdown
            placement="bottom-end"
            renderTitle={
                <div className="flex items-center gap-2 cursor-pointer select-none">
                    <span>{t('columns')}</span>
                    <TbColumnInsertRight />
                </div>
            }
        >
            {selectableColumn.map((column) => (
                <Dropdown.Item key={column.accessorKey} variant="header" className="my-1">
                    <Checkbox
                        checked={column.checked}
                        onChange={() => onColumnToggle(column.accessorKey)}
                    >
                        {column.header}
                    </Checkbox>
                </Dropdown.Item>
            ))}
        </Dropdown>
    )
}

export default ColumnSelector 