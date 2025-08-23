'use client'

export default function GlobalError({
  error,
  reset,
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Lỗi toàn cục!
            </h2>
            <p className="text-gray-600 mb-4">
              Có lỗi nghiêm trọng xảy ra trong ứng dụng.
            </p>
            <button
              onClick={() => reset()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Thử lại
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
