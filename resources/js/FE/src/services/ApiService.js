import AxiosBase from './axios/AxiosBase'
import appConfig from '@/configs/app.config'
import { UnauthorizedError } from '@/errors'

const ApiService = {
    async fetchDataWithAxios(param) {
        let token = null;

        // Try to get token from NextAuth session
        if (typeof window === 'undefined') {
            // Server-side: use auth() function
            try {
                const { auth } = await import('@/auth')
                const session = await auth();
                token = session?.accessToken;
            } catch (error) {
                console.warn('Could not get server session:', error);
            }
        } else {
            // Client-side: use getSession from next-auth/react
            try {
                const { getSession } = await import('next-auth/react')
                const session = await getSession();
                token = session?.accessToken;
            } catch (error) {
                console.warn('Could not get client session:', error);
            }
        }

        // Merge headers - param headers take precedence
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...param.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Xử lý baseURL
        let finalUrl = param.url;
        if (param.baseURL) {
            finalUrl = `${param.baseURL}${param.url}`;
        } else {
            finalUrl = `${appConfig.API_BASE_URL}/api${param.url}`;
        }

        // Luôn tắt verify SSL phía Node (server-side ONLY)
        let extraConfig = {}
        if (typeof window === 'undefined') {
            try {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
                const https = require('https')
                extraConfig.httpsAgent = new https.Agent({ rejectUnauthorized: false })
            } catch (e) {
                // ignore
            }
        }

        const finalParam = {
            ...param,
            url: finalUrl,
            headers,
            ...extraConfig,
        }

        return new Promise((resolve, reject) => {
            AxiosBase(finalParam)
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error(`❌ API ${finalParam.method?.toUpperCase()} ${finalParam.url} failed:`, {
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        message: error.message,
                        code: error.code,
                        url: finalParam.url
                    })

                    reject(error)
                })
        })
    },

    // Alias method for backward compatibility
    async fetchData(param) {
        return this.fetchDataWithAxios(param)
    },
}

export default ApiService
