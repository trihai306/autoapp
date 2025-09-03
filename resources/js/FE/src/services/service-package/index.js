// Service Package Services - Main export file
export * from './ServicePackageService'
export * from './ServicePackageFeatureService'

// Re-export commonly used functions for convenience
export {
    apiGetServicePackages,
    apiGetServicePackage,
    apiCreateServicePackage,
    apiUpdateServicePackage,
    apiDeleteServicePackage,
    apiGetPopularServicePackages,
    apiCompareServicePackages,
    ServicePackageHelpers
} from './ServicePackageService'

export {
    apiGetServicePackageFeatures,
    apiCreateServicePackageFeature,
    apiUpdateServicePackageFeature,
    apiDeleteServicePackageFeature,
    ServicePackageFeatureHelpers
} from './ServicePackageFeatureService'

// Default export with all services
import ServicePackageService from './ServicePackageService'
import ServicePackageFeatureService from './ServicePackageFeatureService'

export default {
    ServicePackage: ServicePackageService,
    Feature: ServicePackageFeatureService
}
