'use client'

import { Button } from '@/components/ui'
import { HiOutlinePlus, HiOutlineRefresh } from 'react-icons/hi'
import { useContentManagementStore } from '../_store/contentManagementStore'

const ContentManagementHeader = ({ onRefresh }) => {
    const {
        setCreateGroupModalOpen,
        selectedContentGroup,
        setCreateContentModalOpen,
    } = useContentManagementStore()

    return (
        <div className="mb-8">
            {/* Main Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                        Quản lý Content
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-base">
                        Quản lý nhóm content và nội dung một cách dễ dàng
                    </p>
                </div>
                
                <div className="flex items-center space-x-3">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<HiOutlineRefresh />}
                        onClick={onRefresh}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Làm mới
                    </Button>
                    
                    {selectedContentGroup && (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiOutlinePlus />}
                            onClick={() => setCreateContentModalOpen(true)}
                            className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-gray-800"
                        >
                            Thêm Content
                        </Button>
                    )}
                    
                    <Button
                        variant="solid"
                        size="sm"
                        icon={<HiOutlinePlus />}
                        onClick={() => setCreateGroupModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Tạo nhóm mới
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ContentManagementHeader
