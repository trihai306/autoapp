'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { usePermission, useRole } from '@/utils/hooks/usePermission'
import Loading from '@/components/shared/Loading'

/**
 * Higher-order component to protect routes with permission checks
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {object} options - Permission check options
 * @param {string|string[]} options.permission - Required permission(s)
 * @param {string|string[]} options.role - Required role(s)
 * @param {boolean} options.requireAll - If true, user must have ALL permissions/roles
 * @param {string} options.redirectTo - Path to redirect if user doesn't have permission
 * @returns {React.Component} - Protected component
 */
const withPermissionCheck = (WrappedComponent, options = {}) => {
    const {
        permission,
        role,
        requireAll = false,
        redirectTo = '/access-denied'
    } = options

    return function ProtectedComponent(props) {
        const { data: session, status } = useSession()
        const router = useRouter()
        const hasPermission = usePermission(permission, requireAll)
        const hasRole = useRole(role, requireAll)

        useEffect(() => {
            if (status === 'loading') return // Still loading

            if (status === 'unauthenticated') {
                router.push('/sign-in')
                return
            }

            if (status === 'authenticated') {
                let hasAccess = true

                // Check permissions and roles
                if (permission && role) {
                    hasAccess = hasPermission && hasRole
                } else if (permission) {
                    hasAccess = hasPermission
                } else if (role) {
                    hasAccess = hasRole
                }

                if (!hasAccess) {
                    router.push(redirectTo)
                    return
                }
            }
        }, [status, hasPermission, hasRole, router])

        // Show loading while checking authentication
        if (status === 'loading') {
            return <Loading loading={true} />
        }

        // Show loading while redirecting
        if (status === 'unauthenticated') {
            return <Loading loading={true} />
        }

        // Check permissions after authentication is confirmed
        if (status === 'authenticated') {
            let hasAccess = true

            if (permission && role) {
                hasAccess = hasPermission && hasRole
            } else if (permission) {
                hasAccess = hasPermission
            } else if (role) {
                hasAccess = hasRole
            }

            if (!hasAccess) {
                return <Loading loading={true} />
            }
        }

        return <WrappedComponent {...props} />
    }
}

/**
 * HOC specifically for resource-based permissions
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {string} resource - Resource name (e.g., 'users', 'transactions')
 * @param {string} action - Required action ('view', 'create', 'edit', 'delete')
 * @param {string} redirectTo - Path to redirect if user doesn't have permission
 * @returns {React.Component} - Protected component
 */
const withResourcePermission = (WrappedComponent, resource, action = 'view', redirectTo = '/access-denied') => {
    return withPermissionCheck(WrappedComponent, {
        permission: `${resource}.${action}`,
        redirectTo
    })
}

/**
 * HOC for admin-only routes
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {string} redirectTo - Path to redirect if user is not admin
 * @returns {React.Component} - Protected component
 */
const withAdminCheck = (WrappedComponent, redirectTo = '/access-denied') => {
    return withPermissionCheck(WrappedComponent, {
        role: ['admin', 'super-admin'],
        redirectTo
    })
}

/**
 * HOC for super admin-only routes
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {string} redirectTo - Path to redirect if user is not super admin
 * @returns {React.Component} - Protected component
 */
const withSuperAdminCheck = (WrappedComponent, redirectTo = '/access-denied') => {
    return withPermissionCheck(WrappedComponent, {
        role: 'super-admin',
        redirectTo
    })
}

export {
    withPermissionCheck,
    withResourcePermission,
    withAdminCheck,
    withSuperAdminCheck
}

export default withPermissionCheck
