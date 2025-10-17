import dashboardsRoute from './dashboardsRoute'
import conceptsRoute from './conceptsRoute'
import uiComponentsRoute from './uiComponentsRoute'
import authRoute from './authRoute'
import authDemoRoute from './authDemoRoute'
import guideRoute from './guideRoute'
import proxyManagementRoute from './proxyManagementRoute'
import otherRoute from './otherRoute'

export const protectedRoutes = {
    ...dashboardsRoute,
    ...uiComponentsRoute,
    ...conceptsRoute,
    ...guideRoute,
    ...proxyManagementRoute,
}

export const publicRoutes = {
    ...authRoute,
    ...authDemoRoute,
    ...otherRoute,
    '/': {
        key: 'home',
        authority: [],
    },
    '/landing': {
        key: 'landing',
        authority: [],
    },
}

export const authRoutes = authRoute
