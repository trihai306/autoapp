'use client'
import { useEffect } from 'react'
import { useUserListStore } from '../_store/userListStore'

const UserListProvider = ({ userList, children }) => {
    const setUserList = useUserListStore(
        (state) => state.setUserList,
    )

    const setInitialLoading = useUserListStore(
        (state) => state.setInitialLoading,
    )

    useEffect(() => {
        setUserList(userList)

        setInitialLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userList])

    return <>{children}</>
}

export default UserListProvider
