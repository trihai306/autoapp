import { signInUserData } from '../data/authData'
import { usersData, userDetailData } from '../data/usersData'
import { rolesData } from '../data/rolesData'
import { permissionsData } from '../data/permissionsData'
import { transactionsData } from '../data/transactionsData'
import { notificationsData } from '../data/notificationsData'
import { aiSpendingHistoryData } from '../data/aiSpendingHistoryData'
import { accountTaskData } from '../data/accountTaskData'

import {
    authFakeApi,
    usersFakeApi,
    rolesFakeApi,
    permissionsFakeApi,
    transactionsFakeApi,
    notificationsFakeApi,
    aiSpendingHistoryFakeApi,
    accountTaskFakeApi,
} from './fakeApi'

import { createServer } from 'miragejs'
import appConfig from '@/configs/app.config'

const { apiPrefix } = appConfig

export function mockServer({ environment = 'test' }) {
    return createServer({
        environment,
        seeds(server) {
            server.db.loadData({
                signInUserData,
                usersData,
                userDetailData,
                rolesData,
                permissionsData,
                transactionsData,
                notificationsData,
                aiSpendingHistoryData,
                accountTaskData,
            })
        },
        routes() {
            this.urlPrefix = ''
            this.namespace = ''
            this.passthrough((request) => {
                const isExternal = request.url.startsWith('http')
                return isExternal
            })
            this.passthrough()

            authFakeApi(this, apiPrefix)
            usersFakeApi(this, apiPrefix)
            rolesFakeApi(this, apiPrefix)
            permissionsFakeApi(this, apiPrefix)
            transactionsFakeApi(this, apiPrefix)
            notificationsFakeApi(this, apiPrefix)
            aiSpendingHistoryFakeApi(this, apiPrefix)
            accountTaskFakeApi(this, apiPrefix)
        },
    })
}
