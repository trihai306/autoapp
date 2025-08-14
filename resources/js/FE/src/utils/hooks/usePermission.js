'use client'

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

/**
 * Hook to check user permissions
 * @param {string|string[]} permission - Permission(s) to check
 * @param {boolean} requireAll - If true, user must have ALL permissions. If false, user needs ANY permission
 * @returns {boolean} - Whether user has the required permission(s)
 */
function usePermission(permission, requireAll = false) {
    const { data: session } = useSession()

    return useMemo(() => {
        if (!session?.user?.permissions) {
            return false
        }

        const userPermissions = session.user.permissions || []

        if (typeof permission === 'string') {
            return userPermissions.includes(permission)
        }

        if (Array.isArray(permission)) {
            if (requireAll) {
                return permission.every(p => userPermissions.includes(p))
            } else {
                return permission.some(p => userPermissions.includes(p))
            }
        }

        return false
    }, [session?.user?.permissions, permission, requireAll])
}

/**
 * Hook to check user roles
 * @param {string|string[]} role - Role(s) to check
 * @param {boolean} requireAll - If true, user must have ALL roles. If false, user needs ANY role
 * @returns {boolean} - Whether user has the required role(s)
 */
function useRole(role, requireAll = false) {
    const { data: session } = useSession()

    return useMemo(() => {
        if (!session?.user?.roles) {
            return false
        }

        const userRoles = session.user.roles || []

        if (typeof role === 'string') {
            return userRoles.includes(role)
        }

        if (Array.isArray(role)) {
            if (requireAll) {
                return role.every(r => userRoles.includes(r))
            } else {
                return role.some(r => userRoles.includes(r))
            }
        }

        return false
    }, [session?.user?.roles, role, requireAll])
}

/**
 * Hook to check if user can manage a resource (CRUD operations)
 * @param {string} resource - Resource name (e.g., 'users', 'transactions')
 * @returns {object} - Object with view, create, edit, delete permissions
 */
function useResourcePermissions(resource) {
    const { data: session } = useSession()

    return useMemo(() => {
        if (!session?.user?.permissions) {
            return {
                view: false,
                create: false,
                edit: false,
                delete: false,
                bulkOperations: false
            }
        }

        const userPermissions = session.user.permissions || []

        return {
            view: userPermissions.includes(`${resource}.view`),
            create: userPermissions.includes(`${resource}.create`),
            edit: userPermissions.includes(`${resource}.edit`),
            delete: userPermissions.includes(`${resource}.delete`),
            bulkOperations: userPermissions.includes(`${resource}.bulk-operations`)
        }
    }, [session?.user?.permissions, resource])
}

/**
 * Hook to check if user is admin
 * @returns {boolean} - Whether user has admin role
 */
function useIsAdmin() {
    return useRole(['admin', 'super-admin'])
}

/**
 * Hook to check if user is super admin
 * @returns {boolean} - Whether user has super-admin role
 */
function useIsSuperAdmin() {
    return useRole('super-admin')
}

/**
 * Hook to get all user permissions and roles
 * @returns {object} - User's permissions and roles data
 */
function useUserPermissions() {
    const { data: session } = useSession()

    return useMemo(() => {
        if (!session?.user) {
            return {
                roles: [],
                permissions: [],
                permission_groups: {},
                isAdmin: false,
                isSuperAdmin: false
            }
        }

        const roles = session.user.roles || []
        const permissions = session.user.permissions || []
        const permission_groups = session.user.permission_groups || {}

        return {
            roles,
            permissions,
            permission_groups,
            isAdmin: roles.includes('admin') || roles.includes('super-admin'),
            isSuperAdmin: roles.includes('super-admin')
        }
    }, [session?.user])
}

export {
    usePermission,
    useRole,
    useResourcePermissions,
    useIsAdmin,
    useIsSuperAdmin,
    useUserPermissions
}
