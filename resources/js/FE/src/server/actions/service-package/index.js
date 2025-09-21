// Service Package Actions - Main export file

// Import all actions for default export
import getServicePackages from './getServicePackages'
import getServicePackage from './getServicePackage'
import createServicePackage from './createServicePackage'
import updateServicePackage from './updateServicePackage'
import deleteServicePackage from './deleteServicePackage'
import deleteServicePackages from './deleteServicePackages'
import updateServicePackageStatus from './updateServicePackageStatus'
import getPopularServicePackages from './getPopularServicePackages'
import compareServicePackages from './compareServicePackages'
import getServicePackageStats from './getServicePackageStats'
import searchServicePackages from './searchServicePackages'

// Service Package Category Actions
import getServicePackageCategories from './getServicePackageCategories'
import createServicePackageCategory from './createServicePackageCategory'
import updateServicePackageCategory from './updateServicePackageCategory'
import deleteServicePackageCategory from './deleteServicePackageCategory'

// Service Package Tier Actions
import getServicePackageTiers from './getServicePackageTiers'
import createServicePackageTier from './createServicePackageTier'
import updateServicePackageTier from './updateServicePackageTier'
import deleteServicePackageTier from './deleteServicePackageTier'

// Service Package Feature Actions
import getServicePackageFeatures from './getServicePackageFeatures'
import createServicePackageFeature from './createServicePackageFeature'
import updateServicePackageFeature from './updateServicePackageFeature'
import deleteServicePackageFeature from './deleteServicePackageFeature'
import bulkCreateServicePackageFeatures from './bulkCreateServicePackageFeatures'
import bulkDeleteServicePackageFeatures from './bulkDeleteServicePackageFeatures'

// Service Package Payment Actions
import purchaseServicePackage from './purchaseServicePackage'
import getUserSubscriptions from './getUserSubscriptions'
import getCurrentSubscription from './getCurrentSubscription'
import extendSubscription from './extendSubscription'
import cancelSubscription from './cancelSubscription'

// Named exports
export {
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
    
    // Service Package Category Actions
    getServicePackageCategories,
    createServicePackageCategory,
    updateServicePackageCategory,
    deleteServicePackageCategory,
    
    // Service Package Tier Actions
    getServicePackageTiers,
    createServicePackageTier,
    updateServicePackageTier,
    deleteServicePackageTier,
    
    // Service Package Feature Actions
    getServicePackageFeatures,
    createServicePackageFeature,
    updateServicePackageFeature,
    deleteServicePackageFeature,
    bulkCreateServicePackageFeatures,
    bulkDeleteServicePackageFeatures,
    
    // Service Package Payment Actions
    purchaseServicePackage,
    getUserSubscriptions,
    getCurrentSubscription,
    extendSubscription,
    cancelSubscription
}

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
    
    // Service Package Category Actions
    getServicePackageCategories,
    createServicePackageCategory,
    updateServicePackageCategory,
    deleteServicePackageCategory,
    
    // Service Package Tier Actions
    getServicePackageTiers,
    createServicePackageTier,
    updateServicePackageTier,
    deleteServicePackageTier,
    
    // Service Package Feature Actions
    getServicePackageFeatures,
    createServicePackageFeature,
    updateServicePackageFeature,
    deleteServicePackageFeature,
    bulkCreateServicePackageFeatures,
    bulkDeleteServicePackageFeatures,
    
    // Service Package Payment Actions
    purchaseServicePackage,
    getUserSubscriptions,
    getCurrentSubscription,
    extendSubscription,
    cancelSubscription
}
