import { toast } from 'react-hot-toast'
import { UnauthorizedError } from '@/errors'

/**
 * Centralized error handler for API responses
 * @param {Error} error - The error object
 * @param {Object} options - Configuration options
 * @param {boolean} options.showToast - Whether to show toast notification
 * @param {string} options.fallbackMessage - Fallback error message
 * @param {Function} options.onUnauthorized - Custom handler for 401 errors
 */
export const handleApiError = (error, options = {}) => {
    const {
        showToast = true,
        fallbackMessage = 'Đã xảy ra lỗi, vui lòng thử lại',
        onUnauthorized
    } = options

    // Handle 401 Unauthorized errors
    if (error instanceof UnauthorizedError || error?.isUnauthorized || error?.response?.status === 401) {
        const message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'
        
        if (showToast) {
            toast.error(message)
        }
        
        if (onUnauthorized && typeof onUnauthorized === 'function') {
            onUnauthorized(error)
        }
        
        console.error('401 Unauthorized:', error)
        return { type: 'unauthorized', message, error }
    }

    // Handle other HTTP errors
    if (error?.response?.status) {
        const status = error.response.status
        let message = fallbackMessage

        switch (status) {
            case 400:
                message = error.response.data?.message || 'Dữ liệu không hợp lệ'
                break
            case 403:
                message = 'Bạn không có quyền thực hiện hành động này'
                break
            case 404:
                message = 'Không tìm thấy dữ liệu'
                break
            case 422:
                message = error.response.data?.message || 'Dữ liệu không hợp lệ'
                break
            case 500:
                message = 'Lỗi máy chủ, vui lòng thử lại sau'
                break
            default:
                message = error.response.data?.message || fallbackMessage
        }

        if (showToast) {
            toast.error(message)
        }

        console.error(`HTTP ${status} Error:`, error)
        return { type: 'http_error', status, message, error }
    }

    // Handle network errors
    if (error?.message === 'Network Error' || !navigator.onLine) {
        const message = 'Lỗi kết nối mạng, vui lòng kiểm tra internet'
        
        if (showToast) {
            toast.error(message)
        }
        
        console.error('Network Error:', error)
        return { type: 'network_error', message, error }
    }

    // Handle generic errors
    const message = error?.message || fallbackMessage
    
    if (showToast) {
        toast.error(message)
    }
    
    console.error('Generic Error:', error)
    return { type: 'generic_error', message, error }
}

/**
 * Hook for handling API errors in React components
 */
export const useErrorHandler = () => {
    return {
        handleError: handleApiError
    }
}
