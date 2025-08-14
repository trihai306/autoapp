'use client'

import { usePermission, useRole } from '@/utils/hooks/usePermission'

/**
 * Component to conditionally render children based on user permissions
 * @param {object} props
 * @param {string|string[]} props.permission - Permission(s) required
 * @param {string|string[]} props.role - Role(s) required
 * @param {boolean} props.requireAll - If true, user must have ALL permissions/roles
 * @param {React.ReactNode} props.children - Content to render if user has permission
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have permission
 * @returns {React.ReactNode}
 */
const PermissionCheck = ({ 
    permission, 
    role, 
    requireAll = false, 
    children, 
    fallback = null 
}) => {
    const hasPermission = usePermission(permission, requireAll)
    const hasRole = useRole(role, requireAll)

    // If both permission and role are specified, user must have both
    if (permission && role) {
        return (hasPermission && hasRole) ? children : fallback
    }

    // If only permission is specified
    if (permission) {
        return hasPermission ? children : fallback
    }

    // If only role is specified
    if (role) {
        return hasRole ? children : fallback
    }

    // If neither permission nor role is specified, render children
    return children
}

/**
 * Component to check specific resource permissions
 * @param {object} props
 * @param {string} props.resource - Resource name (e.g., 'users', 'transactions')
 * @param {string} props.action - Action required ('view', 'create', 'edit', 'delete', 'bulkOperations')
 * @param {React.ReactNode} props.children - Content to render if user has permission
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have permission
 * @returns {React.ReactNode}
 */
const ResourcePermissionCheck = ({ 
    resource, 
    action, 
    children, 
    fallback = null 
}) => {
    const hasPermission = usePermission(`${resource}.${action}`)
    
    return hasPermission ? children : fallback
}

/**
 * Component to check admin permissions
 * @param {object} props
 * @param {React.ReactNode} props.children - Content to render if user is admin
 * @param {React.ReactNode} props.fallback - Content to render if user is not admin
 * @returns {React.ReactNode}
 */
const AdminCheck = ({ children, fallback = null }) => {
    const hasAdminRole = useRole(['admin', 'super-admin'])
    
    return hasAdminRole ? children : fallback
}

/**
 * Component to check super admin permissions
 * @param {object} props
 * @param {React.ReactNode} props.children - Content to render if user is super admin
 * @param {React.ReactNode} props.fallback - Content to render if user is not super admin
 * @returns {React.ReactNode}
 */
const SuperAdminCheck = ({ children, fallback = null }) => {
    const hasSuperAdminRole = useRole('super-admin')
    
    return hasSuperAdminRole ? children : fallback
}

export {
    PermissionCheck,
    ResourcePermissionCheck,
    AdminCheck,
    SuperAdminCheck
}

export default PermissionCheck
