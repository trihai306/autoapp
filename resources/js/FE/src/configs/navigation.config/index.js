import dashboardsNavigationConfig from './dashboards.navigation.config'
import conceptsNavigationConfig from './concepts.navigation.config'
import managementNavigationConfig from './management.navigation.config'

const navigationConfig = [
    ...dashboardsNavigationConfig,
    ...conceptsNavigationConfig,
    ...managementNavigationConfig,
]

export default navigationConfig
