const appConfig = {
    apiPrefix: '/api',
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://autoapp.test',
    authenticatedEntryPath: '/concepts/tiktok-account-management',
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'vi',
    activeNavTranslation: true,
}

export default appConfig
