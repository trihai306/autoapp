'use client'
import { useEffect } from 'react'
import { useTransactionListStore } from '../_store/transactionListStore'

const TransactionListProvider = ({ transactionList, children }) => {
    const setTransactionList = useTransactionListStore(
        (state) => state.setTransactionList,
    )

    const setInitialLoading = useTransactionListStore(
        (state) => state.setInitialLoading,
    )

    useEffect(() => {
        setTransactionList(transactionList)

        setInitialLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactionList])

    return <>{children}</>
}

export default TransactionListProvider
