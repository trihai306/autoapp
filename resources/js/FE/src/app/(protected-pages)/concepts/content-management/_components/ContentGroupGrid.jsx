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
            {/* Search Bar with enhanced styling */}
            <div className="flex items-center justify-between">
                <div className="flex-1 max-w-lg">
                    <Input
                        placeholder="Tìm kiếm nhóm content..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        prefix={<HiOutlineSearch className="text-gray-400" />}
                        className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:border-primary/50 focus:ring-primary/25 shadow-sm"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20">
                        <span className="text-sm font-medium text-primary">
                            {filteredGroups.length} nhóm content
                        </span>
                    </div>
                </div>
            </div>

            {/* Enhanced Empty State */}
            {filteredGroups.length === 0 && (
                <div className="text-center py-16 animate-fade-in">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center mb-8 shadow-lg animate-bounce-in">
                        <HiOutlineSearch className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {searchTerm ? 'Không tìm thấy nhóm content' : 'Chưa có nhóm content nào'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                        {searchTerm 
                            ? `Không có nhóm content nào chứa "${searchTerm}". Thử tìm kiếm với từ khóa khác hoặc tạo nhóm content mới.`
                            : 'Bắt đầu hành trình quản lý content của bạn bằng cách tạo nhóm content đầu tiên!'
                        }
                    </p>
                    {!searchTerm && (
                        <div className="space-y-4">
                            <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl border border-primary/20 max-w-md mx-auto">
                                <p className="text-sm text-primary font-medium mb-2">
                                    🚀 Bắt đầu ngay
                                </p>
                                <p className="text-xs text-primary/80">
                                    Click nút "Tạo nhóm mới" ở góc trên bên phải để tạo nhóm content đầu tiên
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Content Groups Grid with stagger animations */}
            {filteredGroups.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredGroups.map((group, index) => (
                        <div
                            key={group.id}
                            style={{
                                animationDelay: `${index * 150}ms`,
                            }}
                            className="stagger-item hover-lift"
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
