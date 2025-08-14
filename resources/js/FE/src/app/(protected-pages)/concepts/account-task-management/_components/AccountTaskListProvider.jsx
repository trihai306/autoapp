'use client'
import { useEffect } from 'react'
import { useAccountTaskListStore } from '../_store/accountTaskListStore'

const AccountTaskListProvider = ({ accountTaskList, children }) => {
    const setAccountTaskList = useAccountTaskListStore(
        (state) => state.setAccountTaskList,
    )

    const setInitialLoading = useAccountTaskListStore(
        (state) => state.setInitialLoading,
    )

    useEffect(() => {
        setAccountTaskList(accountTaskList)
        setInitialLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountTaskList])

    return <>{children}</>
}

export default AccountTaskListProvider
