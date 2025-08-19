import { create } from 'zustand'

export const initialFilterData = {
    name: '',
    host: '',
    status: '',
}

const initialState = {
    initialLoading: true,
    proxyList: [],
    stats: {},
    filterData: initialFilterData,
    selectedProxy: [],
    isFormOpen: false,
    isImportFormOpen: false,
    formMode: 'add',
    editingProxy: null,
    selectedProxyForForm: null,
}

export const useProxyListStore = create((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setSelectedProxy: (checked, row) =>
        set((state) => {
            const prevData = state.selectedProxy
            if (checked) {
                return { selectedProxy: [...prevData, ...[row]] }
            } else {
                if (
                    prevData.some((prevProxy) => row.id === prevProxy.id)
                ) {
                    return {
                        selectedProxy: prevData.filter(
                            (prevProxy) => prevProxy.id !== row.id,
                        ),
                    }
                }
                return { selectedProxy: prevData }
            }
        }),
    setSelectAllProxy: (row) => set(() => ({ selectedProxy: row })),
    setProxyList: (proxyList) => set(() => ({ proxyList })),
    setStats: (stats) => set(() => ({ stats })),
    setInitialLoading: (payload) => set(() => ({ initialLoading: payload })),
    openForm: (mode, proxy) => set(() => ({ isFormOpen: true, formMode: mode, editingProxy: proxy, selectedProxyForForm: proxy })),
    closeForm: () => set(() => ({ isFormOpen: false, editingProxy: null, selectedProxyForForm: null })),
    openImportForm: () => set(() => ({ isImportFormOpen: true })),
    closeImportForm: () => set(() => ({ isImportFormOpen: false })),
}))
