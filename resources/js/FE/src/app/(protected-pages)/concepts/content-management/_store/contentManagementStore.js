import { create } from 'zustand'

export const initialFilterData = {
    name: '',
    user_id: '',
}

export const initialContentFilterData = {
    title: '',
    content_group_id: '',
}

const initialState = {
    // Loading states
    initialLoading: true,
    contentGroupsLoading: false,
    contentsLoading: false,
    
    // Data
    contentGroups: [],
    contents: [],
    selectedContentGroup: null,
    
    // Filters
    filterData: initialFilterData,
    contentFilterData: initialContentFilterData,
    
    // Selection
    selectedContentGroups: [],
    selectedContents: [],
    
    // UI states
    isContentSidebarOpen: false,
    isCreateGroupModalOpen: false,
    isCreateContentModalOpen: false,
    isEditGroupModalOpen: false,
    isEditContentModalOpen: false,
    editingGroup: null,
    editingContent: null,
}

export const useContentManagementStore = create((set, get) => ({
    ...initialState,
    
    // Filter actions
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setContentFilterData: (payload) => set(() => ({ contentFilterData: payload })),
    
    // Content Group actions
    setContentGroups: (contentGroups) => set(() => ({ contentGroups })),
    setContentGroupsLoading: (loading) => set(() => ({ contentGroupsLoading: loading })),
    setSelectedContentGroup: (group) => set(() => ({ 
        selectedContentGroup: group,
        isContentSidebarOpen: !!group,
        contents: group ? [] : get().contents // Clear contents when changing group
    })),
    
    // Content actions
    setContents: (contents) => set(() => ({ contents })),
    setContentsLoading: (loading) => set(() => ({ contentsLoading: loading })),
    
    // Selection actions
    setSelectedContentGroups: (checked, row) =>
        set((state) => {
            const prevData = state.selectedContentGroups
            if (checked) {
                return { selectedContentGroups: [...prevData, row] }
            } else {
                return {
                    selectedContentGroups: prevData.filter(
                        (prevGroup) => prevGroup.id !== row.id,
                    ),
                }
            }
        }),
    setSelectAllContentGroups: (groups) => set(() => ({ selectedContentGroups: groups })),
    
    setSelectedContents: (checked, row) =>
        set((state) => {
            const prevData = state.selectedContents
            if (checked) {
                return { selectedContents: [...prevData, row] }
            } else {
                return {
                    selectedContents: prevData.filter(
                        (prevContent) => prevContent.id !== row.id,
                    ),
                }
            }
        }),
    setSelectAllContents: (contents) => set(() => ({ selectedContents: contents })),
    
    // UI actions
    setContentSidebarOpen: (isOpen) => set(() => ({ isContentSidebarOpen: isOpen })),
    setCreateGroupModalOpen: (isOpen) => set(() => ({ isCreateGroupModalOpen: isOpen })),
    setCreateContentModalOpen: (isOpen) => set(() => ({ isCreateContentModalOpen: isOpen })),
    setEditGroupModalOpen: (isOpen, group = null) => set(() => ({ 
        isEditGroupModalOpen: isOpen,
        editingGroup: group
    })),
    setEditContentModalOpen: (isOpen, content = null) => set(() => ({ 
        isEditContentModalOpen: isOpen,
        editingContent: content
    })),
    
    // Loading actions
    setInitialLoading: (payload) => set(() => ({ initialLoading: payload })),
    
    // Reset actions
    resetSelection: () => set(() => ({ 
        selectedContentGroups: [],
        selectedContents: []
    })),
    resetFilters: () => set(() => ({ 
        filterData: initialFilterData,
        contentFilterData: initialContentFilterData
    })),
    closeSidebar: () => set(() => ({ 
        isContentSidebarOpen: false,
        selectedContentGroup: null,
        contents: []
    })),
}))
