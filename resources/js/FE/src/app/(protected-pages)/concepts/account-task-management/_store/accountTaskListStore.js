import { create } from 'zustand'

export const initialFilterData = {
    task_type: '',
    status: '',
    priority: '',
    tiktok_account_id: '',
}

const initialState = {
    initialLoading: true,
    accountTaskList: [],
    filterData: initialFilterData,
    selectedTasks: [],
}

export const useAccountTaskListStore = create((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setSelectedTasks: (checked, row) =>
        set((state) => {
            const prevData = state.selectedTasks
            if (checked) {
                return { selectedTasks: [...prevData, ...[row]] }
            } else {
                if (
                    prevData.some((prevTask) => row.id === prevTask.id)
                ) {
                    return {
                        selectedTasks: prevData.filter(
                            (prevTask) => prevTask.id !== row.id,
                        ),
                    }
                }
                return { selectedTasks: prevData }
            }
        }),
    setSelectAllTasks: (rows) => set(() => ({ selectedTasks: rows })),
    setAccountTaskList: (accountTaskList) => set(() => ({ accountTaskList })),
    setInitialLoading: (payload) => set(() => ({ initialLoading: payload })),
}))
