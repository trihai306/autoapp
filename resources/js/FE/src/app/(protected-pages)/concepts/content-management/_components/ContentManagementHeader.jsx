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
        <div className="mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Quản lý Content
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Quản lý nhóm content và nội dung một cách dễ dàng
                    </p>
                </div>
                
                <div className="flex items-center space-x-3">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<HiOutlineRefresh />}
                        onClick={onRefresh}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        Làm mới
                    </Button>
                    
                    {selectedContentGroup && (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiOutlinePlus />}
                            onClick={() => setCreateContentModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Thêm Content
                        </Button>
                    )}
                    
                    <Button
                        variant="solid"
                        size="sm"
                        icon={<HiOutlinePlus />}
                        onClick={() => setCreateGroupModalOpen(true)}
                        className="bg-primary hover:bg-primary-dark"
                    >
                        Tạo nhóm mới
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ContentManagementHeader
