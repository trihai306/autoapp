import ApiService from '@/services/ApiService'

/**
 * Service Package Feature Service - API functions for service package feature management
 */

// Get all features for a specific service package
export async function apiGetServicePackageFeatures(packageId, params = {}) {
    return ApiService.fetchDataWithAxios({
        url: `/service-packages/${packageId}/features`,
        method: 'get',
        params,
    })
}

// Get a single feature by ID
export async function apiGetServicePackageFeature(featureId) {
    return ApiService.fetchDataWithAxios({
        url: `/service-package-features/${featureId}`,
        method: 'get',
    })
}

// Create a new feature for a service package
export async function apiCreateServicePackageFeature(packageId, data) {
    return ApiService.fetchDataWithAxios({
        url: `/service-packages/${packageId}/features`,
        method: 'post',
        data: {
            service_package_id: packageId,
            ...data,
        },
    })
}

// Update a service package feature
export async function apiUpdateServicePackageFeature(featureId, data) {
    return ApiService.fetchDataWithAxios({
        url: `/service-package-features/${featureId}`,
        method: 'put',
        data,
    })
}

// Delete a service package feature
export async function apiDeleteServicePackageFeature(featureId) {
    return ApiService.fetchDataWithAxios({
        url: `/service-package-features/${featureId}`,
        method: 'delete',
    })
}

// Bulk create features for a service package
export async function apiBulkCreateServicePackageFeatures(packageId, features) {
    return ApiService.fetchDataWithAxios({
        url: `/service-packages/${packageId}/features/bulk`,
        method: 'post',
        data: { features },
    })
}

// Bulk update features for a service package
export async function apiBulkUpdateServicePackageFeatures(packageId, features) {
    return ApiService.fetchDataWithAxios({
        url: `/service-packages/${packageId}/features/bulk-update`,
        method: 'put',
        data: { features },
    })
}

// Bulk delete features
export async function apiBulkDeleteServicePackageFeatures(featureIds) {
    return ApiService.fetchDataWithAxios({
        url: '/service-package-features/bulk-delete',
        method: 'post',
        data: { ids: featureIds },
    })
}

// Get features by type
export async function apiGetServicePackageFeaturesByType(packageId, type) {
    return ApiService.fetchDataWithAxios({
        url: `/service-packages/${packageId}/features`,
        method: 'get',
        params: { type },
    })
}

// Get included features only
export async function apiGetIncludedServicePackageFeatures(packageId) {
    return ApiService.fetchDataWithAxios({
        url: `/service-packages/${packageId}/features`,
        method: 'get',
        params: { included: true },
    })
}

// Update feature sort order
export async function apiUpdateServicePackageFeatureSortOrder(featureId, sortOrder) {
    return ApiService.fetchDataWithAxios({
        url: `/service-package-features/${featureId}/sort-order`,
        method: 'put',
        data: { sort_order: sortOrder },
    })
}

// Bulk update feature sort orders
export async function apiBulkUpdateServicePackageFeatureSortOrders(updates) {
    return ApiService.fetchDataWithAxios({
        url: '/service-package-features/bulk-update-sort-order',
        method: 'put',
        data: { updates },
    })
}

