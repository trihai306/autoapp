import { create } from 'zustand'

export const useDeviceListStore = create((set, get) => ({
    // Device list state
    deviceList: [],
    selectedDevice: [],
    
    // Loading states
    isLoading: false,
    isDeleting: false,
    isUpdating: false,
    
    // Pagination
    currentPage: 1,
    perPage: 10,
    total: 0,
    
    // Filters and search
    searchQuery: '',
    filterData: {},
    filters: {
        status: '',
        device_type: '',
        platform: '',
        is_online: '',
        user_id: ''
    },
    
    // Sorting
    sortBy: 'created_at',
    sortOrder: 'desc',
    
    // Actions
    setDeviceList: (devices) => {
        set({ deviceList: devices })
    },
    
    setSelectedDevice: (devices) => set({ selectedDevice: devices }),
    
    addSelectedDevice: (device) => set((state) => ({
        selectedDevice: [...state.selectedDevice, device]
    })),
    
    removeSelectedDevice: (deviceId) => set((state) => ({
        selectedDevice: state.selectedDevice.filter(device => device.id !== deviceId)
    })),
    
    clearSelectedDevice: () => set({ selectedDevice: [] }),
    
    setLoading: (loading) => set({ isLoading: loading }),
    
    setDeleting: (deleting) => set({ isDeleting: deleting }),
    
    setUpdating: (updating) => set({ isUpdating: updating }),
    
    setPagination: (page, perPage, total) => set({
        currentPage: page,
        perPage: perPage,
        total: total
    }),
    
    setSearchQuery: (query) => set({ searchQuery: query }),
    
    setFilterData: (filterData) => set({ filterData }),
    
    setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
    })),
    
    clearFilters: () => set({
        filterData: {},
        filters: {
            status: '',
            device_type: '',
            platform: '',
            is_online: '',
            user_id: ''
        }
    }),
    
    setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
    
    // Update device in list
    updateDeviceInList: (deviceId, updatedData) => set((state) => ({
        deviceList: state.deviceList.map(device =>
            device.id === deviceId ? { ...device, ...updatedData } : device
        )
    })),
    
    // Remove device from list
    removeDeviceFromList: (deviceId) => set((state) => ({
        deviceList: state.deviceList.filter(device => device.id !== deviceId)
    })),
    
    // Add device to list
    addDeviceToList: (device) => set((state) => ({
        deviceList: [device, ...state.deviceList]
    })),
    
    // Get selected device count
    getSelectedCount: () => get().selectedDevice.length,
    
    // Check if device is selected
    isDeviceSelected: (deviceId) => {
        const selectedDevice = get().selectedDevice
        return selectedDevice.some(device => device.id === deviceId)
    },
    
    // Toggle device selection
    toggleDeviceSelection: (device) => {
        const state = get()
        const isSelected = state.isDeviceSelected(device.id)
        
        if (isSelected) {
            state.removeSelectedDevice(device.id)
        } else {
            state.addSelectedDevice(device)
        }
    },
    
    // Select all devices
    selectAllDevices: () => set((state) => ({
        selectedDevice: [...state.deviceList]
    })),
    
    // Reset store
    reset: () => set({
        deviceList: [],
        selectedDevice: [],
        isLoading: false,
        isDeleting: false,
        isUpdating: false,
        currentPage: 1,
        perPage: 10,
        total: 0,
        searchQuery: '',
        filterData: {},
        filters: {
            status: '',
            device_type: '',
            platform: '',
            is_online: '',
            user_id: ''
        },
        sortBy: 'created_at',
        sortOrder: 'desc'
    })
}))
