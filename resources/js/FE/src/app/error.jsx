'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error boundary caught an error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Đã xảy ra lỗi!
        </h2>
        <p className="text-gray-600 mb-4">
          Có lỗi xảy ra trong ứng dụng. Vui lòng thử lại.
        </p>
        <button
          onClick={() => reset()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Thử lại
        </button>
      </div>
    </div>
  )
}
