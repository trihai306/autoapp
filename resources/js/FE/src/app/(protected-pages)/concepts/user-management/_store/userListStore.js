import { create } from 'zustand'

export const initialFilterData = {
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    status: '',
}

const initialState = {
    initialLoading: true,
    userList: [],
    filterData: initialFilterData,
    selectedUser: [],
}

export const useUserListStore = create((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setSelectedUser: (checked, row) =>
        set((state) => {
            const prevData = state.selectedUser
            if (checked) {
                return { selectedUser: [...prevData, ...[row]] }
            } else {
                if (
                    prevData.some((prevUser) => row.id === prevUser.id)
                ) {
                    return {
                        selectedUser: prevData.filter(
                            (prevUser) => prevUser.id !== row.id,
                        ),
                    }
                }
                return { selectedUser: prevData }
            }
        }),
    setSelectAllUser: (row) => set(() => ({ selectedUser: row })),
    setUserList: (userList) => set(() => ({ userList })),
    setInitialLoading: (payload) => set(() => ({ initialLoading: payload })),
}))
