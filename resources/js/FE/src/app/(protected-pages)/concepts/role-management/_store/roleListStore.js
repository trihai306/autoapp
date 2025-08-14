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
}

export const useRoleListStore = create((set) => ({
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
    openForm: (mode, role) => set(() => ({ isFormOpen: true, formMode: mode, selectedRoleForForm: role })),
    closeForm: () => set(() => ({ isFormOpen: false, selectedRoleForForm: null })),
}))
