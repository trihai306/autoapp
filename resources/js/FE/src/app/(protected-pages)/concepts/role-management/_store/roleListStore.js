import { create } from 'zustand'

export const initialFilterData = {
    name: '',
}

const initialState = {
    initialLoading: true,
    roleList: [],
    filterData: initialFilterData,
    selectedRole: [],
    isFormOpen: false,
    formMode: 'add',
    selectedRoleForForm: null,
    isFormLoading: false,
}

export const useRoleListStore = create((set, get) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setSelectedRole: (checked, row) =>
        set((state) => {
            const prevData = state.selectedRole
            if (checked) {
                return { selectedRole: [...prevData, row] }
            } else {
                return {
                    selectedRole: prevData.filter(
                        (prevRole) => prevRole.id !== row.id,
                    ),
                }
            }
        }),
    setSelectAllRole: (rows) => set(() => ({ selectedRole: rows })),
    setRoleList: (roleList) => set(() => ({ roleList })),
    setInitialLoading: (payload) => set(() => ({ initialLoading: payload })),
    openForm: async (mode, role) => {
        if (mode === 'edit' && role?.id) {
            // Set loading state
            set(() => ({ 
                isFormOpen: true, 
                formMode: mode, 
                selectedRoleForForm: role,
                isFormLoading: true
            }))
            
            // Fetch full role details including permissions
            try {
                // Import getRole function
                const { default: getRole } = await import('@/server/actions/user/getRole')
                const response = await getRole(role.id)
                
                if (response.success && response.data) {
                    set(() => ({ 
                        isFormOpen: true, 
                        formMode: mode, 
                        selectedRoleForForm: response.data,
                        isFormLoading: false
                    }))
                } else {
                    // Fallback to basic role data
                    set(() => ({ 
                        isFormOpen: true, 
                        formMode: mode, 
                        selectedRoleForForm: role,
                        isFormLoading: false
                    }))
                }
            } catch (error) {
                // Fallback to basic role data
                set(() => ({ 
                    isFormOpen: true, 
                    formMode: mode, 
                    selectedRoleForForm: role,
                    isFormLoading: false
                }))
            }
        } else {
            // For add mode or no role, just open form
            set(() => ({ 
                isFormOpen: true, 
                formMode: mode, 
                selectedRoleForForm: role,
                isFormLoading: false
            }))
        }
    },
    closeForm: () => {
        set(() => ({ isFormOpen: false, selectedRoleForForm: null }))
    },
}))
