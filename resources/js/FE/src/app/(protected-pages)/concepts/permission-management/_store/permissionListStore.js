import { create } from 'zustand'

export const initialFilterData = {
    name: '',
}

const initialState = {
    initialLoading: true,
    permissionList: [],
    filterData: initialFilterData,
    selectedPermission: [],
    isFormOpen: false,
    formMode: 'add',
    editingPermission: null,
}

export const usePermissionListStore = create((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setSelectedPermission: (checked, row) =>
        set((state) => {
            const prevData = state.selectedPermission
            if (checked) {
                return { selectedPermission: [...prevData, ...[row]] }
            } else {
                if (
                    prevData.some((prevPerm) => row.id === prevPerm.id)
                ) {
                    return {
                        selectedPermission: prevData.filter(
                            (prevPerm) => prevPerm.id !== row.id,
                        ),
                    }
                }
                return { selectedPermission: prevData }
            }
        }),
    setSelectAllPermission: (row) => set(() => ({ selectedPermission: row })),
    setPermissionList: (permissionList) => set(() => ({ permissionList })),
    setInitialLoading: (payload) => set(() => ({ initialLoading: payload })),
    openForm: (mode, permission) => set(() => ({ isFormOpen: true, formMode: mode, editingPermission: permission })),
    closeForm: () => set(() => ({ isFormOpen: false, editingPermission: null })),
}))
