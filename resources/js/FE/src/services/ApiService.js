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
        
        const headers = param.headers || {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const finalParam = {
            ...param,
            headers,
        }

        return new Promise((resolve, reject) => {
            AxiosBase(finalParam)
                .then((response) => {
                    resolve(response.data)
                })
                .catch((errors) => {
                    // Lỗi 401 được xử lý bởi Axios interceptor (redirect to sign-in)
                    // và vẫn được reject để component có thể xử lý error appropriately
                    reject(errors)
                })
        })
    },

    // Alias method for backward compatibility
    async fetchData(param) {
        return this.fetchDataWithAxios(param)
    },
}

export default ApiService
