'use client'
import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { 
    HiOutlinePlay as Play,
    HiOutlineX as Square,
    HiOutlineLightningBolt as Zap
} from 'react-icons/hi'

const QuickActions = ({ selectedAccounts = [], onAction, loading = false }) => {
    const handleAction = async (actionType) => {
        await onAction?.(actionType)
    }

    const quickActions = [
        {
            id: 'start',
            label: 'Bắt đầu',
            icon: Play,
            color: 'bg-green-500 hover:bg-green-600',
            description: 'Khởi động kịch bản cho tài khoản đã chọn'
        },
        {
            id: 'stop',
            label: 'Dừng',
            icon: Square,
            color: 'bg-red-500 hover:bg-red-600',
            description: 'Dừng hoàn toàn tất cả tác vụ'
        }
    ]

    return (
        <Card>
            <div className="p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm lg:text-base">
                        Thao tác nhanh
                    </h3>
                    {selectedAccounts.length > 0 && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                            {selectedAccounts.length}
                        </span>
                    )}
                </div>
                
                {/* Horizontal layout for desktop, vertical for mobile */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {quickActions.map((action) => (
                        <Button
                            key={action.id}
                            onClick={() => handleAction(action.id)}
                            disabled={loading || selectedAccounts.length === 0}
                            className={`${action.color} text-white border-0 flex-1 sm:flex-none sm:w-auto flex items-center justify-center gap-3 h-12 rounded-lg transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <action.icon className="w-5 h-5" />
                            <span className="text-sm font-medium">
                                {action.label}
                            </span>
                        </Button>
                    ))}
                </div>
                
                {selectedAccounts.length === 0 && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                        Chọn tài khoản để sử dụng thao tác nhanh
                    </p>
                )}
            </div>
        </Card>
    )
}

export default QuickActions
