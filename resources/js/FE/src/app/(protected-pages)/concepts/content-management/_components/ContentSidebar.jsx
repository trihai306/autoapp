'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { HiOutlineX, HiOutlineSearch, HiOutlinePlus, HiOutlineDocumentText } from 'react-icons/hi'
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
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.content.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <>
            {/* Backdrop */}
            {isContentSidebarOpen && selectedContentGroup && (
                <div 
                    className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
                    onClick={closeSidebar}
                />
            )}
            
            {/* Sidebar */}
            <div className={`fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 z-50 transform transition-all duration-300 ease-out ${
                isContentSidebarOpen && selectedContentGroup ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg">
                                    <HiOutlineDocumentText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {selectedContentGroup?.name || 'Chọn nhóm content'}
                                    </h2>
                                    {selectedContentGroup && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {contents.length} content
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<HiOutlineX />}
                                onClick={closeSidebar}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            />
                        </div>
                        
                        {/* Search */}
                        <div className="flex items-center space-x-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Tìm kiếm content..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    prefix={<HiOutlineSearch className="text-gray-400" />}
                                    size="sm"
                                    className="w-full"
                                />
                            </div>
                            {selectedContentGroup && (
                                <Button
                                    variant="solid"
                                    size="sm"
                                    icon={<HiOutlinePlus />}
                                    onClick={() => setCreateContentModalOpen(true)}
                                    className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-gray-800"
                                >
                                    Thêm
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="flex-1 overflow-y-auto">
                        {!selectedContentGroup ? (
                            <div className="text-center py-16 px-6">
                                <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-5">
                                    <HiOutlineDocumentText className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                    Chọn nhóm content
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Click vào một nhóm content bên trái để xem danh sách nội dung
                                </p>
                            </div>
                        ) : contentsLoading ? (
                            <div className="p-5 space-y-4">
                                {Array.from({ length: 5 }, (_, index) => (
                                    <ContentItemSkeleton key={index} />
                                ))}
                            </div>
                        ) : filteredContents.length === 0 ? (
                            <div className="text-center py-16 px-6">
                                <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-5">
                                    {searchTerm ? (
                                        <HiOutlineSearch className="w-10 h-10 text-gray-400" />
                                    ) : (
                                        <HiOutlinePlus className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                    {searchTerm ? 'Không tìm thấy content' : 'Chưa có content nào'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                                    {searchTerm 
                                        ? `Không có content nào chứa "${searchTerm}"`
                                        : 'Hãy thêm content đầu tiên để bắt đầu!'
                                    }
                                </p>
                                {!searchTerm && (
                                    <Button
                                        variant="solid"
                                        size="sm"
                                        icon={<HiOutlinePlus />}
                                        onClick={() => setCreateContentModalOpen(true)}
                                        className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-gray-800"
                                    >
                                        Thêm content đầu tiên
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="p-5 space-y-4">
                                {filteredContents.map((content, index) => (
                                    <ContentItem
                                        key={content.id}
                                        content={content}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                            {filteredContents.length} / {contents.length} content
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ContentSidebar
