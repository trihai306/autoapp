import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { HiOutlineClock as Clock, HiOutlineExclamation as AlertTriangle } from 'react-icons/hi'

export default function RateLimitPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md" header={{ content: (
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                        <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Quá nhiều yêu cầu</h2>
                    <p className="text-gray-600">Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng chờ một chút trước khi thử lại.</p>
                </div>
            )}}>
                <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Rate Limit Exceeded
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>Mã lỗi: 429 - Too Many Requests</p>
                                    <p>Thời gian: {new Date().toLocaleString('vi-VN')}</p>
                                    <p>Thử lại sau: 1-5 phút</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        <p>Để tránh tình trạng này:</p>
                        <ul className="mt-2 text-left space-y-1">
                            <li>• Không spam click các nút</li>
                            <li>• Chờ phản hồi trước khi thực hiện hành động tiếp theo</li>
                            <li>• Sử dụng ứng dụng một cách hợp lý</li>
                        </ul>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <Button asElement={Link} href="/dashboard" className="w-full">Về trang chủ</Button>
                        <Button variant="default" onClick={() => window.location.reload()} className="w-full">Thử lại</Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
