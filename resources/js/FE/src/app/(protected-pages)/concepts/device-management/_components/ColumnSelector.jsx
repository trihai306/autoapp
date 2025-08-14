'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Tooltip from '@/components/ui/Tooltip'
import { HiOutlineViewBoards as Columns, HiOutlineX as X } from 'react-icons/hi'

const ColumnSelector = ({ columns = [], selectableColumns = [], onColumnToggle }) => {
    const [isOpen, setIsOpen] = useState(false)

    const visibleColumns = columns.map(col => col.accessorKey)

    return (
        <div className="relative">
            <Tooltip title="Cột hiển thị">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-gray-600 dark:text-gray-400 !px-2"
                    aria-label="Cột hiển thị"
                >
                    <Columns className="w-4 h-4" />
                </Button>
            </Tooltip>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                    Chọn cột hiển thị
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {selectableColumns.map((column) => (
                                    <div key={column.accessorKey} className="flex items-center">
                                        <Checkbox
                                            checked={visibleColumns.includes(column.accessorKey)}
                                            onChange={(checked) => onColumnToggle(column.accessorKey)}
                                        >
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {column.header}
                                            </span>
                                        </Checkbox>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default ColumnSelector
