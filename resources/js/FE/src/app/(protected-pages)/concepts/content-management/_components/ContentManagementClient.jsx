'use client'

import { useEffect } from 'react'
import Container from '@/components/shared/Container'
import { useContentManagementStore } from '../_store/contentManagementStore'
import getContentGroups from '@/server/actions/content/getContentGroups'
import ContentGroupGrid from './ContentGroupGrid'
import ContentGroupGridSkeleton from './ContentGroupGridSkeleton'
import ContentSidebar from './ContentSidebar'
import CreateContentGroupModal from './CreateContentGroupModal'
import CreateContentModal from './CreateContentModal'
import EditContentGroupModal from './EditContentGroupModal'
import EditContentModal from './EditContentModal'
import ContentManagementHeader from './ContentManagementHeader'
import '@/styles/content-management-animations.css'

const ContentManagementClient = () => {
    const {
        initialLoading,
        contentGroups,
        isContentSidebarOpen,
        isCreateGroupModalOpen,
        isCreateContentModalOpen,
        isEditGroupModalOpen,
        isEditContentModalOpen,
        setContentGroups,
        setInitialLoading,
        setContentGroupsLoading,
    } = useContentManagementStore()

    const fetchContentGroups = async () => {
        try {
            setContentGroupsLoading(true)
            const response = await getContentGroups()
            if (response.success && response.data) {
                setContentGroups(response.data.data || response.data)
            }
        } catch (error) {
            console.error('Error fetching content groups:', error)
        } finally {
            setContentGroupsLoading(false)
            setInitialLoading(false)
        }
    }

    useEffect(() => {
        fetchContentGroups()
    }, [])

    const handleRefresh = () => {
        fetchContentGroups()
    }

    if (initialLoading) {
        return (
            <Container className="h-full">
                <div className="flex flex-col h-full">
                    {/* Header Skeleton */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                                <div className="h-4 w-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Content Skeleton */}
                    <div className="flex-1 flex relative">
                        <div className="flex-1">
                            <ContentGroupGridSkeleton count={8} />
                        </div>
                    </div>
                </div>
            </Container>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px] opacity-20"></div>
            
            <Container className="relative h-full">
                <div className="flex flex-col h-full">
                    {/* Header with animation */}
                    <div className="animate-fade-in">
                        <ContentManagementHeader onRefresh={handleRefresh} />
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 flex relative">
                        {/* Content Groups Grid */}
                        <div className={`flex-1 transition-all duration-500 ease-out ${
                            isContentSidebarOpen ? 'mr-96' : ''
                        }`}>
                            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                                <ContentGroupGrid 
                                    contentGroups={contentGroups}
                                    onRefresh={handleRefresh}
                                />
                            </div>
                        </div>
                        
                        {/* Sidebar backdrop */}
                        {isContentSidebarOpen && (
                            <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 animate-fade-in" />
                        )}
                        
                        {/* Content Sidebar */}
                        <ContentSidebar />
                    </div>
                </div>
                
                {/* Modals */}
                {isCreateGroupModalOpen && (
                    <CreateContentGroupModal onSuccess={handleRefresh} />
                )}
                {isCreateContentModalOpen && (
                    <CreateContentModal onSuccess={handleRefresh} />
                )}
                {isEditGroupModalOpen && (
                    <EditContentGroupModal onSuccess={handleRefresh} />
                )}
                {isEditContentModalOpen && (
                    <EditContentModal onSuccess={handleRefresh} />
                )}
            </Container>
        </div>
    )
}

export default ContentManagementClient
