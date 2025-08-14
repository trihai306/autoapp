/**
 * Route permissions configuration
 * Maps routes to required permissions
 */

const routePermissions = {
    // Dashboard routes
    '/dashboards/analytic': {
        permissions: ['analytics.view'],
        roles: [],
    },

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

    // Transaction Management
    '/concepts/transaction-management': {
        permissions: ['transactions.view'],
        roles: [],
    },
    '/concepts/transaction-management/transaction-list': {
        permissions: ['transactions.view'],
        roles: [],
    },

    // TikTok Account Management
    '/concepts/tiktok-account-management': {
        permissions: ['tiktok-accounts.view'],
        roles: [],
    },
    '/concepts/tiktok-account-management/account-list': {
        permissions: ['tiktok-accounts.view'],
        roles: [],
    },

    // Content Management
    '/concepts/content-management': {
        permissions: ['content-groups.view', 'contents.view'],
        roles: [],
        requireAll: false, // User needs ANY of the permissions
    },
    '/concepts/content-management/content-groups': {
        permissions: ['content-groups.view'],
        roles: [],
    },
    '/concepts/content-management/contents': {
        permissions: ['contents.view'],
        roles: [],
    },

    // Device Management
    '/concepts/device-management': {
        permissions: ['devices.view'],
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

    // Account Tasks
    '/concepts/account-tasks': {
        permissions: ['account-tasks.view'],
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