// Helper functions for service package feature data processing
export const ServicePackageFeatureHelpers = {
    /**
     * Format feature value for display
     * @param {Object} feature - Service package feature object
     * @returns {string} Formatted feature value
     */
    formatFeatureValue: (feature) => {
        if (feature.value === 'unlimited' || feature.value === '∞') {
            return 'Không giới hạn'
        }
        
        if (feature.value && feature.unit) {
            return `${feature.value} ${feature.unit}`
        }
        
        return feature.value || ''
    },

    /**
     * Check if feature is unlimited
     * @param {Object} feature - Service package feature object
     * @returns {boolean} True if feature is unlimited
     */
    isUnlimited: (feature) => {
        return ['unlimited', '∞', null].includes(feature.value)
    },

    /**
     * Check if feature has numeric value
     * @param {Object} feature - Service package feature object
     * @returns {boolean} True if feature has numeric value
     */
    hasNumericValue: (feature) => {
        return !isNaN(parseFloat(feature.value)) && isFinite(feature.value)
    },

    /**
     * Get numeric value of feature
     * @param {Object} feature - Service package feature object
     * @returns {number|null} Numeric value or null
     */
    getNumericValue: (feature) => {
        return this.hasNumericValue(feature) ? parseFloat(feature.value) : null
    },

    /**
     * Check if feature is included
     * @param {Object} feature - Service package feature object
     * @returns {boolean} True if feature is included
     */
    isIncluded: (feature) => {
        return feature.is_included === true
    },

    /**
     * Get feature type display name
     * @param {string} type - Feature type
     * @returns {string} Display name for feature type
     */
    getFeatureTypeDisplayName: (type) => {
        const typeMap = {
            feature: 'Tính năng',
            limit: 'Giới hạn',
            benefit: 'Lợi ích',
            restriction: 'Hạn chế',
            addon: 'Bổ sung'
        }
        return typeMap[type] || type
    },

    /**
     * Sort features by sort order
     * @param {Array} features - Array of features
     * @returns {Array} Sorted features
     */
    sortByOrder: (features) => {
        return [...features].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    },

    /**
     * Group features by type
     * @param {Array} features - Array of features
     * @returns {Object} Features grouped by type
     */
    groupByType: (features) => {
        return features.reduce((groups, feature) => {
            const type = feature.type || 'feature'
            if (!groups[type]) {
                groups[type] = []
            }
            groups[type].push(feature)
            return groups
        }, {})
    },

    /**
     * Filter features by type
     * @param {Array} features - Array of features
     * @param {string} type - Feature type to filter by
     * @returns {Array} Filtered features
     */
    filterByType: (features, type) => {
        return features.filter(feature => feature.type === type)
    },

    /**
     * Filter included features only
     * @param {Array} features - Array of features
     * @returns {Array} Included features only
     */
    filterIncluded: (features) => {
        return features.filter(feature => feature.is_included === true)
    },

    /**
     * Get feature comparison data
     * @param {Array} features - Array of features to compare
     * @returns {Object} Comparison data
     */
    getComparisonData: (features) => {
        if (features.length === 0) return null

        const types = [...new Set(features.map(f => f.type))]
        const includedCount = features.filter(f => f.is_included).length
        const unlimitedCount = features.filter(f => this.isUnlimited(f)).length

        return {
            total: features.length,
            included: includedCount,
            excluded: features.length - includedCount,
            unlimited: unlimitedCount,
            types: types,
            typeCounts: types.reduce((counts, type) => {
                counts[type] = features.filter(f => f.type === type).length
                return counts
            }, {})
        }
    },

    /**
     * Create feature template
     * @param {string} name - Feature name
     * @param {string} type - Feature type
     * @param {string} value - Feature value
     * @param {string} unit - Feature unit
     * @param {Object} options - Additional options
     * @returns {Object} Feature template
     */
    createFeatureTemplate: (name, type = 'feature', value = null, unit = null, options = {}) => {
        return {
            name,
            type,
            value,
            unit,
            description: options.description || null,
            is_included: options.is_included !== false,
            sort_order: options.sort_order || 0,
            icon: options.icon || null,
            ...options
        }
    },

    /**
     * Validate feature data
     * @param {Object} feature - Feature object to validate
     * @returns {Object} Validation result
     */
    validateFeature: (feature) => {
        const errors = []

        if (!feature.name || feature.name.trim() === '') {
            errors.push('Tên tính năng không được để trống')
        }

        if (!feature.type) {
            errors.push('Loại tính năng không được để trống')
        }

        if (feature.value && feature.unit && !this.hasNumericValue(feature)) {
            errors.push('Giá trị phải là số khi có đơn vị')
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }
}

export default {
    apiGetServicePackageFeatures,
    apiGetServicePackageFeature,
    apiCreateServicePackageFeature,
    apiUpdateServicePackageFeature,
    apiDeleteServicePackageFeature,
    apiBulkCreateServicePackageFeatures,
    apiBulkUpdateServicePackageFeatures,
    apiBulkDeleteServicePackageFeatures,
    apiGetServicePackageFeaturesByType,
    apiGetIncludedServicePackageFeatures,
    apiUpdateServicePackageFeatureSortOrder,
    apiBulkUpdateServicePackageFeatureSortOrders,
    ServicePackageFeatureHelpers
}
