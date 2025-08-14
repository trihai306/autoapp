'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { HiOutlineX, HiOutlineSearch, HiOutlinePlus } from 'react-icons/hi'
import { useContentManagementStore } from '../_store/contentManagementStore'
import ContentItem from './ContentItem'
import ContentItemSkeleton from './ContentItemSkeleton'

const ContentSidebar = () => {
    const {
        isContentSidebarOpen,
        selectedContentGroup,
        contents,
        contentsLoading,
        closeSidebar,
        setCreateContentModalOpen,
    } = useContentManagementStore()

    const [searchTerm, setSearchTerm] = useState('')

    // Filter contents based on search term
    const filteredContents = contents.filter(content =>
        content.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className={`fixed right-0 top-0 h-full w-96 bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 shadow-2xl border-l border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm z-50 transform transition-all duration-700 ease-out ${
            isContentSidebarOpen && selectedContentGroup ? 'translate-x-0 animate-slide-in-right' : 'translate-x-full'
        }`}>
            <div className="flex flex-col h-full">
                {/* Header with enhanced design */}
                <div className="relative p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-transparent via-gray-50/30 to-transparent dark:via-gray-800/30">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-transparent to-gray-100/30 dark:from-gray-800/30 dark:to-gray-700/30 opacity-50"></div>
                    
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 text-white rounded-lg shadow-sm">
                                    <HiOutlineSearch className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {selectedContentGroup?.name || 'Chọn nhóm content'}
                                    </h2>
                                    {selectedContentGroup && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            ID: {selectedContentGroup.id}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<HiOutlineX />}
                                onClick={closeSidebar}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                            />
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Tìm kiếm content..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    prefix={<HiOutlineSearch className="text-gray-400" />}
                                    size="sm"
                                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:border-primary/50 focus:ring-primary/25"
                                />
                            </div>
                            {selectedContentGroup && (
                                <Button
                                    variant="solid"
                                    size="sm"
                                    icon={<HiOutlinePlus />}
                                    onClick={() => setCreateContentModalOpen(true)}
                                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 dark:from-gray-500 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    Thêm
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto">
                    {!selectedContentGroup ? (
                        <div className="text-center py-12 px-6">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <HiOutlineSearch className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                Chọn nhóm content
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Click vào một nhóm content bên trái để xem danh sách nội dung và bắt đầu quản lý
                            </p>
                            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                                <p className="text-xs text-primary font-medium">
                                    💡 Mẹo: Bạn có thể tạo nhóm content mới bằng nút "Tạo nhóm mới"
                                </p>
                            </div>
                        </div>
                    ) : contentsLoading ? (
                        <div className="p-4 space-y-3">
                            {Array.from({ length: 5 }, (_, index) => (
                                <div
                                    key={index}
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                    }}
                                    className="animate-fade-in"
                                >
                                    <ContentItemSkeleton />
                                </div>
                            ))}
                        </div>
                    ) : filteredContents.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                {searchTerm ? (
                                    <HiOutlineSearch className="w-8 h-8 text-gray-400" />
                                ) : (
                                    <HiOutlinePlus className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                {searchTerm ? 'Không tìm thấy content' : 'Chưa có content nào'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                                {searchTerm 
                                    ? `Không có content nào chứa "${searchTerm}". Thử tìm kiếm với từ khóa khác.`
                                    : 'Nhóm này chưa có content nào. Hãy thêm content đầu tiên để bắt đầu!'
                                }
                            </p>
                            {!searchTerm && (
                                <div className="space-y-3">
                                    <Button
                                        variant="solid"
                                        size="sm"
                                        icon={<HiOutlinePlus />}
                                        onClick={() => setCreateContentModalOpen(true)}
                                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 dark:from-gray-500 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        Thêm content đầu tiên
                                    </Button>
                                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                            ✨ Sử dụng "Bulk Input" để thêm nhiều content cùng lúc!
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                            {filteredContents.map((content, index) => (
                                <div
                                    key={content.id}
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                    }}
                                    className="animate-fade-in"
                                >
                                    <ContentItem
                                        content={content}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        {filteredContents.length} / {contents.length} content
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContentSidebar
