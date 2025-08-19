import { logData } from '@/mock/data/logData'

export async function apiGetLogs(params, token) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Mock pagination
    const { activityIndex = 1, filter } = params || {}
    const pageSize = 5
    const startIndex = (activityIndex - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    // Filter data if needed
    let filteredData = logData
    if (filter && Array.isArray(filter)) {
        // Filter events based on selected types
        filteredData = logData.map(log => ({
            ...log,
            events: log.events.filter(event => filter.includes(event.type))
        })).filter(log => log.events.length > 0) // Only keep logs with matching events
    }
    
    // Return paginated data
    const paginatedData = filteredData.slice(startIndex, endIndex)
    const hasMore = endIndex < filteredData.length
    
    return {
        data: paginatedData,
        loadable: hasMore,
        total: filteredData.length,
        currentPage: activityIndex,
        perPage: pageSize
    }
}
