// Service Package Actions - Main export file

// Service Package Actions
export { default as getServicePackages } from './getServicePackages'
export { default as getServicePackage } from './getServicePackage'
export { default as createServicePackage } from './createServicePackage'
export { default as updateServicePackage } from './updateServicePackage'
export { default as deleteServicePackage } from './deleteServicePackage'
export { default as deleteServicePackages } from './deleteServicePackages'
export { default as updateServicePackageStatus } from './updateServicePackageStatus'
export { default as getPopularServicePackages } from './getPopularServicePackages'
export { default as compareServicePackages } from './compareServicePackages'
export { default as getServicePackageStats } from './getServicePackageStats'
export { default as searchServicePackages } from './searchServicePackages'

// Service Package Feature Actions
export { default as getServicePackageFeatures } from './getServicePackageFeatures'
export { default as createServicePackageFeature } from './createServicePackageFeature'
export { default as updateServicePackageFeature } from './updateServicePackageFeature'
export { default as deleteServicePackageFeature } from './deleteServicePackageFeature'
export { default as bulkCreateServicePackageFeatures } from './bulkCreateServicePackageFeatures'
export { default as bulkDeleteServicePackageFeatures } from './bulkDeleteServicePackageFeatures'

// Default export with all actions grouped
export default {
    // Service Package Actions
    getServicePackages,
    getServicePackage,
    createServicePackage,
    updateServicePackage,
    deleteServicePackage,
    deleteServicePackages,
    updateServicePackageStatus,
    getPopularServicePackages,
    compareServicePackages,
    getServicePackageStats,
    searchServicePackages,
    
    // Service Package Feature Actions
    getServicePackageFeatures,
    createServicePackageFeature,
    updateServicePackageFeature,
    deleteServicePackageFeature,
    bulkCreateServicePackageFeatures,
    bulkDeleteServicePackageFeatures
}
