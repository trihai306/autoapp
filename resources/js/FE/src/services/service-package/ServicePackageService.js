import ApiService from '@/services/ApiService'

/**
 * Service Package Service - API functions for service package management
 */

// Get all service packages with pagination, search, and filters
export async function apiGetServicePackages(params) {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages',
        method: 'get',
        params,
    })
}

// Get a single service package by ID or slug
export async function apiGetServicePackage(id) {
    return ApiService.fetchDataWithAxios({
        url: `/service-packages/${id}`,
        method: 'get',
    })
}

// Create a new service package
export async function apiCreateServicePackage(data) {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages',
        method: 'post',
        data,
    })
}

// Update a service package
export async function apiUpdateServicePackage(id, data) {
    return ApiService.fetchDataWithAxios({
        url: `/service-packages/${id}`,
        method: 'put',
        data,
    })
}

// Delete a service package
export async function apiDeleteServicePackage(id) {
    return ApiService.fetchDataWithAxios({
        url: `/service-packages/${id}`,
        method: 'delete',
    })
}

// Get popular service packages
export async function apiGetPopularServicePackages() {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages/popular',
        method: 'get',
    })
}

// Compare service packages
export async function apiCompareServicePackages(packageIds) {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages/compare',
        method: 'post',
        data: { package_ids: packageIds },
    })
}

// Get service packages with specific filters
export async function apiGetServicePackagesByPrice(minPrice, maxPrice) {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages',
        method: 'get',
        params: {
            min_price: minPrice,
            max_price: maxPrice,
        },
    })
}

// Get service packages by duration type
export async function apiGetServicePackagesByDuration(durationType) {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages',
        method: 'get',
        params: {
            duration_type: durationType,
        },
    })
}

// Get active service packages only
export async function apiGetActiveServicePackages(params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages',
        method: 'get',
        params: {
            ...params,
            active: true,
        },
    })
}

// Get free service packages
export async function apiGetFreeServicePackages() {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages',
        method: 'get',
        params: {
            min_price: 0,
            max_price: 0,
        },
    })
}

// Get service packages by price range
export async function apiGetServicePackagesByPriceRange(priceRange) {
    const { min, max } = priceRange
    return ApiService.fetchDataWithAxios({
        url: '/service-packages',
        method: 'get',
        params: {
            min_price: min,
            max_price: max,
        },
    })
}

// Search service packages by name or description
export async function apiSearchServicePackages(query, params = {}) {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages',
        method: 'get',
        params: {
            ...params,
            search: query,
        },
    })
}

// Get service package statistics (if implemented in backend)
export async function apiGetServicePackageStats() {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages/stats',
        method: 'get',
    })
}

// Bulk operations for service packages
export async function apiBulkDeleteServicePackages(ids) {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages/bulk-delete',
        method: 'post',
        data: { ids },
    })
}

export async function apiBulkUpdateServicePackageStatus(ids, status) {
    return ApiService.fetchDataWithAxios({
        url: '/service-packages/bulk-update-status',
        method: 'post',
        data: { ids, status },
    })
}

