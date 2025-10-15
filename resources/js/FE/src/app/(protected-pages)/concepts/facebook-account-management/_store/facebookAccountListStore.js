import { create } from 'zustand'

export const initialFilterData = {
    username: '',
    email: '',
    phone_number: '',
    status: '',
    connection_type: '',
    proxy_status: '',
}

const initialState = {
    initialLoading: true,
    facebookAccountList: [],
    filterData: initialFilterData,
    selectedFacebookAccount: [],
}

export const useFacebookAccountListStore = create((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setSelectedFacebookAccount: (checked, row) =>
        set((state) => {
            const prevData = state.selectedFacebookAccount
            if (checked) {
                return { selectedFacebookAccount: [...prevData, ...[row]] }
            } else {
                if (
                    prevData.some((prevFacebookAccount) => row.id === prevFacebookAccount.id)
                ) {
                    return {
                        selectedFacebookAccount: prevData.filter(
                            (prevFacebookAccount) => prevFacebookAccount.id !== row.id,
                        ),
                    }
                }
                return { selectedFacebookAccount: prevData }
            }
        }),
    setSelectAllFacebookAccount: (row) => set(() => ({ selectedFacebookAccount: row })),
    setFacebookAccountList: (facebookAccountList) => set(() => ({ facebookAccountList })),
    setInitialLoading: (payload) => set(() => ({ initialLoading: payload })),
}))
