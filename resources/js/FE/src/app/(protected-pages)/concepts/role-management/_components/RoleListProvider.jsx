'use client'
import { useEffect } from 'react'
import { useRoleListStore } from '../_store/roleListStore'

const RoleListProvider = ({ roleList, children }) => {
    const setRoleList = useRoleListStore(
        (state) => state.setRoleList,
    )

    const setInitialLoading = useRoleListStore(
        (state) => state.setInitialLoading,
    )

    useEffect(() => {
        setRoleList(roleList)
        setInitialLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleList])

    return <>{children}</>
}

export default RoleListProvider
