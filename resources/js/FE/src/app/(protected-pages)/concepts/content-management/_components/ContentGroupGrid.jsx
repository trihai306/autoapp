'use client'

import { useState } from 'react'
import { useContentManagementStore } from '../_store/contentManagementStore'
import ContentGroupCard from './ContentGroupCard'
import ContentGroupGridSkeleton from './ContentGroupGridSkeleton'
import { Input } from '@/components/ui'
import { HiOutlineSearch } from 'react-icons/hi'

const ContentGroupGrid = ({ contentGroups, onRefresh }) => {
    const {
        contentGroupsLoading,
        filterData,
        setFilterData,
    } = useContentManagementStore()

    const [searchTerm, setSearchTerm] = useState('')

    // Filter content groups based on search term
    const filteredGroups = contentGroups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
    }

    if (contentGroupsLoading) {
        return <ContentGroupGridSkeleton count={8} />
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex-1 max-w-md">
                    <Input
                        placeholder="Tìm kiếm nhóm content..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        prefix={<HiOutlineSearch className="text-gray-400" />}
                        className="w-full"
                    />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredGroups.length} nhóm content
                </div>
            </div>

            {/* Empty State */}
            {filteredGroups.length === 0 && (
                <div className="text-center py-16">
                    <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <HiOutlineSearch className="w-8 h-8 text-gray-400" />
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchTerm ? 'Không tìm thấy nhóm content' : 'Chưa có nhóm content nào'}
                    </h3>
                    
                    <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                        {searchTerm 
                            ? `Không có nhóm content nào chứa "${searchTerm}". Thử tìm kiếm với từ khóa khác.`
                            : 'Bắt đầu hành trình quản lý content của bạn bằng cách tạo nhóm content đầu tiên!'
                        }
                    </p>
                </div>
            )}

            {/* Content Groups Grid */}
            {filteredGroups.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredGroups.map((group, index) => (
                        <div
                            key={group.id}
                            style={{
                                animationDelay: `${index * 100}ms`,
                            }}
                            className="animate-fade-in"
                        >
                            <ContentGroupCard
                                group={group}
                                onRefresh={onRefresh}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ContentGroupGrid
