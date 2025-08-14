import { create } from 'zustand'

export const initialFilterData = {
    type: '',
    user_id: '',
    status: '',
}

const initialState = {
    initialLoading: true,
    transactionList: [],
    filterData: initialFilterData,
    selectedTransaction: [],
}

export const useTransactionListStore = create((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setSelectedTransaction: (checked, row) =>
        set((state) => {
            const prevData = state.selectedTransaction
            if (checked) {
                return { selectedTransaction: [...prevData, ...[row]] }
            } else {
                if (
                    prevData.some((prevTransaction) => row.id === prevTransaction.id)
                ) {
                    return {
                        selectedTransaction: prevData.filter(
                            (prevTransaction) => prevTransaction.id !== row.id,
                        ),
                    }
                }
                return { selectedTransaction: prevData }
            }
        }),
    setSelectAllTransaction: (row) => set(() => ({ selectedTransaction: row })),
    setTransactionList: (transactionList) => set(() => ({ transactionList })),
    setInitialLoading: (payload) => set(() => ({ initialLoading: payload })),
}))
