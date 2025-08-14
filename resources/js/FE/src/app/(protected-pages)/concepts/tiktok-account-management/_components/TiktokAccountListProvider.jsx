'use client'
import { useEffect } from 'react'
import { useTiktokAccountListStore } from '../_store/tiktokAccountListStore'

const TiktokAccountListProvider = ({ tiktokAccountList, children }) => {
    const setTiktokAccountList = useTiktokAccountListStore(
        (state) => state.setTiktokAccountList,
    )

    const setInitialLoading = useTiktokAccountListStore(
        (state) => state.setInitialLoading,
    )

    useEffect(() => {
        setTiktokAccountList(tiktokAccountList)

        setInitialLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tiktokAccountList])

    return <>{children}</>
}

export default TiktokAccountListProvider 