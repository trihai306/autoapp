import { create } from 'zustand'

export const initialFilterData = {
    username: '',
    email: '',
    phone_number: '',
    status: '',
}

const initialState = {
    initialLoading: true,
    tiktokAccountList: [],
    filterData: initialFilterData,
    selectedTiktokAccount: [],
}

export const useTiktokAccountListStore = create((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setSelectedTiktokAccount: (checked, row) =>
        set((state) => {
            const prevData = state.selectedTiktokAccount
            if (checked) {
                return { selectedTiktokAccount: [...prevData, ...[row]] }
            } else {
                if (
                    prevData.some((prevTiktokAccount) => row.id === prevTiktokAccount.id)
                ) {
                    return {
                        selectedTiktokAccount: prevData.filter(
                            (prevTiktokAccount) => prevTiktokAccount.id !== row.id,
                        ),
                    }
                }
                return { selectedTiktokAccount: prevData }
            }
        }),
    setSelectAllTiktokAccount: (row) => set(() => ({ selectedTiktokAccount: row })),
    setTiktokAccountList: (tiktokAccountList) => set(() => ({ tiktokAccountList })),
    setInitialLoading: (payload) => set(() => ({ initialLoading: payload })),
})) 