// Helper functions for service package data processing
export const ServicePackageHelpers = {
    /**
     * Format price for display
     * @param {number} price - Price value
     * @param {string} currency - Currency code
     * @returns {string} Formatted price string
     */
    formatPrice: (price, currency = 'VND') => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: currency,
        }).format(price)
    },

    /**
     * Get duration display text
     * @param {Object} pkg - Service package object
     * @returns {string} Duration display text
     */
    getDurationText: (pkg) => {
        if (pkg.duration_years) {
            return `${pkg.duration_years} năm`
        }
        if (pkg.duration_months) {
            return `${pkg.duration_months} tháng`
        }
        if (pkg.duration_days) {
            return `${pkg.duration_days} ngày`
        }
        return 'Không giới hạn'
    },

    /**
     * Check if package is free
     * @param {Object} pkg - Service package object
     * @returns {boolean} True if package is free
     */
    isFree: (pkg) => {
        return pkg.price === 0 || pkg.price === '0.00'
    },

    /**
     * Check if package is popular
     * @param {Object} pkg - Service package object
     * @returns {boolean} True if package is popular
     */
    isPopular: (pkg) => {
        return pkg.is_popular === true
    },

    /**
     * Check if package is active
     * @param {Object} pkg - Service package object
     * @returns {boolean} True if package is active
     */
    isActive: (pkg) => {
        return pkg.is_active === true
    },

    /**
     * Get package features as array
     * @param {Object} pkg - Service package object
     * @returns {Array} Array of features
     */
    getFeatures: (pkg) => {
        return pkg.features || []
    },

    /**
     * Get package limits as array
     * @param {Object} pkg - Service package object
     * @returns {Array} Array of limits
     */
    getLimits: (pkg) => {
        return pkg.limits || []
    },

    /**
     * Sort packages by price
     * @param {Array} packages - Array of service packages
     * @param {string} order - 'asc' or 'desc'
     * @returns {Array} Sorted packages
     */
    sortByPrice: (packages, order = 'asc') => {
        return [...packages].sort((a, b) => {
            const priceA = parseFloat(a.price)
            const priceB = parseFloat(b.price)
            return order === 'asc' ? priceA - priceB : priceB - priceA
        })
    },

    /**
     * Filter packages by price range
     * @param {Array} packages - Array of service packages
     * @param {number} minPrice - Minimum price
     * @param {number} maxPrice - Maximum price
     * @returns {Array} Filtered packages
     */
    filterByPriceRange: (packages, minPrice, maxPrice) => {
        return packages.filter(pkg => {
            const price = parseFloat(pkg.price)
            return price >= minPrice && price <= maxPrice
        })
    },

    /**
     * Filter packages by duration type
     * @param {Array} packages - Array of service packages
     * @param {string} durationType - Duration type (days, months, years, unlimited)
     * @returns {Array} Filtered packages
     */
    filterByDurationType: (packages, durationType) => {
        return packages.filter(pkg => {
            switch (durationType) {
                case 'days':
                    return pkg.duration_days !== null
                case 'months':
                    return pkg.duration_months !== null
                case 'years':
                    return pkg.duration_years !== null
                case 'unlimited':
                    return !pkg.duration_days && !pkg.duration_months && !pkg.duration_years
                default:
                    return true
            }
        })
    },

    /**
     * Get package comparison data
     * @param {Array} packages - Array of service packages to compare
     * @returns {Object} Comparison data
     */
    getComparisonData: (packages) => {
        if (packages.length === 0) return null

        const prices = packages.map(p => parseFloat(p.price))
        const features = packages.map(p => p.features || [])
        
        return {
            count: packages.length,
            priceRange: {
                min: Math.min(...prices),
                max: Math.max(...prices),
                avg: prices.reduce((a, b) => a + b, 0) / prices.length
            },
            commonFeatures: features.reduce((common, current) => 
                common.filter(feature => 
                    current.some(f => f.name === feature.name)
                ), features[0] || []
            ),
            allFeatures: [...new Set(features.flat().map(f => f.name))]
        }
    }
}

export default {
    apiGetServicePackages,
    apiGetServicePackage,
    apiCreateServicePackage,
    apiUpdateServicePackage,
    apiDeleteServicePackage,
    apiGetPopularServicePackages,
    apiCompareServicePackages,
    apiGetServicePackagesByPrice,
    apiGetServicePackagesByDuration,
    apiGetActiveServicePackages,
    apiGetFreeServicePackages,
    apiGetServicePackagesByPriceRange,
    apiSearchServicePackages,
    apiGetServicePackageStats,
    apiBulkDeleteServicePackages,
    apiBulkUpdateServicePackageStatus,
    ServicePackageHelpers
}
