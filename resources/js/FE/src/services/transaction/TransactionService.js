// resources/js/FE/src/services/transaction/TransactionService.js
import ApiService from '@/services/ApiService'

const TransactionService = {
    /**
     * Fetches a list of all transactions (Admin view).
     * From old TransactionsService.js
     */
    getTransactions: async (params) => {
        return ApiService.fetchDataWithAxios({
            url: '/transactions',
            method: 'get',
            params,
        })
    },

    /**
     * Deletes a bulk of transactions (Admin view).
     * From old TransactionsService.js
     */
    deleteTransactions: async (data) => {
        return ApiService.fetchDataWithAxios({
            url: '/transactions/bulk-delete',
            method: 'post',
            data,
        })
    },

    /**
     * Fetches transactions for the currently authenticated user.
     * From old TransactionService.js
     */
    getUserTransactions: async (params) => {
        return ApiService.fetchDataWithAxios({
            url: '/my-transactions',
            method: 'get',
            params,
        })
    },

    /**
     * Approves a specific transaction.
     * From old TransactionService.js
     */
    approveTransaction: async (transactionId) => {
        return ApiService.fetchDataWithAxios({
            url: `/transactions/${transactionId}/approve`,
            method: 'post',
        })
    },

    /**
     * Rejects a specific transaction.
     * From old TransactionService.js
     */
    rejectTransaction: async (transactionId) => {
        return ApiService.fetchDataWithAxios({
            url: `/transactions/${transactionId}/reject`,
            method: 'post',
        })
    },
}

export default TransactionService;
