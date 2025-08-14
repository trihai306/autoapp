'use client'
import { useEffect } from 'react'
import { usePermissionListStore } from '../_store/permissionListStore'

const PermissionListProvider = ({ permissionList, children }) => {
    const setPermissionList = usePermissionListStore(
        (state) => state.setPermissionList,
    )

    const setInitialLoading = usePermissionListStore(
        (state) => state.setInitialLoading,
    )

    useEffect(() => {
        setPermissionList(permissionList)
        setInitialLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [permissionList])

    return <>{children}</>
}

export default PermissionListProvider
