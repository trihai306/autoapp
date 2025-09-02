/**
 * Route permissions configuration
 * Maps routes to required permissions
 */

const routePermissions = {
    // User Management
    '/concepts/user-management': {
        permissions: ['users.view'],
        roles: [],
    },
    '/concepts/user-management/user-list': {
        permissions: ['users.view'],
        roles: [],
    },
    '/concepts/user-management/user-edit': {
        permissions: ['users.edit'],
        roles: [],
    },

    // Role & Permission Management
    '/concepts/role-management': {
        permissions: ['roles.view'],
        roles: ['admin', 'super-admin'],
    },
    '/concepts/permission-management': {
        permissions: ['permissions.view'],
        roles: ['admin', 'super-admin'],
    },

    // Transaction Management - Bỏ permission check
    '/concepts/transaction-management': {
        permissions: [],
        roles: [],
    },
    '/concepts/transaction-management/transaction-list': {
        permissions: [],
        roles: [],
    },

    // TikTok Account Management - Bỏ permission check
    '/concepts/tiktok-account-management': {
        permissions: [],
        roles: [],
    },

    // Topup - Bỏ permission check
    '/concepts/topup': {
        permissions: [],
        roles: [],
    },

    // Service Registration - Bỏ permission check
    '/concepts/service-registration': {
        permissions: [],
        roles: [],
    },
    '/concepts/tiktok-account-management/account-list': {
        permissions: [],
        roles: [],
    },

    // Content Management - Bỏ permission check
    '/concepts/content-management': {
        permissions: [],
        roles: [],
    },
    '/concepts/content-management/content-groups': {
        permissions: [],
        roles: [],
    },
    '/concepts/content-management/contents': {
        permissions: [],
        roles: [],
    },

    // Device Management - Bỏ permission check
    '/concepts/device-management': {
        permissions: [],
        roles: [],
    },

    // Interaction Scenarios
    '/concepts/interaction-scenarios': {
        permissions: ['interaction-scenarios.view'],
        roles: [],
    },

    // Scenario Scripts
    '/concepts/scenario-scripts': {
        permissions: ['scenario-scripts.view'],
        roles: [],
    },

    // Account Tasks - Bỏ permission check
    '/concepts/account-tasks': {
        permissions: [],
        roles: [],
    },

    // Notifications
    '/concepts/notifications': {
        permissions: ['notifications.view'],
        roles: [],
    },

    // Settings
    '/concepts/settings': {
        permissions: ['settings.view'],
        roles: [],
    },

    // AI Spending
    '/concepts/ai-spending': {
        permissions: ['ai-spending.view', 'ai-spending.view-own'],
        roles: [],
        requireAll: false,
    },

    // Admin only routes
    '/concepts/admin': {
        permissions: [],
        roles: ['admin', 'super-admin'],
    },

    // Super Admin only routes
    '/concepts/super-admin': {
        permissions: [],
        roles: ['super-admin'],
    },
}

/**
 * Get permission requirements for a route
 * @param {string} pathname - Route pathname
 * @returns {object|null} - Permission requirements or null if no requirements
 */
export const getRoutePermissions = (pathname) => {
    // Exact match first
    if (routePermissions[pathname]) {
        return routePermissions[pathname]
    }

    // Check for partial matches (for dynamic routes)
    for (const route in routePermissions) {
        if (pathname.startsWith(route)) {
            return routePermissions[route]
        }
    }

    return null
}

/**
 * Check if user has permission to access a route
 * @param {string} pathname - Route pathname
 * @param {string[]} userPermissions - User's permissions
 * @param {string[]} userRoles - User's roles
 * @returns {boolean} - Whether user can access the route
 */
export const canAccessRoute = (pathname, userPermissions = [], userRoles = []) => {
    const requirements = getRoutePermissions(pathname)
    
    // Super Admin bypass: luôn được phép truy cập
    if (Array.isArray(userRoles) && userRoles.includes('super-admin')) {
        return true
    }
    
    if (!requirements) {
        return true // No requirements means public access
    }

    const { permissions = [], roles = [], requireAll = false } = requirements

    // Check roles first
    if (roles.length > 0) {
        const hasRole = roles.some(role => userRoles.includes(role))
        if (!hasRole) {
            return false
        }
    }

    // Check permissions
    if (permissions.length > 0) {
        if (requireAll) {
            return permissions.every(permission => userPermissions.includes(permission))
        } else {
            return permissions.some(permission => userPermissions.includes(permission))
        }
    }

    return true
}

export default routePermissions
