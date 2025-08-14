'use client'

import React from 'react'
import { handleApiError } from '@/utils/errorHandler'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        
        // Handle the error using our centralized error handler
        handleApiError(error, {
            showToast: true,
            fallbackMessage: 'Đã xảy ra lỗi không mong muốn'
        })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Đã xảy ra lỗi
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Vui lòng tải lại trang hoặc thử lại sau
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Tải lại trang
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
