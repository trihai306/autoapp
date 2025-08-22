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
            // Nếu có baseURL, sử dụng nó
            finalUrl = `${param.baseURL}${param.url}`;
        } else {
            // Nếu không có baseURL, sử dụng default từ appConfig
            finalUrl = `${appConfig.API_BASE_URL}/api${param.url}`;
        }
        
        const finalParam = {
            ...param,
            url: finalUrl,
            headers,
        }

        return new Promise((resolve, reject) => {
            console.log('📡 Making API request:', {
                method: finalParam.method?.toUpperCase(),
                url: finalParam.url,
                hasToken: !!token,
                headers: finalParam.headers
            });
            
            AxiosBase(finalParam)
                .then((response) => {
                    console.log(`✅ API ${finalParam.method?.toUpperCase()} ${finalParam.url} successful:`, response.data)
                    resolve(response.data)
                })
                .catch((error) => {
                    console.error(`❌ API ${finalParam.method?.toUpperCase()} ${finalParam.url} failed:`, {
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        message: error.message,
                        code: error.code,
                        url: finalParam.url,
                        headers: finalParam.headers
                    })
                    
                    // Lỗi 401 được xử lý bởi Axios interceptor (redirect to sign-in)
                    // và vẫn được reject để component có thể xử lý error appropriately
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
