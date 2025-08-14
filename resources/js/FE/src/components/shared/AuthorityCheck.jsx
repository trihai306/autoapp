import useAuthority from '@/utils/hooks/useAuthority'
import { usePermission, useRole } from '@/utils/hooks/usePermission'

const AuthorityCheck = (props) => {
    const { 
        userAuthority = [], 
        authority = [], 
        permissions = [], 
        roles = [], 
        requireAll = false,
        children 
    } = props

    const roleMatched = useAuthority(userAuthority, authority)
    const hasPermission = usePermission(permissions, requireAll)
    const hasRole = useRole(roles, requireAll)

    // If using new permission system
    if (permissions.length > 0 || roles.length > 0) {
        let hasAccess = true

        if (permissions.length > 0 && roles.length > 0) {
            hasAccess = hasPermission && hasRole
        } else if (permissions.length > 0) {
            hasAccess = hasPermission
        } else if (roles.length > 0) {
            hasAccess = hasRole
        }

        return <>{hasAccess ? children : null}</>
    }

    // Fallback to old authority system
    return <>{roleMatched ? children : null}</>
}

export default AuthorityCheck
